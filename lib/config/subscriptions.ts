export type PlanSlug = "free" | "team" | "startup" | "enterprise";

export type ResearchDepth = "quick" | "full";

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
    scheduledResearch: boolean;
    apiAccess: boolean;
    // Enterprise features
    stackHealth: boolean | "limited"; // "limited" = score only (no breakdown/recs)
    boardReports: boolean;
    competitorIntel: boolean;
    contracts: boolean;
    procurement: boolean;
    calendar: boolean;
    customWeights: boolean | "limited"; // "limited" = weights only, no custom dims
    decisionLog: boolean;
    riskMonitor: boolean;
    integrations: boolean;
    teamLiteracy: boolean;
    publicProfile: boolean;
    embedWidget: boolean;
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
        competitors: number;
    };
    extraCreditPrice: number | null; // price per additional credit, null = can't buy
    features: PlanFeatures;
    defaultResearchDepth: ResearchDepth;
};

export const PLANS: Record<"FREE" | "TEAM" | "STARTUP" | "ENTERPRISE", Plan> = {
    FREE: {
        name: "Free",
        slug: "free",
        price: 0,
        annualPrice: 0,
        limits: {
            tools: 15,
            research: 5,
            members: 1,
            competitors: 0,
        },
        extraCreditPrice: null,
        defaultResearchDepth: "quick",
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
            scheduledResearch: false,
            apiAccess: false,
            stackHealth: "limited",
            boardReports: false,
            competitorIntel: false,
            contracts: false,
            procurement: false,
            calendar: false,
            customWeights: false,
            decisionLog: false,
            riskMonitor: false,
            integrations: false,
            teamLiteracy: false,
            publicProfile: false,
            embedWidget: false,
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
            competitors: 0,
        },
        extraCreditPrice: 1.50,
        defaultResearchDepth: "full",
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
            scheduledResearch: true,
            apiAccess: false,
            stackHealth: "limited",
            boardReports: false,
            competitorIntel: false,
            contracts: false,
            procurement: true,
            calendar: true,
            customWeights: false,
            decisionLog: true,
            riskMonitor: false,
            integrations: false,
            teamLiteracy: false,
            publicProfile: true,
            embedWidget: false,
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
            competitors: 5,
        },
        extraCreditPrice: 1.00,
        defaultResearchDepth: "full",
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
            scheduledResearch: true,
            apiAccess: false,
            stackHealth: true,
            boardReports: true,
            competitorIntel: true,
            contracts: true,
            procurement: true,
            calendar: true,
            customWeights: "limited",
            decisionLog: true,
            riskMonitor: true,
            integrations: true,
            teamLiteracy: true,
            publicProfile: true,
            embedWidget: true,
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
            competitors: Infinity,
        },
        extraCreditPrice: 0.75,
        defaultResearchDepth: "full",
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
            scheduledResearch: true,
            apiAccess: true,
            stackHealth: true,
            boardReports: true,
            competitorIntel: true,
            contracts: true,
            procurement: true,
            calendar: true,
            customWeights: true,
            decisionLog: true,
            riskMonitor: true,
            integrations: true,
            teamLiteracy: true,
            publicProfile: true,
            embedWidget: true,
        },
    },
};

export const CREDIT_PACKS = [
    { credits: 25, label: "25 credits" },
    { credits: 50, label: "50 credits" },
    { credits: 100, label: "100 credits" },
] as const;

export type CreditPackSize = typeof CREDIT_PACKS[number]["credits"];

export const CREDIT_PACK_PRICES: Record<string, Record<number, number>> = {
    free:       { 25: 1000, 50: 1500, 100: 2000 },
    team:       { 25: 1000, 50: 1500, 100: 2000 },
    startup:    { 25: 800,  50: 1200, 100: 1600 },
    enterprise: { 25: 600,  50: 900,  100: 1200 },
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

export function getPlanLimits(subscription?: { status: string; planId?: string | null; currentPeriodEnd?: Date | null }): Plan {
    if (subscription?.status === 'active' || subscription?.status === 'trialing') {
        // Check if trial/subscription has expired
        if (subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) < new Date()) {
            return PLANS.FREE;
        }

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
