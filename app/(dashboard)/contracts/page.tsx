export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkspaceId } from "@/lib/db/queries";
import { PlanGate } from "@/components/billing/plan-gate";
import { checkFeatureAccess } from "@/lib/middleware/require-subscription";
import { listContracts, getSpendEntries } from "@/lib/actions/contracts";
import { ContractsClient } from "@/components/contracts/contracts-client";

export const metadata: Metadata = {
    title: "Contracts -- Trackr",
    description: "Manage software contracts, track renewal dates, and extract key terms.",
};

export default async function ContractsPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) redirect("/onboarding");

    const plan = await checkFeatureAccess(workspaceId, "contracts");
    if (!plan) {
        return (
            <PlanGate
                featureName="Contract Vault"
                description="Upload and manage software contracts. Track renewal dates, auto-renew clauses, and key terms in one place."
                requiredPlan="Startup"
            />
        );
    }

    const [contractsList, spendEntries] = await Promise.all([
        listContracts(workspaceId),
        getSpendEntries(workspaceId),
    ]);

    return (
        <ContractsClient
            initialData={contractsList}
            spendEntries={spendEntries}
            workspaceId={workspaceId}
            userId={user.id}
        />
    );
}
