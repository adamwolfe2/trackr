import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/services/stripe";
import { db } from "@/lib/db";
import { subscriptions, ads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
                break;
            }
            case "customer.subscription.updated": {
                await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
                break;
            }
            case "customer.subscription.deleted": {
                await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                break;
            }
            case "invoice.payment_failed": {
                await handlePaymentFailed(event.data.object as Stripe.Invoice);
                break;
            }
            default: {
                // Unhandled event type — return 200 to acknowledge receipt
            }
        }
    } catch {
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}

/**
 * Helper to extract current_period_end from a Stripe Subscription.
 * In Stripe v20, current_period_end moved from Subscription to SubscriptionItem.
 */
function getSubscriptionPeriodEnd(sub: Stripe.Subscription): Date | null {
    const item = sub.items?.data?.[0];
    if (item?.current_period_end) {
        return new Date(item.current_period_end * 1000);
    }
    return null;
}

function getCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer): string {
    return typeof customer === "string" ? customer : customer.id;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    // Handle ad campaign payment
    if (session.metadata?.type === "ad_campaign" && session.metadata.adId) {
        await db
            .update(ads)
            .set({ status: "active" })
            .where(eq(ads.id, session.metadata.adId));
        return;
    }

    const workspaceId = session.metadata?.workspaceId;
    if (!workspaceId) return;

    const subscriptionId = session.subscription as string;
    if (!subscriptionId) return;

    // Retrieve the full subscription to get period and item details
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

    const planId = stripeSubscription.items.data[0]?.price?.id ?? "";
    const customerId = getCustomerId(stripeSubscription.customer);
    const periodEnd = getSubscriptionPeriodEnd(stripeSubscription);

    // Check if a subscription record already exists for this workspace
    const existing = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, workspaceId),
    });

    if (existing) {
        await db
            .update(subscriptions)
            .set({
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                status: stripeSubscription.status,
                planId,
                currentPeriodEnd: periodEnd,
                updatedAt: new Date(),
            })
            .where(eq(subscriptions.workspaceId, workspaceId));
    } else {
        await db.insert(subscriptions).values({
            workspaceId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            status: stripeSubscription.status,
            planId,
            currentPeriodEnd: periodEnd,
        });
    }
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
    const subscriptionId = sub.id;
    const planId = sub.items.data[0]?.price?.id ?? "";
    const customerId = getCustomerId(sub.customer);
    const periodEnd = getSubscriptionPeriodEnd(sub);

    const existing = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.stripeSubscriptionId, subscriptionId),
    });

    if (!existing) return;

    await db
        .update(subscriptions)
        .set({
            status: sub.status,
            planId,
            stripeCustomerId: customerId,
            currentPeriodEnd: periodEnd,
            updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
    const subscriptionId = sub.id;

    const existing = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.stripeSubscriptionId, subscriptionId),
    });

    if (!existing) return;

    await db
        .update(subscriptions)
        .set({
            status: "canceled",
            updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    // In Stripe v20, subscription is accessed via parent.subscription_details
    const subRef = invoice.parent?.subscription_details?.subscription;
    const subscriptionId = typeof subRef === "string"
        ? subRef
        : subRef?.id ?? null;

    if (!subscriptionId) return;

    const existing = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.stripeSubscriptionId, subscriptionId),
    });

    if (!existing) return;

    await db
        .update(subscriptions)
        .set({
            status: "past_due",
            updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));
}
