export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkspaceId } from "@/lib/db/queries";
import { checkFeatureAccess } from "@/lib/middleware/require-subscription";
import { PlanGate } from "@/components/billing/plan-gate";
import { IntegrationsClient } from "@/components/integrations/integrations-client";

export const metadata: Metadata = {
    title: "Integrations — Trackr",
    description: "Connect third-party services to automate spend tracking and push reports.",
};

export default async function IntegrationsPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) redirect("/onboarding");

    const plan = await checkFeatureAccess(workspaceId, "integrations");
    if (!plan) {
        return (
            <PlanGate
                featureName="Integrations"
                description="Connect third-party services to automate spend tracking and push reports. Available on Startup plan and above."
                requiredPlan="Startup"
            />
        );
    }

    return <IntegrationsClient />;
}
