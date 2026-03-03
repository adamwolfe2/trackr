/**
 * Per-workspace monthly API cost cap enforcement.
 *
 * Checks cumulative API spend (from api_logs) against tier budgets.
 * Returns { allowed, usage, budget, pctUsed } so callers can warn or block.
 */

import { db } from "@/lib/db";
import { apiLogs } from "@/lib/db/schema";
import { eq, gte, sql, and } from "drizzle-orm";
import type { PlanSlug } from "@/lib/config/subscriptions";

/** Monthly API cost budget per plan tier (in USD). */
const COST_BUDGETS: Record<PlanSlug, number> = {
    free: 1,
    team: 15,
    startup: 40,
    enterprise: 120,
};

export interface CostCapResult {
    allowed: boolean;
    warned: boolean;
    usage: number;
    budget: number;
    pctUsed: number;
}

/**
 * Check whether a workspace has remaining API budget for the current month.
 *
 * - Warns at 80% usage (allowed=true, warned=true).
 * - Blocks at 100% usage (allowed=false).
 */
export async function checkCostCap(
    workspaceId: string,
    planSlug: PlanSlug,
): Promise<CostCapResult> {
    const budget = COST_BUDGETS[planSlug];

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [result] = await db
        .select({
            total: sql<string>`coalesce(sum(${apiLogs.estimatedCost}), 0)`,
        })
        .from(apiLogs)
        .where(and(
            eq(apiLogs.workspaceId, workspaceId),
            gte(apiLogs.createdAt, startOfMonth),
        ));

    const usage = Number(result?.total ?? 0);
    const pctUsed = budget > 0 ? (usage / budget) * 100 : 0;

    return {
        allowed: usage < budget,
        warned: pctUsed >= 80 && usage < budget,
        usage,
        budget,
        pctUsed,
    };
}
