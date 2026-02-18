import { db } from "@/lib/db";
import { subscriptions, ads } from "@/lib/db/schema";
import { stripe } from "@/lib/services/stripe";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

function getPriceId(subscription: Stripe.Subscription): string {
    const item = subscription.items.data[0];
    const price = item?.price;
    return typeof price === "string" ? price : (price?.id ?? "unknown");
}

function getPeriodEnd(subscription: Stripe.Subscription): Date {
    const periodEnd = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end;
    return periodEnd ? new Date(periodEnd * 1000) : new Date();
}

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature");

    if (!signature) {
        return new NextResponse("Missing Stripe-Signature header", { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        return new NextResponse("Stripe webhook secret not configured", { status: 500 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Signature verification failed";
        return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
    }

    try {
        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;

            // Handle subscription checkout
            if (session.mode === "subscription" && session.metadata?.workspaceId) {
                const workspaceId = session.metadata.workspaceId;

                // Idempotency: check if subscription already recorded
                const existing = await db.query.subscriptions.findFirst({
                    where: eq(subscriptions.stripeSubscriptionId, session.subscription as string),
                });

                if (!existing && session.subscription) {
                    const stripeSubscription = await stripe.subscriptions.retrieve(
                        session.subscription as string
                    );

                    await db.insert(subscriptions).values({
                        workspaceId,
                        stripeSubscriptionId: stripeSubscription.id,
                        stripeCustomerId: stripeSubscription.customer as string,
                        planId: getPriceId(stripeSubscription),
                        status: stripeSubscription.status,
                        currentPeriodEnd: getPeriodEnd(stripeSubscription),
                    });
                }
            }

            // Handle ad campaign payment
            if (session.metadata?.type === "ad_campaign" && session.metadata.adId) {
                await db
                    .update(ads)
                    .set({ status: "active" })
                    .where(eq(ads.id, session.metadata.adId));
            }
        }

        if (event.type === "invoice.payment_succeeded") {
            const invoice = event.data.object as Stripe.Invoice;
            const subscriptionId = typeof invoice.subscription === "string"
                ? invoice.subscription
                : invoice.subscription?.id;

            if (subscriptionId) {
                const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

                await db
                    .update(subscriptions)
                    .set({
                        planId: getPriceId(stripeSubscription),
                        currentPeriodEnd: getPeriodEnd(stripeSubscription),
                        status: stripeSubscription.status,
                        updatedAt: new Date(),
                    })
                    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscription.id));
            }
        }

        if (event.type === "customer.subscription.deleted") {
            const subscription = event.data.object as Stripe.Subscription;
            await db
                .update(subscriptions)
                .set({ status: "canceled", updatedAt: new Date() })
                .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Webhook handler error";
        return new NextResponse(`Handler Error: ${message}`, { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
}
