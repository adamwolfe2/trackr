"use server";

import { db } from "@/lib/db";
import { architects, architectReferrals, workspaces, workspaceMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

export type ManagedServiceTier = "none" | "basic" | "premium";

export async function getAssignedArchitect(workspaceId: string) {
    const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.id, workspaceId),
        columns: { id: true, name: true },
    });
    if (!workspace) return null;

    // Find architect referral for this workspace that is active
    const referral = await db.query.architectReferrals.findFirst({
        where: and(
            eq(architectReferrals.workspaceId, workspaceId),
            eq(architectReferrals.status, "active"),
        ),
        with: {
            architect: true,
        },
    });

    if (!referral?.architect) return null;

    return {
        id: referral.architect.id,
        firstName: referral.architect.firstName,
        lastName: referral.architect.lastName,
        email: referral.architect.email,
        role: referral.architect.role,
        calendarUrl: referral.architect.calendarUrl,
        arcCode: referral.architect.arcCode,
    };
}

export async function getRetainerArchitects() {
    // Get all active architects available for retainer assignments
    const allArchitects = await db.query.architects.findMany({
        where: eq(architects.status, "active"),
        columns: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            totalClients: true,
            calendarUrl: true,
        },
    });

    return allArchitects;
}

export async function requestArchitectReview(workspaceId: string, _notes?: string) {
    // Auth: verify caller is signed in and belongs to this workspace
    const user = await currentUser();
    if (!user) throw new Error("Not authenticated");

    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.userId, user.id),
            eq(workspaceMembers.workspaceId, workspaceId),
        ),
    });
    if (!member) throw new Error("Not a member of this workspace");

    const architect = await getAssignedArchitect(workspaceId);
    if (!architect) throw new Error("No architect assigned to this workspace");

    // In production: send email to architect, create calendar event
    revalidatePath("/managed");
    return { success: true, architectEmail: architect.email };
}
