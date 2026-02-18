/**
 * Simple in-memory rate limiter for API routes.
 * For production scale, replace with Upstash Redis rate limiting.
 * This handles moderate traffic without external dependencies.
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store.entries()) {
            if (entry.resetAt < now) store.delete(key);
        }
    }, 5 * 60 * 1000);
}

interface RateLimitOptions {
    /** Max requests per window */
    limit: number;
    /** Window duration in seconds */
    windowSeconds: number;
}

interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    resetAt: number;
}

export function rateLimit(
    identifier: string,
    options: RateLimitOptions
): RateLimitResult {
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

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
    return {
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    };
}
