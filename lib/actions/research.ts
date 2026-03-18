// NOT "use server" — performDeepResearch is an internal function called by
// API routes and other server actions, NOT directly by clients. Exposing it
// as a server action would let anyone trigger expensive API calls without auth.

import { db } from "@/lib/db";
import { tools, reports, workspaces, researchJobs, subscriptions, painPoints } from "@/lib/db/schema";
import { eq, sql, and, gte, ne, inArray, count, gt } from "drizzle-orm";
import { firecrawl } from "@/lib/services/firecrawl";
import { tavily, type TavilyResult } from "@/lib/services/tavily";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { InferSelectModel } from "drizzle-orm";
import { getPlanLimits, type ResearchDepth } from "@/lib/config/subscriptions";
import { isPrivateUrl } from "@/lib/utils/url-validation";
import { sendResearchCompleteEmail, sendResearchFailedEmail } from "@/lib/email/resend";
import { clerkClient } from "@clerk/nextjs/server";
import { postMessage, researchCompleteBlocks, researchFailedBlocks } from "@/lib/services/slack";
import { logApiCall, COST_MAP, estimateOpenAICost } from "@/lib/services/api-logger";
import { perplexity } from "@/lib/services/perplexity";
import { checkCostCap } from "@/lib/services/cost-cap";

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
        founded: z.string().describe("Year founded, or 'Unknown' if not found"),
        headquarters: z.string().describe("HQ location, or 'Unknown' if not found"),
        employeeCount: z.string().describe("Approximate employee count range e.g. '51-200', or 'Unknown' if not found"),
        funding: z.string().describe("Total funding raised, 'Bootstrapped', 'Public', or 'Unknown'"),
        recentNews: z.array(z.string()).describe("2-3 recent notable developments, launches, or news items from the past year"),
    }).describe("Market intelligence about the company behind the tool"),
});

const WorkspaceFitSchema = z.object({
    fitScore: z.number().min(0).max(10).describe("Overall workspace fit score (0-10) based on the company's scorecard recipe, pain points, and business units."),
    fitJustification: z.string().describe("2-3 sentence justification for the fit score."),
    dealBreakerFlags: z.array(z.object({
        trigger: z.string().describe("The deal breaker criterion that was triggered"),
        severity: z.enum(["hard", "soft"]).describe("hard = absolute blocker, soft = significant concern"),
        explanation: z.string().describe("Why this is a deal breaker for this specific company"),
    })).describe("Deal breakers from the company's recipe that this tool triggers. Empty array if none."),
    painPointMapping: z.array(z.object({
        painPointTitle: z.string().describe("Title of the company's pain point"),
        addressesIt: z.enum(["fully", "partially", "tangentially"]).describe("How well this tool addresses the pain point"),
        explanation: z.string().describe("How the tool addresses (or fails to address) this pain point"),
    })).describe("How this tool maps to the company's defined pain points."),
    businessUnitRelevance: z.array(z.object({
        unitName: z.string().describe("Name of the business unit"),
        relevanceScore: z.number().min(0).max(10).describe("Relevance score 0-10 for this unit"),
        reason: z.string().describe("Why this tool is relevant (or not) for this business unit"),
    })).describe("Relevance scores per business unit from the company's recipe."),
});

const ReportSchemaWithFit = ReportSchema.extend({
    workspaceFit: WorkspaceFitSchema,
});

// Minimal report used when AI synthesis fails entirely — ensures tool always reaches active status
function buildFallbackReport(toolName: string): z.infer<typeof ReportSchema> {
    return {
        summary: `${toolName} — research data collected. Re-run research to generate a full AI analysis.`,
        scorecardSnapshot: {
            features:          { score: 5, justification: "Manual review required — AI synthesis unavailable" },
            pricing_value:     { score: 5, justification: "Manual review required — AI synthesis unavailable" },
            ease_of_use:       { score: 5, justification: "Manual review required — AI synthesis unavailable" },
            integration_depth: { score: 5, justification: "Manual review required — AI synthesis unavailable" },
            support_quality:   { score: 5, justification: "Manual review required — AI synthesis unavailable" },
            security:          { score: 5, justification: "Manual review required — AI synthesis unavailable" },
            ai_capabilities:   { score: 5, justification: "Manual review required — AI synthesis unavailable" },
        },
        features: { list: [] },
        pricing: [],
        isPricingHidden: false,
        pros: ["Research data collected — re-run to generate insights"],
        cons: [],
        competitors: [],
        integrations: [],
        categories: [],
        sentimentConsensus: {
            overall: "mixed",
            confidence: 0,
            sourceAgreement: "AI synthesis unavailable — re-run research to generate sentiment analysis.",
        },
        marketIntel: {
            founded: "Unknown",
            headquarters: "Unknown",
            employeeCount: "Unknown",
            funding: "Unknown",
            recentNews: [],
        },
    };
}

