"use server";

import { db } from "@/lib/db";
import { referrals, workspaceMembers } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createReferralCode(workspaceId: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // Verify the caller belongs to the given workspace
    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });
    if (!member) throw new Error("User is not a member of any workspace");
    if (member.workspaceId !== workspaceId) throw new Error("Forbidden");

    try {
        // Generate simple random code
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();

        await db.insert(referrals).values({
            referrerWorkspaceId: workspaceId,
            code,
        });

        revalidatePath("/referrals");
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create referral code";
        return { success: false, error: message };
    }
}
