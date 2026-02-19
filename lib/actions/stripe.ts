"use server";

import { stripe } from "@/lib/services/stripe";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { workspaceMembers, subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { PlanSlug, BillingInterval } from "@/lib/config/subscriptions";

type PaidPlanSlug = Exclude<PlanSlug, "free">;

function getPriceId(plan: PaidPlanSlug, interval: BillingInterval = "monthly"): string {
    const prefix = `STRIPE_${plan.toUpperCase()}`;
    const suffix = interval === "annual" ? "ANNUAL" : "MONTHLY";
    const envKey = `${prefix}_${suffix}_PRICE_ID`;
    const id = process.env[envKey];
    if (!id) throw new Error(`${envKey} not configured`);
    return id;
}

export async function createCheckoutSession(
    workspaceId: string,
    plan: PaidPlanSlug = "team",
    interval: BillingInterval = "monthly"
) {
    const user = await currentUser();
    if (!user) {
        throw new Error("Unauthorized");
    }

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id)
    });

    if (!member || member.role !== 'owner' || member.workspaceId !== workspaceId) {
        throw new Error("Unauthorized: You must be the workspace owner to upgrade.");
    }

    const priceId = getPriceId(plan, interval);

    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: user.emailAddresses[0].emailAddress,
        metadata: { workspaceId, userId: user.id, plan, interval },
        subscription_data: { trial_period_days: 14 },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
    });

    if (!session.url) {
        throw new Error("Failed to create checkout session");
    }

    return { url: session.url };
}

export async function createCustomerPortalSession(workspaceId: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id)
    });

    if (!member || member.role !== 'owner' || member.workspaceId !== workspaceId) {
        throw new Error("Unauthorized");
    }

    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, workspaceId)
    });

    if (!subscription || !subscription.stripeCustomerId) {
        throw new Error("No subscription found");
    }

    const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
    });

    return { url: session.url };
}
