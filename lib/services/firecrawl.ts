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
     */
    async scrapeUrl(url: string): Promise<ScrapeResult> {
        if (!this.apiKey) {
            console.error("FIRECRAWL_API_KEY is not configured — cannot scrape URL");
            return { success: false, error: "FIRECRAWL_API_KEY is not configured" };
        }

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
                    formats: ["markdown", "html"],
                    onlyMainContent: true
                }),
                signal: controller.signal,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Firecrawl API error: ${response.status} ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            return { success: true, data: data.data };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            if (message.includes("aborted") || message.includes("abort")) {
                console.error(`Firecrawl scrape timed out after 30s for: ${url}`);
                return { success: false, error: "Firecrawl scrape timed out" };
            }
            console.error("Firecrawl scrape failed:", error);
            return { success: false, error: message };
        } finally {
            clearTimeout(timeout);
        }
    }

    /**
     * Crawl a website to find subpages (e.g. documentation, pricing)
     * Optimized to exclude irrelevant paths and limit depth via search query or limit.
     */
    async mapSite(url: string, options: MapOptions = {}): Promise<MapResult> {
        if (!this.apiKey) return { success: false, error: "No API Key" };

        const { limit = 50, includeSubdomains = false, search, ignoreSitemap = true } = options;

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

            // Firecrawl map endpoint returns { success: true, links: [] } or { data: [] } depending on version
            // Adjusted to handle response safely
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Map failed: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            // Firecrawl map returns { success: true, links: [...] }
            const links: string[] = data.links ?? data.data ?? [];
            return { success: true, data: links };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            if (message.includes("aborted") || message.includes("abort")) {
                console.error(`Firecrawl map timed out after 30s for: ${url}`);
                return { success: false, error: "Firecrawl map timed out" };
            }
            console.error("Firecrawl map failed:", error);
            return { success: false, error: message };
        } finally {
            clearTimeout(timeout);
        }
    }

}

export const firecrawl = new FirecrawlService();
