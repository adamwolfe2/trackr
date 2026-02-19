"use server";

import { db } from "@/lib/db";
import { tools, reports, workspaces, researchJobs, subscriptions } from "@/lib/db/schema";
import { eq, sql, and, gte, ne } from "drizzle-orm";
import { firecrawl } from "@/lib/services/firecrawl";
import { perplexity } from "@/lib/services/perplexity";
import { tavily } from "@/lib/services/tavily";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { InferSelectModel } from "drizzle-orm";
import { getPlanLimits } from "@/lib/config/subscriptions";
import { sendResearchCompleteEmail, sendResearchFailedEmail } from "@/lib/email/resend";
import { clerkClient } from "@clerk/nextjs/server";
import { postMessage, researchCompleteBlocks, researchFailedBlocks } from "@/lib/services/slack";
import { logApiCall, COST_MAP, estimateOpenAICost } from "@/lib/services/api-logger";

type ToolWithWorkspace = InferSelectModel<typeof tools> & {
    workspace: InferSelectModel<typeof workspaces>;
};

const ReportSchema = z.object({
    summary: z.string().describe("Executive summary of the tool analysis, max 2 sentences."),
    scorecardSnapshot: z.object({
        features: z.object({ score: z.number().min(0).max(10), justification: z.string() }),
        pricing_value: z.object({ score: z.number().min(0).max(10), justification: z.string() }),
        ease_of_use: z.object({ score: z.number().min(0).max(10), justification: z.string() }),
        integration_depth: z.object({ score: z.number().min(0).max(10), justification: z.string() }),
        support_quality: z.object({ score: z.number().min(0).max(10), justification: z.string() }),
        security: z.object({ score: z.number().min(0).max(10), justification: z.string() }),
        ai_capabilities: z.object({ score: z.number().min(0).max(10), justification: z.string() }),
    }).describe("Scores (0-10) for each of the 7 evaluation dimensions."),
    features: z.object({
        list: z.array(z.string()).describe("List of key features")
    }),
    pricing: z.array(z.object({
        tier: z.string(),
        price: z.string()
    })).describe("Pricing tiers found on the pricing page"),
    isPricingHidden: z.boolean().describe("True if pricing is not publicly listed and requires a demo/contact."),
    pros: z.array(z.string()).describe("Top 3-5 pros based on user reviews and official info"),
    cons: z.array(z.string()).describe("Top 3-5 cons based on user reviews and complaints"),
    competitors: z.array(z.string()).describe("3-5 main competitors (use their domain names, e.g. notion.so)"),
    integrations: z.array(z.string()).describe("Tools/platforms this integrates with (e.g. Slack, Zapier, Salesforce, HubSpot)"),
    categories: z.array(z.string()).describe("3-5 relevant categories for this tool (e.g. CRM, Analytics, DevTool)"),
});

type ResearchLog = { message: string; timestamp: string };

async function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
    ]);
}

async function logProgress(toolId: string, message: string) {
    const newLog: ResearchLog = { message, timestamp: new Date().toISOString() };

    await db.update(tools)
        .set({
            researchLogs: sql`
                CASE
                    WHEN research_logs IS NULL THEN jsonb_build_array(${JSON.stringify(newLog)}::jsonb)
                    ELSE research_logs || ${JSON.stringify(newLog)}::jsonb
                END
            ` as unknown as ResearchLog[],
        })
        .where(eq(tools.id, toolId));
}

function getDomain(url: string): string {
    try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
}

