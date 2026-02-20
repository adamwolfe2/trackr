import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey && process.env.NEXT_PHASE !== "phase-production-build") {
    console.warn("STRIPE_SECRET_KEY is not set — Stripe operations will fail at runtime");
}

export const stripe = new Stripe(stripeKey || "sk_placeholder_build_only", {
    typescript: true,
});
