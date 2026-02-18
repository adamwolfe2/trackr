"use server";

import { stripe } from "@/lib/services/stripe";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { workspaceMembers, subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function createCheckoutSession(workspaceId: string) {
    const user = await currentUser();
    if (!user) {
        throw new Error("Unauthorized");
    }

    // Verify user is owner of workspace
    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id)
    });

    if (!member || member.role !== 'owner' || member.workspaceId !== workspaceId) {
        throw new Error("Unauthorized: You must be the workspace owner to upgrade.");
    }

    const priceId = process.env.STRIPE_PRO_PRICE_ID;
    if (!priceId) {
        throw new Error("Stripe price ID not configured");
    }

    // Check if checksout session already exists or customer exists
    // For MVP, we'll just create a new session
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        customer_email: user.emailAddresses[0].emailAddress,
        metadata: {
            workspaceId: workspaceId,
            userId: user.id
        },
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

    // Get subscription to find customer ID
    // We should strictly verify workspace ownership too
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
