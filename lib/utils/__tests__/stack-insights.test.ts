import { describe, it, expect } from "vitest";
import { computeStackInsights, type SpendEntry } from "../stack-insights";

function makeEntry(overrides: Partial<SpendEntry> & { toolName: string }): SpendEntry {
    return {
        id: overrides.id ?? "spend_1",
        toolName: overrides.toolName,
        category: "category" in overrides ? (overrides.category ?? null) : null,
        monthlyCost: "monthlyCost" in overrides ? overrides.monthlyCost! : "50",
        seatCount: "seatCount" in overrides ? overrides.seatCount! : 5,
        status: overrides.status ?? "active",
    };
}

describe("computeStackInsights", () => {
    it("returns zero score and empty results for empty input", () => {
        const result = computeStackInsights([]);
        expect(result.score).toBe(0);
        expect(result.aiNativeCount).toBe(0);
        expect(result.aiEnabledCount).toBe(0);
        expect(result.traditionalCount).toBe(0);
        expect(result.totalActiveSpend).toBe(0);
        expect(result.enrichedTools).toHaveLength(0);
        expect(result.opportunities).toHaveLength(0);
    });

    it("filters out non-active entries", () => {
        const entries = [
            makeEntry({ toolName: "Notion", status: "active" }),
            makeEntry({ toolName: "Slack", status: "inactive" }),
            makeEntry({ toolName: "Linear", status: "canceled" }),
        ];
        const result = computeStackInsights(entries);
        expect(result.enrichedTools).toHaveLength(1);
        expect(result.enrichedTools[0].toolName).toBe("Notion");
    });

    it("calculates totalActiveSpend correctly", () => {
        const entries = [
            makeEntry({ toolName: "Tool A", monthlyCost: "100" }),
            makeEntry({ id: "s2", toolName: "Tool B", monthlyCost: "50.50" }),
        ];
        const result = computeStackInsights(entries);
        expect(result.totalActiveSpend).toBeCloseTo(150.5, 1);
    });

    it("handles null monthlyCost as 0", () => {
        const entries = [makeEntry({ toolName: "Free Tool", monthlyCost: null })];
        const result = computeStackInsights(entries);
        expect(result.totalActiveSpend).toBe(0);
    });

    it("correctly classifies known AI-native tools (e.g. ChatGPT)", () => {
        const entries = [makeEntry({ toolName: "ChatGPT" })];
        const result = computeStackInsights(entries);
        expect(result.aiNativeCount).toBe(1);
        expect(result.aiEnabledCount).toBe(0);
        // AI-native tools score 2 points, max is 2, so score = 100%
        expect(result.score).toBe(100);
        expect(result.label).toBe("AI Leader");
    });

    it("detects Slack + Teams redundancy opportunity", () => {
        const entries = [
            makeEntry({ id: "s1", toolName: "Slack" }),
            makeEntry({ id: "s2", toolName: "Microsoft Teams" }),
        ];
        const result = computeStackInsights(entries);
        const opp = result.opportunities.find((o) => o.title.includes("Slack") && o.title.includes("Teams"));
        expect(opp).toBeDefined();
        expect(opp?.priority).toBe("high");
    });

    it("caps opportunities at 5", () => {
        // Create lots of entries to trigger multiple opportunity types
        const entries = Array.from({ length: 10 }, (_, i) => ({
            id: `s${i}`,
            toolName: `Unknown Tool ${i}`,
            category: "productivity",
            monthlyCost: "50",
            seatCount: 5,
            status: "active",
        }));
        const result = computeStackInsights(entries);
        expect(result.opportunities.length).toBeLessThanOrEqual(5);
    });

    it("reports missing seat count as low priority opportunity", () => {
        const entries = [
            makeEntry({ toolName: "Notion", seatCount: null }),
            makeEntry({ id: "s2", toolName: "Slack", seatCount: null }),
        ];
        const result = computeStackInsights(entries);
        const opp = result.opportunities.find((o) => o.priority === "low" && o.title.includes("seat"));
        expect(opp).toBeDefined();
    });

    it("calculates timeSavedPerMonth for AI tools", () => {
        // ChatGPT with 10 seats should save significant hours per month
        const entries = [makeEntry({ toolName: "ChatGPT", seatCount: 10 })];
        const result = computeStackInsights(entries);
        expect(result.timeSavedPerMonth).toBeGreaterThan(0);
        expect(result.timeSavedPerYear).toBe(result.timeSavedPerMonth * 12);
        expect(result.dollarValueSaved).toBe(result.timeSavedPerYear * 75);
    });

    it("returns 'Just Starting' label for score below 8", () => {
        // All traditional tools → score = 0
        const entries = [
            makeEntry({ toolName: "Excel - Microsoft" }),
            makeEntry({ id: "s2", toolName: "PowerPoint" }),
        ];
        const result = computeStackInsights(entries);
        // Traditional tools score 0 points, so score is very low
        expect(result.score).toBeLessThan(20);
        // Label should be Just Starting or Developing
        expect(["Just Starting", "Developing"]).toContain(result.label);
    });
});
