// Enrichment orchestrator — runs configured providers and merges results
// Future: schedule periodic enrichment for curated tools, write back to tools.seed.ts

export { perplexityEnrichmentProvider } from "./perplexity";
export { grokEnrichmentProvider } from "./grok";
export type { EnrichmentProvider, EnrichmentResult, EnrichmentSource } from "./types";

import { perplexityEnrichmentProvider } from "./perplexity";
import { grokEnrichmentProvider } from "./grok";
import type { EnrichmentResult } from "./types";

/**
 * Enrich a single curated tool using all configured providers.
 * Safe to call — skips providers that aren't configured.
 */
export async function enrichTool(
    toolDomain: string,
    toolName: string
): Promise<EnrichmentResult[]> {
    const providers = [
        perplexityEnrichmentProvider,
        grokEnrichmentProvider,
    ].filter((p) => p.isConfigured());

    if (providers.length === 0) {
        console.warn("[enrichment] No providers configured. Set PERPLEXITY_API_KEY or XAI_API_KEY.");
        return [];
    }

    const results = await Promise.allSettled(
        providers.map((p) => p.enrich(toolDomain, toolName))
    );

    return results
        .filter((r): r is PromiseFulfilledResult<EnrichmentResult> => r.status === "fulfilled")
        .map((r) => r.value);
}
