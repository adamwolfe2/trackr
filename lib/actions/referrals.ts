"use server";

import { db } from "@/lib/db";
import { referrals } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getWorkspaceId } from "@/lib/db/queries";
import { eq, sql } from "drizzle-orm";

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

/** Increment click count for a referral code (fire-and-forget, no auth needed) */
export async function trackReferralClick(code: string) {
    if (!code || typeof code !== "string" || code.length > 20) return;
    try {
        await db.update(referrals)
            .set({ clicks: sql`${referrals.clicks} + 1` })
            .where(eq(referrals.code, code.toUpperCase()));
    } catch {
        // Non-critical
    }
}

/** Increment signup count for a referral code (called during onboarding) */
export async function trackReferralSignup(code: string) {
    if (!code || typeof code !== "string" || code.length > 20) return;
    try {
        await db.update(referrals)
            .set({ signups: sql`${referrals.signups} + 1` })
            .where(eq(referrals.code, code.toUpperCase()));
    } catch {
        // Non-critical
    }
}
