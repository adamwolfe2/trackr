import { OpenAI } from "openai";
import { cachedFetch, buildCacheKey } from "@/lib/services/research-cache";

const CACHE_TTL_SEC = 60 * 60; // 1 hour

async function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

/** Internal timeout for individual Perplexity API calls */
const PERPLEXITY_CALL_TIMEOUT_MS = 45_000;

async function withRetry<T>(
    fn: () => Promise<T>,
    maxAttempts = 3,
    baseDelayMs = 1000
): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            return await Promise.race([
                fn(),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error("Perplexity call timed out")), PERPLEXITY_CALL_TIMEOUT_MS)
                ),
            ]);
        } catch (err) {
            lastError = err;
            // Detect rate limiting by status code or message
            const isRateLimit = err instanceof Error && (
                err.message.includes("429") ||
                err.message.includes("rate limit") ||
                (err as { status?: number }).status === 429
            );
            const delay = isRateLimit
                ? Math.pow(2, attempt) * 5000 // 5s, 10s, 20s for rate limits
                : Math.pow(2, attempt) * baseDelayMs; // 1s, 2s, 4s for other errors
            if (attempt < maxAttempts - 1) await sleep(delay);
        }
    }
    throw lastError;
}

export class PerplexityService {
    private client: OpenAI | null = null;

    constructor() {
        const apiKey = process.env.PERPLEXITY_API_KEY;
        if (apiKey) {
            this.client = new OpenAI({
                apiKey: apiKey,
                baseURL: "https://api.perplexity.ai",
            });
        }
    }

    async search(query: string, model = "sonar"): Promise<string> {
        if (!this.client) {
            return "";
        }

        const cacheKey = buildCacheKey("perplexity", model, query);

        return cachedFetch(cacheKey, CACHE_TTL_SEC, async () => {
            try {
                return await withRetry(async () => {
                    const response = await this.client!.chat.completions.create({
                        model,
                        messages: [
                            { role: "system", content: "You are a helpful research assistant. Find facts, reviews, and sentiment." },
                            { role: "user", content: query },
                        ],
                    });
                    return response.choices[0].message.content || "";
                });
            } catch (error) {
                console.error("Perplexity search failed after retries:", error);
                return "";
            }
        });
    }

    async deepResearch(query: string): Promise<string> {
        return this.search(query, "sonar-deep-research");
    }

    async analyzeSentiment(entity: string): Promise<string> {
        if (!this.client) {
            return JSON.stringify({
                sentiment: "neutral",
                quotes: ["Mock quote 1: Great tool!", "Mock quote 2: Too expensive."],
            });
        }

        const cacheKey = buildCacheKey("perplexity", "sentiment", entity);

        return cachedFetch(cacheKey, CACHE_TTL_SEC, async () => {
            try {
                return await withRetry(async () => {
                    const response = await this.client!.chat.completions.create({
                        model: "sonar-reasoning-pro",
                        messages: [
                            {
                                role: "system",
                                content: `You are an expert sentiment analyst. Your goal is to find authentic user reviews and extracting specific, direct quotes.

                        Output a JSON object with:
                        - "summary": A brief summary of user sentiment.
                        - "sentiment": "positive", "neutral", or "negative".
                        - "quotes": An array of objects { "text": "...", "source": "..." } containing real user quotes.
                        `,
                            },
                            { role: "user", content: `Analyze the sentiment for "${entity}". Find 3-5 specific, direct quotes from users on Reddit, G2, or Capterra.` },
                        ],
                    });
                    return response.choices[0].message.content || "";
                });
            } catch (error) {
                console.error("Perplexity sentiment analysis failed:", error);
                return "";
            }
        });
    }

    async discoverTools(painPoint: string): Promise<string> {
        if (!this.client) {
            return this.getMockSuggestions(painPoint);
        }

        const cacheKey = buildCacheKey("perplexity", "discover", painPoint);

        return cachedFetch(cacheKey, CACHE_TTL_SEC, async () => {
            try {
                return await withRetry(async () => {
                    const response = await this.client!.chat.completions.create({
                        model: "sonar-reasoning-pro",
                        messages: [
                            { role: "system", content: "You are an expert software procurement assistant. specialized in finding the best B2B SaaS tools." },
                            { role: "user", content: `Find 3-5 software tools that solve this pain point: "${painPoint}". Return a JSON list with name, url, and short description.` },
                        ],
                    });
                    return response.choices[0].message.content || "";
                });
            } catch (error) {
                console.error("Perplexity discovery failed:", error);
                return this.getMockSuggestions(painPoint);
            }
        });
    }

    private getMockSuggestions(painPoint: string): string {
        return JSON.stringify([
            { name: "Mock Tool A", url: "https://example.com/a", description: `Solves ${painPoint} efficiently.` },
            { name: "Mock Tool B", url: "https://example.com/b", description: `Alternative for ${painPoint}.` },
        ]);
    }
}

export const perplexity = new PerplexityService();
