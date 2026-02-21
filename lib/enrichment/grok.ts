// Grok/X enrichment provider — fetches trend signals and X community sentiment
// Uses xAI API (compatible with OpenAI SDK format)

import type { EnrichmentProvider, EnrichmentResult } from "./types";

export const grokEnrichmentProvider: EnrichmentProvider = {
    name: "grok",

    isConfigured() {
        return !!process.env.XAI_API_KEY;
    },

    async enrich(toolDomain: string, toolName: string): Promise<EnrichmentResult> {
        if (!this.isConfigured()) {
            throw new Error("XAI_API_KEY is not set");
        }

        const prompt = `What is the current X/Twitter community sentiment and trending discussion around the tool "${toolName}" (${toolDomain})?

Focus on:
1. What practitioners and builders are saying about it in the last 90 days
2. Any viral posts, threads, or debates
3. Common praise and criticism patterns
4. Emerging use cases being discussed

Be concise and factual.`;

        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.XAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "grok-2-latest",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 800,
            }),
        });

        if (!response.ok) {
            throw new Error(`xAI API error: ${response.status}`);
        }

        const data = await response.json() as {
            choices: { message: { content: string } }[];
        };

        const raw = data.choices[0]?.message?.content ?? "";

        return {
            source: "grok",
            toolDomain,
            fetchedAt: new Date(),
            trendSignals: [],
            raw,
        };
    },
};
