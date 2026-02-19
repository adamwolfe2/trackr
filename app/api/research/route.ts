import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tools, reports, workspaceMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { FirecrawlService } from "@/lib/services/firecrawl";
import { OpenAIService } from "@/lib/services/openai";
import { currentUser } from "@clerk/nextjs/server";
import { rateLimit } from "@/lib/middleware/rate-limit";
import { z } from "zod";

const ResearchRequestSchema = z.object({
    toolId: z.string().uuid("toolId must be a valid UUID"),
    url: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
    // Auth check
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Workspace membership check
    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });
    if (!member) return NextResponse.json({ error: "No workspace found" }, { status: 403 });

    // Rate limit: 10 research requests per minute per user
    const rl = rateLimit(`research:${user.id}`, { limit: 10, windowSeconds: 60 });
    if (!rl.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

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

    // Fetch tool and verify workspace ownership
    const tool = await db.query.tools.findFirst({
        where: eq(tools.id, toolId),
    });
    if (!tool) return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    if (tool.workspaceId !== member.workspaceId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const targetUrl = providedUrl ?? tool.websiteUrl;
    if (!targetUrl) {
        return NextResponse.json({ error: "Tool has no website URL" }, { status: 400 });
    }

    try {
        // Update status to 'researching'
        await db
            .update(tools)
            .set({ status: "researching", lastResearchedAt: new Date() })
            .where(eq(tools.id, toolId));

        const firecrawl = new FirecrawlService();
        const openaiService = new OpenAIService();

        // Scrape website
        const scrapeResult = await firecrawl.scrapeUrl(targetUrl);
        if (!scrapeResult.success) {
            throw new Error("Failed to scrape website: " + (scrapeResult.error ?? "unknown"));
        }

        const content =
            scrapeResult.data?.markdown ??
            scrapeResult.data?.content ??
            "No content found.";

        // Analyze with AI
        const analysis = await openaiService.analyzeTool(content);

        // Save report
        await db.insert(reports).values({
            toolId,
            summary: analysis.summary ?? null,
            features: analysis.features ?? [],
            pricing: analysis.pricing ?? [],
            pros: analysis.pros ?? [],
            cons: analysis.cons ?? [],
            scorecardSnapshot: analysis.scorecard ?? {},
            createdAt: new Date(),
        } as typeof reports.$inferInsert);

        // Update tool status — "active" is the valid post-research status
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
