import { db } from "@/lib/db";
import { researchJobs, tools, reports } from "@/lib/db/schema";
import { eq, and, lte, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { after } from "next/server";
import { performDeepResearch } from "@/lib/actions/research";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Jobs running longer than this are considered stuck */
const STUCK_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

/**
 * GET /api/cron/recover-stuck-jobs
 *
 * Finds research jobs stuck in "running" status for >10 minutes
 * and marks them as failed, reverting the associated tool status.
 *
 * Schedule: every 5 minutes via Vercel Cron or Upstash.
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
        const stuckThreshold = new Date(now.getTime() - STUCK_THRESHOLD_MS);

        // Find all jobs stuck in "running" that started > 10 min ago
        const stuckJobs = await db.query.researchJobs.findMany({
            where: and(
                eq(researchJobs.status, "running"),
                lte(researchJobs.triggeredAt, stuckThreshold),
            ),
            columns: { id: true, toolId: true, triggeredAt: true },
        });

        if (stuckJobs.length === 0) {
            return NextResponse.json({ success: true, recovered: 0 });
        }

        const stuckJobIds = stuckJobs.map((j) => j.id);
        const stuckToolIds = [...new Set(stuckJobs.map((j) => j.toolId))];

        // Mark all stuck jobs as failed
        await db
            .update(researchJobs)
            .set({
                status: "failed",
                completedAt: now,
                errorMessage: "Research timed out (exceeded 10 minute limit). Please retry.",
            })
            .where(inArray(researchJobs.id, stuckJobIds));

        // For each stuck tool, revert status and decide whether to auto-retry:
        // - If tool has at least one report → "active" (previous research is still valid)
        // - If no report and stuck job count <= 2 → auto-retry via after()
        // - Otherwise → "failed" (so user sees retry button)
        const toolsToRetry: string[] = [];
        for (const toolId of stuckToolIds) {
            const existingReport = await db.query.reports.findFirst({
                where: eq(reports.toolId, toolId),
                columns: { id: true },
            });

            if (existingReport) {
                await db.update(tools).set({ status: "active" }).where(eq(tools.id, toolId));
            } else {
                // Count how many times this tool has been attempted (including the stuck one)
                const allJobs = await db.query.researchJobs.findMany({
                    where: eq(researchJobs.toolId, toolId),
                    columns: { id: true },
                });
                if (allJobs.length <= 2) {
                    // First or second attempt — auto-retry
                    toolsToRetry.push(toolId);
                    await db.update(tools).set({ status: "failed" }).where(eq(tools.id, toolId));
                } else {
                    await db.update(tools).set({ status: "failed" }).where(eq(tools.id, toolId));
                }
            }
        }

        // Fire auto-retries outside the HTTP response window
        for (const toolId of toolsToRetry) {
            after(async () => {
                try {
                    await performDeepResearch(toolId);
                } catch (err) {
                    console.error(`[api/cron/recover-stuck-jobs] auto-retry failed for tool ${toolId}:`, err);
                }
            });
        }

        return NextResponse.json({
            success: true,
            recovered: stuckJobs.length,
            autoRetried: toolsToRetry.length,
            toolIds: stuckToolIds,
        });
    } catch (err) {
        console.error("[api/cron/recover-stuck-jobs]", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
