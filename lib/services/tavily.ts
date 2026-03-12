import { createHash } from "crypto";
import { cachedFetch, buildCacheKey } from "@/lib/services/research-cache";

export interface TavilyResult {
    title: string;
    url: string;
    content: string;
    score: number;
}

export interface TavilySearchResponse {
    answer: string;
    results: TavilyResult[];
}

/** Default timeout for Tavily API calls (30 seconds) */
const TAVILY_TIMEOUT_MS = 30_000;

/** Max retry attempts for transient failures */
const MAX_RETRIES = 3;

const EMPTY_RESPONSE: TavilySearchResponse = { answer: "", results: [] };

async function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

export class TavilyService {
    private apiKey: string;
    private baseUrl = "https://api.tavily.com";

    constructor() {
        this.apiKey = process.env.TAVILY_API_KEY || "";
    }

    async search(
        query: string,
        options: {
            searchDepth?: "basic" | "advanced";
            maxResults?: number;
            includeDomains?: string[];
            includeAnswer?: boolean;
        } = {}
    ): Promise<TavilySearchResponse> {
        if (!this.apiKey) {
            console.warn("TAVILY_API_KEY not set. Returning empty results.");
            return EMPTY_RESPONSE;
        }

        const queryHash = createHash("sha256")
            .update(query + JSON.stringify(options))
            .digest("hex")
            .slice(0, 16);
        const cacheKey = buildCacheKey("tavily", queryHash);

        return cachedFetch(cacheKey, 6 * 3600, async () => {
            const result = await this._doSearchWithRetry(query, options);
            // Don't cache empty results — they may be transient failures.
            // cachedFetch stores the return value; throwing skips the cache SET.
            if (result.results.length === 0 && !result.answer) {
                throw Object.assign(new Error("Tavily returned empty results — skipping cache"), { _emptyResult: true });
            }
            return result;
        }).catch((err) => {
            // If the "skip cache" throw propagates, return empty results without caching
            if (err && (err as { _emptyResult?: boolean })._emptyResult) return EMPTY_RESPONSE;
            return EMPTY_RESPONSE;
        });
    }

    private async _doSearchWithRetry(
        query: string,
        options: {
            searchDepth?: "basic" | "advanced";
            maxResults?: number;
            includeDomains?: string[];
            includeAnswer?: boolean;
        }
    ): Promise<TavilySearchResponse> {
        let lastError: unknown;

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                return await this._doSearch(query, options);
            } catch (err) {
                lastError = err;
                // Check for rate limiting (429)
                const isRateLimit = err instanceof Error && (
                    err.message.includes("429") || err.message.includes("rate limit")
                );
                const delay = isRateLimit
                    ? Math.pow(2, attempt) * 5000  // 5s, 10s, 20s for rate limits
                    : Math.pow(2, attempt) * 1000;  // 1s, 2s, 4s for other errors

                if (attempt < MAX_RETRIES - 1) {
                    await sleep(delay);
                }
            }
        }

        console.error("Tavily search failed after retries:", lastError);
        return EMPTY_RESPONSE;
    }

    private async _doSearch(
        query: string,
        options: {
            searchDepth?: "basic" | "advanced";
            maxResults?: number;
            includeDomains?: string[];
            includeAnswer?: boolean;
        }
    ): Promise<TavilySearchResponse> {
        const body: Record<string, unknown> = {
            api_key: this.apiKey,
            query,
            search_depth: options.searchDepth ?? "advanced",
            max_results: options.maxResults ?? 8,
            include_answer: options.includeAnswer ?? true,
            include_raw_content: false,
        };

        if (options.includeDomains?.length) {
            body.include_domains = options.includeDomains;
        }

        const response = await fetch(`${this.baseUrl}/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(TAVILY_TIMEOUT_MS),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            throw new Error(`Tavily search failed: ${response.status} ${errorText.slice(0, 200)}`);
        }

        const data = await response.json();
        return {
            answer: data.answer ?? "",
            results: (data.results ?? []).map((r: Record<string, unknown>) => ({
                title: (r.title as string) ?? "",
                url: (r.url as string) ?? "",
                content: (r.content as string) ?? "",
                score: (r.score as number) ?? 0,
            })),
        };
    }
}

export const tavily = new TavilyService();
