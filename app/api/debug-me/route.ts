import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { workspaceMembers, subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getPlanLimits } from "@/lib/config/subscriptions";

// Temporary — shows the actual Clerk user ID + workspace for whoever is logged in
export async function GET() {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });

    const subscription = member
        ? await db.query.subscriptions.findFirst({
              where: eq(subscriptions.workspaceId, member.workspaceId),
          })
        : null;

    const plan = getPlanLimits(subscription ?? undefined);

    return NextResponse.json({
        clerkUserId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        workspaceId: member?.workspaceId ?? null,
        subscription: subscription
            ? { planId: subscription.planId, status: subscription.status }
            : null,
        resolvedPlan: plan.slug,
    });
}
