import { describe, it, expect, vi } from "vitest";

// Mock db to prevent real DB writes in logApiCall tests
vi.mock("@/lib/db", () => ({
    db: {
        insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
                catch: vi.fn(),
            }),
        }),
    },
}));

import { estimateOpenAICost, COST_MAP, logApiCall } from "../api-logger";

describe("estimateOpenAICost", () => {
    it("correctly prices gpt-4o input and output tokens", () => {
        // 1M input tokens: $2.50, 1M output tokens: $10.00
        const cost = estimateOpenAICost(1_000_000, 1_000_000, "gpt-4o");
        expect(cost).toBeCloseTo(12.50, 2);
    });

    it("correctly prices gpt-4o-mini input and output tokens", () => {
        // 1M input tokens: $0.15, 1M output tokens: $0.60
        const cost = estimateOpenAICost(1_000_000, 1_000_000, "gpt-4o-mini");
        expect(cost).toBeCloseTo(0.75, 2);
    });

    it("gpt-4o-mini is cheaper than gpt-4o for same token count", () => {
        const miniCost = estimateOpenAICost(10_000, 2_000, "gpt-4o-mini");
        const fullCost = estimateOpenAICost(10_000, 2_000, "gpt-4o");
        expect(miniCost).toBeLessThan(fullCost);
    });

    it("returns 0 for unknown model", () => {
        const cost = estimateOpenAICost(1_000_000, 1_000_000, "unknown-model");
        expect(cost).toBe(0);
    });

    it("prices embedding model by total tokens", () => {
        const cost = estimateOpenAICost(500_000, 500_000, "embedding");
        // (500k + 500k) * $0.02/1M = 1M * 0.02/1M = $0.02
        expect(cost).toBeCloseTo(0.02, 5);
    });

    it("returns 0 when both token counts are 0", () => {
        const cost = estimateOpenAICost(0, 0, "gpt-4o");
        expect(cost).toBe(0);
    });

    it("defaults to gpt-4o pricing when no model specified", () => {
        const withDefault = estimateOpenAICost(100_000, 10_000);
        const withExplicit = estimateOpenAICost(100_000, 10_000, "gpt-4o");
        expect(withDefault).toBeCloseTo(withExplicit, 10);
    });
});

describe("COST_MAP", () => {
    it("has positive costs for paid services", () => {
        expect(COST_MAP.firecrawl.map).toBeGreaterThan(0);
        expect(COST_MAP.firecrawl.scrape).toBeGreaterThan(0);
        expect(COST_MAP.tavily.search).toBeGreaterThan(0);
        expect(COST_MAP.perplexity["sonar-reasoning-pro"]).toBeGreaterThan(0);
    });

    it("scraping costs more than mapping", () => {
        expect(COST_MAP.firecrawl.scrape).toBeGreaterThan(COST_MAP.firecrawl.map);
    });

    it("free services have zero cost", () => {
        expect(COST_MAP.resend.send).toBe(0);
        expect(COST_MAP.slack.post).toBe(0);
    });
});

describe("logApiCall", () => {
    it("fire-and-forget: does not throw even when db insert fails", () => {
        // logApiCall should never throw — it's fire-and-forget
        expect(() => {
            logApiCall({
                service: "firecrawl",
                endpoint: "map",
                durationMs: 150,
                estimatedCost: 0.01,
                workspaceId: "ws_1",
                toolId: "tool_1",
            });
        }).not.toThrow();
    });
});
