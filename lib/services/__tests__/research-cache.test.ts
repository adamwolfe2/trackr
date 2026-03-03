import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the redis module
const mockGet = vi.fn();
const mockSet = vi.fn();

vi.mock("@/lib/services/redis", () => ({
    getRedis: vi.fn(() => ({
        get: mockGet,
        set: mockSet,
    })),
}));

import { cachedFetch, buildCacheKey } from "../research-cache";
import { getRedis } from "../redis";

describe("buildCacheKey", () => {
    it("joins prefix and parts with colons", () => {
        expect(buildCacheKey("tavily", "reviews", "notion"))
            .toBe("trackr:cache:tavily:reviews:notion");
    });

    it("handles single part", () => {
        expect(buildCacheKey("firecrawl", "https://example.com"))
            .toBe("trackr:cache:firecrawl:https://example.com");
    });
});

describe("cachedFetch", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSet.mockResolvedValue("OK");
    });

    it("returns cached value on Redis hit", async () => {
        mockGet.mockResolvedValue({ data: "cached" });

        const fetcher = vi.fn().mockResolvedValue({ data: "fresh" });
        const result = await cachedFetch("key", 3600, fetcher);

        expect(result).toEqual({ data: "cached" });
        expect(fetcher).not.toHaveBeenCalled();
    });

    it("calls fetcher and stores result on Redis miss", async () => {
        mockGet.mockResolvedValue(null);

        const fetcher = vi.fn().mockResolvedValue({ data: "fresh" });
        const result = await cachedFetch("key", 3600, fetcher);

        expect(result).toEqual({ data: "fresh" });
        expect(fetcher).toHaveBeenCalledTimes(1);
        expect(mockSet).toHaveBeenCalledWith("key", { data: "fresh" }, { ex: 3600 });
    });

    it("calls fetcher when Redis GET fails (graceful degradation)", async () => {
        mockGet.mockRejectedValue(new Error("Redis connection failed"));

        const fetcher = vi.fn().mockResolvedValue("fallback");
        const result = await cachedFetch("key", 3600, fetcher);

        expect(result).toBe("fallback");
        expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it("does not block on Redis SET failure", async () => {
        mockGet.mockResolvedValue(null);
        mockSet.mockRejectedValue(new Error("SET failed"));

        const fetcher = vi.fn().mockResolvedValue("data");
        const result = await cachedFetch("key", 3600, fetcher);

        expect(result).toBe("data");
    });

    it("calls fetcher directly when Redis is unavailable", async () => {
        vi.mocked(getRedis).mockReturnValueOnce(null);

        const fetcher = vi.fn().mockResolvedValue("no-redis");
        const result = await cachedFetch("key", 3600, fetcher);

        expect(result).toBe("no-redis");
        expect(mockGet).not.toHaveBeenCalled();
    });
});
