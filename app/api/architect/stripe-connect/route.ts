/**
 * GET /api/architect/stripe-connect
 *
 * Initiates Stripe Connect Express onboarding for an authenticated architect.
 * Creates a Connect account if needed, generates an onboarding link, and redirects.
 */

import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { architects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/services/stripe";

export async function GET() {
    const user = await currentUser();
    if (!user) {
        return NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL));
    }

    const architect = await db.query.architects.findFirst({
        where: eq(architects.userId, user.id),
    });

    if (!architect) {
        return NextResponse.redirect(new URL("/apply", process.env.NEXT_PUBLIC_APP_URL));
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://trytrackr.com";

    try {
        let accountId = architect.stripeConnectAccountId;

        // Create Stripe Connect Express account if not yet created
        if (!accountId) {
            const account = await stripe.accounts.create({
                type: "express",
                email: architect.email,
                metadata: {
                    architectId: architect.id,
                    arcCode: architect.arcCode,
                },
                capabilities: {
                    transfers: { requested: true },
                },
            });
            accountId = account.id;

            await db
                .update(architects)
                .set({ stripeConnectAccountId: accountId })
                .where(eq(architects.id, architect.id));
        }

        // Generate onboarding link
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${appUrl}/api/architect/stripe-connect`,
            return_url: `${appUrl}/api/architect/stripe-connect/callback`,
            type: "account_onboarding",
        });

        return NextResponse.redirect(accountLink.url);
    } catch {
        const errUrl = new URL("/architect/settings", appUrl);
        errUrl.searchParams.set("stripe_error", "connection_failed");
        return NextResponse.redirect(errUrl);
    }
}
