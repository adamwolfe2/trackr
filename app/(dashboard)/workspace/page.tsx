export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { workspaceMembers, workspaces, subscriptions, pendingInvitations } from "@/lib/db/schema";
import { and, asc, eq, gt } from "drizzle-orm";
import { Shield, Building2, Lock } from "lucide-react";
import { clerkClient } from "@clerk/nextjs/server";
import { ApiKeySection } from "@/components/workspace/api-key-section";
import { SlackSection } from "@/components/workspace/slack-section";
import { InviteMemberForm, RemoveMemberButton, CancelInvitationButton, UpdateWorkspaceNameForm, UpdateCompanyContextForm } from "@/components/workspace/workspace-forms";
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

    if (!currentMember) redirect("/onboarding");

    const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.id, currentMember.workspaceId),
    });

    const members = await db.query.workspaceMembers.findMany({
        where: eq(workspaceMembers.workspaceId, currentMember.workspaceId),
        orderBy: [asc(workspaceMembers.joinedAt)],
    });

    // Fetch active (non-expired) pending invitations for this workspace
    const pendingInvites = await db.query.pendingInvitations.findMany({
        where: and(
            eq(pendingInvitations.workspaceId, currentMember.workspaceId),
            gt(pendingInvitations.expiresAt, new Date())
        ),
        orderBy: [asc(pendingInvitations.createdAt)],
    });

    // Resolve Clerk user data for all members (names, emails)
    const clerk = await clerkClient();
    const memberUserData = await Promise.all(
        members.map(async (member) => {
            if (member.userId === user.id) {
                return { userId: member.userId, firstName: user.firstName, lastName: user.lastName, email: user.emailAddresses[0]?.emailAddress };
            }
            try {
                const clerkUser = await clerk.users.getUser(member.userId);
                return {
                    userId: member.userId,
                    firstName: clerkUser.firstName,
                    lastName: clerkUser.lastName,
                    email: clerkUser.emailAddresses[0]?.emailAddress ?? null,
                };
            } catch {
                return { userId: member.userId, firstName: null, lastName: null, email: null };
            }
        })
    );
    const memberUserMap = new Map(memberUserData.map((u) => [u.userId, u]));

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
                        <span className="font-mono text-[10px] text-neutral-400">
                            {members.length} member{members.length !== 1 ? "s" : ""}
                            {pendingInvites.length > 0 && ` · ${pendingInvites.length} pending`}
                        </span>
                    </div>
                    <div className="p-5 space-y-5">
                        {isOwnerOrAdmin && <InviteMemberForm />}

                        <div className="divide-y divide-neutral-100">
                            {members.map((member) => {
                                const isCurrentUser = member.userId === user.id;
                                const isThisOwner = member.role === "owner";
                                const userData = memberUserMap.get(member.userId);
                                const displayName = `${userData?.firstName ?? ""} ${userData?.lastName ?? ""}`.trim() || (isCurrentUser ? "You" : "Team Member");
                                const avatarLetter = (userData?.firstName?.[0] ?? userData?.email?.[0] ?? "?").toUpperCase();

                                return (
                                    <div key={member.id} className="flex items-center justify-between py-3 gap-2">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-8 w-8 border border-black flex items-center justify-center font-mono text-xs font-bold flex-shrink-0">
                                                {avatarLetter}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-mono text-sm font-medium truncate">
                                                    {displayName}
                                                    {isCurrentUser && <span className="font-mono text-[10px] text-neutral-400 ml-2">(you)</span>}
                                                </div>
                                                <div className="font-mono text-[10px] text-neutral-400 truncate">
                                                    {userData?.email ?? `Joined ${new Date(member.joinedAt).toLocaleDateString()}`}
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

                        {/* Pending Invitations */}
                        {isOwnerOrAdmin && pendingInvites.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-neutral-100">
                                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Pending Invitations</p>
                                <div className="divide-y divide-neutral-100">
                                    {pendingInvites.map((invite) => (
                                        <div key={invite.id} className="flex items-center justify-between py-2.5 gap-2">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="h-8 w-8 border border-dashed border-neutral-300 flex items-center justify-center font-mono text-xs text-neutral-300 flex-shrink-0">
                                                    ?
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-mono text-sm text-neutral-600 truncate">{invite.email}</div>
                                                    <div className="font-mono text-[10px] text-neutral-400">
                                                        Expires {new Date(invite.expiresAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="font-mono text-[10px] uppercase tracking-widest border border-dashed border-neutral-300 text-neutral-400 px-2 py-0.5">Invited</span>
                                                <CancelInvitationButton invitationId={invite.id} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
