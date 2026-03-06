"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { workspaces, workspaceMembers, subscriptions, pendingInvitations } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and, count, gt } from "drizzle-orm";
import { getWorkspaceId } from "@/lib/db/queries";
import { getPlanLimits } from "@/lib/config/subscriptions";
import { createHash, randomBytes } from "crypto";

function hashApiKey(key: string): string {
    return createHash("sha256").update(key).digest("hex");
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function updateWorkspaceName(formData: FormData) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const name = (formData.get("name") as string)?.trim();
    if (!name) throw new Error("Workspace name is required");
    if (name.length > 200) throw new Error("Workspace name too long (max 200 characters)");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    // Only owner/admin can update name
    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.userId, user.id),
            eq(workspaceMembers.workspaceId, workspaceId)
        ),
    });

    if (!member || (member.role !== "owner" && member.role !== "admin")) {
        throw new Error("Only workspace owners can update the workspace name");
    }

    await db.update(workspaces)
        .set({ name })
        .where(eq(workspaces.id, workspaceId));

    revalidatePath("/workspace");
    return { success: true };
}

export async function inviteMember(formData: FormData) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !EMAIL_REGEX.test(email)) throw new Error("Valid email is required");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    // Check current user's role
    const currentMember = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.userId, user.id),
            eq(workspaceMembers.workspaceId, workspaceId)
        ),
    });

    if (!currentMember || (currentMember.role !== "owner" && currentMember.role !== "admin")) {
        throw new Error("Only workspace owners can invite members");
    }

    // Enforce plan member limit
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, workspaceId),
    });
    const limits = getPlanLimits(subscription ?? undefined);
    const [{ value: memberCount }] = await db
        .select({ value: count() })
        .from(workspaceMembers)
        .where(eq(workspaceMembers.workspaceId, workspaceId));
    if (memberCount >= limits.limits.members) {
        throw new Error(`Your ${limits.name} plan allows up to ${limits.limits.members} member${limits.limits.members === 1 ? "" : "s"}. Upgrade to add more.`);
    }

    // Rate limit: max 20 invites per hour per user
    const [{ value: recentInviteCount }] = await db
        .select({ value: count() })
        .from(pendingInvitations)
        .where(and(
            eq(pendingInvitations.invitedByUserId, user.id),
            gt(pendingInvitations.createdAt, new Date(Date.now() - 60 * 60 * 1000))
        ));
    if (recentInviteCount >= 20) {
        throw new Error("Rate limit reached. You can send at most 20 invitations per hour.");
    }

    // Check if an active (non-expired) invitation already exists for this email.
    // Without a unique constraint we must do this check manually to prevent duplicates.
    const existingInvite = await db.query.pendingInvitations.findFirst({
        where: and(
            eq(pendingInvitations.workspaceId, workspaceId),
            eq(pendingInvitations.email, email),
            gt(pendingInvitations.expiresAt, new Date()),
        ),
    });

    let inviteId: string | undefined;
    if (!existingInvite) {
        // No active invite — create one with 7-day expiry
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const [newInvite] = await db
            .insert(pendingInvitations)
            .values({ workspaceId, email, invitedByUserId: user.id, expiresAt })
            .returning({ id: pendingInvitations.id });
        inviteId = newInvite?.id;
    } else {
        // Re-send existing invite with its token
        inviteId = existingInvite.id;
    }

    // Send invite email via Resend if available
    try {
        const workspace = await db.query.workspaces.findFirst({
            where: eq(workspaces.id, workspaceId),
        });
        const { sendInviteEmail } = await import("@/lib/email/resend");
        const inviterName = [user.firstName, user.lastName].filter(Boolean).join(" ") || undefined;
        await sendInviteEmail(email, workspace?.name || "a Trackr workspace", inviterName, inviteId);
    } catch {
        // Email sending failure is non-fatal
    }

    revalidatePath("/workspace");
    return { success: true, message: `Invitation sent to ${email}` };
}

interface ScorecardRecipeInput {
    systemContext: string;
    businessUnits: Array<{ key: string; name: string; description: string; priorities: string }>;
    evaluationCriteria: string;
    dealBreakers: string;
}

export async function saveScorecardRecipe(recipe: ScorecardRecipeInput) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });
    if (!member) throw new Error("No workspace found");
    if (member.role !== "owner" && member.role !== "admin") {
        throw new Error("Only workspace owners and admins can update the scorecard configuration");
    }

    const workspaceId = member.workspaceId;

    await db.update(workspaces)
        .set({ scorecardConfig: recipe as unknown as Record<string, unknown> })
        .where(eq(workspaces.id, workspaceId));

    revalidatePath("/scorecard");
    return { success: true };
}

interface ScorecardWeightsInput {
    core: number;
    ease: number;
    integration: number;
    pricing: number;
    ai: number;
    community: number;
    scale: number;
}

export async function saveScorecardWeights(weights: ScorecardWeightsInput) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });
    if (!member) throw new Error("No workspace found");
    if (member.role !== "owner" && member.role !== "admin") {
        throw new Error("Only workspace owners and admins can update scoring weights");
    }

    // Validate weights total 100
    const total = Object.values(weights).reduce((sum, v) => sum + v, 0);
    if (total !== 100) throw new Error("Weights must total 100%");

    const workspaceId = member.workspaceId;

    // Get existing scorecard config and merge weights
    const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.id, workspaceId),
        columns: { scorecardConfig: true },
    });

    const existingConfig = (workspace?.scorecardConfig || {}) as Record<string, unknown>;

    await db.update(workspaces)
        .set({
            scorecardConfig: { ...existingConfig, weights } as unknown as Record<string, unknown>,
        })
        .where(eq(workspaces.id, workspaceId));

    revalidatePath("/settings/scorecard");
    return { success: true };
}

