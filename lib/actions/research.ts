// NOT "use server" — performDeepResearch is an internal function called by
// API routes and other server actions, NOT directly by clients. Exposing it
// as a server action would let anyone trigger expensive API calls without auth.

import { db } from "@/lib/db";
import { tools, reports, workspaces, researchJobs, subscriptions } from "@/lib/db/schema";
import { eq, sql, and, gte, ne, inArray, count } from "drizzle-orm";
import { firecrawl } from "@/lib/services/firecrawl";
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
    sentimentConsensus: z.object({
        overall: z.enum(["very_positive", "positive", "mixed", "negative", "very_negative"]).describe("Overall consensus across all sources"),
        confidence: z.number().min(0).max(100).describe("Confidence level 0-100 based on volume and agreement of sources"),
        sourceAgreement: z.string().describe("1-2 sentence summary of whether sources agree or disagree, and on what"),
    }).describe("Multi-source sentiment consensus — cross-reference all review sites, Reddit, Trustpilot, and competitor analyses"),
    marketIntel: z.object({
        founded: z.string().optional().describe("Year founded or 'Unknown'"),
        headquarters: z.string().optional().describe("HQ location or 'Unknown'"),
        employeeCount: z.string().optional().describe("Approximate employee count range, e.g. '51-200'"),
        funding: z.string().optional().describe("Total funding raised or 'Bootstrapped' or 'Public' or 'Unknown'"),
        recentNews: z.array(z.string()).describe("2-3 recent notable developments, launches, or news items from the past year"),
    }).describe("Market intelligence about the company behind the tool"),
});

type ResearchLog = { message: string; timestamp: string };

const MAX_RESEARCH_LOGS = 50;

async function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
    ]);
}

