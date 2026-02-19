import { db } from "@/lib/db";
import { feedChannels } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ingestAllChannels } from "@/lib/actions/feed";
import { enrichFeedItems } from "@/lib/actions/feed-enrichment";
import { extractToolsFromFeedItems, generateSuggestions } from "@/lib/actions/suggestions";
import { timingSafeEqual } from "crypto";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min max for processing all workspaces

export async function GET(req: Request) {
    const authHeader = req.headers.get('Authorization') || '';
    const expected = `Bearer ${process.env.CRON_SECRET || ''}`;
    if (!process.env.CRON_SECRET || authHeader.length !== expected.length || !timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Find all workspaces that have at least one feed channel
        const channels = await db.query.feedChannels.findMany({
            where: eq(feedChannels.enabled, true),
            columns: { workspaceId: true },
        });

        // Deduplicate workspace IDs
        const workspaceIds = [...new Set(channels.map(c => c.workspaceId))];

        let totalIngested = 0;
        let totalEnriched = 0;
        let totalExtracted = 0;
        let totalSuggestions = 0;

        for (const wsId of workspaceIds) {
            try {
                // Step 1: Ingest new articles from all channels
                const ingested = await ingestAllChannels(wsId);
                totalIngested += ingested;

                // Step 2: Enrich with AI summaries + relevance scores
                const enriched = await enrichFeedItems(wsId);
                totalEnriched += enriched;

                // Step 3: Extract tool mentions from high-relevance items
                const extracted = await extractToolsFromFeedItems(wsId);
                totalExtracted += extracted;

                // Step 4: Generate suggestions by matching against stack + pain points
                if (extracted > 0) {
                    const suggestions = await generateSuggestions(wsId);
                    totalSuggestions += suggestions;
                }
            } catch (error) {
                console.error(`Feed cron failed for workspace ${wsId}:`, error);
            }
        }

        return NextResponse.json({
            success: true,
            workspaces: workspaceIds.length,
            ingested: totalIngested,
            enriched: totalEnriched,
            toolsExtracted: totalExtracted,
            suggestions: totalSuggestions,
        });
    } catch (error) {
        console.error("Feed cron error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
