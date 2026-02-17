export interface ScrapeResult {
    success: boolean;
    data?: any;
    error?: string;
}

export class FirecrawlService {
    private apiKey: string;
    private baseUrl = "https://api.firecrawl.dev/v0";

    constructor() {
        this.apiKey = process.env.FIRECRAWL_API_KEY || "";
    }

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
                body: JSON.stringify({ url, pageOptions: { onlyMainContent: true } })
            });

            if (!response.ok) {
                throw new Error(`Firecrawl API error: ${response.statusText}`);
            }

            const data = await response.json();
            return { success: true, data: data.data };
        } catch (error: any) {
            console.error("Firecrawl scrape failed:", error);
            return { success: false, error: error.message };
        }
    }

    private getMockData(url: string): ScrapeResult {
        return {
            success: true,
            data: {
                content: `Mocked content for ${url}. This tool is a leading solution in its category with robust features and competitive pricing.`,
                metadata: { title: "Mock Tool", description: "Best tool ever." }
            }
        };
    }
}

export const firecrawl = new FirecrawlService();
