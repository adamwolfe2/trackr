import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/services/stripe";
import { db } from "@/lib/db";
import { subscriptions, ads, workspaceMembers, webhookEvents, architectReferrals, architects, architectCommissions } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import type Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs/server";
import { sendTrialEndingEmail, cancelDripForUser, sendCommissionEarned } from "@/lib/email/resend";
import { getPlanLimits } from "@/lib/config/subscriptions";
import { captureEvent } from "@/lib/analytics/posthog-server";

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

    // Idempotency: atomically claim the event — only one concurrent request can succeed
    const eventId = event.id;
    const claimed = await db.insert(webhookEvents)
        .values({
            source: 'stripe',
            eventId,
            eventType: event.type,
            error: null,
        })
        .onConflictDoNothing()
        .returning({ id: webhookEvents.id });

    if (claimed.length === 0) {
        // Another request already claimed this event — skip silently
        return NextResponse.json({ received: true });
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
            case "invoice.paid": {
                await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
                break;
            }
            case "customer.subscription.trial_will_end": {
                await handleTrialWillEnd(event.data.object as Stripe.Subscription);
                break;
            }
            case "account.updated": {
                await handleAccountUpdated(event.data.object as Stripe.Account);
                break;
            }
            default: {
                // Unhandled event type — return 200 to acknowledge receipt
            }
        }
    } catch (err) {
        const fullError = err instanceof Error ? err.message : String(err);
        // Log full detail to console/Sentry for debugging
        console.error(`Stripe webhook error [${event.type}]:`, fullError);
        // Sanitize before persisting — strip email addresses and truncate
        const safeError = fullError
            .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL]")
            .slice(0, 500);
        // Update the already-inserted record with the sanitized error
        await db.update(webhookEvents)
            .set({ error: safeError })
            .where(and(eq(webhookEvents.source, 'stripe'), eq(webhookEvents.eventId, eventId)));
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
        if (!isNaN(creditCount) && creditCount > 0) {
            await db.update(subscriptions)
                .set({ creditBalance: sql`${subscriptions.creditBalance} + ${creditCount}`, updatedAt: new Date() })
                .where(eq(subscriptions.workspaceId, session.metadata.workspaceId));
        }
        return;
    }

    const workspaceId = session.metadata?.workspaceId;
    if (!workspaceId) {
        console.error('[stripe-webhook] CRITICAL: workspaceId missing from checkout metadata', {
            sessionId: session.id, customerId: session.customer, metadata: session.metadata,
        });
        return;
    }

    const subscriptionId = session.subscription as string;
    if (!subscriptionId) {
        console.error('[stripe-webhook] CRITICAL: subscriptionId missing from completed checkout', {
            sessionId: session.id, workspaceId,
        });
        return;
    }

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

    // Track subscription start — use userId from metadata as distinct_id for user-level funnel
    const distinctId = session.metadata?.userId ?? workspaceId;
    await captureEvent(distinctId, "subscription_started", {
        plan: session.metadata?.plan,
        interval: session.metadata?.interval,
        workspace_id: workspaceId,
        subscription_id: subscriptionId,
        status: stripeSubscription.status,
    });
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

    await captureEvent(existing.workspaceId, "subscription_updated", {
        workspace_id: existing.workspaceId,
        subscription_id: subscriptionId,
        old_status: existing.status,
        new_status: sub.status,
        plan_id: planId,
    });

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

    await captureEvent(existing.workspaceId, "subscription_canceled", {
        workspace_id: existing.workspaceId,
        subscription_id: subscriptionId,
    });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    const subscriptionId = getSubscriptionIdFromInvoice(invoice);
    if (!subscriptionId) return;

    const existing = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.stripeSubscriptionId, subscriptionId),
        columns: { workspaceId: true },
    });

    await db.update(subscriptions)
        .set({ status: "past_due", updatedAt: new Date() })
        .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));

    if (existing?.workspaceId) {
        await captureEvent(existing.workspaceId, "payment_failed", {
            workspace_id: existing.workspaceId,
            subscription_id: subscriptionId,
        });
    }
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

    // Architect commission: check if this workspace has an architect referral
    if (existing) {
        try {
            // First check for active referrals; if none, promote a "lead" to "active"
            // (a "lead" becomes "active" on first successful payment — this is the conversion event)
            let referral = await db.query.architectReferrals.findFirst({
                where: and(
                    eq(architectReferrals.workspaceId, existing.workspaceId),
                    eq(architectReferrals.status, "active"),
                ),
            });

            if (!referral) {
                // Promote lead → active on first payment
                const leadReferral = await db.query.architectReferrals.findFirst({
                    where: and(
                        eq(architectReferrals.workspaceId, existing.workspaceId),
                        eq(architectReferrals.status, "lead"),
                    ),
                });
                if (leadReferral) {
                    await db.update(architectReferrals)
                        .set({ status: "active" })
                        .where(eq(architectReferrals.id, leadReferral.id));
                    referral = { ...leadReferral, status: "active" };
                }
            }

            if (referral) {
                const architect = await db.query.architects.findFirst({
                    where: and(
                        eq(architects.id, referral.architectId),
                        eq(architects.status, "active"),
                    ),
                });

                if (architect) {
                    const invoiceAmount = invoice.amount_paid; // cents
                    const commissionRate = 20;
                    const commissionAmount = Math.floor(invoiceAmount * commissionRate / 100);
                    const invoiceId = invoice.id;

                    if (commissionAmount > 0 && invoiceId) {
                        // Create commission record
                        const [commission] = await db.insert(architectCommissions).values({
                            architectId: architect.id,
                            referralId: referral.id,
                            stripeInvoiceId: invoiceId,
                            invoiceAmount,
                            commissionRate,
                            commissionAmount,
                            status: "pending",
                        }).returning();

                        // If architect has completed Stripe Connect, transfer immediately
                        if (architect.stripeOnboardingComplete && architect.stripeConnectAccountId) {
                            try {
                                const transfer = await stripe.transfers.create({
                                    amount: commissionAmount,
                                    currency: "usd",
                                    destination: architect.stripeConnectAccountId,
                                    metadata: {
                                        commissionId: commission.id,
                                        architectId: architect.id,
                                        invoiceId,
                                    },
                                });

                                await db.update(architectCommissions)
                                    .set({
                                        status: "paid",
                                        stripeTransferId: transfer.id,
                                        paidAt: new Date(),
                                    })
                                    .where(eq(architectCommissions.id, commission.id));

                                // Update architect lifetime earnings
                                await db.update(architects)
                                    .set({ totalEarnings: architect.totalEarnings + commissionAmount })
                                    .where(eq(architects.id, architect.id));

                                // Notify architect
                                await sendCommissionEarned(
                                    architect.email,
                                    architect.firstName,
                                    existing.workspaceId,
                                    commissionAmount,
                                    architect.totalEarnings + commissionAmount,
                                );
                            } catch (transferErr) {
                                console.error("[webhook] Stripe transfer failed for architect", architect.id, transferErr);
                                // Commission stays as "pending" — can be retried
                            }
                        }
                    }
                }
            }
        } catch (commErr) {
            // Non-critical: log but don't fail the webhook
            console.error("[webhook] Architect commission processing failed", commErr);
        }
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

async function handleAccountUpdated(account: Stripe.Account) {
    // Stripe Connect: update architect onboarding status when charges become enabled
    if (!account.charges_enabled) return;

    const architect = await db.query.architects.findFirst({
        where: eq(architects.stripeConnectAccountId, account.id),
    });

    if (architect && !architect.stripeOnboardingComplete) {
        await db.update(architects)
            .set({ stripeOnboardingComplete: true })
            .where(eq(architects.id, architect.id));
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