export async function updateCompanyContext(formData: FormData) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    const companyContext = (formData.get("companyContext") as string)?.trim() || null;
    if (companyContext && companyContext.length > 5000) throw new Error("Company context too long (max 5000 characters)");

    // Only owner/admin can update company context
    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.userId, user.id),
            eq(workspaceMembers.workspaceId, workspaceId)
        ),
    });
    if (!member || (member.role !== "owner" && member.role !== "admin")) {
        throw new Error("Only workspace owners or admins can update company context");
    }

    await db.update(workspaces)
        .set({ companyContext })
        .where(eq(workspaces.id, workspaceId));

    revalidatePath("/workspace");
    return { success: true };
}

export async function regenerateApiKey() {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    // Only owner/admin can regenerate API key
    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.userId, user.id),
            eq(workspaceMembers.workspaceId, workspaceId)
        ),
    });

    if (!member || (member.role !== "owner" && member.role !== "admin")) {
        throw new Error("Only workspace owners or admins can manage API keys");
    }

    const apiKey = `trk_${crypto.randomUUID().replace(/-/g, "")}`;
    const hashedKey = hashApiKey(apiKey);
    await db.update(workspaces).set({ apiKey: hashedKey }).where(eq(workspaces.id, workspaceId));

    revalidatePath("/workspace");
    return apiKey;
}

export async function removeMember(memberId: string) {
    if (!UUID_RE.test(memberId)) throw new Error("Invalid member ID");
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    // Check current user's role
    const currentMember = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.userId, user.id),
            eq(workspaceMembers.workspaceId, workspaceId)
        ),
    });

    if (!currentMember || (currentMember.role !== "owner" && currentMember.role !== "admin")) {
        throw new Error("Only workspace owners can remove members");
    }

    // Verify the member to remove belongs to the same workspace
    const memberToRemove = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.id, memberId),
            eq(workspaceMembers.workspaceId, workspaceId)
        ),
    });

    if (!memberToRemove) throw new Error("Member not found");
    if (memberToRemove.role === "owner") throw new Error("Cannot remove the workspace owner");

    await db.delete(workspaceMembers).where(eq(workspaceMembers.id, memberId));

    revalidatePath("/workspace");
    return { success: true };
}

export async function disconnectSlackWorkspace() {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.userId, user.id),
            eq(workspaceMembers.workspaceId, workspaceId)
        ),
    });

    if (!member || (member.role !== "owner" && member.role !== "admin")) {
        throw new Error("Only workspace owners or admins can manage Slack settings");
    }

    const { disconnectSlack } = await import("@/lib/services/slack");
    await disconnectSlack(workspaceId);

    revalidatePath("/workspace");
    return { success: true };
}

export async function cancelInvitation(invitationId: string) {
    if (!UUID_RE.test(invitationId)) throw new Error("Invalid invitation ID");
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    // Only owner/admin can cancel invitations
    const currentMember = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.userId, user.id),
            eq(workspaceMembers.workspaceId, workspaceId)
        ),
    });

    if (!currentMember || (currentMember.role !== "owner" && currentMember.role !== "admin")) {
        throw new Error("Only workspace owners or admins can cancel invitations");
    }

    // Verify invitation belongs to this workspace
    const invitation = await db.query.pendingInvitations.findFirst({
        where: and(
            eq(pendingInvitations.id, invitationId),
            eq(pendingInvitations.workspaceId, workspaceId)
        ),
    });

    if (!invitation) throw new Error("Invitation not found");

    await db.delete(pendingInvitations).where(eq(pendingInvitations.id, invitationId));

    revalidatePath("/workspace");
    return { success: true };
}

export async function generateInviteLink() {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.userId, user.id),
            eq(workspaceMembers.workspaceId, workspaceId)
        ),
    });

    if (!member || (member.role !== "owner" && member.role !== "admin")) {
        throw new Error("Only workspace owners or admins can manage invite links");
    }

    const code = randomBytes(16).toString("hex");
    await db.update(workspaces).set({ inviteCode: code }).where(eq(workspaces.id, workspaceId));

    revalidatePath("/workspace");
    return code;
}

export async function revokeInviteLink() {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.userId, user.id),
            eq(workspaceMembers.workspaceId, workspaceId)
        ),
    });

    if (!member || (member.role !== "owner" && member.role !== "admin")) {
        throw new Error("Only workspace owners or admins can manage invite links");
    }

    await db.update(workspaces).set({ inviteCode: null }).where(eq(workspaces.id, workspaceId));

    revalidatePath("/workspace");
    return { success: true };
}

export async function updateSlackSettings(channelId: string | null, enabled: boolean) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.userId, user.id),
            eq(workspaceMembers.workspaceId, workspaceId)
        ),
    });

    if (!member || (member.role !== "owner" && member.role !== "admin")) {
        throw new Error("Only workspace owners or admins can manage Slack settings");
    }

    await db.update(workspaces)
        .set({
            slackChannelId: channelId,
            slackEnabled: enabled,
        })
        .where(eq(workspaces.id, workspaceId));

    revalidatePath("/workspace");
    return { success: true };
}
