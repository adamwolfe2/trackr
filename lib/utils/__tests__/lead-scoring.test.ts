import { describe, it, expect } from "vitest";
import { computeLeadScore } from "../lead-scoring";

// ── Helper to build a submission row ────────────────────────────────────────

function makeSubmission(overrides: Partial<Parameters<typeof computeLeadScore>[0]> = {}) {
    return {
        revenue: null,
        employeeCount: null,
        monthlySpend: null,
        currentTools: null,
        dailyAdoptionPct: null,
        hasAIManager: null,
        scorecard: null,
        shareViewedAt: null,
        ...overrides,
    };
}

// ── parseRevenue (tested via computeLeadScore breakdown.revenue) ────────────

describe("parseRevenue", () => {
    it("scores '$100M+' as 15", () => {
        const result = computeLeadScore(makeSubmission({ revenue: "$100M+" }));
        expect(result.breakdown.revenue).toBe(15);
    });

    it("scores '$25M - $100M' as 15 (matches 100m first)", () => {
        // parseRevenue checks "100m" before "25m" — this range contains both
        const result = computeLeadScore(makeSubmission({ revenue: "$25M \u2013 $100M" }));
        expect(result.breakdown.revenue).toBe(15);
    });

    it("scores '$5M - $25M' as 13 (matches 25m)", () => {
        // parseRevenue checks "25m" before "5m" — this range contains "25m"
        const result = computeLeadScore(makeSubmission({ revenue: "$5M \u2013 $25M" }));
        expect(result.breakdown.revenue).toBe(13);
    });

    it("scores '$2M-$5M' as 10", () => {
        const result = computeLeadScore(makeSubmission({ revenue: "$2M-$5M" }));
        expect(result.breakdown.revenue).toBe(10);
    });

    it("returns 0 for null revenue", () => {
        const result = computeLeadScore(makeSubmission({ revenue: null }));
        expect(result.breakdown.revenue).toBe(0);
    });

    it("returns 0 for undefined (coerced null) revenue", () => {
        const result = computeLeadScore(makeSubmission());
        expect(result.breakdown.revenue).toBe(0);
    });
});

// ── parseEmployees (tested via breakdown.employees) ─────────────────────────

describe("parseEmployees", () => {
    it("scores '500-1,000' as 10 (matches '1,000' first = large enterprise)", () => {
        // parseEmployees checks "1,000" before "500" — range contains both
        const result = computeLeadScore(makeSubmission({ employeeCount: "500\u20131,000" }));
        expect(result.breakdown.employees).toBe(10);
    });

    it("scores '201-1,000 people' as 10 (matches '1,000' first)", () => {
        // parseEmployees checks "1,000" before "201"
        const result = computeLeadScore(makeSubmission({ employeeCount: "201\u20131,000 people" }));
        expect(result.breakdown.employees).toBe(10);
    });

    it("scores '1,000+ people' as 10 (large enterprise)", () => {
        const result = computeLeadScore(makeSubmission({ employeeCount: "1,000+ people" }));
        expect(result.breakdown.employees).toBe(10);
    });

    it("scores '25-50' as 12", () => {
        const result = computeLeadScore(makeSubmission({ employeeCount: "25-50" }));
        expect(result.breakdown.employees).toBe(12);
    });

    it("scores clean number '35' as 12 (25-49 range)", () => {
        const result = computeLeadScore(makeSubmission({ employeeCount: "35" }));
        expect(result.breakdown.employees).toBe(12);
    });

    it("returns 0 for null employeeCount", () => {
        const result = computeLeadScore(makeSubmission({ employeeCount: null }));
        expect(result.breakdown.employees).toBe(0);
    });
});

// ── parseSpend (tested via breakdown.spend) ─────────────────────────────────

describe("parseSpend", () => {
    it("scores '$50K+/mo' as 15", () => {
        const result = computeLeadScore(makeSubmission({ monthlySpend: "$50K+/mo" }));
        expect(result.breakdown.spend).toBe(15);
    });

    it("scores '$15K - $50K/mo' as 15 (matches '50k' first)", () => {
        // parseSpend checks "50k" before "15k" — this range contains both
        const result = computeLeadScore(makeSubmission({ monthlySpend: "$15K \u2013 $50K/mo" }));
        expect(result.breakdown.spend).toBe(15);
    });

    it("scores '$5K-$10K' as 10", () => {
        const result = computeLeadScore(makeSubmission({ monthlySpend: "$5K-$10K" }));
        expect(result.breakdown.spend).toBe(10);
    });

    it("returns 0 for null monthlySpend", () => {
        const result = computeLeadScore(makeSubmission({ monthlySpend: null }));
        expect(result.breakdown.spend).toBe(0);
    });
});

// ── toolCount (breakdown.toolCount) ─────────────────────────────────────────

