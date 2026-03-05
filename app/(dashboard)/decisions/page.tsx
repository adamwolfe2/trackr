export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkspaceId } from "@/lib/db/queries";
import { checkFeatureAccess } from "@/lib/middleware/require-subscription";
import { PlanGate } from "@/components/billing/plan-gate";
import { getDecisionLog } from "@/lib/actions/decision-log";
import { db } from "@/lib/db";
import { tools } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { DecisionLogClient } from "@/components/decisions/decision-log-client";

export const metadata: Metadata = {
    title: "Decision Log — Trackr",
    description: "Audit trail of all tool decisions, changes, and actions across your workspace.",
};

export default async function DecisionsPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) redirect("/onboarding");

    // Feature gate: decisionLog requires Team+
    const plan = await checkFeatureAccess(workspaceId, "decisionLog");
    if (!plan) {
        return (
            <PlanGate
                featureName="Decision Log"
                description="Track every tool decision your team makes. See who added, archived, researched, or approved tools with a full audit trail."
                requiredPlan="Team"
            />
        );
    }

    // Fetch initial data in parallel
    const [logResult, availableTools] = await Promise.all([
        getDecisionLog(workspaceId, { limit: 50, offset: 0 }),
        db.query.tools.findMany({
            where: eq(tools.workspaceId, workspaceId),
            columns: { id: true, name: true },
            orderBy: [asc(tools.name)],
        }),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="font-serif text-3xl font-normal">Decision Log</h1>
                <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
                    {logResult.total} decision{logResult.total !== 1 ? "s" : ""} recorded
                </span>
            </div>

            <DecisionLogClient
                workspaceId={workspaceId}
                initialEntries={logResult.entries}
                initialTotal={logResult.total}
                availableTools={availableTools}
            />
        </div>
    );
}
