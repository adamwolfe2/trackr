"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { workspaces, workspaceMembers, subscriptions } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and, count } from "drizzle-orm";
import { getWorkspaceId } from "./tools";
import { getPlanLimits } from "@/lib/config/subscriptions";

export async function updateWorkspaceName(formData: FormData) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const name = (formData.get("name") as string)?.trim();
    if (!name) throw new Error("Workspace name is required");

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
    if (!email || !email.includes("@")) throw new Error("Valid email is required");

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

    // Send invite email via Resend if available
    try {
        const workspace = await db.query.workspaces.findFirst({
            where: eq(workspaces.id, workspaceId),
        });
        const { sendInviteEmail } = await import("@/lib/email/resend");
        const inviterName = [user.firstName, user.lastName].filter(Boolean).join(" ") || undefined;
        await sendInviteEmail(email, workspace?.name || "a Trackr workspace", inviterName);
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

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    await db.update(workspaces)
        .set({ scorecardConfig: recipe as unknown as Record<string, unknown> })
        .where(eq(workspaces.id, workspaceId));

    revalidatePath("/scorecard");
    return { success: true };
}

export async function updateCompanyContext(formData: FormData) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    const companyContext = (formData.get("companyContext") as string)?.trim() || null;

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
    await db.update(workspaces).set({ apiKey }).where(eq(workspaces.id, workspaceId));

    revalidatePath("/workspace");
    return apiKey;
}

export async function removeMember(memberId: string) {
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
