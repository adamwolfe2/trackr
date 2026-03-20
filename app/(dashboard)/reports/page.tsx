export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkspaceId } from "@/lib/db/queries";
import { checkFeatureAccess } from "@/lib/middleware/require-subscription";
import { PlanGate } from "@/components/billing/plan-gate";
import { listBoardReports } from "@/lib/actions/board-reports";
import { ReportsClient } from "@/components/reports/reports-client";

export const metadata: Metadata = {
    title: "Board Reports \u2014 Trackr",
    description: "Generate executive-ready board reports for your AI tool stack.",
};

export default async function ReportsPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) redirect("/onboarding");

    // Feature gate: boardReports requires Startup+
    const plan = await checkFeatureAccess(workspaceId, "boardReports");
    if (!plan) {
        return (
            <PlanGate
                featureName="Board Reports"
                description="Generate executive-ready reports with health scores, spend overviews, and AI nativeness metrics for stakeholder review."
                requiredPlan="Startup"
            />
        );
    }

    const reports = await listBoardReports(workspaceId);

    return (
        <ReportsClient
            reports={reports}
            workspaceId={workspaceId}
            userId={user.id}
        />
    );
}
