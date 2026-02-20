import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/services/stripe";
import { db } from "@/lib/db";
import { subscriptions, ads, workspaceMembers, webhookEvents } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import type Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs/server";
import { sendTrialEndingEmail, cancelDripForUser } from "@/lib/email/resend";
import { getPlanLimits } from "@/lib/config/subscriptions";

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

    // Idempotency: skip if already processed
    const eventId = event.id;
    const alreadyProcessed = await db.query.webhookEvents.findFirst({
        where: and(
            eq(webhookEvents.source, 'stripe'),
            eq(webhookEvents.eventId, eventId),
        ),
    });
    if (alreadyProcessed) {
        return NextResponse.json({ received: true });
    }

    let processingError: string | undefined;
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
            case "invoice.payment_succeeded": {
                await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
                break;
            }
            case "customer.subscription.trial_will_end": {
                await handleTrialWillEnd(event.data.object as Stripe.Subscription);
                break;
            }
            default: {
                // Unhandled event type — return 200 to acknowledge receipt
            }
        }
    } catch (err) {
        processingError = err instanceof Error ? err.message : String(err);
        console.error(`Stripe webhook error [${event.type}]:`, processingError);
    }

    // Audit log: record event regardless of success/failure for debugging
    await db.insert(webhookEvents)
        .values({
            source: 'stripe',
            eventId,
            eventType: event.type,
            error: processingError ?? null,
        })
        .onConflictDoNothing();

    if (processingError) {
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

    // Handle extra credit purchase
    if (session.metadata?.type === "extra_credits" && session.metadata.workspaceId) {
        const creditCount = parseInt(session.metadata.creditCount ?? "0", 10);
        if (creditCount > 0) {
            await db.update(subscriptions)
                .set({ creditBalance: sql`${subscriptions.creditBalance} + ${creditCount}`, updatedAt: new Date() })
                .where(eq(subscriptions.workspaceId, session.metadata.workspaceId));
        }
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
        await db.insert(subscriptions)
            .values({
                workspaceId,
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                status: stripeSubscription.status,
                planId,
                currentPeriodEnd: periodEnd,
            })
            .onConflictDoUpdate({
                target: subscriptions.stripeSubscriptionId,
                set: {
                    status: stripeSubscription.status,
                    planId,
                    currentPeriodEnd: periodEnd,
                    updatedAt: new Date(),
                },
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

    // Cancel drip emails for the workspace owner on upgrade to paid plan
    if (sub.status === 'active' && existing.status !== 'active') {
        const owner = await db.query.workspaceMembers.findFirst({
            where: and(
                eq(workspaceMembers.workspaceId, existing.workspaceId),
                eq(workspaceMembers.role, 'owner'),
            ),
        });
        if (owner) {
            try {
                const clerk = await clerkClient();
                const clerkUser = await clerk.users.getUser(owner.userId);
                const email = clerkUser.emailAddresses[0]?.emailAddress;
                if (email) cancelDripForUser(email).catch(() => {});
            } catch { /* non-critical */ }
        }
    }
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
    const subscriptionId = getSubscriptionIdFromInvoice(invoice);
    if (!subscriptionId) return;

    await db.update(subscriptions)
        .set({ status: "past_due", updatedAt: new Date() })
        .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
    const subscriptionId = getSubscriptionIdFromInvoice(invoice);
    if (!subscriptionId) return;

    const existing = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.stripeSubscriptionId, subscriptionId),
    });

    // Restore active status from past_due (failed payment recovered) or
    // incomplete (initial payment completed after delayed confirmation)
    if (existing?.status === "past_due" || existing?.status === "incomplete") {
        await db.update(subscriptions)
            .set({ status: "active", updatedAt: new Date() })
            .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));
    }
}

async function handleTrialWillEnd(sub: Stripe.Subscription) {
    const subscriptionId = sub.id;

    const existing = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.stripeSubscriptionId, subscriptionId),
    });

    if (!existing) return;

    // Calculate days left from trial_end
    const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000) : null;
    const daysLeft = trialEnd
        ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 3; // Stripe sends this 3 days before by default

    // Look up workspace owner to send email
    const owner = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.workspaceId, existing.workspaceId),
            eq(workspaceMembers.role, "owner"),
        ),
    });

    if (!owner) return;

    try {
        const clerk = await clerkClient();
        const clerkUser = await clerk.users.getUser(owner.userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        const plan = getPlanLimits(existing);

        if (email) {
            await sendTrialEndingEmail(email, daysLeft, plan.name);
        }
    } catch {
        // Non-critical — don't fail webhook if email errors
    }
}

function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
    const subRef = invoice.parent?.subscription_details?.subscription;
    if (typeof subRef === "string") return subRef;
    if (typeof subRef === "object" && subRef !== null && "id" in subRef) {
        return (subRef as { id: string }).id;
    }
    return null;
}
