import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subscriptions, workspaceMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getPlanLimits } from "@/lib/config/subscriptions";

// Temporary diagnostic endpoint — remove after debugging
// Auth: requires ?secret=trackr-debug-2026
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    if (searchParams.get("secret") !== "trackr-debug-2026") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = searchParams.get("userId") ?? "user_39pOxRj82ZZep0dpOUaV1oHJAJe";

    const dbHost = process.env.DATABASE_URL
        ? process.env.DATABASE_URL.split("@")[1]?.split("/")[0] ?? "unknown"
        : "NOT SET";

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, userId),
    });

    if (!member) {
        return NextResponse.json({ dbHost, member: null, subscription: null, plan: null });
    }

    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, member.workspaceId),
    });

    const plan = getPlanLimits(subscription ?? undefined);

    return NextResponse.json({
        dbHost,
        workspaceId: member.workspaceId,
        subscription: subscription
            ? {
                  id: subscription.id,
                  planId: subscription.planId,
                  status: subscription.status,
                  currentPeriodEnd: subscription.currentPeriodEnd,
                  creditBalance: subscription.creditBalance,
              }
            : null,
        resolvedPlan: plan.slug,
    });
}
