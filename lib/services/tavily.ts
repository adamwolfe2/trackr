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
            return { answer: "", results: [] };
        }

        try {
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
            });

            if (!response.ok) {
                console.error("Tavily search failed:", response.status, await response.text());
                return { answer: "", results: [] };
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
        } catch (error) {
            console.error("Tavily search error:", error);
            return { answer: "", results: [] };
        }
    }
}

export const tavily = new TavilyService();
