export const PLANS = {
    FREE: {
        name: "Free",
        slug: "free",
        price: 0,
        limits: {
            tools: 25,
            research: 5,
            members: 1,
            deepResearch: true,
        }
    },
    TEAM: {
        name: "Team",
        slug: "team",
        price: 29,
        limits: {
            tools: Infinity,
            research: 50,
            members: 10,
            deepResearch: true,
        }
    },
    AGENCY: {
        name: "Agency",
        slug: "agency",
        price: 99,
        limits: {
            tools: Infinity,
            research: Infinity,
            members: Infinity,
            deepResearch: true,
        }
    },
};

export function getPlanLimits(subscription?: { status: string; planId?: string | null }) {
    if (subscription?.status === 'active' || subscription?.status === 'trialing') {
        const agencyPriceId = process.env.STRIPE_AGENCY_PRICE_ID;
        if (subscription.planId && agencyPriceId && subscription.planId === agencyPriceId) {
            return PLANS.AGENCY;
        }
        return PLANS.TEAM;
    }
    return PLANS.FREE;
}