describe("toolCount scoring", () => {
    it("scores 25+ tools as 10", () => {
        const result = computeLeadScore(makeSubmission({
            currentTools: Array.from({ length: 26 }, (_, i) => `tool-${i}`),
        }));
        expect(result.breakdown.toolCount).toBe(10);
    });

    it("scores '3-10 tools' range (e.g. 8 tools) as 5", () => {
        const result = computeLeadScore(makeSubmission({
            currentTools: Array.from({ length: 8 }, (_, i) => `tool-${i}`),
        }));
        expect(result.breakdown.toolCount).toBe(5);
    });

    it("scores '5-10' range (e.g. 5 tools) as 5", () => {
        const result = computeLeadScore(makeSubmission({
            currentTools: Array.from({ length: 5 }, (_, i) => `tool-${i}`),
        }));
        expect(result.breakdown.toolCount).toBe(5);
    });

    it("scores fewer than 5 tools as 2", () => {
        const result = computeLeadScore(makeSubmission({ currentTools: ["Slack", "Notion"] }));
        expect(result.breakdown.toolCount).toBe(2);
    });

    it("treats null currentTools as empty (score 2)", () => {
        const result = computeLeadScore(makeSubmission({ currentTools: null }));
        expect(result.breakdown.toolCount).toBe(2);
    });
});

// ── parseAdoption (breakdown.adoption) ──────────────────────────────────────

describe("parseAdoption", () => {
    it("scores 'Less than 10%' as 15 (low adoption = high opportunity)", () => {
        const result = computeLeadScore(makeSubmission({ dailyAdoptionPct: "Less than 10%" }));
        expect(result.breakdown.adoption).toBe(15);
    });

    it("scores '10-30%' as 13", () => {
        const result = computeLeadScore(makeSubmission({ dailyAdoptionPct: "10\u201330%" }));
        expect(result.breakdown.adoption).toBe(13);
    });

    it("scores '30%' as 10", () => {
        const result = computeLeadScore(makeSubmission({ dailyAdoptionPct: "30%" }));
        expect(result.breakdown.adoption).toBe(10);
    });

    it("scores '60%+' as 5 (high adoption = less opportunity)", () => {
        const result = computeLeadScore(makeSubmission({ dailyAdoptionPct: "60%+" }));
        expect(result.breakdown.adoption).toBe(5);
    });

    it("defaults to 10 for null adoption", () => {
        const result = computeLeadScore(makeSubmission({ dailyAdoptionPct: null }));
        expect(result.breakdown.adoption).toBe(10);
    });
});

// ── governance (breakdown.governance) ───────────────────────────────────────

describe("governance scoring", () => {
    it("scores 'No - it's scattered across teams' as 10", () => {
        const result = computeLeadScore(makeSubmission({
            hasAIManager: "No \u2014 it\u2019s scattered across teams",
        }));
        expect(result.breakdown.governance).toBe(10);
    });

    it("scores 'No' as 10", () => {
        const result = computeLeadScore(makeSubmission({ hasAIManager: "No" }));
        expect(result.breakdown.governance).toBe(10);
    });

    it("scores 'Yes, we have someone dedicated' as 3", () => {
        const result = computeLeadScore(makeSubmission({
            hasAIManager: "Yes, we have someone dedicated",
        }));
        expect(result.breakdown.governance).toBe(3);
    });

    it("defaults to 10 for null hasAIManager", () => {
        const result = computeLeadScore(makeSubmission({ hasAIManager: null }));
        expect(result.breakdown.governance).toBe(10);
    });
});

// ── aiScore (breakdown.aiScore) ─────────────────────────────────────────────

describe("aiScore scoring", () => {
    it("scores low aiNativeScore (< 30) as 10", () => {
        const result = computeLeadScore(makeSubmission({
            scorecard: { aiNativeScore: { score: 20 } },
        }));
        expect(result.breakdown.aiScore).toBe(10);
    });

    it("scores medium aiNativeScore (30-49) as 7", () => {
        const result = computeLeadScore(makeSubmission({
            scorecard: { aiNativeScore: { score: 45 } },
        }));
        expect(result.breakdown.aiScore).toBe(7);
    });

    it("scores medium-high aiNativeScore (50-69) as 4", () => {
        const result = computeLeadScore(makeSubmission({
            scorecard: { aiNativeScore: { score: 55 } },
        }));
        expect(result.breakdown.aiScore).toBe(4);
    });

    it("scores high aiNativeScore (70+) as 1", () => {
        const result = computeLeadScore(makeSubmission({
            scorecard: { aiNativeScore: { score: 85 } },
        }));
        expect(result.breakdown.aiScore).toBe(1);
    });

    it("defaults to 50 (score 4) when scorecard is null", () => {
        const result = computeLeadScore(makeSubmission({ scorecard: null }));
        expect(result.breakdown.aiScore).toBe(4);
    });
});

