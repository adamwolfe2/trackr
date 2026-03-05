export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { workspaceMembers, workspaces, subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ScorecardClient, type ScorecardRecipe } from "@/components/scorecard/scorecard-client";
import { WeightEditor, type ScorecardWeights } from "@/components/scorecard/weight-editor";
import { PlanGate } from "@/components/billing/plan-gate";
import { getPlanLimits, hasFeature } from "@/lib/config/subscriptions";

export const metadata: Metadata = {
    title: "Scorecard — Trackr",
    description: "Configure your custom tool evaluation scorecard and scoring weights.",
};

export default async function ScorecardPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });

    if (!member) {
        redirect("/onboarding");
    }

    // Feature gate: scorecard recipe requires Startup+
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, member.workspaceId),
    });
    const plan = getPlanLimits(subscription);
    if (!hasFeature(plan, "scorecardRecipe")) {
        return (
            <PlanGate
                featureName="Scorecard Recipe"
                description="Create a custom evaluation framework with weighted dimensions tailored to your company's priorities."
                requiredPlan="Startup"
            />
        );
    }

    const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.id, member.workspaceId),
        columns: { scorecardConfig: true },
    });

    const config = workspace?.scorecardConfig as (ScorecardRecipe & { weights?: ScorecardWeights }) | null;
    const savedRecipe = config ? { systemContext: config.systemContext, businessUnits: config.businessUnits, evaluationCriteria: config.evaluationCriteria, dealBreakers: config.dealBreakers } : null;
    const savedWeights = config?.weights || null;
    const canEditWeights = hasFeature(plan, "customWeights");

    return (
        <div className="space-y-8">
            {/* Weight Editor — always visible, editable only for Startup+ */}
            <WeightEditor savedWeights={savedWeights} canEditWeights={canEditWeights} />

            {/* Recipe Editor */}
            <ScorecardClient savedRecipe={savedRecipe} />
        </div>
    );
}
