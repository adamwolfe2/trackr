export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getWorkspaceId } from "@/lib/db/queries";
import { getPlanLimits, hasFeature } from "@/lib/config/subscriptions";
import { listIntegrations } from "@/lib/actions/integrations";
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

    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, workspaceId),
    });
    const plan = getPlanLimits(subscription);

    if (!hasFeature(plan, "integrations")) {
        return (
            <PlanGate
                featureName="Integrations"
                description="Connect Ramp, Brex, Bill.com, Notion, and Confluence to automate spend tracking and push reports to your team's knowledge base."
                requiredPlan="Startup"
            />
        );
    }

    const connected = await listIntegrations(workspaceId);

    return <IntegrationsClient connectedIntegrations={connected} />;
}
