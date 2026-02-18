import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { stripe } from "@/lib/services/stripe";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        if (!session?.metadata?.workspaceId) {
            return new NextResponse("Workspace ID is required", { status: 400 });
        }

        await db.insert(subscriptions).values({
            workspaceId: session.metadata.workspaceId,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            // @ts-ignore
            planId: subscription.items.data[0].price.id,
            status: subscription.status,
            // @ts-ignore
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        });
    }

    // Handle Ad Campaign Payment
    if (event.type === "checkout.session.completed" && session.metadata?.type === 'ad_campaign') {
        const adId = session.metadata.adId;
        if (adId) {
            const { ads } = await import("@/lib/db/schema");
            await db.update(ads)
                .set({ status: 'active' })
                .where(eq(ads.id, adId));
        }
    }

    if (event.type === "invoice.payment_succeeded") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        await db.update(subscriptions)
            .set({
                // @ts-ignore
                planId: subscription.items.data[0].price.id,
                // @ts-ignore
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                status: subscription.status,
            })
            .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
    }

    return new NextResponse(null, { status: 200 });
}
