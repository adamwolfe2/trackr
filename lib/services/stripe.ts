import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

if (!stripeKey && !isBuildPhase) {
    console.error("CRITICAL: STRIPE_SECRET_KEY is not set — all payment operations will fail");
}

// During build, use a placeholder so the module resolves. At runtime, guard every call.
export const stripe = new Stripe(stripeKey || "sk_placeholder_build_only", {
    typescript: true,
});

/**
 * Runtime guard: call before any Stripe API operation to fail fast
 * with a clear error instead of a cryptic 401 from Stripe.
 */
export function assertStripeConfigured(): void {
    if (!stripeKey && !isBuildPhase) {
        throw new Error("Stripe is not configured: STRIPE_SECRET_KEY environment variable is missing");
    }
}
