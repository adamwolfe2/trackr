import { OpenAI } from "openai";

export class PerplexityService {
    private client: OpenAI | null = null;

    constructor() {
        const apiKey = process.env.PERPLEXITY_API_KEY;
        if (apiKey) {
            this.client = new OpenAI({
                apiKey: apiKey,
                baseURL: "https://api.perplexity.ai"
            });
        }
    }

    async search(query: string, model: string = "sonar-reasoning-pro"): Promise<string> {
        if (!this.client) {
            console.warn("PERPLEXITY_API_KEY is not set. Returning mock search results.");
            return "Mock search result: No major red flags found. Users praise the ease of use but complain about pricing.";
        }

        try {
            const response = await this.client.chat.completions.create({
                model: model,
                messages: [
                    { role: "system", content: "You are a helpful research assistant. Find facts, reviews, and sentiment." },
                    { role: "user", content: query }
                ]
            });

            return response.choices[0].message.content || "";
        } catch (error) {
            console.error("Perplexity search failed:", error);
            return "";
        }
    }

    async deepResearch(query: string): Promise<string> {
        return this.search(query, "sonar-deep-research");
    }

    async analyzeSentiment(entity: string): Promise<string> {
        if (!this.client) {
            return JSON.stringify({
                sentiment: "neutral",
                quotes: ["Mock quote 1: Great tool!", "Mock quote 2: Too expensive."]
            });
        }

        try {
            const response = await this.client.chat.completions.create({
                model: "sonar-reasoning-pro",
                messages: [
                    {
                        role: "system",
                        content: `You are an expert sentiment analyst. Your goal is to find authentic user reviews and extracting specific, direct quotes.
                        
                        Output a JSON object with:
                        - "summary": A brief summary of user sentiment.
                        - "sentiment": "positive", "neutral", or "negative".
                        - "quotes": An array of objects { "text": "...", "source": "..." } containing real user quotes.
                        `
                    },
                    { role: "user", content: `Analyze the sentiment for "${entity}". Find 3-5 specific, direct quotes from users on Reddit, G2, or Capterra.` }
                ]
            });

            return response.choices[0].message.content || "";
        } catch (error) {
            console.error("Perplexity sentiment analysis failed:", error);
            return "";
        }
    }

    async discoverTools(painPoint: string): Promise<string> {
        if (!this.client) {
            console.warn("PERPLEXITY_API_KEY is not set. Returning mock suggestions.");
            return this.getMockSuggestions(painPoint);
        }

        try {
            const response = await this.client.chat.completions.create({
                model: "sonar-reasoning-pro", // or sonar-small-online
                messages: [
                    { role: "system", content: "You are an expert software procurement assistant. specialized in finding the best B2B SaaS tools." },
                    { role: "user", content: `Find 3-5 software tools that solve this pain point: "${painPoint}". Return a JSON list with name, url, and short description.` }
                ]
            });

            return response.choices[0].message.content || "";
        } catch (error) {
            console.error("Perplexity discovery failed:", error);
            return this.getMockSuggestions(painPoint);
        }
    }

    private getMockSuggestions(painPoint: string): string {
        return JSON.stringify([
            { name: "Mock Tool A", url: "https://example.com/a", description: `Solves ${painPoint} efficiently.` },
            { name: "Mock Tool B", url: "https://example.com/b", description: `Alternative for ${painPoint}.` }
        ]);
    }
}

export const perplexity = new PerplexityService();
