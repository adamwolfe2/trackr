"use server";

import { db } from "@/lib/db";
import { referrals } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getWorkspaceId } from "@/lib/db/queries";

export async function createReferralCode() {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // Derive workspace from authenticated user
    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

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