async function logProgress(toolId: string, message: string) {
    const newLog: ResearchLog = { message, timestamp: new Date().toISOString() };

    // Append the new log and trim to keep only the most recent entries
    await db.update(tools)
        .set({
            researchLogs: sql`
                (CASE
                    WHEN research_logs IS NULL THEN jsonb_build_array(${JSON.stringify(newLog)}::jsonb)
                    WHEN jsonb_array_length(research_logs) >= ${MAX_RESEARCH_LOGS}
                        THEN (SELECT jsonb_agg(elem) FROM (
                            SELECT elem FROM jsonb_array_elements(research_logs || ${JSON.stringify(newLog)}::jsonb) AS elem
                            ORDER BY elem->>'timestamp' DESC
                            LIMIT ${MAX_RESEARCH_LOGS}
                        ) sub)
                    ELSE research_logs || ${JSON.stringify(newLog)}::jsonb
                END)
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

        // Count non-failed research jobs for this workspace's tools this month (single SQL query)
        const workspaceToolSubquery = db
            .select({ id: tools.id })
            .from(tools)
            .where(eq(tools.workspaceId, tool.workspaceId));

        const [{ value: jobCount }] = await db
            .select({ value: count() })
            .from(researchJobs)
            .where(and(
                inArray(researchJobs.toolId, workspaceToolSubquery),
                gte(researchJobs.triggeredAt, startOfMonth),
                ne(researchJobs.status, "failed"),
            ));

        if (jobCount >= limits.limits.research) {
            await db.update(tools).set({ status: "failed" }).where(eq(tools.id, toolId));
            return {
                success: false,
                error: `Monthly research limit reached (${limits.limits.research} runs on ${limits.name} plan). Upgrade to run more research this month.`,
            };
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
        await logProgress(toolId, `Step 1/7: Mapping site structure for ${domain}...`);
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

        // Detect key sub-pages from sitemap
        const pricingUrl = subPages.find((u) => /\/pricing/i.test(u)) ?? tool.websiteUrl;
        const featuresUrl = subPages.find((u) => /\/(features|product|platform)/i.test(u));
        const aboutUrl = subPages.find((u) => /\/(about|company|team)/i.test(u));
        const securityUrl = subPages.find((u) => /\/(security|compliance|trust|privacy)/i.test(u));

        // Only scrape about/security pages if workspace recipe mentions security/compliance
        // or if those pages are likely valuable (reduces Firecrawl costs for most runs)
        const recipe = tool.workspace.scorecardConfig as {
            systemContext?: string;
            dealBreakers?: string;
            evaluationCriteria?: string;
        } | null;
        const recipeText = [recipe?.systemContext, recipe?.dealBreakers, recipe?.evaluationCriteria].filter(Boolean).join(" ").toLowerCase();
        const needsDeepScrape = recipeText.includes("security") || recipeText.includes("compliance") || recipeText.includes("enterprise") || recipeText.includes("soc") || recipeText.includes("hipaa");

        // ── Step 2: Scrape pages (2-5 depending on context) ─────────────
        const pagesToScrape = [
            { key: "main", url: tool.websiteUrl, label: "homepage" },
            ...(pricingUrl !== tool.websiteUrl ? [{ key: "pricing", url: pricingUrl, label: "pricing" }] : []),
            ...(featuresUrl ? [{ key: "features", url: featuresUrl, label: "features" }] : []),
            ...(needsDeepScrape && aboutUrl ? [{ key: "about", url: aboutUrl, label: "about" }] : []),
            ...(needsDeepScrape && securityUrl ? [{ key: "security", url: securityUrl, label: "security" }] : []),
        ];
        const pageLabels = pagesToScrape.map(p => p.label).join(", ");
        await logProgress(toolId, `Step 2/7: Crawling ${pagesToScrape.length} pages (${pageLabels})...`);

        const scrapeFallback = { success: false, data: { markdown: "", metadata: {} } };
        const scrapeStart = Date.now();
        const scrapeResults = await Promise.all(
            pagesToScrape.map(({ url }) =>
                withTimeout(firecrawl.scrapeUrl(url), 30000, scrapeFallback)
            )
        );
        const scrapeDuration = Date.now() - scrapeStart;

        // Log each scrape and store results
        pagesToScrape.forEach(({ key, label }, i) => {
            rawData[key] = scrapeResults[i].data?.markdown ?? "";
            logApiCall({
                service: "firecrawl",
                endpoint: "scrape",
                durationMs: scrapeDuration,
                estimatedCost: COST_MAP.firecrawl.scrape,
                workspaceId: tool.workspaceId,
                toolId,
                metadata: { target: label },
            });
        });

        // Extract logo from Firecrawl metadata (favicon preferred, OG image fallback)
        const logoUrl: string | null =
            scrapeResults[0].data?.metadata?.favicon ||
            scrapeResults[0].data?.metadata?.ogImage ||
            null;

        if (logoUrl) {
            await db.update(tools).set({ logoUrl }).where(eq(tools.id, toolId));
        }

        // ── Step 3: Tavily — review sites ─────────────────────────────────
        await logProgress(toolId, `Step 3/7: Searching reviews (G2, Capterra, TrustRadius, ProductHunt)...`);
        const tavilyFallback = { results: [], answer: "" };
        const reviewStart = Date.now();
        const reviewSearch = await withTimeout(
            tavily.search(
                `${tool.name} software reviews user feedback pros cons`,
                {
                    includeDomains: ["g2.com", "capterra.com", "trustradius.com", "getapp.com", "producthunt.com"],
                    maxResults: 8,
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
            await logProgress(toolId, `Found ${reviewSearch.results.length} review sources: ${sourceNames.join(", ")}`);
        }

        rawData.reviews = reviewSearch.results
            .map((r) => `[${r.title}](${r.url}):\n${r.content.slice(0, 500)}`)
            .join("\n\n");

        // ── Step 4: Tavily — trust & reputation sites ───────────────────
        await logProgress(toolId, `Step 4/7: Checking Trustpilot, BBB, Glassdoor...`);
        const trustStart = Date.now();
        const trustSearch = await withTimeout(
            tavily.search(
                `"${tool.name}" reviews rating`,
                {
                    includeDomains: ["trustpilot.com", "bbb.org", "glassdoor.com", "sitejabber.com"],
                    maxResults: 6,
                    includeAnswer: true,
                }
            ),
            30000,
            tavilyFallback
        );
        logApiCall({
            service: "tavily",
            endpoint: "search-trust",
            durationMs: Date.now() - trustStart,
            estimatedCost: COST_MAP.tavily.search,
            workspaceId: tool.workspaceId,
            toolId,
        });

        if (trustSearch.results.length > 0) {
            const trustSourceNames = [...new Set(
                trustSearch.results.map((r) => {
                    try { return new URL(r.url).hostname.replace("www.", ""); } catch { return r.url; }
                })
            )];
            await logProgress(toolId, `Found ${trustSearch.results.length} trust sources: ${trustSourceNames.join(", ")}`);
        }

        rawData.trust = trustSearch.results
            .map((r) => `[${r.title}](${r.url}):\n${r.content.slice(0, 500)}`)
            .join("\n\n");

        // ── Step 5: Deep Reddit — 3 targeted queries ────────────────────
        await logProgress(toolId, `Step 5/7: Deep scanning Reddit (3 targeted searches)...`);
        const redditStart = Date.now();
        const [redditReviews, redditComparisons, redditComplaints] = await Promise.all([
            withTimeout(
                tavily.search(
                    `"${tool.name}" review experience worth it site:reddit.com`,
                    { includeDomains: ["reddit.com"], maxResults: 5, includeAnswer: true }
                ),
                30000, tavilyFallback
            ),
            withTimeout(
                tavily.search(
                    `"${tool.name}" vs alternative comparison site:reddit.com`,
                    { includeDomains: ["reddit.com"], maxResults: 5, includeAnswer: true }
                ),
                30000, tavilyFallback
            ),
            withTimeout(
                tavily.search(
                    `"${tool.name}" problems issues complaints frustrating site:reddit.com`,
                    { includeDomains: ["reddit.com"], maxResults: 5, includeAnswer: true }
                ),
                30000, tavilyFallback
            ),
        ]);
        const redditDuration = Date.now() - redditStart;
        // Log all 3 Reddit searches
        for (const label of ["reddit-reviews", "reddit-comparisons", "reddit-complaints"]) {
            logApiCall({
                service: "tavily",
                endpoint: `search-${label}`,
                durationMs: redditDuration,
                estimatedCost: COST_MAP.tavily.search,
                workspaceId: tool.workspaceId,
                toolId,
            });
        }

        // Deduplicate Reddit results by URL
        const allRedditResults = [...redditReviews.results, ...redditComparisons.results, ...redditComplaints.results];
        const seenUrls = new Set<string>();
        const uniqueRedditResults = allRedditResults.filter(r => {
            if (seenUrls.has(r.url)) return false;
            seenUrls.add(r.url);
            return true;
        });

        await logProgress(toolId, `Found ${uniqueRedditResults.length} unique Reddit threads`);

        // Combine Reddit answers for synthesis
        const redditAnswers = [redditReviews.answer, redditComparisons.answer, redditComplaints.answer]
            .filter(Boolean).join("\n\n");

        rawData.reddit = uniqueRedditResults
            .map((r) => `[${r.title}](${r.url}):\n${r.content.slice(0, 500)}`)
            .join("\n\n");
        rawData.redditAnswers = redditAnswers;

        // ── Step 6: Tavily — competitors + market intelligence ────────────
        await logProgress(toolId, `Step 6/7: Analyzing competitive landscape + market intel...`);
        const competitorStart = Date.now();
        const [competitorSearch, marketSearch] = await Promise.all([
            withTimeout(
                tavily.search(
                    `${tool.name} competitors alternatives comparison vs`,
                    { maxResults: 6, includeAnswer: true }
                ),
                30000, tavilyFallback
            ),
            withTimeout(
                tavily.search(
                    `"${tool.name}" company funding employees headquarters founded`,
                    { maxResults: 4, includeAnswer: true }
                ),
                30000, tavilyFallback
            ),
        ]);
        const competitorDuration = Date.now() - competitorStart;
        logApiCall({
            service: "tavily",
            endpoint: "search-competitors",
            durationMs: competitorDuration,
            estimatedCost: COST_MAP.tavily.search,
            workspaceId: tool.workspaceId,
            toolId,
        });
        logApiCall({
            service: "tavily",
            endpoint: "search-market-intel",
            durationMs: competitorDuration,
            estimatedCost: COST_MAP.tavily.search,
            workspaceId: tool.workspaceId,
            toolId,
        });

        // Combine competitor + market intel into one block for synthesis
        const competitorContent = competitorSearch.results
            .map((r) => `[${r.title}](${r.url}):\n${r.content.slice(0, 400)}`)
            .join("\n\n");
        const marketContent = marketSearch.results
            .map((r) => `[${r.title}](${r.url}):\n${r.content.slice(0, 400)}`)
            .join("\n\n");
        rawData.competitors = [
            competitorSearch.answer && `COMPETITOR ANALYSIS:\n${competitorSearch.answer}`,
            competitorContent && `COMPETITOR SOURCES:\n${competitorContent}`,
            marketSearch.answer && `MARKET INTEL:\n${marketSearch.answer}`,
            marketContent && `MARKET SOURCES:\n${marketContent}`,
        ].filter(Boolean).join("\n\n");

        // ── Step 7: GPT-4o-mini synthesis ───────────────────────────────────
        // Count total unique data sources used
        const totalDataSources = [
            ...new Set([
                ...reviewSearch.results.map(r => { try { return new URL(r.url).hostname; } catch { return r.url; } }),
                ...trustSearch.results.map(r => { try { return new URL(r.url).hostname; } catch { return r.url; } }),
                ...uniqueRedditResults.map(() => "reddit.com"),
                ...competitorSearch.results.map(r => { try { return new URL(r.url).hostname; } catch { return r.url; } }),
                ...marketSearch.results.map(r => { try { return new URL(r.url).hostname; } catch { return r.url; } }),
                domain, // official site
            ])
        ];
        await logProgress(toolId, `Step 7/7: Synthesizing from ${totalDataSources.length} sources...`);

        const companyContext = tool.workspace.companyContext ?? "A technology company evaluating software tools.";
        // recipe was already loaded above for conditional scraping — cast to full type for prompt building
        const fullRecipe = tool.workspace.scorecardConfig as {
            systemContext?: string;
            businessUnits?: Array<{ name: string; description: string; priorities: string }>;
            evaluationCriteria?: string;
            dealBreakers?: string;
        } | null;

        // Build a rich recipe-based prompt if a recipe exists, otherwise fall back to context only
        const recipeSection = fullRecipe?.systemContext ? `
=== COMPANY SCORECARD RECIPE ===
${fullRecipe.systemContext}

${fullRecipe.businessUnits?.length ? `BUSINESS UNITS:\n${fullRecipe.businessUnits.map(bu =>
    `• ${bu.name}: ${bu.description}\n  Priorities: ${bu.priorities}`
).join("\n\n")}` : ""}

${fullRecipe.evaluationCriteria ? `EVALUATION CRITERIA:\n${fullRecipe.evaluationCriteria}` : ""}

${fullRecipe.dealBreakers ? `DEAL BREAKERS (flag these prominently in cons):\n${fullRecipe.dealBreakers}` : ""}
` : `COMPANY CONTEXT: ${companyContext}`;

        const openaiStart = Date.now();
        const { object: reportData, usage } = await generateObject({
            model: openai("gpt-4o-mini"),
            schema: ReportSchema,
            prompt: `
You are a rigorous software procurement analyst evaluating ${tool.name} (${tool.websiteUrl}).
You have access to data from ${totalDataSources.length} unique sources. Cross-reference all sources to form your analysis.

${recipeSection}

For the scorecardSnapshot, score these dimensions from 0-10:
- features: Features & Functionality
- pricing_value: Pricing Value
- ease_of_use: Ease of Use
- integration_depth: Integration Depth
- support_quality: Support & Documentation
- security: Security & Compliance
- ai_capabilities: AI Capabilities

=== OFFICIAL WEBSITE (HOMEPAGE) ===
${rawData.main.slice(0, 5000)}

=== PRICING PAGE ===
${rawData.pricing?.slice(0, 3000) || "No separate pricing page found."}

=== FEATURES / PRODUCT PAGE ===
${rawData.features?.slice(0, 2500) || "No features page found."}

=== ABOUT / COMPANY PAGE ===
${rawData.about?.slice(0, 2000) || "No about page found."}

=== SECURITY / COMPLIANCE PAGE ===
${rawData.security?.slice(0, 2000) || "No security page found."}

=== REVIEW SITES (G2, Capterra, TrustRadius, Product Hunt) ===
${rawData.reviews?.slice(0, 3500) || "No review data found."}

=== TRUST & REPUTATION (Trustpilot, BBB, Glassdoor, Sitejabber) ===
${rawData.trust?.slice(0, 2500) || "No trust/reputation data found."}

=== REDDIT COMMUNITY FEEDBACK (${uniqueRedditResults.length} threads) ===
${rawData.reddit?.slice(0, 4000) || "No Reddit data found."}

=== REDDIT AI SUMMARIES ===
${rawData.redditAnswers?.slice(0, 2000) || "No Reddit summaries available."}

=== COMPETITIVE LANDSCAPE + MARKET INTEL ===
${rawData.competitors?.slice(0, 3000) || "No competitor data."}

INSTRUCTIONS:
- Be critical and specific. Don't repeat marketing copy — synthesize real user pain points.
- If pricing is hidden or requires contacting sales, set isPricingHidden=true and note it in cons.
- Extract ALL integrations mentioned (Slack, Zapier, Salesforce, etc.).
- For competitors, use their domain name (e.g. notion.so, linear.app).
- Evaluate through the lens of the company's recipe above: what works for their specific business units, and flag any deal breakers prominently.
- For sentimentConsensus: cross-reference ALL sources (reviews, trust sites, Reddit, competitor analyses). Do sources agree? What's the confidence based on volume of data?
- For marketIntel: extract company details from the about page, market research, and any other available sources. Use "Unknown" for fields you can't determine.
            `.trim(),
        });
        logApiCall({
            service: "openai",
            endpoint: "gpt-4o-mini",
            durationMs: Date.now() - openaiStart,
            tokensIn: usage?.inputTokens,
            tokensOut: usage?.outputTokens,
            estimatedCost: estimateOpenAICost(usage?.inputTokens ?? 0, usage?.outputTokens ?? 0, "gpt-4o-mini"),
            workspaceId: tool.workspaceId,
            toolId,
        });

        // ── Step 8: Store report ──────────────────────────────────────────
        const sentimentData = {
            reviewSources: reviewSearch.results.map((r) => ({
                title: r.title,
                url: r.url,
                score: r.score,
            })),
            trustSources: trustSearch.results.map((r) => ({
                title: r.title,
                url: r.url,
                score: r.score,
            })),
            reviewAnswer: reviewSearch.answer,
            trustAnswer: trustSearch.answer,
            redditThreads: uniqueRedditResults.map((r) => ({
                title: r.title,
                url: r.url,
                subreddit: (() => { try { return new URL(r.url).pathname.split("/")[2] || "reddit"; } catch { return "reddit"; } })(),
                snippet: r.content.slice(0, 200),
            })),
            redditAnswer: redditAnswers,
            competitorAnalysis: rawData.competitors,
            sentimentConsensus: reportData.sentimentConsensus,
            marketIntel: reportData.marketIntel,
            dataSources: totalDataSources.length,
            pagesScraped: pagesToScrape.length,
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
                    tool.workspace.slackBotToken ?? undefined,
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
                    tool.workspace.slackBotToken ?? undefined,
                );
            } catch {
                // Non-critical
            }
        }

        return { success: false, error: message };
    }
}
