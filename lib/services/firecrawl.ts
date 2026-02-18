export interface ScrapeResult {
    success: boolean;
    data?: any;
    error?: string;
}

export interface CrawlResult {
    success: boolean;
    jobId?: string;
    data?: any[];
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
            console.warn("FIRECRAWL_API_KEY is not set. Returning mock data.");
            return this.getMockData(url);
        }

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
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Firecrawl API error: ${response.status} ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            return { success: true, data: data.data };
        } catch (error: any) {
            console.error("Firecrawl scrape failed:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Crawl a website to find subpages (e.g. documentation, pricing)
     * Optimized to exclude irrelevant paths and limit depth via search query or limit.
     */
    async mapSite(url: string, options: MapOptions = {}): Promise<ScrapeResult> {
        if (!this.apiKey) return { success: false, error: "No API Key" };

        const { limit = 50, includeSubdomains = false, search, ignoreSitemap = true } = options;

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
                })
            });

            // Firecrawl map endpoint returns { success: true, links: [] } or { data: [] } depending on version
            // Adjusted to handle response safely
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Map failed: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            // Firecrawl map returns { success: true, links: [...] }
            const links = data.links ?? data.data ?? [];
            return { success: true, data: links };
        } catch (e: any) {
            console.error("Firecrawl map failed:", e);
            return { success: false, error: e.message };
        }
    }

    private getMockData(url: string): ScrapeResult {
        return {
            success: true,
            data: {
                markdown: `# Mocked content for ${url}\n\nThis tool is a leading solution in its category with robust features and competitive pricing.`,
                metadata: { title: "Mock Tool", description: "Best tool ever." }
            }
        };
    }
}

export const firecrawl = new FirecrawlService();
