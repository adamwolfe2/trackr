"use server";

import { db } from "@/lib/db";
import { referrals, subscriptions } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getWorkspaceId } from "@/lib/db/queries";
import { eq, sql } from "drizzle-orm";

const REFERRAL_CREDITS = 5;

export async function createReferralCode() {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // Derive workspace from authenticated user
    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    try {
        // Generate cryptographically strong 8-char alphanumeric code
        const code = crypto.randomUUID().replace(/-/g, "").substring(0, 8).toUpperCase();

        await db.insert(referrals).values({
            referrerWorkspaceId: workspaceId,
            code,
        });

        revalidatePath("/referrals");
        return { success: true };
    } catch {
        return { success: false, error: "Failed to create referral code" };
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

/** Increment signup count for a referral code and award research credits to the referrer */
export async function trackReferralSignup(code: string) {
    if (!code || typeof code !== "string" || code.length > 20) return;
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");
    try {
        const [referral] = await db
            .update(referrals)
            .set({ signups: sql`${referrals.signups} + 1` })
            .where(eq(referrals.code, code.toUpperCase()))
            .returning({ referrerWorkspaceId: referrals.referrerWorkspaceId });

        // Award REFERRAL_CREDITS research credits to the referrer's subscription.
        // Uses a silent UPDATE — if the workspace has no subscription row (free tier),
        // the update affects 0 rows and no error is thrown.
        if (referral?.referrerWorkspaceId) {
            await db
                .update(subscriptions)
                .set({
                    creditBalance: sql`${subscriptions.creditBalance} + ${REFERRAL_CREDITS}`,
                    updatedAt: new Date(),
                })
                .where(eq(subscriptions.workspaceId, referral.referrerWorkspaceId));
        }
    } catch {
        // Non-critical
    }
}
