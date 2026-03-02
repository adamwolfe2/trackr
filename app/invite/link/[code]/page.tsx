import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { workspaces, workspaceMembers, subscriptions } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import Link from "next/link";
import { getPlanLimits } from "@/lib/config/subscriptions";

export const metadata: Metadata = {
    title: "Join Workspace — Trackr",
    robots: { index: false, follow: false },
};

function InvitePage({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#F3F3EF] flex items-center justify-center p-6">
            <div className="border-2 border-black p-8 max-w-md w-full bg-[#F3F3EF]">
                {children}
            </div>
        </div>
    );
}

export default async function InviteLinkPage({
    params,
}: {
    params: Promise<{ code: string }>;
}) {
    const { code } = await params;

    // Basic sanity check — 32-char hex
    if (!/^[0-9a-f]{32}$/.test(code)) {
        return (
            <InvitePage>
                <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-2">Invitation</p>
                <h1 className="font-serif text-2xl font-normal mb-4">Invalid link</h1>
                <p className="font-mono text-sm text-neutral-600 mb-6">
                    This invite link is not valid. Ask your team admin for a new one.
                </p>
                <Link href="/" className="font-mono text-xs uppercase tracking-widest hover:underline">
                    Go to Trackr →
                </Link>
            </InvitePage>
        );
    }

    const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.inviteCode, code),
    });

    if (!workspace) {
        return (
            <InvitePage>
                <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-2">Invitation</p>
                <h1 className="font-serif text-2xl font-normal mb-4">Link not found</h1>
                <p className="font-mono text-sm text-neutral-600 mb-6">
                    This invite link has been revoked or does not exist. Ask your team admin for a new one.
                </p>
                <Link href="/" className="font-mono text-xs uppercase tracking-widest hover:underline">
                    Go to Trackr →
                </Link>
            </InvitePage>
        );
    }

    const user = await currentUser();

    if (!user) {
        redirect(`/sign-in?redirect_url=${encodeURIComponent(`/invite/link/${code}`)}`);
    }

    // Check if already a member — idempotent
    const existing = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });

    if (!existing) {
        // Enforce member count limit
        const [subscription, [{ value: currentMemberCount }]] = await Promise.all([
            db.query.subscriptions.findFirst({
                where: eq(subscriptions.workspaceId, workspace.id),
                columns: { planId: true, status: true },
            }),
            db.select({ value: count() })
                .from(workspaceMembers)
                .where(eq(workspaceMembers.workspaceId, workspace.id)),
        ]);

        const plan = getPlanLimits(subscription ?? undefined);
        if (plan.limits.members !== Infinity && currentMemberCount >= plan.limits.members) {
            return (
                <InvitePage>
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-2">Invitation</p>
                    <h1 className="font-serif text-2xl font-normal mb-4">Workspace is full</h1>
                    <p className="font-mono text-sm text-neutral-600 mb-6">
                        <strong>{workspace.name}</strong> has reached its member limit
                        ({plan.limits.members} seat{plan.limits.members !== 1 ? "s" : ""} on the {plan.name} plan).
                        Ask your team admin to upgrade before joining.
                    </p>
                    <Link href="/" className="font-mono text-xs uppercase tracking-widest hover:underline">
                        Go to Trackr →
                    </Link>
                </InvitePage>
            );
        }

        await db
            .insert(workspaceMembers)
            .values({
                userId: user.id,
                workspaceId: workspace.id,
                role: "member",
            })
            .onConflictDoNothing();
    }

    redirect("/tools");
}
