/**
 * Shared Redis singleton (Upstash).
 *
 * Consumed by rate-limit, research-cache, and any future Redis consumers.
 * Returns null when KV credentials are missing (local dev).
 */

import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;

export function getRedis(): Redis | null {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null;
    if (!_redis) {
        _redis = new Redis({
            url: process.env.KV_REST_API_URL,
            token: process.env.KV_REST_API_TOKEN,
        });
    }
    return _redis;
}
