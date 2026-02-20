export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";

export const metadata: Metadata = {
    title: "Software Stack — Trackr",
    description: "Track your software spend, contracts, and AI nativeness score.",
};
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { softwareSpend, workspaceMembers, tools, subscriptions } from "@/lib/db/schema";
import { eq, desc, and, isNotNull, sql } from "drizzle-orm";
import { StackClient } from "./client";
import { computeStackInsights } from "@/lib/utils/stack-insights";
import { PlanGate } from "@/components/billing/plan-gate";
import { getPlanLimits, hasFeature } from "@/lib/config/subscriptions";

export default async function StackPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });

    if (!member) redirect("/onboarding");

    // Feature gate: spend tracking requires Team+
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, member.workspaceId),
    });
    const planData = getPlanLimits(subscription);
    if (!hasFeature(planData, "spendTracking")) {
        return (
            <PlanGate
                featureName="Software Spend Tracking"
                description="Track your software stack, monitor costs, manage contracts, and get renewal alerts."
                requiredPlan="Team"
            />
        );
    }

    const [entries, scoredTools] = await Promise.all([
        db.query.softwareSpend.findMany({
            where: eq(softwareSpend.workspaceId, member.workspaceId),
            orderBy: [desc(softwareSpend.createdAt)],
        }),
        db.query.tools.findMany({
            where: and(
                eq(tools.workspaceId, member.workspaceId),
                isNotNull(tools.overallScore),
                sql`${tools.overallScore}::numeric < 6`
            ),
            columns: { name: true },
        }),
    ]);

    const lowScoredNames = scoredTools.map(t => t.name.toLowerCase());
    const insights = computeStackInsights(entries);

    return <StackClient initialData={entries} lowScoredNames={lowScoredNames} insights={insights} />;
}
