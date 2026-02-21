import { db } from "@/lib/db";
import { researchJobs, tools } from "@/lib/db/schema";
import { eq, and, lte, gte, count, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { after } from "next/server";
import { performDeepResearch } from "@/lib/actions/research";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Only auto-retry jobs that failed at least this long ago */
const RETRY_DELAY_MS = 5 * 60 * 1000; // 5 minutes

/** Don't auto-retry failures older than this (user should retry manually) */
const RETRY_WINDOW_MS = 120 * 60 * 1000; // 2 hours

/**
 * GET /api/cron/auto-retry-failed
 *
 * Finds tools stuck in "failed" status whose first (and only) research job
 * failed between 5 minutes and 2 hours ago, then triggers a single automatic
 * retry. Tools that have already been retried (job count > 1) are skipped.
 *
 * Schedule: every 10 minutes via Vercel Cron.
 */
export async function GET(req: Request) {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
        return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const authHeader = req.headers.get("Authorization") || "";
    const expected = `Bearer ${cronSecret}`;
    if (
        authHeader.length !== expected.length ||
        !timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
    ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const now = new Date();
        const earliestRetry = new Date(now.getTime() - RETRY_WINDOW_MS); // 2 hours ago
        const latestRetry = new Date(now.getTime() - RETRY_DELAY_MS);   // 5 minutes ago

        // Find all research jobs that failed within the retry window
        const candidateJobs = await db.query.researchJobs.findMany({
            where: and(
                eq(researchJobs.status, "failed"),
                gte(researchJobs.completedAt, earliestRetry),
                lte(researchJobs.completedAt, latestRetry),
            ),
            columns: { id: true, toolId: true, completedAt: true },
        });

        if (candidateJobs.length === 0) {
            return NextResponse.json({ success: true, retried: 0 });
        }

        // Deduplicate by toolId
        const toolIdSet = new Set(candidateJobs.map((j) => j.toolId));
        const toolIds = [...toolIdSet];

        // For each candidate tool, count total research jobs.
        // Only auto-retry if total job count === 1 (never retried before).
        const jobCounts = await db
            .select({ toolId: researchJobs.toolId, total: count() })
            .from(researchJobs)
            .where(inArray(researchJobs.toolId, toolIds))
            .groupBy(researchJobs.toolId);

        const eligibleToolIds = jobCounts
            .filter((row) => row.total === 1)
            .map((row) => row.toolId);

        if (eligibleToolIds.length === 0) {
            return NextResponse.json({ success: true, retried: 0 });
        }

        // Verify tools still have "failed" status (could have been manually retried
        // between our job count query and now)
        const failedTools = await db.query.tools.findMany({
            where: and(
                eq(tools.status, "failed"),
                inArray(tools.id, eligibleToolIds),
            ),
            columns: { id: true },
        });

        const toolsToRetry = failedTools.map((t) => t.id);

        if (toolsToRetry.length === 0) {
            return NextResponse.json({ success: true, retried: 0 });
        }

        // Kick off research in the background for each tool.
        // after() ensures the cron returns quickly while research runs asynchronously.
        for (const toolId of toolsToRetry) {
            after(() => performDeepResearch(toolId));
        }

        return NextResponse.json({
            success: true,
            retried: toolsToRetry.length,
            toolIds: toolsToRetry,
        });
    } catch (err) {
        console.error("[api/cron/auto-retry-failed]", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
