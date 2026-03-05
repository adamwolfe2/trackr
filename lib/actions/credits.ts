"use server";

import { currentUser } from "@clerk/nextjs/server";
import { getWorkspaceId } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/services/stripe";
import { getPlanLimits, CREDIT_PACKS, CREDIT_PACK_PRICES, type CreditPackSize } from "@/lib/config/subscriptions";

export async function purchaseCredits(packSize: CreditPackSize) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    // Validate packSize
    const pack = CREDIT_PACKS.find((p) => p.credits === packSize);
    if (!pack) throw new Error("Invalid credit pack size");

    // Load subscription
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, workspaceId),
    });

    const plan = getPlanLimits(subscription ?? undefined);
    const priceInCents = CREDIT_PACK_PRICES[plan.slug]?.[packSize];
    if (!priceInCents) throw new Error("No price found for this credit pack and plan combination");

    let stripeCustomerId = subscription?.stripeCustomerId;

    // Create Stripe customer if needed
    if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
            email: user.emailAddresses[0]?.emailAddress,
            metadata: { workspaceId },
        });
        stripeCustomerId = customer.id;

        if (subscription) {
            // Update existing subscription row with the new customer ID
            await db.update(subscriptions)
                .set({ stripeCustomerId, updatedAt: new Date() })
                .where(eq(subscriptions.workspaceId, workspaceId));
        } else {
            // Create a subscription row for free users
            await db.insert(subscriptions).values({
                workspaceId,
                stripeCustomerId,
                status: "free",
                planId: "free",
            });
        }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com";

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer: stripeCustomerId,
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: `${pack.label} — Trackr Research Credits`,
                        description: `${packSize} research credits`,
                    },
                    unit_amount: priceInCents,
                },
                quantity: 1,
            },
        ],
        metadata: {
            type: "extra_credits",
            workspaceId,
            creditCount: String(packSize),
        },
        success_url: `${appUrl}/settings/billing?success=true&credits=${packSize}`,
        cancel_url: `${appUrl}/settings/billing?canceled=true`,
    });

    return { url: session.url };
}

export async function enableAutoTopUp(packSize: CreditPackSize) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    // Validate packSize
    const pack = CREDIT_PACKS.find((p) => p.credits === packSize);
    if (!pack) throw new Error("Invalid credit pack size");

    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, workspaceId),
    });

    if (!subscription?.stripeCustomerId) {
        throw new Error("A payment method is required to enable auto-refill. Please purchase a credit pack first.");
    }

    await db.update(subscriptions)
        .set({
            autoTopUpEnabled: true,
            autoTopUpPack: packSize,
            updatedAt: new Date(),
        })
        .where(eq(subscriptions.workspaceId, workspaceId));
}

export async function disableAutoTopUp() {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    await db.update(subscriptions)
        .set({
            autoTopUpEnabled: false,
            updatedAt: new Date(),
        })
        .where(eq(subscriptions.workspaceId, workspaceId));
}
