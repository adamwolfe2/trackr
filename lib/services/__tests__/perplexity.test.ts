import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock OpenAI before importing PerplexityService
const mockCreate = vi.fn();
vi.mock("openai", () => ({
    OpenAI: function OpenAI() {
        return {
            chat: {
                completions: {
                    create: mockCreate,
                },
            },
        };
    },
}));

// Mock research-cache — cachedFetch always calls the fetcher (no caching in tests)
vi.mock("@/lib/services/research-cache", () => ({
    cachedFetch: vi.fn(async (_key: string, _ttl: number, fetcher: () => Promise<unknown>) => fetcher()),
    buildCacheKey: vi.fn((...parts: string[]) => parts.join(":")),
}));

import { PerplexityService } from "../perplexity";

const MOCK_RESPONSE = "This is a Perplexity research result about the topic.";

function mockSuccess(content = MOCK_RESPONSE) {
    mockCreate.mockResolvedValue({
        choices: [{ message: { content } }],
    });
}

function mockError(message = "API error") {
    mockCreate.mockRejectedValue(new Error(message));
}

describe("PerplexityService", () => {
    let service: PerplexityService;
    const originalKey = process.env.PERPLEXITY_API_KEY;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.PERPLEXITY_API_KEY = "test_key_123";
        service = new PerplexityService();
    });

    afterEach(() => {
        process.env.PERPLEXITY_API_KEY = originalKey;
    });

    describe("search()", () => {
        it("returns empty string when no API key is set", async () => {
            delete process.env.PERPLEXITY_API_KEY;
            const noKeyService = new PerplexityService();
            const result = await noKeyService.search("test query");
            expect(result).toBe("");
            expect(mockCreate).not.toHaveBeenCalled();
        });

        it("returns API response content for valid query", async () => {
            mockSuccess();
            const result = await service.search("What is Linear?");
            expect(result).toBe(MOCK_RESPONSE);
            expect(mockCreate).toHaveBeenCalledTimes(1);
        });

        it("makes separate API calls for different queries", async () => {
            mockSuccess("Result A");
            const result1 = await service.search("Query A");
            mockSuccess("Result B");
            const result2 = await service.search("Query B");
            expect(result1).toBe("Result A");
            expect(result2).toBe("Result B");
            expect(mockCreate).toHaveBeenCalledTimes(2);
        });

        it("returns empty string when API fails after retries", async () => {
            vi.useFakeTimers();
            mockError("Connection refused");
            const promise = service.search("query that fails");
            // Advance through all retry delays (1s + 2s = 3s total)
            await vi.runAllTimersAsync();
            const result = await promise;
            vi.useRealTimers();
            expect(result).toBe("");
        });

        it("defaults to sonar model", async () => {
            mockSuccess();
            await service.search("query");
            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({ model: "sonar" })
            );
        });

        it("passes the provided model to the API", async () => {
            mockSuccess();
            await service.search("query", "sonar-deep-research");
            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({ model: "sonar-deep-research" })
            );
        });
    });

    describe("analyzeSentiment()", () => {
        it("returns sentiment JSON from API", async () => {
            const sentiment = '{"sentiment": "positive", "quotes": []}';
            mockSuccess(sentiment);
            const result = await service.analyzeSentiment("Linear");
            expect(result).toBe(sentiment);
        });

        it("returns mock data when no API key is set", async () => {
            delete process.env.PERPLEXITY_API_KEY;
            const noKeyService = new PerplexityService();
            const result = await noKeyService.analyzeSentiment("Linear");
            const parsed = JSON.parse(result);
            expect(parsed.sentiment).toBe("neutral");
            expect(Array.isArray(parsed.quotes)).toBe(true);
            expect(mockCreate).not.toHaveBeenCalled();
        });
    });

    describe("discoverTools()", () => {
        it("returns tool suggestions from API", async () => {
            const suggestions = '[{"name":"Linear","url":"https://linear.app","description":"Project management"}]';
            mockSuccess(suggestions);
            const result = await service.discoverTools("project management");
            expect(result).toBe(suggestions);
        });

        it("returns mock suggestions when no API key is set", async () => {
            delete process.env.PERPLEXITY_API_KEY;
            const noKeyService = new PerplexityService();
            const result = await noKeyService.discoverTools("reporting");
            const parsed = JSON.parse(result);
            expect(Array.isArray(parsed)).toBe(true);
            expect(parsed[0]).toHaveProperty("name");
            expect(parsed[0]).toHaveProperty("url");
        });

        it("falls back to mock when API fails", async () => {
            vi.useFakeTimers();
            mockError("API unavailable");
            const promise = service.discoverTools("email automation");
            await vi.runAllTimersAsync();
            const result = await promise;
            vi.useRealTimers();
            const parsed = JSON.parse(result);
            expect(Array.isArray(parsed)).toBe(true);
        });
    });
});
