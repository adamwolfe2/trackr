export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { workspaceMembers, workspaces, subscriptions } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { Shield, Building2, Lock } from "lucide-react";
import { ApiKeySection } from "@/components/workspace/api-key-section";
import { SlackSection } from "@/components/workspace/slack-section";
import { InviteMemberForm, RemoveMemberButton, UpdateWorkspaceNameForm, UpdateCompanyContextForm } from "@/components/workspace/workspace-forms";
import { getPlanLimits, hasFeature } from "@/lib/config/subscriptions";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Workspace Settings — Trackr",
    description: "Manage your team, integrations, and preferences.",
};

export default async function WorkspacePage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const currentMember = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });

    if (!currentMember) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <h1 className="font-serif text-3xl">No Workspace Found</h1>
                <p className="font-mono text-sm text-neutral-500">Complete onboarding to set up your workspace.</p>
            </div>
        );
    }

    const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.id, currentMember.workspaceId),
    });

    const members = await db.query.workspaceMembers.findMany({
        where: eq(workspaceMembers.workspaceId, currentMember.workspaceId),
        orderBy: [asc(workspaceMembers.joinedAt)],
    });

    const isOwnerOrAdmin = currentMember.role === "owner" || currentMember.role === "admin";

    // Plan check for feature gating
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, currentMember.workspaceId),
    });
    const plan = getPlanLimits(subscription);
    const canUseSlack = hasFeature(plan, "slackIntegration");
    const canUseChromeExtension = hasFeature(plan, "chromeExtension");

    const roleLabel = (role: string) => {
        if (role === "owner") return <span className="font-mono text-[10px] uppercase tracking-widest border border-black px-2 py-0.5 flex items-center gap-1"><Shield className="h-2.5 w-2.5" /> Owner</span>;
        if (role === "admin") return <span className="font-mono text-[10px] uppercase tracking-widest border border-neutral-400 text-neutral-600 px-2 py-0.5 flex items-center gap-1"><Shield className="h-2.5 w-2.5" /> Admin</span>;
        return <span className="font-mono text-[10px] uppercase tracking-widest border border-neutral-300 text-neutral-400 px-2 py-0.5">Member</span>;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-serif text-3xl font-normal">Workspace Settings</h1>
                <p className="font-mono text-sm text-neutral-500 mt-1">Manage your team and preferences.</p>
            </div>

            <div className="space-y-6">
                {/* Team Members */}
                <div className="border border-black">
                    <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                        <h2 className="font-mono text-xs uppercase tracking-widest">Team Members</h2>
                        <span className="font-mono text-[10px] text-neutral-400">{members.length} member{members.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="p-5 space-y-5">
                        {isOwnerOrAdmin && <InviteMemberForm />}

                        <div className="divide-y divide-neutral-100">
                            {members.map((member) => {
                                const initials = member.userId.slice(5, 7).toUpperCase();
                                const isCurrentUser = member.userId === user.id;
                                const isThisOwner = member.role === "owner";

                                return (
                                    <div key={member.id} className="flex items-center justify-between py-3 gap-2">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-8 w-8 border border-black flex items-center justify-center font-mono text-xs font-bold flex-shrink-0">
                                                {isCurrentUser ? (user.firstName?.[0] ?? "U") : initials.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-mono text-sm font-medium truncate">
                                                    {isCurrentUser ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "You" : `Member ${initials}`}
                                                    {isCurrentUser && <span className="font-mono text-[10px] text-neutral-400 ml-2">(you)</span>}
                                                </div>
                                                <div className="font-mono text-[10px] text-neutral-400 truncate">
                                                    {isCurrentUser && user.emailAddresses[0]?.emailAddress
                                                        ? user.emailAddresses[0].emailAddress
                                                        : `Joined ${new Date(member.joinedAt).toLocaleDateString()}`}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                            {roleLabel(member.role)}
                                            {isOwnerOrAdmin && !isCurrentUser && !isThisOwner && (
                                                <RemoveMemberButton memberId={member.id} />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* General Preferences */}
                <div className="border border-black">
                    <div className="border-b border-black px-5 py-3">
                        <h2 className="font-mono text-xs uppercase tracking-widest">General Preferences</h2>
                    </div>
                    <div className="p-5">
                        <UpdateWorkspaceNameForm
                            defaultName={workspace?.name ?? "My Workspace"}
                            disabled={!isOwnerOrAdmin}
                        />
                    </div>
                </div>

                {/* Company Profile */}
                <div className="border border-black">
                    <div className="border-b border-black px-5 py-3 flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5" />
                        <h2 className="font-mono text-xs uppercase tracking-widest">Company Profile</h2>
                    </div>
                    <div className="p-5">
                        <p className="font-mono text-xs text-neutral-500 mb-4 leading-relaxed">
                            This context is used by AI research agents to evaluate tools specifically for your company.
                            It was captured from your website during onboarding and can be edited manually.
                        </p>
                        <UpdateCompanyContextForm
                            defaultContext={workspace?.companyContext ?? ""}
                            disabled={!isOwnerOrAdmin}
                        />
                    </div>
                </div>

                {/* Slack Integration */}
                {canUseSlack ? (
                    <SlackSection
                        currentChannelId={workspace?.slackChannelId ?? null}
                        currentEnabled={workspace?.slackEnabled ?? false}
                        isOwnerOrAdmin={isOwnerOrAdmin}
                        slackTeamName={workspace?.slackTeamName ?? null}
                        isConnected={!!workspace?.slackBotToken}
                    />
                ) : (
                    <FeatureLockedSection
                        title="Slack Integration"
                        description="Get research notifications and use slash commands in Slack."
                        requiredPlan="Team"
                    />
                )}

                {/* API Key & Chrome Extension */}
                {canUseChromeExtension ? (
                    <ApiKeySection
                        currentApiKey={workspace?.apiKey ?? null}
                        isOwnerOrAdmin={isOwnerOrAdmin}
                    />
                ) : (
                    <FeatureLockedSection
                        title="Chrome Extension & API"
                        description="Research tools directly from your browser with the Chrome extension."
                        requiredPlan="Team"
                    />
                )}
            </div>
        </div>
    );
}

function FeatureLockedSection({ title, description, requiredPlan }: { title: string; description: string; requiredPlan: string }) {
    return (
        <div className="border border-neutral-300 bg-neutral-50 p-6">
            <div className="flex items-center gap-3 mb-2">
                <Lock className="h-4 w-4 text-neutral-400" />
                <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500">{title}</h2>
            </div>
            <p className="font-mono text-xs text-neutral-400 mb-4">{description}</p>
            <Link
                href="/settings/billing"
                className="inline-block border border-black bg-black text-white px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:bg-neutral-800 transition-colors"
            >
                Upgrade to {requiredPlan} →
            </Link>
        </div>
    );
}
