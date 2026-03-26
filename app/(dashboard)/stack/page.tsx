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

    let entries: Awaited<ReturnType<typeof db.query.softwareSpend.findMany>> = [];
    let lowScoredNames: string[] = [];
    let insights: ReturnType<typeof computeStackInsights> | undefined;
    let fetchError: string | null = null;

    try {
        const [fetchedEntries, scoredTools] = await Promise.all([
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

        entries = fetchedEntries;
        lowScoredNames = scoredTools.map(t => t.name.toLowerCase());
        insights = computeStackInsights(entries);
    } catch (err) {
        // Stack data load failed — show degraded UI with error banner
        fetchError = err instanceof Error ? err.message : "Failed to load stack data";
    }

    return (
        <>
            {fetchError && (
                <div className="mb-4 border border-black bg-white px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-neutral-600">
                            Some data failed to load. You can still manage your stack below.
                        </span>
                    </div>
                    <a href="/stack" className="font-mono text-xs border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors">
                        Retry
                    </a>
                </div>
            )}
            <StackClient initialData={entries} lowScoredNames={lowScoredNames} insights={insights} />
        </>
    );
}
