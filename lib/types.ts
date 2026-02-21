// Shared types for Trackr's curated AI Tool Library

export type ScorecardDimension = {
    score: number; // 0–10
    justification: string;
};

export type Scorecard = {
    coreCapability: ScorecardDimension;
    easeOfUse: ScorecardDimension;
    integrationDepth: ScorecardDimension;
    pricingValue: ScorecardDimension;
    aiSophistication: ScorecardDimension;
    communitySupport: ScorecardDimension;
    scalability: ScorecardDimension;
};

export const SCORECARD_DIMENSION_LABELS: Record<keyof Scorecard, string> = {
    coreCapability: "Core Capability",
    easeOfUse: "Ease of Use",
    integrationDepth: "Integrations",
    pricingValue: "Pricing Value",
    aiSophistication: "AI Sophistication",
    communitySupport: "Community & Support",
    scalability: "Scalability",
};

export type ToolType = "freemium" | "paid" | "free" | "open-source" | "enterprise";
export type ToolTier = "essential" | "power" | "enterprise" | "emerging";
export type ToolSignal = "ProductHunt" | "YC" | "Viral" | "Agents" | "RAG" | "Funded" | "OpenSource" | "EnterpriseReady" | "Fast-growing";

export type PricingTier = {
    tier: string;
    price: string;
};

export type CuratedTool = {
    id: string;
    slug: string; // URL slug — prefixed with "lib-" to distinguish from DB slugs
    name: string;
    domain: string; // for favicon: https://www.google.com/s2/favicons?domain=X&sz=32
    tagline: string;
    description: string;
    category: string; // primary category
    tags: string[]; // all searchable tags/categories
    type: ToolType;
    tier: ToolTier;
    signals: ToolSignal[];
    integrations: string[]; // key integration domains for favicons
    scorecard: Scorecard;
    overallScore: number; // pre-computed average
    pros: string[];
    cons: string[];
    bestFor: string[]; // ideal use cases
    pairsWith: string[]; // complementary tool slugs
    replaces: string[]; // tools it commonly replaces
    pricing: PricingTier[];
    competitors: string[]; // competitor domains
    founded?: string;
    funding?: string;
    employees?: string;
    hq?: string;
};

export type TemplateType = "playbook" | "template" | "guide" | "framework";

export type Template = {
    id: string;
    slug: string;
    name: string;
    type: TemplateType; // playbook, template, guide, or framework
    tagline: string;
    description: string;
    category: string;
    useCase: string;
    recommendedTools: string[]; // tool slugs (lib-*)
    steps: string[];
    tags: string[];
    estimatedSetup: string; // e.g. "2–4 hours"
    outcome: string; // what you get
    date?: string; // publication date e.g. "2026-02-20"
    reference?: string; // reference slug for linking
};
