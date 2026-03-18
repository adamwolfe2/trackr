"use server";

import { after } from "next/server";
import { stripe, assertStripeConfigured } from "@/lib/services/stripe";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { workspaceMembers, subscriptions } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import type { PlanSlug, BillingInterval } from "@/lib/config/subscriptions";
import { captureEvent } from "@/lib/analytics/posthog-server";
import { rateLimit } from "@/lib/middleware/rate-limit";

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
    assertStripeConfigured();
    const user = await currentUser();
    if (!user) {
        throw new Error("Unauthorized");
    }

    const rl = await rateLimit(`checkout:${user.id}`, { limit: 3, windowSeconds: 60 });
    if (!rl.success) throw new Error("Too many requests. Please wait before trying again.");

    const member = await db.query.workspaceMembers.findFirst({
        where: and(eq(workspaceMembers.userId, user.id), eq(workspaceMembers.workspaceId, workspaceId)),
    });

    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
        throw new Error("Unauthorized: Only workspace owners and admins can manage billing.");
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL is required for Stripe redirect URLs");

    const priceId = getPriceId(plan, interval);

    // Reuse existing Stripe customer if workspace already has one (prevents duplicates on re-subscribe)
    const existingSub = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, workspaceId),
        columns: { stripeCustomerId: true },
    });

    const primaryEmail = user.emailAddresses[0]?.emailAddress;
    if (!primaryEmail && !existingSub?.stripeCustomerId) {
        throw new Error("User has no email address — cannot create Stripe checkout session");
    }

    const customerIdentifier = existingSub?.stripeCustomerId
        ? { customer: existingSub.stripeCustomerId }
        : { customer_email: primaryEmail! };

    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        ...customerIdentifier,
        metadata: { workspaceId, userId: user.id, plan, interval },
        subscription_data: { trial_period_days: 14 },
        success_url: `${appUrl}/settings/billing?success=true`,
        cancel_url: `${appUrl}/settings/billing?canceled=true`,
    });

    if (!session.url) {
        throw new Error("Failed to create checkout session");
    }

    // Track checkout initiation after response — non-blocking
    const captureUserId = user.id;
    after(async () => {
        await captureEvent(captureUserId, "checkout_initiated", {
            plan,
            interval,
            workspace_id: workspaceId,
            session_id: session.id,
        });
    });

    return { url: session.url };
}

export async function createCustomerPortalSession(workspaceId: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const member = await db.query.workspaceMembers.findFirst({
        where: and(eq(workspaceMembers.userId, user.id), eq(workspaceMembers.workspaceId, workspaceId)),
    });

    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
        throw new Error("Unauthorized");
    }

    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, workspaceId)
    });

    if (!subscription || !subscription.stripeCustomerId) {
        throw new Error("No subscription found");
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL is required for Stripe redirect URLs");

    const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: `${appUrl}/settings/billing`,
    });

    return { url: session.url };
}
