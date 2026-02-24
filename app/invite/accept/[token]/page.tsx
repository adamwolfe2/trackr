import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { pendingInvitations, workspaceMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function InvitePage({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#F3F3EF] flex items-center justify-center p-6">
            <div className="border-2 border-black p-8 max-w-md w-full bg-[#F3F3EF]">
                {children}
            </div>
        </div>
    );
}

export default async function InviteAcceptPage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;

    if (!UUID_RE.test(token)) {
        return (
            <InvitePage>
                <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-2">Invitation</p>
                <h1 className="font-serif text-2xl font-normal mb-4">Invalid link</h1>
                <p className="font-mono text-sm text-neutral-600 mb-6">
                    This invitation link is not valid. Please ask your team member to send a new invite.
                </p>
                <Link href="/" className="font-mono text-xs uppercase tracking-widest hover:underline">
                    Go to Trackr →
                </Link>
            </InvitePage>
        );
    }

    const invitation = await db.query.pendingInvitations.findFirst({
        where: eq(pendingInvitations.id, token),
        with: { workspace: true },
    });

    if (!invitation) {
        return (
            <InvitePage>
                <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-2">Invitation</p>
                <h1 className="font-serif text-2xl font-normal mb-4">Invitation not found</h1>
                <p className="font-mono text-sm text-neutral-600 mb-6">
                    This invitation has already been used or does not exist. Contact your team admin for a new invite.
                </p>
                <Link href="/" className="font-mono text-xs uppercase tracking-widest hover:underline">
                    Go to Trackr →
                </Link>
            </InvitePage>
        );
    }

    if (invitation.expiresAt < new Date()) {
        return (
            <InvitePage>
                <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-2">Invitation</p>
                <h1 className="font-serif text-2xl font-normal mb-4">Invitation expired</h1>
                <p className="font-mono text-sm text-neutral-600 mb-6">
                    This invitation to <strong>{invitation.workspace?.name ?? "the workspace"}</strong> expired on{" "}
                    {invitation.expiresAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
                    Ask your team admin to send a new invite.
                </p>
                <Link href="/" className="font-mono text-xs uppercase tracking-widest hover:underline">
                    Go to Trackr →
                </Link>
            </InvitePage>
        );
    }

    const user = await currentUser();

    if (!user) {
        // Redirect to sign-in; after auth Clerk will send them back here
        redirect(`/sign-in?redirect_url=${encodeURIComponent(`/invite/accept/${token}`)}`);
    }

    // Check if already a member
    const existing = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.userId, user.id),
            eq(workspaceMembers.workspaceId, invitation.workspaceId),
        ),
    });

    if (!existing) {
        await db
            .insert(workspaceMembers)
            .values({
                userId: user.id,
                workspaceId: invitation.workspaceId,
                role: "member",
            })
            .onConflictDoNothing();
    }

    // Consume the invitation
    await db.delete(pendingInvitations).where(eq(pendingInvitations.id, invitation.id));

    redirect("/tools");
}
