import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { createHash } from "crypto";
import { cachedFetch, buildCacheKey } from "@/lib/services/research-cache";

/** TTL for embedding cache: 7 days (embeddings are deterministic for the same input) */
const EMBEDDING_CACHE_TTL = 7 * 24 * 3600;

export async function generateEmbedding(text: string): Promise<number[]> {
    const normalized = text.replace(/\n/g, " ").trim();

    // Hash the input to create a compact, stable cache key
    const hash = createHash("sha256").update(normalized).digest("hex").slice(0, 24);
    const cacheKey = buildCacheKey("embedding", hash);

    return cachedFetch(cacheKey, EMBEDDING_CACHE_TTL, async () => {
        try {
            const { embedding } = await embed({
                model: openai.embedding("text-embedding-3-small"),
                value: normalized,
            });
            if (!embedding || embedding.length === 0) {
                throw new Error("Empty embedding returned from model");
            }
            return embedding;
        } catch (error) {
            console.error("Error generating embedding:", error);
            throw error;
        }
    });
}
