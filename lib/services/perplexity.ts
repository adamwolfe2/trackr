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