type ResearchLog = { message: string; timestamp: string };

const MAX_RESEARCH_LOGS = 50;

/** Hard ceiling for the entire performDeepResearch operation (5 minutes). */
const RESEARCH_HARD_TIMEOUT_MS = 5 * 60 * 1000;

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

export interface ResearchOptions {
    depth?: ResearchDepth;
    triggeredBy?: string;
}

export async function performDeepResearch(toolId: string, options?: ResearchOptions) {
    const tool = await db.query.tools.findFirst({
        where: eq(tools.id, toolId),
        with: { workspace: true },
    }) as ToolWithWorkspace | undefined;

    if (!tool || !tool.websiteUrl) {
        return { success: false, error: "Tool not found or missing URL" };
    }

    // Narrow to non-undefined for use in closures (TypeScript doesn't carry narrowing into function closures)
    const verifiedTool = tool;

    // SSRF protection: block internal/private addresses before passing to Firecrawl
    if (isPrivateUrl(tool.websiteUrl)) {
        await db.update(tools).set({ status: "failed" }).where(eq(tools.id, toolId));
        return { success: false, error: "Invalid URL — cannot research internal or private network addresses" };
    }

    // Capture previous score for delta display in completion email
    const previousScore = tool.overallScore ? parseFloat(tool.overallScore) : null;

    // Track whether a credit was deducted so we can refund it if research fails
    let creditDeducted = false;

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
            // Check if workspace has extra credits
            if (subscription && subscription.creditBalance > 0) {
                // Atomically decrement credit balance — only marks creditDeducted if the
                // DB row was actually updated (protects against concurrent over-deduction).
                const [deducted] = await db.update(subscriptions)
                    .set({
                        creditBalance: sql`${subscriptions.creditBalance} - 1`,
                        updatedAt: new Date(),
                    })
                    .where(and(
                        eq(subscriptions.workspaceId, tool.workspaceId),
                        gt(subscriptions.creditBalance, 0),
                    ))
                    .returning({ id: subscriptions.id });
                // Only set creditDeducted if the update actually consumed a credit.
                // If another concurrent request already drained the balance the WHERE
                // clause returns 0 rows — treat that as limit reached too.
                if (deducted) {
                    creditDeducted = true;
                } else {
                    await db.update(tools).set({ status: "failed" }).where(eq(tools.id, toolId));
                    return {
                        success: false,
                        error: `Monthly research limit reached (${limits.limits.research} runs on ${limits.name} plan). Upgrade or purchase extra credits to run more research this month.`,
                    };
                }
            } else {
                // Try auto-top-up before giving up
                if (subscription?.autoTopUpEnabled) {
                    const { performAutoTopUp } = await import("@/lib/actions/auto-top-up");
                    const topUp = await performAutoTopUp(tool.workspaceId);
                    if (topUp.success) {
                        // Re-attempt credit deduction after top-up
                        const [deducted] = await db.update(subscriptions)
                            .set({
                                creditBalance: sql`${subscriptions.creditBalance} - 1`,
                                updatedAt: new Date(),
                            })
                            .where(and(
                                eq(subscriptions.workspaceId, tool.workspaceId),
                                gt(subscriptions.creditBalance, 0),
                            ))
                            .returning({ id: subscriptions.id });
                        if (deducted) {
                            creditDeducted = true;
                        } else {
                            await db.update(tools).set({ status: "failed" }).where(eq(tools.id, toolId));
                            return {
                                success: false,
                                error: `Monthly research limit reached (${limits.limits.research} runs on ${limits.name} plan). Auto-top-up charged but credit deduction failed. Please contact support.`,
                            };
                        }
                    } else {
                        await db.update(tools).set({ status: "failed" }).where(eq(tools.id, toolId));
                        return {
                            success: false,
                            error: `Monthly research limit reached (${limits.limits.research} runs on ${limits.name} plan). Auto-top-up failed (card may have been declined). Purchase credits manually or upgrade your plan.`,
                        };
                    }
                } else {
                    await db.update(tools).set({ status: "failed" }).where(eq(tools.id, toolId));
                    return {
                        success: false,
                        error: `Monthly research limit reached (${limits.limits.research} runs on ${limits.name} plan). Upgrade or purchase extra credits to run more research this month.`,
                    };
                }
            }
        }
    }

    // ── Cost cap check ─────────────────────────────────────────────────
    const costCap = await checkCostCap(tool.workspaceId, limits.slug);
    if (!costCap.allowed) {
        await db.update(tools).set({ status: "failed" }).where(eq(tools.id, toolId));
        return {
            success: false,
            error: `Monthly API cost cap reached ($${costCap.usage.toFixed(2)} / $${costCap.budget.toFixed(2)} on ${limits.name} plan). Contact support or upgrade to increase your budget.`,
        };
    }
    if (costCap.warned) {
        console.warn(`[research] Workspace ${tool.workspaceId} at ${costCap.pctUsed.toFixed(0)}% of monthly API budget ($${costCap.usage.toFixed(2)} / $${costCap.budget.toFixed(2)})`);
    }

    // Insert a researchJob row so /queue shows live status
    const [researchJob] = await db.insert(researchJobs).values({
        toolId,
        status: "running",
        triggeredBy: options?.triggeredBy ?? "system",
        triggeredAt: new Date(),
    }).returning();

    // Drizzle RETURNING on Neon HTTP should never return an empty array for a
    // successful INSERT, but guard explicitly so a missed job doesn't silently
    // stay "running" forever (picked up by the stuck-job recovery cron).
    if (!researchJob) {
        throw new Error(`[research] Failed to create researchJob row for tool ${toolId} — INSERT returned no rows`);
    }

    await db.update(tools).set({
        status: "researching",
        researchLogs: [] as unknown as ResearchLog[],
    }).where(eq(tools.id, toolId));

    // Hard deadline — if research exceeds 5 minutes, the timeout will trigger
    // the catch block which creates a fallback report and marks the job failed.
    const researchDeadline = Date.now() + RESEARCH_HARD_TIMEOUT_MS;
    function checkDeadline() {
        if (Date.now() > researchDeadline) {
            throw new Error("Research exceeded 5 minute hard timeout");
        }
    }

    try {
        const rawData: Record<string, string> = {};
        const domain = getDomain(tool.websiteUrl);

        // Resolve research depth: explicit option > plan default
        const depth: ResearchDepth = options?.depth ?? limits.defaultResearchDepth;
        const isQuick = depth === "quick";

        if (isQuick) {
            await logProgress(toolId, `Quick research mode — 1 scrape + 2 Tavily + synthesis`);
        }

        // ── Step 1: Map site ──────────────────────────────────────────────
        await logProgress(toolId, `Step 1/${isQuick ? 4 : 6}: Mapping site structure for ${domain}...`);
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

        // ── Step 2: Scrape pages (quick=1, full=2-5 depending on context)
        const pagesToScrape = isQuick
            ? [{ key: "main", url: tool.websiteUrl, label: "homepage" }]
            : [
                { key: "main", url: tool.websiteUrl, label: "homepage" },
                ...(pricingUrl !== tool.websiteUrl ? [{ key: "pricing", url: pricingUrl, label: "pricing" }] : []),
                ...(featuresUrl ? [{ key: "features", url: featuresUrl, label: "features" }] : []),
                ...(needsDeepScrape && aboutUrl ? [{ key: "about", url: aboutUrl, label: "about" }] : []),
                ...(needsDeepScrape && securityUrl ? [{ key: "security", url: securityUrl, label: "security" }] : []),
            ];
        const pageLabels = pagesToScrape.map(p => p.label).join(", ");
        await logProgress(toolId, `Step 2/${isQuick ? 4 : 6}: Crawling ${pagesToScrape.length} pages (${pageLabels})...`);

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

        checkDeadline();

        // Extract logo from Firecrawl metadata (favicon preferred, OG image fallback)
        const logoUrl: string | null =
            scrapeResults[0].data?.metadata?.favicon ||
            scrapeResults[0].data?.metadata?.ogImage ||
            null;

        if (logoUrl) {
            await db.update(tools).set({ logoUrl }).where(eq(tools.id, toolId));
        }

        const tavilyFallback = { results: [], answer: "" };
        const REVIEW_DOMAINS = ["g2.com", "capterra.com", "trustradius.com", "getapp.com", "producthunt.com"];
        const TRUST_DOMAINS = ["trustpilot.com", "bbb.org", "glassdoor.com", "sitejabber.com"];

        // Variables shared between quick/full paths
        let reviewResults: TavilyResult[] = [];
        let trustResults: TavilyResult[] = [];
        let uniqueRedditResults: TavilyResult[] = [];
        let reviewTrustAnswer = "";
        let perplexityAnalysis = "";

        if (isQuick) {
            // ── Quick mode: 2 Tavily searches (reviews + competitors) ────
            await logProgress(toolId, `Step 3/4: Searching reviews & competitors...`);

            const [reviewTrustSearch, competitorSearch] = await Promise.all([
                withTimeout(
                    tavily.search(
                        `${tool.name} software reviews user feedback rating pros cons`,
                        {
                            includeDomains: [...REVIEW_DOMAINS, ...TRUST_DOMAINS],
                            maxResults: 8,
                            includeAnswer: true,
                        }
                    ),
                    30000, tavilyFallback
                ),
                withTimeout(
                    tavily.search(
                        `${tool.name} competitors alternatives comparison pricing`,
                        { maxResults: 6, includeAnswer: true }
                    ),
                    30000, tavilyFallback
                ),
            ]);

            logApiCall({ service: "tavily", endpoint: "quick-reviews", durationMs: 0, estimatedCost: COST_MAP.tavily.search, workspaceId: tool.workspaceId, toolId });
            logApiCall({ service: "tavily", endpoint: "quick-competitors", durationMs: 0, estimatedCost: COST_MAP.tavily.search, workspaceId: tool.workspaceId, toolId });

            reviewResults = reviewTrustSearch.results.filter(r => {
                try { return REVIEW_DOMAINS.some(d => new URL(r.url).hostname.includes(d)); } catch { return false; }
            });
            trustResults = reviewTrustSearch.results.filter(r => {
                try { return TRUST_DOMAINS.some(d => new URL(r.url).hostname.includes(d)); } catch { return false; }
            });
            reviewTrustAnswer = reviewTrustSearch.answer;

            rawData.reviews = reviewResults.map((r) => `[${r.title}](${r.url}):\n${r.content.slice(0, 500)}`).join("\n\n");
            rawData.trust = trustResults.map((r) => `[${r.title}](${r.url}):\n${r.content.slice(0, 500)}`).join("\n\n");
            rawData.reddit = "";
            rawData.redditAnswers = "";

            const competitorContent = competitorSearch.results.map((r) => `[${r.title}](${r.url}):\n${r.content.slice(0, 400)}`).join("\n\n");
            rawData.competitors = [
                competitorSearch.answer && `COMPETITOR & MARKET ANALYSIS:\n${competitorSearch.answer}`,
                competitorContent && `SOURCES:\n${competitorContent}`,
            ].filter(Boolean).join("\n\n");

        } else {
            // ── Full mode: 2 Tavily + Perplexity ─────────────────────────

            // Step 3: Reviews + trust + Reddit (merged into 1 call)
            await logProgress(toolId, `Step 3/6: Searching reviews, trust sites & Reddit...`);
            const reviewTrustStart = Date.now();
            const reviewTrustSearch = await withTimeout(
                tavily.search(
                    `${tool.name} software reviews user feedback rating pros cons experience problems issues`,
                    { includeDomains: [...REVIEW_DOMAINS, ...TRUST_DOMAINS, "reddit.com"], maxResults: 12, includeAnswer: false }
                ),
                30000, tavilyFallback
            );
            logApiCall({ service: "tavily", endpoint: "search-reviews-trust", durationMs: Date.now() - reviewTrustStart, estimatedCost: COST_MAP.tavily.search, workspaceId: tool.workspaceId, toolId });

            reviewResults = reviewTrustSearch.results.filter(r => {
                try { return REVIEW_DOMAINS.some(d => new URL(r.url).hostname.includes(d)); } catch { return false; }
            });
            trustResults = reviewTrustSearch.results.filter(r => {
                try { return TRUST_DOMAINS.some(d => new URL(r.url).hostname.includes(d)); } catch { return false; }
            });
            uniqueRedditResults = reviewTrustSearch.results.filter(r => {
                try { return new URL(r.url).hostname.includes("reddit.com"); } catch { return false; }
            });
            reviewTrustAnswer = reviewTrustSearch.answer;

            if (reviewTrustSearch.results.length > 0) {
                const sourceNames = [...new Set(
                    reviewTrustSearch.results.map((r) => { try { return new URL(r.url).hostname.replace("www.", ""); } catch { return r.url; } })
                )];
                await logProgress(toolId, `Found ${reviewTrustSearch.results.length} sources (${uniqueRedditResults.length} Reddit): ${sourceNames.join(", ")}`);
            }

            rawData.reviews = reviewResults.map((r) => `[${r.title}](${r.url}):\n${r.content.slice(0, 500)}`).join("\n\n");
            rawData.trust = trustResults.map((r) => `[${r.title}](${r.url}):\n${r.content.slice(0, 500)}`).join("\n\n");
            rawData.reddit = uniqueRedditResults.map((r) => `[${r.title}](${r.url}):\n${r.content.slice(0, 500)}`).join("\n\n");
            rawData.redditAnswers = reviewTrustAnswer || "";

            // Step 4: Competitors + market intel (formerly step 5)
            await logProgress(toolId, `Step 4/6: Analyzing competitive landscape + market intel...`);
            const competitorStart = Date.now();
            const competitorMarketSearch = await withTimeout(
                tavily.search(
                    `${tool.name} competitors alternatives comparison vs company funding employees headquarters founded`,
                    { maxResults: 6, includeAnswer: true }
                ),
                30000, tavilyFallback
            );
            logApiCall({ service: "tavily", endpoint: "search-competitors-market", durationMs: Date.now() - competitorStart, estimatedCost: COST_MAP.tavily.search, workspaceId: tool.workspaceId, toolId });

            const competitorContent = competitorMarketSearch.results.map((r) => `[${r.title}](${r.url}):\n${r.content.slice(0, 400)}`).join("\n\n");
            rawData.competitors = [
                competitorMarketSearch.answer && `COMPETITOR & MARKET ANALYSIS:\n${competitorMarketSearch.answer}`,
                competitorContent && `SOURCES:\n${competitorContent}`,
            ].filter(Boolean).join("\n\n");

            // Step 5.5: Perplexity deep analysis (full mode only)
            // Use sonar for all tiers — sonar-reasoning-pro is 5x cost with marginal quality gain
            const perplexityModel = "sonar" as const;
            const perplexityCost = COST_MAP.perplexity["sonar"];

            if (!process.env.PERPLEXITY_API_KEY) {
                console.warn("[research] PERPLEXITY_API_KEY not set — competitive analysis step skipped.");
                await logProgress(toolId, `Perplexity: Skipped (PERPLEXITY_API_KEY not set)`);
            } else {
                await logProgress(toolId, `Perplexity: Running analysis (${perplexityModel})...`);
                const perplexityStart = Date.now();
                try {
                    perplexityAnalysis = await withTimeout(
                        perplexity.search(
                            `Comprehensive analysis of ${tool.name} (${tool.websiteUrl}): market position, strengths vs competitors, recent developments, user satisfaction trends, and any concerns. Focus on facts and real user experiences.`,
                            perplexityModel
                        ),
                        60000, ""
                    );
                    logApiCall({
                        service: "perplexity", endpoint: perplexityModel,
                        durationMs: Date.now() - perplexityStart,
                        estimatedCost: perplexityCost,
                        workspaceId: tool.workspaceId, toolId,
                    });
                    if (perplexityAnalysis) {
                        await logProgress(toolId, `Perplexity: Analysis complete (${perplexityAnalysis.length} chars)`);
                    }
                } catch (err) {
                    const detail = err instanceof Error ? err.message : String(err);
                    await logProgress(toolId, `Perplexity: Analysis failed (non-critical, continuing) — ${detail}`);
                }
            }
        }

        checkDeadline();

        // ── Synthesis step (shared between quick and full) ──────────────
        const allSearchResults = [...reviewResults, ...trustResults, ...uniqueRedditResults];
        const totalDataSources = [
            ...new Set([
                ...allSearchResults.map(r => { try { return new URL(r.url).hostname; } catch { return r.url; } }),
                ...uniqueRedditResults.map(() => "reddit.com"),
                domain,
            ])
        ];
        const synthesisStep = isQuick ? "4/4" : "6/6";
        await logProgress(toolId, `Step ${synthesisStep}: Synthesizing from ${totalDataSources.length} sources...`);

        const companyContext = tool.workspace.companyContext ?? "A technology company evaluating software tools.";
        // recipe was already loaded above for conditional scraping — cast to full type for prompt building
        const fullRecipe = tool.workspace.scorecardConfig as {
            systemContext?: string;
            businessUnits?: Array<{ name: string; description: string; priorities: string }>;
            evaluationCriteria?: string;
            dealBreakers?: string;
        } | null;

        // Fetch active pain points if recipe exists (for workspace fit scoring)
        const hasRecipe = !!fullRecipe?.systemContext;
        let painPointsList: Array<{ title: string; description: string | null }> = [];
        if (hasRecipe) {
            painPointsList = await db.query.painPoints.findMany({
                where: and(
                    eq(painPoints.workspaceId, tool.workspaceId),
                    eq(painPoints.active, true),
                ),
                columns: { title: true, description: true },
                limit: 10,
            });
        }

        // Build a rich recipe-based prompt if a recipe exists, otherwise fall back to context only
        const recipeSection = fullRecipe?.systemContext ? `
=== COMPANY SCORECARD RECIPE ===
${fullRecipe.systemContext}

${fullRecipe.businessUnits?.length ? `BUSINESS UNITS:\n${fullRecipe.businessUnits.map(bu =>
    `• ${bu.name}: ${bu.description}\n  Priorities: ${bu.priorities}`
).join("\n\n")}` : ""}

${fullRecipe.evaluationCriteria ? `EVALUATION CRITERIA:\n${fullRecipe.evaluationCriteria}` : ""}

${fullRecipe.dealBreakers ? `DEAL BREAKERS (flag these prominently in cons):\n${fullRecipe.dealBreakers}` : ""}

${painPointsList.length > 0 ? `COMPANY PAIN POINTS:\n${painPointsList.map(pp =>
    `- ${pp.title}${pp.description ? `: ${pp.description}` : ""}`
).join("\n")}` : ""}
` : `COMPANY CONTEXT: ${companyContext}`;

        // Sanitize tool name before embedding into AI prompt to prevent prompt injection
        const safeToolName = tool.name
            .replace(/\n/g, " ")
            .replace(/\r/g, " ")
            .replace(/`/g, "'")
            .slice(0, 200);

        const synthesisPrompt = `
You are a rigorous software procurement analyst evaluating ${safeToolName} (${tool.websiteUrl}).
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

${perplexityAnalysis ? `=== PERPLEXITY DEEP ANALYSIS ===
${perplexityAnalysis.slice(0, 3000)}` : ""}

INSTRUCTIONS:
- Be critical and specific. Don't repeat marketing copy — synthesize real user pain points.
- If pricing is hidden or requires contacting sales, set isPricingHidden=true and note it in cons.
- Extract ALL integrations mentioned (Slack, Zapier, Salesforce, etc.).
- For competitors, use their domain name (e.g. notion.so, linear.app).
- Evaluate through the lens of the company's recipe above: what works for their specific business units, and flag any deal breakers prominently.
- For sentimentConsensus: cross-reference ALL sources (reviews, trust sites, Reddit, competitor analyses). Do sources agree? What's the confidence based on volume of data?
- For marketIntel: extract company details from the about page, market research, and any other available sources. Use "Unknown" for any field you cannot determine.
${hasRecipe ? `- For workspaceFit: Score how well this tool fits the company's specific needs based on the scorecard recipe above.
  - fitScore: Overall workspace fit (0-10). Consider recipe criteria, pain points, business units, and deal breakers.
  - dealBreakerFlags: Check each deal breaker in the recipe. Only flag ones that actually apply to this tool. Use "hard" for absolute blockers and "soft" for significant concerns.
  - painPointMapping: Map each company pain point to how well this tool addresses it ("fully", "partially", "tangentially"). Only include pain points listed above.
  - businessUnitRelevance: Score relevance (0-10) for each business unit listed in the recipe. Skip if no business units are defined.` : ""}
        `.trim();

        // Attempt synthesis — primary model, then fallback to gpt-4o with json mode,
        // then a minimal data-only report so research never ends in a failed state.
        type FitData = z.infer<typeof WorkspaceFitSchema>;
        let reportData: z.infer<typeof ReportSchema>;
        let fitData: FitData | null = null;
        const promptCharLength = synthesisPrompt.length;
        const openaiStart = Date.now();

        function logOpenAISynthesis(model: string, u: { inputTokens?: number; outputTokens?: number } | undefined, startMs: number) {
            const tokensIn = u?.inputTokens ?? 0;
            const tokensOut = u?.outputTokens ?? 0;
            if (tokensIn > 30_000) {
                console.warn(`[research] HIGH TOKEN COUNT: ${tokensIn} input tokens for tool ${toolId} (model: ${model}, promptChars: ${promptCharLength}, pages: ${pagesToScrape.length})`);
            }
            logApiCall({
                service: "openai",
                endpoint: model,
                durationMs: Date.now() - startMs,
                tokensIn,
                tokensOut,
                estimatedCost: estimateOpenAICost(tokensIn, tokensOut, model),
                workspaceId: verifiedTool.workspaceId,
                toolId,
                metadata: { promptCharLength, pagesScraped: pagesToScrape.length },
            });
        }

        try {
            if (hasRecipe) {
                const { object, usage: u } = await generateObject({
                    model: openai("gpt-4o-mini"),
                    schema: ReportSchemaWithFit,
                    prompt: synthesisPrompt,
                });
                fitData = object.workspaceFit;
                reportData = object;
                logOpenAISynthesis("gpt-4o-mini", u, openaiStart);
            } else {
                const { object, usage: u } = await generateObject({
                    model: openai("gpt-4o-mini"),
                    schema: ReportSchema,
                    prompt: synthesisPrompt,
                });
                reportData = object;
                logOpenAISynthesis("gpt-4o-mini", u, openaiStart);
            }
        } catch (primaryErr) {
            const primaryMsg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
            await logProgress(toolId, `Synthesis attempt 1 failed: ${primaryMsg.slice(0, 120)} — retrying...`);
            // Brief pause before retry — prevents hitting the same rate-limit window twice
            await new Promise((r) => setTimeout(r, 2000));
            try {
                const retryStart = Date.now();
                // Retry with same model (gpt-4o-mini) — avoids 4-5x cost escalation to gpt-4o.
                // Most failures are transient rate limits or timeouts, not model capability.
                if (hasRecipe) {
                    const { object, usage: u } = await generateObject({
                        model: openai("gpt-4o-mini"),
                        schema: ReportSchemaWithFit,
                        prompt: synthesisPrompt,
                    });
                    fitData = object.workspaceFit;
                    reportData = object;
                    logOpenAISynthesis("gpt-4o-mini", u, retryStart);
                } else {
                    const { object, usage: u } = await generateObject({
                        model: openai("gpt-4o-mini"),
                        schema: ReportSchema,
                        prompt: synthesisPrompt,
                    });
                    reportData = object;
                    logOpenAISynthesis("gpt-4o-mini", u, retryStart);
                }
                await logProgress(toolId, `Synthesis: Retry succeeded.`);
            } catch (retryErr) {
                const retryMsg = retryErr instanceof Error ? retryErr.message : String(retryErr);
                await logProgress(toolId, `Synthesis: Both attempts failed (${retryMsg.slice(0, 80)}). Storing data-only report.`);
                reportData = buildFallbackReport(tool.name);
            }
        }

        // ── Step 8: Store report ──────────────────────────────────────────
        const sentimentData = {
            reviewSources: reviewResults.map((r) => ({
                title: r.title,
                url: r.url,
                score: r.score,
            })),
            trustSources: trustResults.map((r) => ({
                title: r.title,
                url: r.url,
                score: r.score,
            })),
            reviewAnswer: reviewTrustAnswer,
            trustAnswer: reviewTrustAnswer,
            redditThreads: uniqueRedditResults.map((r) => ({
                title: r.title,
                url: r.url,
                subreddit: (() => { try { return new URL(r.url).pathname.split("/")[2] || "reddit"; } catch { return "reddit"; } })(),
                snippet: r.content.slice(0, 200),
            })),
            redditAnswer: rawData.redditAnswers,
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

        try {
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
                workspaceFitData: fitData,
            });
        } catch (insertErr) {
            // Report insert failed — log and attempt a minimal save so the tool
            // reaches "active" status rather than staying stuck as "researching".
            console.error(`[research] Report insert failed for tool ${toolId}:`, insertErr);
            await logProgress(toolId, `Warning: Report save failed — storing minimal record. Re-run research to regenerate.`);
            const minimal = buildFallbackReport(tool.name);
            await db.insert(reports).values({
                toolId: tool.id,
                version: reportVersion,
                scorecardSnapshot: minimal.scorecardSnapshot,
                summary: `Research data collected but report save failed. Re-run to regenerate.`,
                features: minimal.features,
                pricing: [],
                isPricingHidden: false,
                pros: [],
                cons: [],
                competitors: [],
                integrations: [],
                rawScrapedData: rawData,
                sentimentData: null,
                workspaceFitData: null,
            });
        }

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
                    await sendResearchCompleteEmail(email, tool.name, toolId, avgScore, previousScore);
                }
            } catch (emailErr) {
                console.warn(`[research] Failed to send complete email for tool ${toolId}:`, emailErr);
            }
        }

        // Send Slack notification if workspace has Slack enabled
        if (tool.workspace.slackEnabled && tool.workspace.slackChannelId) {
            try {
                await postMessage(
                    tool.workspace.slackChannelId,
                    `Research complete: ${tool.name} scored ${avgScore.toFixed(1)}/10`,
                    researchCompleteBlocks(tool.name, toolId, avgScore, previousScore),
                    tool.workspace.slackBotToken ?? undefined,
                );
            } catch (slackErr) {
                console.warn(`[research] Failed to send Slack complete notification for tool ${toolId}:`, slackErr);
            }
        }

        revalidatePath(`/tools/${toolId}`);
        revalidatePath("/tools");
        revalidatePath("/queue");

        return { success: true };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        await logProgress(toolId, `Unexpected error: ${message.slice(0, 120)} — attempting emergency fallback report...`);

        // NEVER leave a tool in "failed" state if we can avoid it.
        // Attempt to save a fallback report and mark the tool active so the user
        // always sees something useful. Only fall back to "failed" if even this
        // last-resort save throws.
        let savedFallback = false;
        try {
            const fallback = buildFallbackReport(tool?.name ?? "Unknown Tool");
            const existingReports = await db.query.reports.findMany({
                where: eq(reports.toolId, toolId),
                columns: { id: true },
            });
            await db.insert(reports).values({
                toolId,
                version: existingReports.length + 1,
                scorecardSnapshot: fallback.scorecardSnapshot,
                summary: `Research encountered an error. A minimal report was generated — re-run research for full analysis.`,
                features: fallback.features,
                pricing: [],
                isPricingHidden: false,
                pros: ["Re-run research to generate full analysis"],
                cons: [],
                competitors: [],
                integrations: [],
                rawScrapedData: {},
                sentimentData: null,
                workspaceFitData: null,
            });
            await db.update(tools).set({
                status: "active",
                overallScore: "5.0",
                lastResearchedAt: new Date(),
            }).where(eq(tools.id, toolId));
            savedFallback = true;
            await logProgress(toolId, "Emergency fallback report saved — re-run research to generate full analysis.");
        } catch {
            // Absolute last resort — at least mark tool as failed so UI doesn't spin forever
            await db.update(tools).set({ status: "failed" }).where(eq(tools.id, toolId)).catch(err => { console.error("[research] failed to mark tool as failed:", err); });
        }

        // Refund credit if we deducted one but research didn't complete successfully
        if (creditDeducted) {
            await db.update(subscriptions)
                .set({
                    creditBalance: sql`${subscriptions.creditBalance} + 1`,
                    updatedAt: new Date(),
                })
                .where(eq(subscriptions.workspaceId, tool.workspaceId))
                .catch(err => { console.error("[research] failed to refund credit:", err); });
        }

        // Mark researchJob as failed
        if (researchJob) {
            await db.update(researchJobs).set({
                status: "failed",
                completedAt: new Date(),
                errorMessage: message,
            }).where(eq(researchJobs.id, researchJob.id)).catch(err => { console.error("[research] failed to mark job as failed:", err); });
        }

        // Send notifications only if we couldn't save any report at all
        if (!savedFallback) {
            if (tool?.submittedBy) {
                try {
                    const clerk = await clerkClient();
                    const clerkUser = await clerk.users.getUser(tool.submittedBy);
                    const email = clerkUser.emailAddresses[0]?.emailAddress;
                    if (email) {
                        await sendResearchFailedEmail(email, tool.name, toolId, message);
                    }
                } catch { /* non-critical */ }
            }

            if (tool?.workspace?.slackEnabled && tool.workspace.slackChannelId) {
                try {
                    await postMessage(
                        tool.workspace.slackChannelId,
                        `Research failed: ${tool.name}`,
                        researchFailedBlocks(tool.name, toolId, message),
                        tool.workspace.slackBotToken ?? undefined,
                    );
                } catch { /* non-critical */ }
            }
        }

        return { success: savedFallback, error: savedFallback ? undefined : message };
    }
}