export async function performDeepResearch(toolId: string) {
    const tool = await db.query.tools.findFirst({
        where: eq(tools.id, toolId),
        with: { workspace: true },
    }) as ToolWithWorkspace | undefined;

    if (!tool || !tool.websiteUrl) {
        return { success: false, error: "Tool not found or missing URL" };
    }

    // Check monthly research run limit
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, tool.workspaceId),
    });
    const limits = getPlanLimits(subscription ?? undefined);

    if (limits.limits.research !== Infinity) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        // Count completed research jobs for workspace tools this month
        const workspaceToolIds = await db.query.tools.findMany({
            where: eq(tools.workspaceId, tool.workspaceId),
            columns: { id: true },
        });
        const toolIds = workspaceToolIds.map((t) => t.id);

        if (toolIds.length > 0) {
            // Count all non-failed jobs (running + complete) this month — not just completed
            const jobsThisMonth = await db.query.researchJobs.findMany({
                where: and(
                    gte(researchJobs.triggeredAt, startOfMonth),
                    ne(researchJobs.status, "failed"),
                ),
                columns: { id: true, toolId: true },
            }).then((jobs) => jobs.filter((j) => toolIds.includes(j.toolId)));

            if (jobsThisMonth.length >= limits.limits.research) {
                await db.update(tools).set({ status: "failed" }).where(eq(tools.id, toolId));
                return {
                    success: false,
                    error: `Monthly research limit reached (${limits.limits.research} runs on ${limits.name} plan). Upgrade to run more research this month.`,
                };
            }
        }
    }

    // Insert a researchJob row so /queue shows live status
    const [researchJob] = await db.insert(researchJobs).values({
        toolId,
        status: "running",
        triggeredAt: new Date(),
    }).returning();

    await db.update(tools).set({
        status: "researching",
        researchLogs: [] as unknown as ResearchLog[],
    }).where(eq(tools.id, toolId));

    try {
        const rawData: Record<string, string> = {};
        const domain = getDomain(tool.websiteUrl);

        // ── Step 1: Map site ──────────────────────────────────────────────
        await logProgress(toolId, `Step 1/6: Mapping site structure for ${domain}...`);
        const mapStart = Date.now();
        const mapResult = await withTimeout(
            firecrawl.mapSite(tool.websiteUrl),
            30000,
            { success: false, data: [] }
        );
        logApiCall({
            service: "firecrawl",
            endpoint: "map",
            durationMs: Date.now() - mapStart,
            estimatedCost: COST_MAP.firecrawl.map,
            workspaceId: tool.workspaceId,
            toolId,
        });
        const subPages: string[] = mapResult.success && Array.isArray(mapResult.data) ? mapResult.data : [];

        const pricingUrl = subPages.find((u) => /\/pricing/.test(u)) ?? tool.websiteUrl;

        // ── Step 2: Scrape main + pricing pages ───────────────────────────
        const pricingLabel = pricingUrl !== tool.websiteUrl ? " + pricing page" : "";
        await logProgress(toolId, `Step 2/6: Crawling ${domain}${pricingLabel}...`);

        const scrapeFallback = { success: false, data: { markdown: "", metadata: {} } };
        const scrapeStart = Date.now();
        const hasSeparatePricing = pricingUrl !== tool.websiteUrl;
        const [mainScrape, pricingScrape] = await Promise.all([
            withTimeout(firecrawl.scrapeUrl(tool.websiteUrl), 30000, scrapeFallback),
            hasSeparatePricing
                ? withTimeout(firecrawl.scrapeUrl(pricingUrl), 30000, scrapeFallback)
                : Promise.resolve({ success: true, data: { markdown: "", metadata: {} } }),
        ]);
        const scrapeDuration = Date.now() - scrapeStart;
        logApiCall({
            service: "firecrawl",
            endpoint: "scrape",
            durationMs: scrapeDuration,
            estimatedCost: COST_MAP.firecrawl.scrape,
            workspaceId: tool.workspaceId,
            toolId,
            metadata: { target: "main" },
        });
        if (hasSeparatePricing) {
            logApiCall({
                service: "firecrawl",
                endpoint: "scrape",
                durationMs: scrapeDuration,
                estimatedCost: COST_MAP.firecrawl.scrape,
                workspaceId: tool.workspaceId,
                toolId,
                metadata: { target: "pricing" },
            });
        }

        rawData.main = mainScrape.data?.markdown ?? "";
        rawData.pricing = pricingScrape.data?.markdown ?? "";

        // Extract logo from Firecrawl metadata (favicon preferred, OG image fallback)
        const logoUrl: string | null =
            mainScrape.data?.metadata?.favicon ||
            mainScrape.data?.metadata?.ogImage ||
            null;

        if (logoUrl) {
            await db.update(tools).set({ logoUrl }).where(eq(tools.id, toolId));
        }

        // ── Step 3: Tavily — review sites ─────────────────────────────────
        await logProgress(toolId, `Step 3/6: Searching reviews (G2, Capterra, TrustRadius)...`);
        const tavilyFallback = { results: [], answer: "" };
        const reviewStart = Date.now();
        const reviewSearch = await withTimeout(
            tavily.search(
                `${tool.name} software reviews user feedback pros cons`,
                {
                    includeDomains: ["g2.com", "capterra.com", "trustradius.com", "getapp.com", "producthunt.com"],
                    maxResults: 6,
                    includeAnswer: true,
                }
            ),
            30000,
            tavilyFallback
        );
        logApiCall({
            service: "tavily",
            endpoint: "search-reviews",
            durationMs: Date.now() - reviewStart,
            estimatedCost: COST_MAP.tavily.search,
            workspaceId: tool.workspaceId,
            toolId,
        });

        if (reviewSearch.results.length > 0) {
            const sourceNames = [...new Set(
                reviewSearch.results.map((r) => {
                    try { return new URL(r.url).hostname.replace("www.", ""); } catch { return r.url; }
                })
            )];
            await logProgress(toolId, `Reviewing ${reviewSearch.results.length} sources: ${sourceNames.join(", ")}...`);
        }

        rawData.reviews = reviewSearch.results
            .map((r) => `[${r.title}](${r.url}):\n${r.content.slice(0, 400)}`)
            .join("\n\n");

        // ── Step 4: Tavily — Reddit sentiment ─────────────────────────────
        await logProgress(toolId, `Step 4/6: Scanning Reddit + community discussions...`);
        const redditStart = Date.now();
        const redditSearch = await withTimeout(
            tavily.search(
                `${tool.name} reddit experiences pros cons issues 2024`,
                { includeDomains: ["reddit.com"], maxResults: 5, includeAnswer: true }
            ),
            30000,
            tavilyFallback
        );
        logApiCall({
            service: "tavily",
            endpoint: "search-reddit",
            durationMs: Date.now() - redditStart,
            estimatedCost: COST_MAP.tavily.search,
            workspaceId: tool.workspaceId,
            toolId,
        });

        rawData.reddit = redditSearch.results
            .map((r) => `${r.title}:\n${r.content.slice(0, 300)}`)
            .join("\n\n");

        // ── Step 5: Perplexity — competitors + market analysis ────────────
        await logProgress(toolId, `Step 5/6: Analyzing competitive landscape...`);
        const perplexityStart = Date.now();
        const competitorAnalysis = await withTimeout(
            perplexity.search(
                `Who are the main competitors of ${tool.name}? What are the key differentiators? What do users typically choose instead, and why?`
            ),
            30000,
            ""
        );
        logApiCall({
            service: "perplexity",
            endpoint: "sonar-reasoning-pro",
            durationMs: Date.now() - perplexityStart,
            estimatedCost: COST_MAP.perplexity["sonar-reasoning-pro"],
            workspaceId: tool.workspaceId,
            toolId,
        });
        rawData.competitors = competitorAnalysis;

        // ── Step 6: GPT-4o synthesis ──────────────────────────────────────
        await logProgress(toolId, `Step 6/6: Synthesizing final report with GPT-4o...`);

        const companyContext = tool.workspace.companyContext ?? "A technology company evaluating software tools.";
        const recipe = tool.workspace.scorecardConfig as {
            systemContext?: string;
            businessUnits?: Array<{ name: string; description: string; priorities: string }>;
            evaluationCriteria?: string;
            dealBreakers?: string;
        } | null;

        // Build a rich recipe-based prompt if a recipe exists, otherwise fall back to context only
        const recipeSection = recipe?.systemContext ? `
=== COMPANY SCORECARD RECIPE ===
${recipe.systemContext}

${recipe.businessUnits?.length ? `BUSINESS UNITS:\n${recipe.businessUnits.map(bu =>
    `• ${bu.name}: ${bu.description}\n  Priorities: ${bu.priorities}`
).join("\n\n")}` : ""}

${recipe.evaluationCriteria ? `EVALUATION CRITERIA:\n${recipe.evaluationCriteria}` : ""}

${recipe.dealBreakers ? `DEAL BREAKERS (flag these prominently in cons):\n${recipe.dealBreakers}` : ""}
` : `COMPANY CONTEXT: ${companyContext}`;

        const openaiStart = Date.now();
        const { object: reportData, usage } = await generateObject({
            model: openai("gpt-4o"),
            schema: ReportSchema,
            prompt: `
You are a rigorous software procurement analyst evaluating ${tool.name} (${tool.websiteUrl}).

${recipeSection}

For the scorecardSnapshot, score these dimensions from 0-10:
- features: Features & Functionality
- pricing_value: Pricing Value
- ease_of_use: Ease of Use
- integration_depth: Integration Depth
- support_quality: Support & Documentation
- security: Security & Compliance
- ai_capabilities: AI Capabilities

=== OFFICIAL WEBSITE ===
${rawData.main.slice(0, 5000)}

=== PRICING PAGE ===
${rawData.pricing.slice(0, 3000)}

=== REVIEW SITES (G2, Capterra, TrustRadius, Product Hunt) ===
${rawData.reviews?.slice(0, 3000) || "No review data found."}

=== REDDIT / COMMUNITY FEEDBACK ===
${rawData.reddit?.slice(0, 2000) || "No Reddit data found."}

=== COMPETITIVE LANDSCAPE ===
${rawData.competitors?.slice(0, 2000) || "No competitor data."}

INSTRUCTIONS:
- Be critical and specific. Don't repeat marketing copy — synthesize real user pain points.
- If pricing is hidden or requires contacting sales, set isPricingHidden=true and note it in cons.
- Extract ALL integrations mentioned (Slack, Zapier, Salesforce, etc.).
- For competitors, use their domain name (e.g. notion.so, linear.app).
- Evaluate through the lens of the company's recipe above: what works for their specific business units, and flag any deal breakers prominently.
            `.trim(),
        });
        logApiCall({
            service: "openai",
            endpoint: "gpt-4o",
            durationMs: Date.now() - openaiStart,
            tokensIn: usage?.inputTokens,
            tokensOut: usage?.outputTokens,
            estimatedCost: estimateOpenAICost(usage?.inputTokens ?? 0, usage?.outputTokens ?? 0),
            workspaceId: tool.workspaceId,
            toolId,
        });

        // ── Step 7: Store report ──────────────────────────────────────────
        const sentimentData = {
            reviewSources: reviewSearch.results.map((r) => ({
                title: r.title,
                url: r.url,
                score: r.score,
            })),
            reviewAnswer: reviewSearch.answer,
            redditAnswer: redditSearch.answer,
            competitorAnalysis: rawData.competitors,
        };

        // Count existing reports for this tool to set correct version
        const existingReports = await db.query.reports.findMany({
            where: eq(reports.toolId, tool.id),
            columns: { id: true },
        });
        const reportVersion = existingReports.length + 1;

        await db.insert(reports).values({
            toolId: tool.id,
            version: reportVersion,
            scorecardSnapshot: reportData.scorecardSnapshot,
            summary: reportData.summary,
            features: reportData.features,
            pricing: reportData.pricing,
            isPricingHidden: reportData.isPricingHidden,
            pros: reportData.pros,
            cons: reportData.cons,
            competitors: reportData.competitors,
            integrations: reportData.integrations ?? [],
            rawScrapedData: rawData,
            sentimentData: sentimentData,
        });

        await logProgress(toolId, "Research complete. Report generated.");

        const scores = Object.values(reportData.scorecardSnapshot).map((s) => s.score);
        const avgScore = scores.length > 0
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : 0;

        await db.update(tools).set({
            status: "active",
            overallScore: avgScore.toFixed(1),
            lastResearchedAt: new Date(),
            category: reportData.categories,
        }).where(eq(tools.id, toolId));

        // Mark researchJob as complete
        if (researchJob) {
            await db.update(researchJobs).set({
                status: "complete",
                completedAt: new Date(),
            }).where(eq(researchJobs.id, researchJob.id));
        }

        // Send research complete email to submitter (fire and forget)
        if (tool.submittedBy) {
            try {
                const clerk = await clerkClient();
                const clerkUser = await clerk.users.getUser(tool.submittedBy);
                const email = clerkUser.emailAddresses[0]?.emailAddress;
                if (email) {
                    await sendResearchCompleteEmail(email, tool.name, toolId, avgScore);
                }
            } catch {
                // Non-critical — don't fail research if email errors
            }
        }

        // Send Slack notification if workspace has Slack enabled
        if (tool.workspace.slackEnabled && tool.workspace.slackChannelId) {
            try {
                await postMessage(
                    tool.workspace.slackChannelId,
                    `Research complete: ${tool.name} scored ${avgScore.toFixed(1)}/10`,
                    researchCompleteBlocks(tool.name, toolId, avgScore),
                );
            } catch {
                // Non-critical
            }
        }

        revalidatePath(`/tools/${toolId}`);
        revalidatePath("/tools");
        revalidatePath("/queue");

        return { success: true };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        await logProgress(toolId, `Error: ${message}`);
        await db.update(tools).set({ status: "failed" }).where(eq(tools.id, toolId));

        // Mark researchJob as failed
        if (researchJob) {
            await db.update(researchJobs).set({
                status: "failed",
                completedAt: new Date(),
                errorMessage: message,
            }).where(eq(researchJobs.id, researchJob.id));
        }

        // Send failure email to submitter (fire and forget)
        if (tool?.submittedBy) {
            try {
                const clerk = await clerkClient();
                const clerkUser = await clerk.users.getUser(tool.submittedBy);
                const email = clerkUser.emailAddresses[0]?.emailAddress;
                if (email) {
                    await sendResearchFailedEmail(email, tool.name, toolId, message);
                }
            } catch {
                // Non-critical
            }
        }

        // Send Slack failure notification
        if (tool?.workspace?.slackEnabled && tool.workspace.slackChannelId) {
            try {
                await postMessage(
                    tool.workspace.slackChannelId,
                    `Research failed: ${tool.name}`,
                    researchFailedBlocks(tool.name, toolId, message),
                );
            } catch {
                // Non-critical
            }
        }

        return { success: false, error: message };
    }
}
