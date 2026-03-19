"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
    boardReports,
    tools,
    softwareSpend,
    decisionLog,
    stackHealthScores,
    researchJobs,
} from "@/lib/db/schema";
import { eq, desc, and, sql, gte, inArray } from "drizzle-orm";
import { computeStackInsights } from "@/lib/utils/stack-insights";
import { requireWorkspaceMember } from "@/lib/middleware/require-workspace-member";
import crypto from "crypto";

// ── Types ────────────────────────────────────────────────────────────

type BoardReportPeriod = "monthly" | "quarterly" | "annual";

type BoardReportData = {
    period: BoardReportPeriod;
    periodLabel: string;
    generatedAt: string;
    // Stack Health
    healthScore: number | null;
    healthBreakdown: Record<string, number> | null;
    // Spend Overview
    totalMonthlySpend: number;
    spendByCategory: Array<{ category: string; total: number }>;
    spendMoMChange: number | null;
    // Tool Portfolio
    totalTools: number;
    toolsByStatus: Record<string, number>;
    topToolsByScore: Array<{ name: string; score: number }>;
    newToolsThisPeriod: number;
    // AI Nativeness
    aiNativenessScore: number;
    aiNativenessLabel: string;
    aiNativeCount: number;
    aiEnabledCount: number;
    traditionalCount: number;
    // Recent Decisions
    recentDecisions: Array<{
        action: string;
        actorName: string | null;
        details: unknown;
        createdAt: string;
    }>;
    // Upcoming Renewals
    upcomingRenewals: Array<{
        toolName: string;
        renewalDate: string;
        monthlyCost: string | null;
    }>;
    // Research
    researchSuccessRate: number;
    totalResearchJobs: number;
};

// ── Helpers ──────────────────────────────────────────────────────────

function getPeriodLabel(period: BoardReportPeriod): string {
    const now = new Date();
    const month = now.toLocaleString("en-US", { month: "long" });
    const year = now.getFullYear();

    switch (period) {
        case "monthly":
            return `${month} ${year}`;
        case "quarterly": {
            const q = Math.ceil((now.getMonth() + 1) / 3);
            return `Q${q} ${year}`;
        }
        case "annual":
            return `${year}`;
    }
}

function getPeriodStart(period: BoardReportPeriod): Date {
    const now = new Date();
    switch (period) {
        case "monthly":
            return new Date(now.getFullYear(), now.getMonth(), 1);
        case "quarterly": {
            const q = Math.floor(now.getMonth() / 3) * 3;
            return new Date(now.getFullYear(), q, 1);
        }
        case "annual":
            return new Date(now.getFullYear(), 0, 1);
    }
}

// ── Actions ──────────────────────────────────────────────────────────

