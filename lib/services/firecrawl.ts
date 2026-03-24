import { cachedFetch, buildCacheKey } from "@/lib/services/research-cache";
import { createHash } from "crypto";

/** Hash a URL into a short, stable key for Redis. */
function urlHash(url: string): string {
    return createHash("sha256").update(url).digest("hex").slice(0, 16);
}

const CACHE_TTL = 86400; // 24 hours

export interface ScrapeData {
    markdown?: string;
    html?: string;
    content?: string;
    metadata?: Record<string, string | undefined>;
    [key: string]: unknown;
}

export interface ScrapeResult {
    success: boolean;
    data?: ScrapeData;
    error?: string;
}

export interface MapResult {
    success: boolean;
    data?: string[];
    error?: string;
}

export interface CrawlResult {
    success: boolean;
    jobId?: string;
    data?: ScrapeData[];
    error?: string;
}

export interface MapOptions {
    limit?: number;
    includeSubdomains?: boolean;
    search?: string;
    ignoreSitemap?: boolean;
}

export class FirecrawlService {
    private apiKey: string;
    private baseUrl = "https://api.firecrawl.dev/v1";

    constructor() {
        this.apiKey = process.env.FIRECRAWL_API_KEY || "";
    }

    /**
     * Scrape a single URL to get markdown, metadata, etc.
     * Results are cached in Redis for 24h to avoid redundant API calls.
     * Retries once on transient failures (timeout, 5xx, network error).
     */
    async scrapeUrl(url: string): Promise<ScrapeResult> {
        if (!this.apiKey) {
            return { success: false, error: "FIRECRAWL_API_KEY is not configured" };
        }

        const cacheKey = buildCacheKey("firecrawl:scrape", urlHash(url));

        return cachedFetch<ScrapeResult>(cacheKey, CACHE_TTL, async () => {
            const result = await this._scrapeOnce(url);
            // Retry once on transient failures
            if (!result.success && this._isRetryable(result.error)) {
                await new Promise((r) => setTimeout(r, 2000));
                return this._scrapeOnce(url);
            }
            return result;
        });
    }

    private _isRetryable(error?: string): boolean {
        if (!error) return false;
        return error.includes("timed out") ||
            error.includes("500") || error.includes("502") ||
            error.includes("503") || error.includes("504") ||
            error.includes("ECONNRESET") || error.includes("fetch failed");
    }

    private async _scrapeOnce(url: string): Promise<ScrapeResult> {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30_000);

        try {
            const response = await fetch(`${this.baseUrl}/scrape`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    url,
                    formats: ["markdown"],
                    onlyMainContent: true
                }),
                signal: controller.signal,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Firecrawl API error: ${response.status} ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            return { success: true, data: data.data } as ScrapeResult;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            if (message.includes("aborted") || message.includes("abort")) {
                return { success: false, error: "Firecrawl scrape timed out" } as ScrapeResult;
            }
            return { success: false, error: message } as ScrapeResult;
        } finally {
            clearTimeout(timeout);
        }
    }

    /**
     * Crawl a website to find subpages (e.g. documentation, pricing)
     * Optimized to exclude irrelevant paths and limit depth via search query or limit.
     * Results are cached in Redis for 24h.
     */
    async mapSite(url: string, options: MapOptions = {}): Promise<MapResult> {
        if (!this.apiKey) return { success: false, error: "No API Key" };

        const { limit = 50, includeSubdomains = false, search, ignoreSitemap = true } = options;
        const cacheKey = buildCacheKey("firecrawl:map", urlHash(url));

        return cachedFetch<MapResult>(cacheKey, CACHE_TTL, async () => {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30_000);

            try {
                const response = await fetch(`${this.baseUrl}/map`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.apiKey}`
                    },
                    body: JSON.stringify({
                        url,
                        limit,
                        includeSubdomains,
                        search,
                        ignoreSitemap
                    }),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Map failed: ${response.status} ${errorText}`);
                }

                const data = await response.json();
                const links: string[] = data.links ?? data.data ?? [];
                return { success: true, data: links } as MapResult;
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "Unknown error";
                if (message.includes("aborted") || message.includes("abort")) {
                    return { success: false, error: "Firecrawl map timed out" } as MapResult;
                }
                return { success: false, error: message } as MapResult;
            } finally {
                clearTimeout(timeout);
            }
        });
    }

}

export const firecrawl = new FirecrawlService();
