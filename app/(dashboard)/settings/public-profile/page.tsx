export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { workspaceMembers, subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getPlanLimits, hasFeature } from "@/lib/config/subscriptions";
import { PlanGate } from "@/components/billing/plan-gate";
import { getWorkspaceProfile } from "@/lib/actions/public-profile";
import { PublicProfileClient } from "./client";

export const metadata: Metadata = {
    title: "Public Profile Settings",
    description: "Configure your public AI stack profile and embeddable widget.",
};

export default async function PublicProfileSettingsPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });
    if (!member) redirect("/onboarding");

    // Feature gate: publicProfile requires Team+
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, member.workspaceId),
    });
    const planData = getPlanLimits(subscription);
    if (!hasFeature(planData, "publicProfile")) {
        return (
            <PlanGate
                featureName="Public Stack Profile"
                description="Share your AI tool stack publicly and embed a widget on your website. Showcase your team's AI adoption."
                requiredPlan="Team"
            />
        );
    }

    const profile = await getWorkspaceProfile(member.workspaceId);
    const canEmbed = hasFeature(planData, "embedWidget");

    return (
        <PublicProfileClient
            workspaceId={member.workspaceId}
            existingProfile={
                profile
                    ? {
                          id: profile.id,
                          slug: profile.slug,
                          headline: profile.headline,
                          description: profile.description,
                          showScores: profile.showScores,
                          showSpend: profile.showSpend,
                          showHealth: profile.showHealth,
                          isPublished: profile.isPublished,
                      }
                    : null
            }
            canEmbed={canEmbed}
        />
    );
}
