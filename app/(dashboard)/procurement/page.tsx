export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkspaceId } from "@/lib/db/queries";
import { checkFeatureAccess } from "@/lib/middleware/require-subscription";
import { PlanGate } from "@/components/billing/plan-gate";
import { listProcurementRequests } from "@/lib/actions/procurement";
import { ProcurementClient } from "@/components/procurement/procurement-client";

export const metadata: Metadata = {
    title: "Procurement \u2014 Trackr",
    description: "AI procurement workflow for requesting, researching, and approving new tools.",
};

export default async function ProcurementPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) redirect("/onboarding");

    // Feature gate: procurement requires Team+
    const plan = await checkFeatureAccess(workspaceId, "procurement");
    if (!plan) {
        return (
            <PlanGate
                featureName="AI Procurement Workflow"
                description="Streamline tool requests with a structured workflow: submit, research, review, and approve new tools for your stack."
                requiredPlan="Team"
            />
        );
    }

    const requests = await listProcurementRequests(workspaceId);

    const userName =
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        user.emailAddresses?.[0]?.emailAddress ||
        "Team Member";

    return (
        <ProcurementClient
            initialRequests={requests.map((r) => ({
                id: r.id,
                toolName: r.toolName,
                toolUrl: r.toolUrl,
                justification: r.justification,
                urgency: r.urgency,
                category: r.category,
                estimatedBudget: r.estimatedBudget,
                status: r.status,
                requestedBy: r.requestedBy,
                requestedByName: r.requestedByName,
                reviewedBy: r.reviewedBy,
                reviewedByName: r.reviewedByName,
                reviewNotes: r.reviewNotes,
                approvedBudget: r.approvedBudget,
                createdAt: r.createdAt.toISOString(),
                updatedAt: r.updatedAt.toISOString(),
            }))}
            workspaceId={workspaceId}
            userId={user.id}
            userName={userName}
        />
    );
}
