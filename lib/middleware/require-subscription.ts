import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getPlanLimits, hasFeature, type PlanFeatures } from "@/lib/config/subscriptions";

/**
 * Check if a workspace has access to a specific premium feature.
 * Returns the plan if allowed, null if not.
 */
export async function checkFeatureAccess(
    workspaceId: string,
    feature: keyof PlanFeatures
) {
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, workspaceId),
    });

    const plan = getPlanLimits(subscription ?? undefined);

    if (!hasFeature(plan, feature)) {
        return null;
    }

    return plan;
}

/**
 * Get the active plan for a workspace.
 */
export async function getWorkspacePlan(workspaceId: string) {
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, workspaceId),
    });

    return {
        plan: getPlanLimits(subscription ?? undefined),
        subscription: subscription ?? null,
        isActive: subscription?.status === "active" || subscription?.status === "trialing",
    };
}
