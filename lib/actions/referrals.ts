"use server";

import { db } from "@/lib/db";
import { referrals } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";

export async function createReferralCode(workspaceId: string) {
    // Generate simple random code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    await db.insert(referrals).values({
        referrerWorkspaceId: workspaceId,
        code,
    });

    revalidatePath("/referrals");
}
