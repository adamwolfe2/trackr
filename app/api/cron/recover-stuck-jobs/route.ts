import { db } from "@/lib/db";
import { researchJobs, tools, reports } from "@/lib/db/schema";
import { eq, and, lte, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { after } from "next/server";
import { performDeepResearch } from "@/lib/actions/research";
import { verifyCronRequest } from "@/lib/middleware/cron-auth";

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
    const authError = verifyCronRequest(req);
    if (authError) return authError;

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

        // Batch-fetch reports and job counts for all stuck tools to avoid N+1
        const [existingReports, allJobsForTools] = await Promise.all([
            db.query.reports.findMany({
                where: inArray(reports.toolId, stuckToolIds),
                columns: { toolId: true },
            }),
            db.query.researchJobs.findMany({
                where: inArray(researchJobs.toolId, stuckToolIds),
                columns: { toolId: true },
            }),
        ]);

        const toolsWithReports = new Set(existingReports.map(r => r.toolId));
        const jobCountByTool = new Map<string, number>();
        for (const job of allJobsForTools) {
            jobCountByTool.set(job.toolId, (jobCountByTool.get(job.toolId) ?? 0) + 1);
        }

        // Classify tools: revert to active (has report), auto-retry, or mark failed
        const toolsToRetry: string[] = [];
        const toolsToActive: string[] = [];
        const toolsToFailed: string[] = [];

        for (const toolId of stuckToolIds) {
            if (toolsWithReports.has(toolId)) {
                toolsToActive.push(toolId);
            } else if ((jobCountByTool.get(toolId) ?? 0) <= 2) {
                toolsToRetry.push(toolId);
                toolsToFailed.push(toolId);
            } else {
                toolsToFailed.push(toolId);
            }
        }

        // Batch status updates
        const statusUpdates: Promise<unknown>[] = [];
        if (toolsToActive.length > 0) {
            statusUpdates.push(db.update(tools).set({ status: "active" }).where(inArray(tools.id, toolsToActive)));
        }
        if (toolsToFailed.length > 0) {
            statusUpdates.push(db.update(tools).set({ status: "failed" }).where(inArray(tools.id, toolsToFailed)));
        }
        await Promise.all(statusUpdates);

        // Fire auto-retries outside the HTTP response window
        for (const toolId of toolsToRetry) {
            after(async () => {
                try {
                    await performDeepResearch(toolId);
                } catch {
                    // Research failure is handled by job status update
                }
            });
        }

        return NextResponse.json({
            success: true,
            recovered: stuckJobs.length,
            autoRetried: toolsToRetry.length,
            toolIds: stuckToolIds,
        });
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
