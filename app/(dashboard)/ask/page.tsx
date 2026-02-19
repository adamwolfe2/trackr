export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";

export const metadata: Metadata = {
    title: "Ask Trackr AI — Trackr",
    description: "Chat with AI about tools in your database.",
};
import { db } from "@/lib/db";
import { subscriptions, workspaceMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import AskTrackrClient from "./client";
import { PlanGate } from "@/components/billing/plan-gate";
import { getPlanLimits } from "@/lib/config/subscriptions";

export default async function AskPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    // Get workspace
    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });

    if (!member) {
        redirect("/onboarding");
    }

    // Check Subscription
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, member.workspaceId)
    });

    const limits = getPlanLimits(subscription);

    if (!limits.limits.deepResearch) {
        return (
            <PlanGate
                featureName="Ask Trackr AI"
                description="Chat with your workspace data, compare tools, and get instant answers powered by GPT-4o."
            />
        );
    }

    return <AskTrackrClient />;
}