export async function generateBoardReport(
    workspaceId: string,
    period: BoardReportPeriod,
    createdBy: string
) {
    await requireWorkspaceMember(workspaceId);
    const periodStart = getPeriodStart(period);
    const periodEnd = new Date();
    const periodLabel = getPeriodLabel(period);

    // 1. Gather tools data
    const allTools = await db.query.tools.findMany({
        where: eq(tools.workspaceId, workspaceId),
        columns: {
            id: true,
            name: true,
            status: true,
            overallScore: true,
            submittedAt: true,
        },
        orderBy: [desc(tools.submittedAt)],
    });

    const toolIds = allTools.map((t) => t.id);

    const totalTools = allTools.length;
    const toolsByStatus: Record<string, number> = {};
    for (const t of allTools) {
        toolsByStatus[t.status] = (toolsByStatus[t.status] ?? 0) + 1;
    }

    const topToolsByScore = allTools
        .filter((t) => t.overallScore !== null)
        .sort((a, b) => Number(b.overallScore) - Number(a.overallScore))
        .slice(0, 5)
        .map((t) => ({ name: t.name, score: Number(t.overallScore) }));

    const newToolsThisPeriod = allTools.filter(
        (t) => t.submittedAt >= periodStart
    ).length;

    // 2. Gather spend data
    const spendEntries = await db.query.softwareSpend.findMany({
        where: eq(softwareSpend.workspaceId, workspaceId),
    });

    const insights = computeStackInsights(spendEntries);

    const catMap = new Map<string, number>();
    for (const e of spendEntries) {
        if (e.status === "active") {
            const cat = e.category ?? "Other";
            catMap.set(
                cat,
                (catMap.get(cat) ?? 0) + (parseFloat(e.monthlyCost ?? "0") || 0)
            );
        }
    }
    const spendByCategory: Array<{ category: string; total: number }> = [];
    catMap.forEach((total, category) => spendByCategory.push({ category, total }));
    spendByCategory.sort((a, b) => b.total - a.total);

    // MoM change: compare current total spend to the most recent board report's total
    let spendMoMChange: number | null = null;
    const previousReport = await db.query.boardReports.findFirst({
        where: eq(boardReports.workspaceId, workspaceId),
        orderBy: [desc(boardReports.createdAt)],
    });
    if (previousReport) {
        const prevData = previousReport.data as BoardReportData | null;
        const prevSpend = prevData?.totalMonthlySpend;
        if (prevSpend != null && prevSpend > 0) {
            spendMoMChange = Math.round(
                ((insights.totalActiveSpend - prevSpend) / prevSpend) * 100
            );
        }
    }

    // 3. Health score
    const latestHealth = await db.query.stackHealthScores.findFirst({
        where: eq(stackHealthScores.workspaceId, workspaceId),
        orderBy: [desc(stackHealthScores.computedAt)],
    });

    const healthScore = latestHealth?.score ?? null;
    const healthBreakdown = latestHealth?.breakdown as Record<string, number> | null;

    // 4. Recent decisions
    const decisions = await db.query.decisionLog.findMany({
        where: and(
            eq(decisionLog.workspaceId, workspaceId),
            gte(decisionLog.createdAt, periodStart)
        ),
        orderBy: [desc(decisionLog.createdAt)],
        limit: 10,
    });

    const recentDecisions = decisions.map((d) => ({
        action: d.action,
        actorName: d.actorName,
        details: d.details,
        createdAt: d.createdAt.toISOString(),
    }));

    // 5. Upcoming renewals (next 90 days)
    const ninetyDaysOut = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const renewals = spendEntries
        .filter(
            (e) =>
                e.status === "active" &&
                e.renewalDate &&
                e.renewalDate >= new Date() &&
                e.renewalDate <= ninetyDaysOut
        )
        .sort(
            (a, b) =>
                (a.renewalDate?.getTime() ?? 0) - (b.renewalDate?.getTime() ?? 0)
        )
        .map((e) => ({
            toolName: e.toolName,
            renewalDate: e.renewalDate!.toISOString(),
            monthlyCost: e.monthlyCost,
        }));

    // 6. Research success rate
    let researchSuccessRate = 0;
    let totalResearchJobs = 0;
    if (toolIds.length > 0) {
        const [successData, totalData] = await Promise.all([
            db
                .select({ count: sql<string>`count(*)` })
                .from(researchJobs)
                .where(
                    and(
                        inArray(researchJobs.toolId, toolIds),
                        eq(researchJobs.status, "complete")
                    )
                ),
            db
                .select({ count: sql<string>`count(*)` })
                .from(researchJobs)
                .where(inArray(researchJobs.toolId, toolIds)),
        ]);
        const total = Number(totalData[0]?.count ?? 0);
        const success = Number(successData[0]?.count ?? 0);
        totalResearchJobs = total;
        researchSuccessRate = total > 0 ? Math.round((success / total) * 100) : 0;
    }

    // 7. Assemble report data
    const reportData: BoardReportData = {
        period,
        periodLabel,
        generatedAt: new Date().toISOString(),
        healthScore,
        healthBreakdown,
        totalMonthlySpend: insights.totalActiveSpend,
        spendByCategory,
        spendMoMChange,
        totalTools,
        toolsByStatus,
        topToolsByScore,
        newToolsThisPeriod,
        aiNativenessScore: insights.score,
        aiNativenessLabel: insights.label,
        aiNativeCount: insights.aiNativeCount,
        aiEnabledCount: insights.aiEnabledCount,
        traditionalCount: insights.traditionalCount,
        recentDecisions,
        upcomingRenewals: renewals,
        researchSuccessRate,
        totalResearchJobs,
    };

    // 8. Insert into database
    const shareToken = crypto.randomUUID();
    const title = `${periodLabel} Board Report`;

    const [report] = await db
        .insert(boardReports)
        .values({
            workspaceId,
            title,
            period,
            periodStart,
            periodEnd,
            data: reportData,
            shareToken,
            createdBy,
        })
        .returning();

    revalidatePath("/reports");
    return report;
}

export async function listBoardReports(workspaceId: string) {
    await requireWorkspaceMember(workspaceId);
    return db.query.boardReports.findMany({
        where: eq(boardReports.workspaceId, workspaceId),
        orderBy: [desc(boardReports.createdAt)],
    });
}

export async function getBoardReport(reportId: string, workspaceId: string) {
    await requireWorkspaceMember(workspaceId);
    return db.query.boardReports.findFirst({
        where: and(
            eq(boardReports.id, reportId),
            eq(boardReports.workspaceId, workspaceId)
        ),
    });
}

export async function getBoardReportByToken(shareToken: string) {
    return db.query.boardReports.findFirst({
        where: eq(boardReports.shareToken, shareToken),
    });
}
