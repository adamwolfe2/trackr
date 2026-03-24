import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

// STRIPE_SECRET_KEY is validated at runtime via assertStripeConfigured()

// During build, use an empty string so the module resolves. At runtime, guard every call.
export const stripe = new Stripe(stripeKey || "", {
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
