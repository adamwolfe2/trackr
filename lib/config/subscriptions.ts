// import { Subscription } from "@/lib/db/schema";

export const PLANS = {
    FREE: {
        name: "Free",
        slug: "free",
        limits: {
            tools: 5,
            research: 0, // Deep research per month? Or boolean?
            deepResearch: false,
        }
    },
    PRO: {
        name: "Pro",
        slug: "pro",
        limits: {
            tools: Infinity,
            research: Infinity,
            deepResearch: true,
        }
    }
};

export function getPlanLimits(subscription?: { status: string }) {
    if (subscription?.status === 'active' || subscription?.status === 'trialing') {
        return PLANS.PRO;
    }
    return PLANS.FREE;
}
