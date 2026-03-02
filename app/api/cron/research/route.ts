import { db } from "@/lib/db";
import { tools, researchJobs } from "@/lib/db/schema";
import { eq, and, lte, ne, isNotNull, lt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { after } from "next/server";
import { performDeepResearch } from "@/lib/actions/research";

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

        // ── Stuck-job recovery ───────────────────────────────────────────────
        // Any researchJob still running/queued for > 15 minutes is considered
        // lost (process crash, timeout, etc.). Reset it to "failed" and mark
        // the associated tool as "failed" so users can retry.
        const stuckCutoff = new Date(now.getTime() - 15 * 60 * 1000);
        const stuckJobs = await db.query.researchJobs.findMany({
            where: and(
                ne(researchJobs.status, "complete"),
                ne(researchJobs.status, "failed"),
                lt(researchJobs.triggeredAt, stuckCutoff),
            ),
            columns: { id: true, toolId: true },
            limit: 20,
        });
        for (const job of stuckJobs) {
            await db.update(tools).set({ status: "failed" }).where(eq(tools.id, job.toolId));
            await db.update(researchJobs).set({
                status: "failed",
                completedAt: now,
                errorMessage: "Timed out — process did not complete within 15 minutes.",
            }).where(eq(researchJobs.id, job.id));
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

        // Advance nextResearchAt for each tool before triggering research
        for (const tool of dueTools) {
            const next = new Date(now);
            switch (tool.researchInterval) {
                case "weekly":    next.setDate(next.getDate() + 7);    break;
                case "biweekly":  next.setDate(next.getDate() + 14);   break;
                case "monthly":   next.setMonth(next.getMonth() + 1);  break;
                default:          next.setDate(next.getDate() + 7);    break;
            }
            await db.update(tools).set({ nextResearchAt: next }).where(eq(tools.id, tool.id));
        }

        // Kick off research in background (cron returns quickly)
        for (const tool of dueTools) {
            after(async () => {
                await performDeepResearch(tool.id).catch(() => null);
            });
        }

        return NextResponse.json({
            success: true,
            scheduled: dueTools.length,
            recovered: stuckJobs.length,
            toolIds: dueTools.map(t => t.id),
        });
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
