import { OpenAI } from "openai";

export class OpenAIService {
    private client: OpenAI | null = null;

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (apiKey) {
            this.client = new OpenAI({
                apiKey: apiKey,
            });
        }
    }

    async generateEmbedding(text: string): Promise<number[]> {
        if (!this.client) {
            throw new Error("OPENAI_API_KEY is not configured");
        }

        const response = await this.client.embeddings.create({
            model: "text-embedding-3-small",
            input: text,
            encoding_format: "float",
        });

        return response.data[0].embedding;
    }

    async analyzeTool(content: string): Promise<any> {
        if (!this.client) {
            throw new Error("OPENAI_API_KEY is not configured");
        }

        const systemPrompt = `You are an expert software analyst. Analyze the provided website content for a software tool.
        Return a JSON object with the following fields:
        - summary: A concise executive summary of what the tool does.
        - features: A list of key features (strings).
        - pricing: An array of objects with { tier, price, features? }.
        - pros: A list of pros.
        - cons: A list of cons.
        - scorecard: An object where keys are criteria (e.g. "ui_ux", "features", "pricing", "support") and values are { score: number (1-10), justification: string }.
        - overallScore: A number between 1-10 (one decimal place).
        `;

        try {
            const completion = await this.client.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Analyze this content:\n\n${content.substring(0, 20000)}` } // Truncate to avoid token limits
                ],
                response_format: { type: "json_object" },
            });

            const result = JSON.parse(completion.choices[0].message.content || "{}");
            return result;
        } catch (error) {
            console.error("OpenAI analysis failed:", error);
            throw new Error("Failed to analyze content");
        }
    }
}

export const openai = new OpenAIService();
