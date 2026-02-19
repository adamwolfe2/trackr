export type PlanSlug = "free" | "team" | "startup" | "enterprise";

export type PlanFeatures = {
    askAI: boolean;
    analytics: boolean;
    scorecardRecipe: boolean;
    renewalAlerts: boolean;
    slackIntegration: boolean;
    chromeExtension: boolean;
    compareTools: boolean | "limited"; // "limited" = 2 tools max
    spendTracking: boolean;
    reportExport: boolean;
    apiAccess: boolean;
};

export type Plan = {
    name: string;
    slug: PlanSlug;
    price: number;
    limits: {
        tools: number;
        research: number;
        members: number;
    };
    extraCreditPrice: number | null; // price per additional credit, null = can't buy
    features: PlanFeatures;
};

export const PLANS: Record<"FREE" | "TEAM" | "STARTUP" | "ENTERPRISE", Plan> = {
    FREE: {
        name: "Free",
        slug: "free",
        price: 0,
        limits: {
            tools: 15,
            research: 3,
            members: 1,
        },
        extraCreditPrice: null,
        features: {
            askAI: false,
            analytics: false,
            scorecardRecipe: false,
            renewalAlerts: false,
            slackIntegration: false,
            chromeExtension: false,
            compareTools: "limited",
            spendTracking: false,
            reportExport: false,
            apiAccess: false,
        },
    },
    TEAM: {
        name: "Team",
        slug: "team",
        price: 50,
        limits: {
            tools: Infinity,
            research: 25,
            members: 5,
        },
        extraCreditPrice: 1.50,
        features: {
            askAI: false,
            analytics: false,
            scorecardRecipe: false,
            renewalAlerts: false,
            slackIntegration: true,
            chromeExtension: true,
            compareTools: true,
            spendTracking: true,
            reportExport: true,
            apiAccess: false,
        },
    },
    STARTUP: {
        name: "Startup",
        slug: "startup",
        price: 149,
        limits: {
            tools: Infinity,
            research: 75,
            members: 15,
        },
        extraCreditPrice: 1.00,
        features: {
            askAI: true,
            analytics: true,
            scorecardRecipe: true,
            renewalAlerts: true,
            slackIntegration: true,
            chromeExtension: true,
            compareTools: true,
            spendTracking: true,
            reportExport: true,
            apiAccess: false,
        },
    },
    ENTERPRISE: {
        name: "Enterprise",
        slug: "enterprise",
        price: 349,
        limits: {
            tools: Infinity,
            research: 200,
            members: Infinity,
        },
        extraCreditPrice: 0.75,
        features: {
            askAI: true,
            analytics: true,
            scorecardRecipe: true,
            renewalAlerts: true,
            slackIntegration: true,
            chromeExtension: true,
            compareTools: true,
            spendTracking: true,
            reportExport: true,
            apiAccess: true,
        },
    },
};

export function getPlanLimits(subscription?: { status: string; planId?: string | null }): Plan {
    if (subscription?.status === 'active' || subscription?.status === 'trialing') {
        // Slug-based overrides (for manually-granted or internal accounts)
        if (subscription.planId === 'enterprise') return PLANS.ENTERPRISE;
        if (subscription.planId === 'startup') return PLANS.STARTUP;
        if (subscription.planId === 'team') return PLANS.TEAM;

        const enterprisePriceId = process.env.STRIPE_ENTERPRISE_PRICE_ID;
        const startupPriceId = process.env.STRIPE_STARTUP_PRICE_ID;
        const teamPriceId = process.env.STRIPE_TEAM_PRICE_ID;

        if (subscription.planId && enterprisePriceId && subscription.planId === enterprisePriceId) {
            return PLANS.ENTERPRISE;
        }
        if (subscription.planId && startupPriceId && subscription.planId === startupPriceId) {
            return PLANS.STARTUP;
        }
        if (subscription.planId && teamPriceId && subscription.planId === teamPriceId) {
            return PLANS.TEAM;
        }
        // Active subscription but planId doesn't match known IDs — default to TEAM
        return PLANS.TEAM;
    }
    return PLANS.FREE;
}

/** Check if a specific feature is available on the current plan */
export function hasFeature(plan: Plan, feature: keyof PlanFeatures): boolean {
    const value = plan.features[feature];
    return value === true || value === "limited";
}
