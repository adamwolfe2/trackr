export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { tools, reports, researchJobs, workspaceMembers, painPoints } from "@/lib/db/schema";
import { eq, sql, desc, gte, inArray, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkspaceId } from "@/lib/actions/tools";
import AnalyticsClient from "./client";

export default async function AnalyticsPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) redirect("/onboarding");

    // ── All tools ───────────────────────────────────────────────────
    const allTools = await db.query.tools.findMany({
        where: eq(tools.workspaceId, workspaceId),
        columns: {
            id: true,
            name: true,
            status: true,
            overallScore: true,
            websiteUrl: true,
            lastResearchedAt: true,
            submittedAt: true,
            submittedBy: true,
        },
        orderBy: [desc(tools.submittedAt)],
    });

    // ── Reports count ───────────────────────────────────────────────
    const toolIds = allTools.map((t) => t.id);
    let totalReports = 0;
    if (toolIds.length > 0) {
        const reportCount = await db
            .select({ count: sql<string>`count(*)` })
            .from(reports)
            .where(inArray(reports.toolId, toolIds));
        totalReports = Number(reportCount[0]?.count ?? 0);
    }

    // ── Research jobs for top researched tools ──────────────────────
    let researchCounts: { toolId: string; count: number }[] = [];
    if (toolIds.length > 0) {
        const jobCounts = await db
            .select({
                toolId: researchJobs.toolId,
                count: sql<string>`count(*)`,
            })
            .from(researchJobs)
            .where(inArray(researchJobs.toolId, toolIds))
            .groupBy(researchJobs.toolId)
            .orderBy(sql`count(*) desc`)
            .limit(10);
        researchCounts = jobCounts.map((r) => ({
            toolId: r.toolId,
            count: Number(r.count),
        }));
    }

    // ── Research activity by week (last 8 weeks) ────────────────────
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    let weeklyActivity: { week: string; count: number }[] = [];
    if (toolIds.length > 0) {
        const weeklyRaw = await db
            .select({
                week: sql<string>`to_char(date_trunc('week', ${researchJobs.triggeredAt}), 'YYYY-MM-DD')`,
                count: sql<string>`count(*)`,
            })
            .from(researchJobs)
            .where(
                and(
                    inArray(researchJobs.toolId, toolIds),
                    gte(researchJobs.triggeredAt, eightWeeksAgo)
                )
            )
            .groupBy(sql`date_trunc('week', ${researchJobs.triggeredAt})`)
            .orderBy(sql`date_trunc('week', ${researchJobs.triggeredAt})`);

        weeklyActivity = weeklyRaw.map((r) => ({
            week: r.week,
            count: Number(r.count),
        }));
    }

    // ── Workspace members ───────────────────────────────────────────
    const members = await db.query.workspaceMembers.findMany({
        where: eq(workspaceMembers.workspaceId, workspaceId),
        columns: { id: true, userId: true, role: true },
    });

    // Count research jobs per member (submittedBy on tools)
    const memberActivity = members.map((m) => {
        const memberTools = allTools.filter((t) => t.submittedBy === m.userId);
        return {
            userId: m.userId,
            role: m.role,
            toolCount: memberTools.length,
        };
    });

    // ── Pain points ─────────────────────────────────────────────────
    const activePainPoints = await db
        .select({ count: sql<string>`count(*)` })
        .from(painPoints)
        .where(and(eq(painPoints.workspaceId, workspaceId), eq(painPoints.active, true)));
    const painPointCount = Number(activePainPoints[0]?.count ?? 0);

    // ── Compute stats ───────────────────────────────────────────────
    const scoredTools = allTools
        .filter((t) => t.overallScore !== null)
        .map((t) => ({ ...t, score: Number(t.overallScore) }));

    const avgScore =
        scoredTools.length > 0
            ? scoredTools.reduce((sum, t) => sum + t.score, 0) / scoredTools.length
            : 0;

    const statusCounts = {
        submitted: allTools.filter((t) => ["submitted", "queued"].includes(t.status)).length,
        researching: allTools.filter((t) => t.status === "researching").length,
        active: allTools.filter((t) => t.status === "active").length,
        archived: allTools.filter((t) => t.status === "archived").length,
        failed: allTools.filter((t) => t.status === "failed").length,
    };

    // Top researched tools with names and avg scores
    const topResearched = researchCounts.map((rc) => {
        const tool = allTools.find((t) => t.id === rc.toolId);
        return {
            name: tool?.name ?? "Unknown",
            researchCount: rc.count,
            avgScore: tool?.overallScore ? Number(tool.overallScore) : null,
        };
    });

    return (
        <AnalyticsClient
            totalTools={allTools.length}
            totalReports={totalReports}
            avgScore={avgScore}
            activePainPoints={painPointCount}
            weeklyActivity={weeklyActivity}
            topResearched={topResearched}
            statusCounts={statusCounts}
            memberActivity={memberActivity}
        />
    );
}
