// Enrichment provider types for future curated tool data enhancement

export type EnrichmentSource = "perplexity" | "grok";

export type EnrichmentResult = {
    source: EnrichmentSource;
    toolDomain: string;
    fetchedAt: Date;
    citations?: string[];
    trendSignals?: string[];
    recentNews?: string[];
    userSentiment?: string;
    competitorMentions?: string[];
    raw: string;
};

export type EnrichmentProvider = {
    name: EnrichmentSource;
    enrich(toolDomain: string, toolName: string): Promise<EnrichmentResult>;
    isConfigured(): boolean;
};
