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
    annualPrice: number; // annual price (total per year)
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
        annualPrice: 0,
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
        annualPrice: 480,
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
        annualPrice: 1430,
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
        annualPrice: 3350,
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

export type BillingInterval = "monthly" | "annual";

export const PAYMENT_LINKS: Record<Exclude<PlanSlug, "free">, Record<BillingInterval, string>> = {
    team: {
        monthly: "https://buy.stripe.com/5kQ7sLc081zoabHe99bjW00",
        annual: "https://buy.stripe.com/5kQ4gzggo0vkOB7e99bjW01",
    },
    startup: {
        monthly: "https://buy.stripe.com/bJe4gz2pydi6abHfddbjW02",
        annual: "https://buy.stripe.com/28EcN51lufqeabH6GHbjW03",
    },
    enterprise: {
        monthly: "https://buy.stripe.com/5kQ8wP5BKlzo4Rn0ijbjW04",
        annual: "https://buy.stripe.com/28E3cve8g2Ds5Vr4yzbjW05",
    },
};

function getEnvPriceIds(plan: Exclude<PlanSlug, "free">): string[] {
    const ids: string[] = [];
    const prefix = `STRIPE_${plan.toUpperCase()}`;
    const monthly = process.env[`${prefix}_MONTHLY_PRICE_ID`];
    const annual = process.env[`${prefix}_ANNUAL_PRICE_ID`];
    if (monthly) ids.push(monthly);
    if (annual) ids.push(annual);
    return ids;
}

export function getPlanLimits(subscription?: { status: string; planId?: string | null }): Plan {
    if (subscription?.status === 'active' || subscription?.status === 'trialing') {
        // Slug-based overrides (for manually-granted or internal accounts)
        if (subscription.planId === 'enterprise') return PLANS.ENTERPRISE;
        if (subscription.planId === 'startup') return PLANS.STARTUP;
        if (subscription.planId === 'team') return PLANS.TEAM;

        if (subscription.planId) {
            if (getEnvPriceIds('enterprise').includes(subscription.planId)) return PLANS.ENTERPRISE;
            if (getEnvPriceIds('startup').includes(subscription.planId)) return PLANS.STARTUP;
            if (getEnvPriceIds('team').includes(subscription.planId)) return PLANS.TEAM;
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
