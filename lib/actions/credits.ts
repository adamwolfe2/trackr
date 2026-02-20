"use server";

import { currentUser } from "@clerk/nextjs/server";
import { getWorkspaceId } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/services/stripe";
import { getPlanLimits } from "@/lib/config/subscriptions";

const CREDIT_PACKS = [
    { credits: 5, label: "5 credits" },
    { credits: 10, label: "10 credits" },
    { credits: 25, label: "25 credits" },
] as const;

export async function purchaseExtraCredits(creditCount: number) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    // Validate credit count
    const pack = CREDIT_PACKS.find((p) => p.credits === creditCount);
    if (!pack) throw new Error("Invalid credit pack");

    // Must have a paid subscription to purchase credits
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, workspaceId),
    });

    if (!subscription || (subscription.status !== "active" && subscription.status !== "trialing")) {
        throw new Error("Active subscription required to purchase credits");
    }

    const plan = getPlanLimits(subscription);
    if (!plan.extraCreditPrice) {
        throw new Error("Extra credits not available on your plan");
    }

    // Calculate total price in cents
    const unitAmountCents = Math.round(plan.extraCreditPrice * 100);
    const totalCents = unitAmountCents * creditCount;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com";

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer: subscription.stripeCustomerId ?? undefined,
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: `${pack.label} — Trackr Research Credits`,
                        description: `${creditCount} additional research credits at $${plan.extraCreditPrice}/each`,
                    },
                    unit_amount: totalCents,
                },
                quantity: 1,
            },
        ],
        metadata: {
            type: "extra_credits",
            workspaceId,
            creditCount: String(creditCount),
        },
        success_url: `${appUrl}/settings/billing?success=true&credits=${creditCount}`,
        cancel_url: `${appUrl}/settings/billing?canceled=true`,
    });

    return { url: session.url };
}
