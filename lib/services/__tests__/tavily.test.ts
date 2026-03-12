import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock global fetch before importing the service
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock research-cache to skip Redis and call fetcher directly (no caching in tests)
vi.mock("@/lib/services/research-cache", () => ({
    cachedFetch: vi.fn(async (_key: string, _ttl: number, fetcher: () => Promise<unknown>) => fetcher()),
    buildCacheKey: vi.fn((...parts: string[]) => parts.join(":")),
}));

import { TavilyService } from "../tavily";

const MOCK_RESPONSE = {
    answer: "Tavily answer about the query",
    results: [
        { title: "Result 1", url: "https://example.com", content: "Content 1", score: 0.9 },
        { title: "Result 2", url: "https://test.com", content: "Content 2", score: 0.7 },
    ],
};

function mockFetchSuccess(data = MOCK_RESPONSE) {
    mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(data),
        text: () => Promise.resolve(""),
    });
}

describe("TavilyService", () => {
    let service: TavilyService;
    const originalKey = process.env.TAVILY_API_KEY;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.TAVILY_API_KEY = "test_tavily_key";
        service = new TavilyService();
    });

    afterEach(() => {
        process.env.TAVILY_API_KEY = originalKey;
    });

    describe("search()", () => {
        it("returns empty results when no API key is set", async () => {
            delete process.env.TAVILY_API_KEY;
            const noKeyService = new TavilyService();
            const result = await noKeyService.search("test query");
            expect(result).toEqual({ answer: "", results: [] });
            expect(mockFetch).not.toHaveBeenCalled();
        });

        it("returns parsed results from API", async () => {
            mockFetchSuccess();
            const result = await service.search("What is Linear?");
            expect(result.answer).toBe(MOCK_RESPONSE.answer);
            expect(result.results).toHaveLength(2);
            expect(result.results[0].title).toBe("Result 1");
            expect(result.results[0].score).toBe(0.9);
        });

        it("uses default search options (advanced depth, max 8, include_answer true)", async () => {
            mockFetchSuccess();
            await service.search("query");
            const callBody = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
            expect(callBody.search_depth).toBe("advanced");
            expect(callBody.max_results).toBe(8);
            expect(callBody.include_answer).toBe(true);
            expect(callBody.include_raw_content).toBe(false);
        });

        it("passes includeDomains when provided", async () => {
            mockFetchSuccess();
            await service.search("reviews", { includeDomains: ["g2.com", "capterra.com"] });
            const callBody = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
            expect(callBody.include_domains).toEqual(["g2.com", "capterra.com"]);
        });

        it("does not include include_domains when not provided", async () => {
            mockFetchSuccess();
            await service.search("query");
            const callBody = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
            expect(callBody.include_domains).toBeUndefined();
        });

        it("respects maxResults option", async () => {
            mockFetchSuccess();
            await service.search("query", { maxResults: 3 });
            const callBody = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
            expect(callBody.max_results).toBe(3);
        });

        it("returns empty results when API responds with non-ok status", async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 429,
                text: () => Promise.resolve("Rate Limited"),
            });
            // Tavily retries 3x — this test verifies it eventually returns empty results
            const result = await service.search("query");
            expect(result).toEqual({ answer: "", results: [] });
            // Should have attempted 3 times (initial + 2 retries)
            expect(mockFetch).toHaveBeenCalledTimes(3);
        }, 45_000);

        it("returns empty results when fetch throws", async () => {
            mockFetch.mockRejectedValue(new Error("Network error"));
            const result = await service.search("query");
            expect(result).toEqual({ answer: "", results: [] });
            expect(mockFetch).toHaveBeenCalledTimes(3);
        }, 45_000);

        it("handles missing answer/results fields gracefully", async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({}), // no answer or results
                text: () => Promise.resolve(""),
            });
            const result = await service.search("query");
            expect(result.answer).toBe("");
            expect(result.results).toEqual([]);
        });
    });

    describe("caching behavior", () => {
        it("produces deterministic cache keys for the same query + options", async () => {
            mockFetchSuccess();
            const r1 = await service.search("same query", { maxResults: 5 });
            const r2 = await service.search("same query", { maxResults: 5 });
            expect(r1).toEqual(r2);
        });
    });
});
