/**
 * Cache-aside utilities for expensive API calls (Tavily, Firecrawl, Perplexity).
 *
 * Uses Redis when available, falls back to no-cache (always calls fetcher).
 * TTL is per-key, defaulting to 24 hours.
 */

import { getRedis } from "@/lib/services/redis";

const PREFIX = "trackr:cache";

/** Build a namespaced cache key from a prefix and variable parts. */
export function buildCacheKey(prefix: string, ...parts: string[]): string {
    return `${PREFIX}:${prefix}:${parts.join(":")}`;
}

/**
 * Cache-aside fetch: check Redis → return cached → call fetcher on miss → store.
 *
 * @param key      Full cache key (use `buildCacheKey` to construct).
 * @param ttlSec   Time-to-live in seconds (default 86400 = 24h).
 * @param fetcher  Async function that produces the value on cache miss.
 * @returns        The cached or freshly-fetched value.
 */
export async function cachedFetch<T>(
    key: string,
    ttlSec: number,
    fetcher: () => Promise<T>,
): Promise<T> {
    const redis = getRedis();

    // Redis unavailable — just call fetcher directly
    if (!redis) return fetcher();

    try {
        const cached = await redis.get<T>(key);
        if (cached !== null && cached !== undefined) return cached;
    } catch (err) {
        console.warn("[research-cache] Redis GET failed, calling fetcher:", err);
    }

    const result = await fetcher();

    // Store in background — don't block the caller
    if (redis) {
        redis.set(key, result, { ex: ttlSec }).catch((err) => {
            console.warn("[research-cache] Redis SET failed:", err);
        });
    }

    return result;
}
