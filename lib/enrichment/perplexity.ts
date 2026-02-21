// Perplexity enrichment provider — fetches real-time citations, news, and sentiment

import type { EnrichmentProvider, EnrichmentResult } from "./types";

export const perplexityEnrichmentProvider: EnrichmentProvider = {
    name: "perplexity",

    isConfigured() {
        return !!process.env.PERPLEXITY_API_KEY;
    },

    async enrich(toolDomain: string, toolName: string): Promise<EnrichmentResult> {
        if (!this.isConfigured()) {
            throw new Error("PERPLEXITY_API_KEY is not set");
        }

        const prompt = `Research the AI tool "${toolName}" (${toolDomain}). Return:
1. 3-5 recent news items or product updates (last 6 months)
2. Key user sentiment themes from Reddit and HN
3. Main competitors mentioned in user discussions
4. Any notable funding, partnerships, or controversy

Be factual and cite sources. Format as structured text.`;

        const response = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "sonar",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            throw new Error(`Perplexity API error: ${response.status}`);
        }

        const data = await response.json() as {
            choices: { message: { content: string } }[];
            citations?: string[];
        };

        const raw = data.choices[0]?.message?.content ?? "";
        const citations = data.citations ?? [];

        return {
            source: "perplexity",
            toolDomain,
            fetchedAt: new Date(),
            citations,
            raw,
        };
    },
};
