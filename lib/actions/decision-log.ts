"use server";

import { db } from "@/lib/db";
import { decisionLog, tools } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VALID_ACTIONS = [
    "tool_added",
    "tool_archived",
    "tool_researched",
    "score_changed",
    "spend_added",
    "spend_updated",
    "contract_uploaded",
    "procurement_approved",
    "procurement_rejected",
    "risk_alert",
    "custom",
] as const;

// ─── Log Decision ──────────────────────────────────────────────────────────

export async function logDecision(
    workspaceId: string,
    data: {
        toolId?: string;
        action: string;
        actorId: string;
        actorName?: string;
        details?: Record<string, unknown>;
    }
) {
    const action = data.action;
    if (!VALID_ACTIONS.includes(action as typeof VALID_ACTIONS[number])) {
        throw new Error(`Invalid action: ${action}`);
    }
    if (!data.actorId) throw new Error("Actor ID is required");

    const toolId = data.toolId && UUID_RE.test(data.toolId) ? data.toolId : null;

    const [created] = await db
        .insert(decisionLog)
        .values({
            workspaceId,
            toolId,
            action,
            actorId: data.actorId,
            actorName: data.actorName?.trim() || null,
            details: data.details ?? null,
        })
        .returning();

    return {
        id: created.id,
        action: created.action,
        createdAt: created.createdAt,
    };
}

// ─── Get Decision Log ──────────────────────────────────────────────────────

export async function getDecisionLog(
    workspaceId: string,
    options?: {
        toolId?: string;
        action?: string;
        limit?: number;
        offset?: number;
    }
) {
    const limit = Math.min(options?.limit ?? 50, 200);
    const offset = options?.offset ?? 0;

    const conditions = [eq(decisionLog.workspaceId, workspaceId)];

    if (options?.toolId && UUID_RE.test(options.toolId)) {
        conditions.push(eq(decisionLog.toolId, options.toolId));
    }

    if (options?.action && VALID_ACTIONS.includes(options.action as typeof VALID_ACTIONS[number])) {
        conditions.push(eq(decisionLog.action, options.action));
    }

    // Get entries with tool info via join
    const entries = await db
        .select({
            id: decisionLog.id,
            toolId: decisionLog.toolId,
            toolName: tools.name,
            action: decisionLog.action,
            actorId: decisionLog.actorId,
            actorName: decisionLog.actorName,
            details: decisionLog.details,
            createdAt: decisionLog.createdAt,
        })
        .from(decisionLog)
        .leftJoin(tools, eq(decisionLog.toolId, tools.id))
        .where(and(...conditions))
        .orderBy(desc(decisionLog.createdAt))
        .limit(limit)
        .offset(offset);

    // Get total count for pagination
    const [countResult] = await db
        .select({ count: sql<string>`count(*)` })
        .from(decisionLog)
        .where(and(...conditions));

    return {
        entries: entries.map((e) => ({
            id: e.id,
            toolId: e.toolId,
            toolName: e.toolName ?? null,
            action: e.action,
            actorId: e.actorId,
            actorName: e.actorName,
            details: e.details as Record<string, unknown> | null,
            createdAt: e.createdAt.toISOString(),
        })),
        total: Number(countResult?.count ?? 0),
    };
}

// ─── Get Tool Decisions ────────────────────────────────────────────────────

export async function getToolDecisions(toolId: string) {
    if (!UUID_RE.test(toolId)) throw new Error("Invalid tool ID");

    const entries = await db.query.decisionLog.findMany({
        where: eq(decisionLog.toolId, toolId),
        orderBy: [desc(decisionLog.createdAt)],
    });

    return entries.map((e) => ({
        id: e.id,
        action: e.action,
        actorId: e.actorId,
        actorName: e.actorName,
        details: e.details as Record<string, unknown> | null,
        createdAt: e.createdAt.toISOString(),
    }));
}
