import * as Sentry from "@sentry/nextjs";
import { db } from "@/lib/db";
import { tools, researchJobs } from "@/lib/db/schema";
import { and, lte, ne, isNotNull, lt, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { after } from "next/server";
import { performDeepResearch } from "@/lib/actions/research";
import { verifyCronRequest } from "@/lib/middleware/cron-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Max tools to auto-research per cron run (avoid overloading) */
const MAX_PER_RUN = 5;

/**
 * GET /api/cron/research
 *
 * Finds tools with a scheduled research interval where next_research_at
 * is in the past, then kicks off research and advances the schedule.
 *
 * Schedule: daily at midnight UTC via Vercel Cron.
 */
export async function GET(req: Request) {
    const authError = verifyCronRequest(req);
    if (authError) return authError;

    try {
        const now = new Date();

        // ── Stuck-job recovery ───────────────────────────────────────────────
        // Any researchJob still running/queued for > 10 minutes is considered
        // lost (process crash, timeout, etc.). Reset it to "failed" and mark
        // the associated tool as "failed" so users can retry.
        // NOTE: Threshold is 10 min, matching recover-stuck-jobs cron.
        const stuckCutoff = new Date(now.getTime() - 10 * 60 * 1000);
        const stuckJobs = await db.query.researchJobs.findMany({
            where: and(
                ne(researchJobs.status, "complete"),
                ne(researchJobs.status, "failed"),
                lt(researchJobs.triggeredAt, stuckCutoff),
            ),
            columns: { id: true, toolId: true },
            limit: 20,
        });
        if (stuckJobs.length > 0) {
            const stuckToolIds = stuckJobs.map(j => j.toolId);
            const stuckJobIds = stuckJobs.map(j => j.id);
            await Promise.all([
                db.update(tools).set({ status: "failed" }).where(inArray(tools.id, stuckToolIds)),
                db.update(researchJobs).set({
                    status: "failed",
                    completedAt: now,
                    errorMessage: "Timed out — process did not complete within 10 minutes.",
                }).where(inArray(researchJobs.id, stuckJobIds)),
            ]);
        }

        // ── Scheduled research ───────────────────────────────────────────────
        const dueTools = await db.query.tools.findMany({
            where: and(
                ne(tools.researchInterval, "manual"),
                isNotNull(tools.nextResearchAt),
                lte(tools.nextResearchAt, now),
                ne(tools.status, "researching"),
                ne(tools.status, "queued"),
            ),
            columns: { id: true, researchInterval: true },
            limit: MAX_PER_RUN,
        });

        // Advance nextResearchAt — batch by interval to reduce round-trips
        if (dueTools.length > 0) {
            const byInterval = new Map<string, string[]>();
            for (const tool of dueTools) {
                const key = tool.researchInterval ?? "weekly";
                const ids = byInterval.get(key) ?? [];
                ids.push(tool.id);
                byInterval.set(key, ids);
            }

            const updates: Promise<unknown>[] = [];
            for (const [interval, ids] of byInterval) {
                const next = new Date(now);
                switch (interval) {
                    case "weekly":    next.setDate(next.getDate() + 7);    break;
                    case "biweekly":  next.setDate(next.getDate() + 14);   break;
                    case "monthly":   next.setMonth(next.getMonth() + 1);  break;
                    default:          next.setDate(next.getDate() + 7);    break;
                }
                updates.push(
                    db.update(tools).set({ nextResearchAt: next }).where(inArray(tools.id, ids))
                );
            }
            await Promise.all(updates);
        }

        // Kick off research in background (cron returns quickly)
        for (const tool of dueTools) {
            after(async () => {
                try {
                    await performDeepResearch(tool.id);
                } catch (err) {
                    Sentry.captureException(err);
                    console.error(`[cron/research] Background research failed for tool ${tool.id}:`, err);
                }
            });
        }

        return NextResponse.json({
            success: true,
            scheduled: dueTools.length,
            recovered: stuckJobs.length,
            toolIds: dueTools.map(t => t.id),
        });
    } catch (err) {
        Sentry.captureException(err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
