/**
 * GET /api/architect/stripe-connect/callback
 *
 * Return URL after Stripe Connect onboarding.
 * Checks account status and updates architect record.
 */

import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { architects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/services/stripe";

export async function GET() {
    const user = await currentUser();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://trytrackr.com";

    if (!user) {
        return NextResponse.redirect(new URL("/sign-in", appUrl));
    }

    const architect = await db.query.architects.findFirst({
        where: eq(architects.userId, user.id),
    });

    if (!architect?.stripeConnectAccountId) {
        return NextResponse.redirect(new URL("/architect/settings", appUrl));
    }

    // Check account status
    const account = await stripe.accounts.retrieve(architect.stripeConnectAccountId);

    if (account.charges_enabled) {
        await db
            .update(architects)
            .set({ stripeOnboardingComplete: true })
            .where(eq(architects.id, architect.id));
    }

    return NextResponse.redirect(new URL("/architect/dashboard", appUrl));
}
