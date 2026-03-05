export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkspaceId } from "@/lib/db/queries";
import { PlanGate } from "@/components/billing/plan-gate";
import { checkFeatureAccess } from "@/lib/middleware/require-subscription";
import { listCompetitors } from "@/lib/actions/competitor-intel";
import { CompetitorsClient } from "@/components/competitors/competitors-client";

export const metadata: Metadata = {
    title: "Competitor Intel -- Trackr",
    description: "Track competitor tool stacks and discover intelligence.",
};

export default async function CompetitorsPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) redirect("/onboarding");

    const plan = await checkFeatureAccess(workspaceId, "competitorIntel");
    if (!plan) {
        return (
            <PlanGate
                featureName="Competitor Stack Intelligence"
                description="Track competitor tool stacks, discover their tech choices, and gain competitive intelligence."
                requiredPlan="Startup"
            />
        );
    }

    const competitors = await listCompetitors(workspaceId);

    return (
        <CompetitorsClient
            initialData={competitors}
            workspaceId={workspaceId}
            userId={user.id}
            planLimit={plan.limits.competitors}
        />
    );
}
