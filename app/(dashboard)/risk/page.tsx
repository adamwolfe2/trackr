export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkspaceId } from "@/lib/db/queries";
import { PlanGate } from "@/components/billing/plan-gate";
import { checkFeatureAccess } from "@/lib/middleware/require-subscription";
import { getRiskDashboard, getRiskAlerts } from "@/lib/actions/risk-monitoring";
import { RiskClient } from "@/components/risk/risk-client";

export const metadata: Metadata = {
    title: "Risk Monitor -- Trackr",
    description: "Monitor vendor risk, security posture, and compliance across your tool stack.",
};

export default async function RiskPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) redirect("/onboarding");

    const plan = await checkFeatureAccess(workspaceId, "riskMonitor");
    if (!plan) {
        return (
            <PlanGate
                featureName="Risk Monitor"
                description="Monitor vendor risk across your tool stack. Track security posture, compliance, data breach history, and more."
                requiredPlan="Startup"
            />
        );
    }

    const [dashboard, alerts] = await Promise.all([
        getRiskDashboard(workspaceId),
        getRiskAlerts(workspaceId),
    ]);

    return (
        <RiskClient
            tools={dashboard.tools}
            stats={dashboard.stats}
            alerts={alerts}
        />
    );
}
