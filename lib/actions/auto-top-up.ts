import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { stripe, assertStripeConfigured } from "@/lib/services/stripe";
import { getPlanLimits, CREDIT_PACK_PRICES } from "@/lib/config/subscriptions";

export async function performAutoTopUp(workspaceId: string): Promise<{ success: boolean; creditsAdded?: number }> {
    assertStripeConfigured();
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, workspaceId),
    });

    if (!subscription?.autoTopUpEnabled || !subscription.stripeCustomerId) {
        return { success: false };
    }

    const plan = getPlanLimits(subscription);
    const autoTopUpPack = subscription.autoTopUpPack;
    const priceInCents = CREDIT_PACK_PRICES[plan.slug]?.[autoTopUpPack];

    if (!priceInCents) {
        return { success: false };
    }

    try {
        await stripe.paymentIntents.create({
            amount: priceInCents,
            currency: "usd",
            customer: subscription.stripeCustomerId,
            off_session: true,
            confirm: true,
            payment_method_types: ["card"],
            metadata: {
                type: "auto_top_up",
                workspaceId,
                creditCount: String(autoTopUpPack),
            },
        });

        // Payment succeeded — increment credit balance
        await db.update(subscriptions)
            .set({
                creditBalance: sql`${subscriptions.creditBalance} + ${autoTopUpPack}`,
                updatedAt: new Date(),
            })
            .where(eq(subscriptions.workspaceId, workspaceId));

        return { success: true, creditsAdded: autoTopUpPack };
    } catch {
        // Payment failed — disable auto-top-up to prevent repeated failures
        await db.update(subscriptions)
            .set({
                autoTopUpEnabled: false,
                updatedAt: new Date(),
            })
            .where(eq(subscriptions.workspaceId, workspaceId));

        return { success: false };
    }
}
