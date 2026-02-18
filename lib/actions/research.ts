"use server";

import { db } from "@/lib/db";
import { tools, reports, subscriptions } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { firecrawl } from "@/lib/services/firecrawl";
import { perplexity } from "@/lib/services/perplexity";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const ReportSchema = z.object({
    summary: z.string().describe("Executive summary of the tool analysis, max 2 sentences."),
    scorecardSnapshot: z.record(z.string(), z.object({
        score: z.number().min(0).max(10),
        justification: z.string()
    })).describe("Scores (0-10) for keys like 'start_up_fit', 'pricing_value', 'integration_depth'"),
    features: z.object({
        list: z.array(z.string()).describe("List of key features")
    }),
    pricing: z.array(z.object({
        tier: z.string(),
        price: z.string()
    })).describe("Pricing tiers found"),
    isPricingHidden: z.boolean().describe("True if pricing is not publicly listed and requires a demo/contact."),
    pros: z.array(z.string()).describe("Top 3-5 pros"),
    cons: z.array(z.string()).describe("Top 3-5 cons"),
    competitors: z.array(z.string()).describe("List of main competitors mentioned or known"),
    categories: z.array(z.string()).describe("3-5 relevant categories for this tool (e.g. CRM, Analytics, DevTool)"),
});

// Helper to log progress to the DB
async function logProgress(toolId: string, message: string) {
    console.log(`[Research ${toolId}]: ${message}`);

    // We append the new log to the existing JSON array
    // Note: This is an MVP approach. Ideally, we'd use a separate logs table for high-frequency writes.
    // Given the low volume (4-5 steps), this is fine.

    const timestamp = new Date().toISOString();
    const newLog = { message, timestamp };

    // Use sql wrapper to append to jsonb array
    await db.update(tools)
        .set({
            // @ts-ignore
            researchLogs: sql`
                CASE 
                    WHEN research_logs IS NULL THEN jsonb_build_array(${newLog}::jsonb)
                    ELSE research_logs || ${newLog}::jsonb
                END
            `
        })
        .where(eq(tools.id, toolId));
}

export async function performDeepResearch(toolId: string) {
    console.log(`Starting deep research for tool ${toolId}`);

    const tool = await db.query.tools.findFirst({
        where: eq(tools.id, toolId),
        with: {
            workspace: true
        }
    });

    if (!tool || !tool.websiteUrl) throw new Error("Tool not found or missing URL");

    // Check Subscription Limits
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, tool.workspaceId)
    });

    // @ts-ignore
    const { getPlanLimits } = await import("@/lib/config/subscriptions");
    const limits = getPlanLimits(subscription);

    if (!limits.limits.deepResearch) {
        throw new Error("Deep research is a Pro feature. Please upgrade.");
    }

    // Reset logs and status
    await db.update(tools).set({
        status: "researching",
        // @ts-ignore
        researchLogs: []
    }).where(eq(tools.id, toolId));

    try {
        const rawData: any = {};

        // STEP 1: Map the Site (Depth)
        await logProgress(toolId, "Initializing Agent: Mapping site structure...");
        const mapResult = await firecrawl.mapSite(tool.websiteUrl);
        const subPages: string[] = (mapResult.success && Array.isArray(mapResult.data)) ? mapResult.data : [];

        const pricingUrl = subPages.find((u: string) => u.includes("pricing")) || tool.websiteUrl;
        const featuresUrl = subPages.find((u: string) => u.includes("features") || u.includes("product")) || tool.websiteUrl;

        // STEP 2: Scrape Key Pages (Depth)
        await logProgress(toolId, `Identified key pages. Scraping ${pricingUrl} and ${featuresUrl}...`);

        const [mainScrape, pricingScrape] = await Promise.all([
            firecrawl.scrapeUrl(tool.websiteUrl),
            pricingUrl !== tool.websiteUrl ? firecrawl.scrapeUrl(pricingUrl) : Promise.resolve({ success: true, data: { markdown: "" } })
        ]);

        rawData.main = mainScrape.data?.markdown || "";
        rawData.pricing = pricingScrape.data?.markdown || "";

        // STEP 3: Perplexity Search (Breadth/Sentiment)
        await logProgress(toolId, "Running Perplexity search for sentiment and competitors...");
        const sentimentAnalysis = await perplexity.search(
            `What are the main pros and cons of ${tool.name}? Are there any major complaints on Reddit or G2? Who are its main competitors?`
        );
        rawData.sentiment = sentimentAnalysis;

        // STEP 4: Synthesize Report (Analysis)
        await logProgress(toolId, "Synthesizing final report with GPT-4o...");

        // @ts-ignore
        const scorecardConfig = tool.workspace.scorecardConfig || {};
        // @ts-ignore
        const companyContext = tool.workspace.companyContext || "Generic Company";

        const { object: reportData } = await generateObject({
            model: openai("gpt-4o"),
            schema: ReportSchema,
            prompt: `
                You are a procurement expert for: ${companyContext}
                Scorecard Preferences: ${JSON.stringify(scorecardConfig)}

                Perform a deep analysis of ${tool.name}.
                
                Sources:
                1. Official Website Main Page:
                ${rawData.main.slice(0, 5000)}
                
                2. Official Pricing Page:
                ${rawData.pricing.slice(0, 3000)}
                
                3. External Sentiment (Reviews/Competitors):
                ${rawData.sentiment}

                Task:
                Generate a strict analysis report fitting the schema.
                - Be critical. If pricing is hidden, say so.
                - Use the sentiment analysis to populate Pros/Cons.
                - Score based on the company's specific needs (Context).
            `
        });

        // 5. Save Report
        await db.insert(reports).values({
            toolId: tool.id,
            version: 1,
            scorecardSnapshot: reportData.scorecardSnapshot,
            summary: reportData.summary,
            features: reportData.features,
            pricing: reportData.pricing,
            isPricingHidden: reportData.isPricingHidden,
            pros: reportData.pros,
            cons: reportData.cons,
            competitors: reportData.competitors,
            rawScrapedData: rawData,
        });

        await logProgress(toolId, "Research complete. Finalizing report...");

        // 6. Update Status
        const scores = Object.values(reportData.scorecardSnapshot).map((s: any) => s.score);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

        await db.update(tools).set({
            status: "active",
            overallScore: avgScore.toFixed(1),
            lastResearchedAt: new Date(),
            category: reportData.categories, // Auto-tagging
        }).where(eq(tools.id, toolId));

        revalidatePath(`/tools/${toolId}`);
        revalidatePath("/tools");

        return { success: true, reportId: tool.id };

    } catch (error: any) {
        console.error("Research failed:", error);
        await logProgress(toolId, `Error: ${error.message}`);
        await db.update(tools).set({ status: "failed" }).where(eq(tools.id, toolId));
        return { success: false, error: error.message };
    }
}
