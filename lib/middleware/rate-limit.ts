/**
 * Rate limiter for API routes.
 *
 * Uses Upstash Redis (sliding window) when KV_REST_API_URL + KV_REST_API_TOKEN
 * are set — counts survive cold starts, scale across all Vercel instances.
 *
 * Falls back to in-memory when running locally without credentials.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "@/lib/services/redis";

// Cache Ratelimit instances by "limit:windowSeconds" so we don't create
// a new one on every request (each instance holds sliding-window state).
const _limiters = new Map<string, Ratelimit>();

function getUpstashLimiter(limit: number, windowSeconds: number): Ratelimit | null {
    const redis = getRedis();
    if (!redis) return null;

    const key = `${limit}:${windowSeconds}`;
    if (!_limiters.has(key)) {
        _limiters.set(key, new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
            prefix: "trackr:rl",
        }));
    }
    return _limiters.get(key)!;
}

// ── In-memory fallback ────────────────────────────────────────────────────────

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes; hard-cap at 50k to prevent unbounded growth
if (typeof setInterval !== "undefined") {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store.entries()) {
            if (entry.resetAt < now) store.delete(key);
        }
        if (store.size > 50_000) {
            const excess = store.size - 50_000;
            let deleted = 0;
            for (const key of store.keys()) {
                store.delete(key);
                if (++deleted >= excess) break;
            }
        }
    }, 5 * 60 * 1000);
}

function inMemoryRateLimit(identifier: string, options: RateLimitOptions): RateLimitResult {
    const { limit, windowSeconds } = options;
    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    const existing = store.get(identifier);

    if (!existing || existing.resetAt < now) {
        const entry: RateLimitEntry = { count: 1, resetAt: now + windowMs };
        store.set(identifier, entry);
        return { success: true, limit, remaining: limit - 1, resetAt: entry.resetAt };
    }

    existing.count++;
    const remaining = Math.max(0, limit - existing.count);

    return {
        success: existing.count <= limit,
        limit,
        remaining,
        resetAt: existing.resetAt,
    };
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface RateLimitOptions {
    /** Max requests per window */
    limit: number;
    /** Window duration in seconds */
    windowSeconds: number;
}

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    /** Unix timestamp (ms) when the window resets */
    resetAt: number;
}

export async function rateLimit(
    identifier: string,
    options: RateLimitOptions
): Promise<RateLimitResult> {
    const { limit, windowSeconds } = options;

    // Prefer Upstash — persistent across cold starts and Vercel instances
    const limiter = getUpstashLimiter(limit, windowSeconds);
    if (limiter) {
        try {
            const r = await limiter.limit(identifier);
            return {
                success: r.success,
                limit: r.limit,
                remaining: r.remaining,
                resetAt: r.reset, // already in milliseconds
            };
        } catch (err) {
            console.error("[rate-limit] Upstash unavailable, falling back to in-memory:", err);
        }
    }

    // In-memory fallback (local dev without credentials, or Upstash error)
    return inMemoryRateLimit(identifier, options);
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
    return {
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
        // RFC 6585 — tells clients exactly how many seconds to wait before retrying
        "Retry-After": String(Math.max(0, Math.ceil((result.resetAt - Date.now()) / 1000))),
    };
}
