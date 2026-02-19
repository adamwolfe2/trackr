import { openai } from "@ai-sdk/openai";
import { embed } from "ai";

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const { embedding } = await embed({
            model: openai.embedding("text-embedding-3-small"),
            value: text.replace(/\n/g, " "),
        });
        if (!embedding || embedding.length === 0) {
            throw new Error("Empty embedding returned from model");
        }
        return embedding;
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw error;
    }
}
