export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkspaceId } from "@/lib/db/queries";
import { checkFeatureAccess } from "@/lib/middleware/require-subscription";
import { PlanGate } from "@/components/billing/plan-gate";
import { listProcurementRequests } from "@/lib/actions/procurement";
import { ProcurementClient } from "@/components/procurement/procurement-client";
import { ClipboardList } from "lucide-react";

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

    if (requests.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="font-serif text-3xl font-normal">Procurement</h1>
                </div>
                <div className="border border-black bg-white p-12 text-center">
                    <ClipboardList className="w-8 h-8 mx-auto mb-4 text-neutral-300" />
                    <h3 className="font-serif text-lg mb-2">No procurement requests yet</h3>
                    <p className="font-mono text-xs text-neutral-500 mb-6 max-w-sm mx-auto">
                        Streamline how your team requests new tools. Submit a request to kick off the research, review, and approval workflow.
                    </p>
                </div>
            </div>
        );
    }

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