// ── engagement (breakdown.engagement) ───────────────────────────────────────

describe("engagement scoring", () => {
    it("gives 5 points when shareViewedAt is set", () => {
        const result = computeLeadScore(makeSubmission({
            shareViewedAt: new Date("2026-03-01"),
        }));
        expect(result.breakdown.engagement).toBe(5);
    });

    it("gives 0 points when shareViewedAt is null", () => {
        const result = computeLeadScore(makeSubmission({ shareViewedAt: null }));
        expect(result.breakdown.engagement).toBe(0);
    });
});

// ── Tier thresholds ─────────────────────────────────────────────────────────

describe("tier thresholds", () => {
    it("classifies score >= 70 as hot", () => {
        // Build a maxed-out submission: revenue 15 + employees 15 + spend 15 + tools 10 + adoption 15 + governance 10 + aiScore 10 + engagement 5 = 95
        const result = computeLeadScore(makeSubmission({
            revenue: "$100M+",
            employeeCount: "500\u20131,000",
            monthlySpend: "$50K+/mo",
            currentTools: Array.from({ length: 30 }, (_, i) => `t${i}`),
            dailyAdoptionPct: "Less than 10%",
            hasAIManager: "No",
            scorecard: { aiNativeScore: { score: 10 } },
            shareViewedAt: new Date(),
        }));
        expect(result.score).toBeGreaterThanOrEqual(70);
        expect(result.tier).toBe("hot");
    });

    it("classifies score 45-69 as warm", () => {
        const result = computeLeadScore(makeSubmission({
            revenue: "$5M \u2013 $25M",
            employeeCount: "25-50",
            monthlySpend: "$5K-$10K",
            currentTools: ["Slack", "Notion", "Zoom"],
            dailyAdoptionPct: "30%",
            hasAIManager: "No",
            scorecard: null,
            shareViewedAt: null,
        }));
        expect(result.score).toBeGreaterThanOrEqual(45);
        expect(result.score).toBeLessThan(70);
        expect(result.tier).toBe("warm");
    });

    it("classifies score < 45 as cold", () => {
        const result = computeLeadScore(makeSubmission({
            revenue: null,
            employeeCount: null,
            monthlySpend: null,
            currentTools: [],
            dailyAdoptionPct: "60%+",
            hasAIManager: "Yes, we have someone dedicated",
            scorecard: { aiNativeScore: { score: 90 } },
            shareViewedAt: null,
        }));
        expect(result.score).toBeLessThan(45);
        expect(result.tier).toBe("cold");
    });
});

// ── Full scoring tests ──────────────────────────────────────────────────────

describe("full scoring", () => {
    it("scores a complete submission row correctly", () => {
        const result = computeLeadScore(makeSubmission({
            revenue: "$25M \u2013 $100M",
            employeeCount: "201\u20131,000 people",
            monthlySpend: "$15K \u2013 $50K/mo",
            currentTools: Array.from({ length: 12 }, (_, i) => `tool-${i}`),
            dailyAdoptionPct: "10\u201330%",
            hasAIManager: "No \u2014 it\u2019s scattered across teams",
            scorecard: { aiNativeScore: { score: 35 } },
            shareViewedAt: new Date("2026-03-20"),
        }));
        expect(result.breakdown.revenue).toBe(15);    // "$25M -- $100M" matches "100m" first
        expect(result.breakdown.employees).toBe(10);  // "201--1,000 people" matches "1,000" first
        expect(result.breakdown.spend).toBe(15);       // "$15K -- $50K/mo" matches "50k" first
        expect(result.breakdown.toolCount).toBe(8);
        expect(result.breakdown.adoption).toBe(13);
        expect(result.breakdown.governance).toBe(10);
        expect(result.breakdown.aiScore).toBe(7);
        expect(result.breakdown.engagement).toBe(5);
        expect(result.score).toBe(83);
        expect(result.tier).toBe("hot");
    });

    it("handles all-null fields without crashing", () => {
        const result = computeLeadScore(makeSubmission());
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
        expect(["hot", "warm", "cold"]).toContain(result.tier);
        expect(result.breakdown).toBeDefined();
    });

    it("max score does not exceed 100", () => {
        const result = computeLeadScore(makeSubmission({
            revenue: "$100M+",
            employeeCount: "500\u20131,000",
            monthlySpend: "$50K+/mo",
            currentTools: Array.from({ length: 30 }, (_, i) => `t${i}`),
            dailyAdoptionPct: "Less than 10%",
            hasAIManager: "No",
            scorecard: { aiNativeScore: { score: 5 } },
            shareViewedAt: new Date(),
        }));
        expect(result.score).toBeLessThanOrEqual(100);
    });
});
