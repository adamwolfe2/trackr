import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tools, reports } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { FirecrawlService } from "@/lib/services/firecrawl";
import { PerplexityService } from "@/lib/services/perplexity"; // Or OpenAI generic service
import { OpenAIService } from "@/lib/services/openai"; // Assuming this exists or I'll use direct OpenAI

// This endpoint triggers a research job
export async function POST(req: NextRequest) {
    try {
        const { toolId, url } = await req.json();

        if (!toolId) {
            return NextResponse.json({ error: "Missing toolId" }, { status: 400 });
        }

        // 1. Fetch tool details if URL not provided
        let targetUrl = url;
        if (!targetUrl) {
            const tool = await db.query.tools.findFirst({
                where: eq(tools.id, toolId)
            });
            if (!tool?.websiteUrl) {
                return NextResponse.json({ error: "Tool has no website URL" }, { status: 400 });
            }
            targetUrl = tool.websiteUrl;
        }

        // 2. Update status to 'researching'
        await db.update(tools)
            .set({ status: "researching", lastResearchedAt: new Date() })
            .where(eq(tools.id, toolId));

        // 2. Initialize Services
        const firecrawl = new FirecrawlService();
        const openai = new OpenAIService();

        // 3. Scrape Website
        // In a real background job, we wouldn't await this entire chain in the HTTP handler,
        // but for this MVP we will process it and return the result or use a stream.
        // For better UX with the stream component, we might want to return a stream, 
        // but the current ResearchStream component pulls logs. 
        // Let's implement a simple "process and return" for now, or start a background promise (Vercel has limits on this).

        // BETTER APPROACH: Use a persistent log or state in DB that the frontend polls.
        // But for "Show me it working", let's do a direct await and assume the user waits.

        console.log(`[Research] Scraping ${url}...`);
        const scrapeResult = await firecrawl.scrapeUrl(url);

        if (!scrapeResult.success) {
            throw new Error("Failed to scrape website: " + scrapeResult.error);
        }

        const content = scrapeResult.data?.content || "No content found.";

        // 4. Analyze with AI
        console.log("[Research] Analyzing content...");
        const analysis = await openai.analyzeTool(content);

        // 5. Save Report
        await db.insert(reports).values({
            id: crypto.randomUUID(),
            toolId: toolId,
            summary: analysis.summary,
            features: analysis.features || [],
            pricing: analysis.pricing || [],
            pros: analysis.pros || [],
            cons: analysis.cons || [],
            scorecardSnapshot: analysis.scorecard || {},
            createdAt: new Date()
        });

        // 6. Update Tool Score & Status
        await db.update(tools)
            .set({
                status: "researched",
                overallScore: analysis.overallScore?.toString() || "0"
            })
            .where(eq(tools.id, toolId));

        return NextResponse.json({ success: true, report: analysis });

    } catch (error: any) {
        console.error("Research Error:", error);

        // Reset status on error
        const { toolId } = await req.json().catch(() => ({ toolId: null }));
        if (toolId) {
            await db.update(tools).set({ status: "error" }).where(eq(tools.id, toolId));
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
