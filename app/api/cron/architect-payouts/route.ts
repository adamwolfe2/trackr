/**
 * GET /api/cron/architect-payouts
 *
 * Runs on the 1st of each month at 10:00 UTC.
 * Processes all pending architect commissions:
 *  - If architect has Stripe Connect onboarding complete → transfer immediately, mark paid
 *  - If not → batch into architectPayouts for manual review, leave commissions pending
 */

import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
    architects,
    architectCommissions,
    architectPayouts,
} from "@/lib/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { stripe } from "@/lib/services/stripe";
import { sendCommissionEarned } from "@/lib/email/resend";
import { verifyCronRequest } from "@/lib/middleware/cron-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
    const authError = verifyCronRequest(req);
    if (authError) return authError;

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1); // first of last month
    const periodEnd = new Date(now.getFullYear(), now.getMonth(), 1);       // first of this month

    // Fetch all pending commissions with their architect
    const pending = await db.query.architectCommissions.findMany({
        where: eq(architectCommissions.status, "pending"),
        with: {
            architect: true,
        },
        limit: 200,
    });

    if (pending.length === 0) {
        return NextResponse.json({ processed: 0, message: "No pending commissions" });
    }

    // Group by architect
    const byArchitect = new Map<string, typeof pending>();
    for (const commission of pending) {
        const list = byArchitect.get(commission.architectId) ?? [];
        list.push(commission);
        byArchitect.set(commission.architectId, list);
    }

    let transferred = 0;
    let batched = 0;
    const errors: string[] = [];

    for (const [architectId, commissions] of byArchitect) {
        const architect = commissions[0].architect;
        if (!architect) continue;

        const total = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);
        const commissionIds = commissions.map((c) => c.id);

        if (architect.stripeOnboardingComplete && architect.stripeConnectAccountId) {
            // Transfer now via Stripe
            try {
                // Idempotency: atomically claim commissions to prevent double-payout on concurrent runs
                const claimed = await db.update(architectCommissions)
                    .set({ status: "processing" })
                    .where(and(
                        inArray(architectCommissions.id, commissionIds),
                        eq(architectCommissions.status, "pending"),
                    ))
                    .returning({ id: architectCommissions.id });

                if (claimed.length === 0) {
                    // Already claimed by another run
                    continue;
                }

                const transfer = await stripe.transfers.create({
                    amount: total,
                    currency: "usd",
                    destination: architect.stripeConnectAccountId,
                    metadata: {
                        architectId,
                        commissionIds: commissionIds.join(","),
                        period: `${periodStart.toISOString().slice(0, 7)}`,
                    },
                });

                // Mark commissions as paid
                await db.update(architectCommissions)
                    .set({ status: "paid", stripeTransferId: transfer.id, paidAt: now })
                    .where(inArray(architectCommissions.id, commissionIds));

                // Create payout record
                await db.insert(architectPayouts).values({
                    architectId,
                    amount: total,
                    stripePayoutId: transfer.id,
                    status: "paid",
                    periodStart,
                    periodEnd,
                });

                // Update lifetime earnings (atomic increment to prevent race conditions)
                await db.update(architects)
                    .set({ totalEarnings: sql`${architects.totalEarnings} + ${total}` })
                    .where(eq(architects.id, architectId));

                // Email the architect
                sendCommissionEarned(
                    architect.email,
                    architect.firstName,
                    "",
                    total,
                    architect.totalEarnings + total,
                ).catch((err: unknown) => {
                    console.warn("[architect-payouts] Failed to send commission email:", err);
                });

                transferred++;
            } catch (err) {
                Sentry.captureException(err);
                console.error(`[architect-payouts] Transfer failed for architect ${architectId}:`, err);
                // Revert claimed commissions back to pending on failure
                await db.update(architectCommissions)
                    .set({ status: "pending" })
                    .where(inArray(architectCommissions.id, commissionIds))
                    .catch(() => {});
                errors.push(`Transfer failed for architect ${architectId.slice(0, 8)}…`);
            }
        } else {
            // No Stripe Connect — create a pending payout batch for manual review
            try {
                // Upsert: one payout record per architect per period
                await db.insert(architectPayouts).values({
                    architectId,
                    amount: total,
                    status: "pending",
                    periodStart,
                    periodEnd,
                }).onConflictDoNothing();

                batched++;
            } catch (err) {
                Sentry.captureException(err);
                console.error(`[architect-payouts] Batch failed for architect ${architectId}:`, err);
                errors.push(`Batch failed for architect ${architectId.slice(0, 8)}…`);
            }
        }
    }

    return NextResponse.json({
        processed: byArchitect.size,
        transferred,
        batched,
        errors: errors.length > 0 ? errors : undefined,
    });
}
