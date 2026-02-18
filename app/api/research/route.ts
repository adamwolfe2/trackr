import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tools, reports } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { FirecrawlService } from "@/lib/services/firecrawl";
import { OpenAIService } from "@/lib/services/openai";
import { z } from "zod";

const ResearchRequestSchema = z.object({
    toolId: z.string().uuid("toolId must be a valid UUID"),
    url: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
    // Parse body once — req.json() can only be consumed once per request
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = ResearchRequestSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? "Invalid request" },
            { status: 400 }
        );
    }

    const { toolId, url: providedUrl } = parsed.data;

    try {
        // 1. Fetch tool details if URL not provided
        let targetUrl = providedUrl;
        if (!targetUrl) {
            const tool = await db.query.tools.findFirst({
                where: eq(tools.id, toolId),
            });
            if (!tool?.websiteUrl) {
                return NextResponse.json(
                    { error: "Tool has no website URL" },
                    { status: 400 }
                );
            }
            targetUrl = tool.websiteUrl;
        }

        // 2. Update status to 'researching'
        await db
            .update(tools)
            .set({ status: "researching", lastResearchedAt: new Date() })
            .where(eq(tools.id, toolId));

        const firecrawl = new FirecrawlService();
        const openaiService = new OpenAIService();

        // 3. Scrape website
        const scrapeResult = await firecrawl.scrapeUrl(targetUrl);
        if (!scrapeResult.success) {
            throw new Error("Failed to scrape website: " + (scrapeResult.error ?? "unknown"));
        }

        const content =
            scrapeResult.data?.markdown ??
            scrapeResult.data?.content ??
            "No content found.";

        // 4. Analyze with AI
        const analysis = await openaiService.analyzeTool(content);

        // 5. Save report
        await db.insert(reports).values({
            toolId,
            summary: analysis.summary ?? null,
            features: analysis.features ?? [],
            pricing: analysis.pricing ?? [],
            pros: analysis.pros ?? [],
            cons: analysis.cons ?? [],
            scorecardSnapshot: analysis.scorecard ?? {},
            createdAt: new Date(),
        });

        // 6. Update tool status — "active" is the valid post-research status
        await db
            .update(tools)
            .set({
                status: "active",
                overallScore: analysis.overallScore?.toString() ?? "0",
                lastResearchedAt: new Date(),
            })
            .where(eq(tools.id, toolId));

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";

        // Reset tool status so user can retry
        await db
            .update(tools)
            .set({ status: "failed" })
            .where(eq(tools.id, toolId));

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
