"use server";

import { db } from "@/lib/db";
import { architectPayouts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function markPayoutPaid(payoutId: string) {
    await db
        .update(architectPayouts)
        .set({ status: "paid" })
        .where(eq(architectPayouts.id, payoutId));

    revalidatePath("/admin/payouts");
}

export async function retryPayout(payoutId: string) {
    await db
        .update(architectPayouts)
        .set({ status: "pending" })
        .where(eq(architectPayouts.id, payoutId));

    revalidatePath("/admin/payouts");
}
