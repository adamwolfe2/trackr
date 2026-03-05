"use server";

import { db } from "@/lib/db";
import {
    tools,
    softwareSpend,
    notes,
    stackHealthScores,
    riskAssessments,
    decisionLog,
} from "@/lib/db/schema";
import { eq, desc, gte, and, inArray } from "drizzle-orm";
import {
    buildBreakdown,
    computeHealthScore,
    generateRecommendations,
    type HealthBreakdown,
} from "@/lib/utils/health-score-engine";

// ─── Compute & Save ────────────────────────────────────────────────────────

export async function computeAndSaveHealthScore(workspaceId: string) {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    // First, get workspace tools so we can scope notes by tool IDs
    const [allTools, spendItems, risks, recentDecisions] =
        await Promise.all([
            db.query.tools.findMany({
                where: eq(tools.workspaceId, workspaceId),
                columns: { id: true, overallScore: true, status: true, category: true, name: true },
            }),
            db.query.softwareSpend.findMany({
                where: eq(softwareSpend.workspaceId, workspaceId),
                columns: {
                    id: true,
                    toolName: true,
                    monthlyCost: true,
                    status: true,
                    renewalDate: true,
                    category: true,
                },
            }),
            db.query.riskAssessments.findMany({
                where: eq(riskAssessments.workspaceId, workspaceId),
                columns: { toolId: true, alertLevel: true },
            }),
            db
                .select({ toolId: decisionLog.toolId, createdAt: decisionLog.createdAt })
                .from(decisionLog)
                .where(
                    and(
                        eq(decisionLog.workspaceId, workspaceId),
                        gte(decisionLog.createdAt, ninetyDaysAgo)
                    )
                ),
        ]);

    // Query notes scoped to this workspace's tool IDs only
    const wsToolIds = allTools.map((t) => t.id);
    const filteredNotes = wsToolIds.length > 0
        ? await db.query.notes.findMany({
              where: and(
                  inArray(notes.toolId, wsToolIds),
                  gte(notes.createdAt, ninetyDaysAgo)
              ),
              columns: { toolId: true, createdAt: true },
          })
        : [];

    // Build set of researched/active tool names for spend efficiency
    const researchedToolNames = new Set(
        allTools
            .filter((t) => t.status === "active")
            .map((t) => t.name.toLowerCase())
    );

    // Collect categories
    const toolCategories = allTools.flatMap((t) =>
        (t as { category: string[] | null }).category ?? []
    );
    const spendCategories = spendItems
        .map((s) => (s as { category: string | null }).category)
        .filter(Boolean) as string[];

    const breakdown = buildBreakdown({
        tools: allTools,
        spendItems,
        researchedToolNames,
        toolCategories,
        spendCategories,
        risks,
        recentNotes: filteredNotes,
        recentDecisions: recentDecisions.map((d) => ({
            toolId: d.toolId,
            createdAt: d.createdAt,
        })),
    });

    const score = computeHealthScore(breakdown);
    const recommendations = generateRecommendations(breakdown);

    // Save to DB
    const [saved] = await db
        .insert(stackHealthScores)
        .values({
            workspaceId,
            score,
            breakdown: breakdown as unknown as Record<string, unknown>,
            recommendations,
        })
        .returning();

    return {
        id: saved.id,
        score: saved.score,
        breakdown: saved.breakdown as HealthBreakdown,
        recommendations: saved.recommendations as string[],
        computedAt: saved.computedAt,
    };
}

// ─── Get History ───────────────────────────────────────────────────────────

export async function getHealthHistory(
    workspaceId: string,
    days: number = 90
) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const rows = await db.query.stackHealthScores.findMany({
        where: and(
            eq(stackHealthScores.workspaceId, workspaceId),
            gte(stackHealthScores.computedAt, since)
        ),
        orderBy: [desc(stackHealthScores.computedAt)],
    });

    return rows.map((r) => ({
        score: r.score,
        breakdown: r.breakdown as HealthBreakdown,
        computedAt: r.computedAt,
    }));
}

// ─── Get Latest ────────────────────────────────────────────────────────────

export async function getLatestHealthScore(workspaceId: string) {
    const row = await db.query.stackHealthScores.findFirst({
        where: eq(stackHealthScores.workspaceId, workspaceId),
        orderBy: [desc(stackHealthScores.computedAt)],
    });

    if (!row) return null;

    return {
        id: row.id,
        score: row.score,
        breakdown: row.breakdown as HealthBreakdown,
        recommendations: (row.recommendations ?? []) as string[],
        computedAt: row.computedAt,
    };
}
