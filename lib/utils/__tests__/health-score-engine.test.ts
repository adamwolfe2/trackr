import { describe, it, expect } from "vitest";
import {
    computeHealthScore,
    computeToolQuality,
    computeSpendEfficiency,
    computeCoverageGaps,
    computeRiskExposure,
    computeRenewalHealth,
    computeTeamUtilization,
    buildBreakdown,
    generateRecommendations,
    type HealthBreakdown,
    type ToolInput,
    type SpendInput,
    type RiskInput,
    type NoteInput,
    type DecisionInput,
} from "../health-score-engine";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeTool(overrides: Partial<ToolInput> = {}): ToolInput {
    return { id: "t1", overallScore: "8.5", status: "active", ...overrides };
}

function makeSpend(overrides: Partial<SpendInput> = {}): SpendInput {
    const thirtyOneDays = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);
    return {
        id: "s1",
        toolName: "Slack",
        monthlyCost: "100",
        status: "active",
        renewalDate: thirtyOneDays,
        ...overrides,
    };
}

function makeBreakdown(overrides: Partial<HealthBreakdown> = {}): HealthBreakdown {
    return {
        toolQuality: 80,
        spendEfficiency: 80,
        coverageGaps: 80,
        riskExposure: 80,
        renewalHealth: 80,
        teamUtilization: 80,
        ...overrides,
    };
}

// ─── computeHealthScore ───────────────────────────────────────────────────────

describe("computeHealthScore", () => {
    it("returns a weighted average of all six dimensions", () => {
        // All 100 → should be 100
        const score = computeHealthScore(makeBreakdown({
            toolQuality: 100, spendEfficiency: 100, coverageGaps: 100,
            riskExposure: 100, renewalHealth: 100, teamUtilization: 100,
        }));
        expect(score).toBe(100);
    });

    it("returns 0 when all non-null dimensions are 0", () => {
        const score = computeHealthScore(makeBreakdown({
            toolQuality: 0, spendEfficiency: 0, coverageGaps: 0,
            riskExposure: 0, renewalHealth: 0, teamUtilization: 0,
        }));
        expect(score).toBe(0);
    });

    it("clamps to 100 even if weights exceed it", () => {
        const score = computeHealthScore(makeBreakdown({
            toolQuality: 200, spendEfficiency: 200, coverageGaps: 200,
            riskExposure: 200, renewalHealth: 200, teamUtilization: 200,
        }));
        expect(score).toBe(100);
    });

    it("weights toolQuality most heavily (0.30)", () => {
        const highQuality = computeHealthScore(makeBreakdown({ toolQuality: 100, spendEfficiency: 0, coverageGaps: 0, riskExposure: 0, renewalHealth: 0, teamUtilization: 0 }));
        const highSpend = computeHealthScore(makeBreakdown({ toolQuality: 0, spendEfficiency: 100, coverageGaps: 0, riskExposure: 0, renewalHealth: 0, teamUtilization: 0 }));
        expect(highQuality).toBeGreaterThan(highSpend);
        expect(highQuality).toBe(30); // 100 * 0.30
        expect(highSpend).toBe(20);   // 100 * 0.20
    });

    it("returns a rounded integer", () => {
        const score = computeHealthScore(makeBreakdown({ toolQuality: 75, spendEfficiency: 75, coverageGaps: 75, riskExposure: 75, renewalHealth: 75, teamUtilization: 75 }));
        expect(Number.isInteger(score)).toBe(true);
    });
});

// ─── computeToolQuality ───────────────────────────────────────────────────────

describe("computeToolQuality", () => {
    it("returns 50 for an empty tool list (neutral score for new workspaces)", () => {
        expect(computeToolQuality([])).toBe(50);
    });

    it("returns 50 when no active tools have scores", () => {
        const tools: ToolInput[] = [
            makeTool({ status: "active", overallScore: null }),
        ];
        expect(computeToolQuality(tools)).toBe(50);
    });

    it("converts 10-scale score to 100-scale correctly", () => {
        const tools: ToolInput[] = [makeTool({ overallScore: "10.00" })];
        expect(computeToolQuality(tools)).toBe(100);
    });

    it("averages multiple active scored tools", () => {
        const tools: ToolInput[] = [
            makeTool({ id: "t1", overallScore: "6.0" }),
            makeTool({ id: "t2", overallScore: "8.0" }),
        ];
        // avg = 7.0 → 70
        expect(computeToolQuality(tools)).toBe(70);
    });

    it("ignores archived tools from quality calculation", () => {
        const tools: ToolInput[] = [
            makeTool({ id: "t1", overallScore: "9.0", status: "active" }),
            makeTool({ id: "t2", overallScore: "1.0", status: "archived" }),
        ];
        // Only active tool: 9.0 → 90
        expect(computeToolQuality(tools)).toBe(90);
    });

    it("returns 50 when all tools are non-active", () => {
        const tools: ToolInput[] = [
            makeTool({ status: "archived", overallScore: "9.0" }),
            makeTool({ status: "queued", overallScore: "8.0" }),
        ];
        expect(computeToolQuality(tools)).toBe(50);
    });
});

// ─── computeSpendEfficiency ───────────────────────────────────────────────────

describe("computeSpendEfficiency", () => {
    it("returns null when there are no active spend items", () => {
        expect(computeSpendEfficiency([], new Set())).toBeNull();
    });

    it("returns 100 when total spend is 0", () => {
        const items: SpendInput[] = [makeSpend({ monthlyCost: "0" })];
        expect(computeSpendEfficiency(items, new Set(["slack"]))).toBe(100);
    });

    it("returns 100 when all spend is on researched tools", () => {
        const items: SpendInput[] = [
            makeSpend({ toolName: "Slack", monthlyCost: "100" }),
            makeSpend({ id: "s2", toolName: "Notion", monthlyCost: "200" }),
        ];
        const researched = new Set(["slack", "notion"]);
        expect(computeSpendEfficiency(items, researched)).toBe(100);
    });

    it("returns 0 when none of the spend is on researched tools", () => {
        const items: SpendInput[] = [makeSpend({ toolName: "Salesforce", monthlyCost: "500" })];
        expect(computeSpendEfficiency(items, new Set())).toBe(0);
    });

    it("calculates partial efficiency correctly", () => {
        const items: SpendInput[] = [
            makeSpend({ id: "s1", toolName: "Slack", monthlyCost: "100" }),      // researched
            makeSpend({ id: "s2", toolName: "Unknown", monthlyCost: "300" }),    // not researched
        ];
        const researched = new Set(["slack"]);
        // 100 / 400 = 25%
        expect(computeSpendEfficiency(items, researched)).toBe(25);
    });

    it("ignores canceled spend items", () => {
        const items: SpendInput[] = [
            makeSpend({ id: "s1", toolName: "Slack", monthlyCost: "100", status: "active" }),
            makeSpend({ id: "s2", toolName: "HubSpot", monthlyCost: "1000", status: "canceled" }),
        ];
        const researched = new Set(["slack"]);
        // Only active: slack $100 out of $100 → 100%
        expect(computeSpendEfficiency(items, researched)).toBe(100);
    });
});

// ─── computeCoverageGaps ─────────────────────────────────────────────────────

describe("computeCoverageGaps", () => {
    it("returns 0 when no categories are covered", () => {
        expect(computeCoverageGaps([], [])).toBe(0);
    });

    it("returns 100 when all 10 critical categories are covered", () => {
        const cats = ["project management", "communication", "security", "analytics",
            "crm", "development", "design", "ai", "finance", "hr"];
        expect(computeCoverageGaps(cats, [])).toBe(100);
    });

    it("returns 50 when 5 out of 10 critical categories are covered", () => {
        const cats = ["project management", "communication", "security", "analytics", "crm"];
        expect(computeCoverageGaps(cats, [])).toBe(50);
    });

    it("counts categories from both tool and spend lists", () => {
        const toolCats = ["project management", "communication"];
        const spendCats = ["security", "analytics", "crm"];
        // 5 / 10 = 50%
        expect(computeCoverageGaps(toolCats, spendCats)).toBe(50);
    });

    it("does not double-count if same category appears in both lists", () => {
        const toolCats = ["project management"];
        const spendCats = ["project management"];
        // Still only 1 unique critical category covered out of 10 = 10%
        expect(computeCoverageGaps(toolCats, spendCats)).toBe(10);
    });

    it("matches categories case-insensitively", () => {
        const cats = ["Project Management", "COMMUNICATION"];
        expect(computeCoverageGaps(cats, [])).toBe(20);
    });
});

// ─── computeRiskExposure ──────────────────────────────────────────────────────

describe("computeRiskExposure", () => {
    it("returns null when there are no active tools", () => {
        expect(computeRiskExposure([], [])).toBeNull();
    });

    it("returns 100 when no tools have risk alerts", () => {
        const tools: ToolInput[] = [makeTool()];
        expect(computeRiskExposure(tools, [])).toBe(100);
    });

    it("returns 100 when all risks are low severity", () => {
        const tools: ToolInput[] = [makeTool({ id: "t1" })];
        const risks: RiskInput[] = [{ toolId: "t1", alertLevel: "low" }];
        expect(computeRiskExposure(tools, risks)).toBe(100);
    });

    it("returns 0 when all active tools have critical risk", () => {
        const tools: ToolInput[] = [makeTool({ id: "t1" }), makeTool({ id: "t2" })];
        const risks: RiskInput[] = [
            { toolId: "t1", alertLevel: "critical" },
            { toolId: "t2", alertLevel: "high" },
        ];
        expect(computeRiskExposure(tools, risks)).toBe(0);
    });

    it("calculates partial exposure: 1 of 2 tools at risk = 50% safe", () => {
        const tools: ToolInput[] = [makeTool({ id: "t1" }), makeTool({ id: "t2" })];
        const risks: RiskInput[] = [{ toolId: "t1", alertLevel: "high" }];
        expect(computeRiskExposure(tools, risks)).toBe(50);
    });

    it("ignores archived tools", () => {
        const tools: ToolInput[] = [
            makeTool({ id: "t1", status: "active" }),
            makeTool({ id: "t2", status: "archived" }),
        ];
        const risks: RiskInput[] = [{ toolId: "t2", alertLevel: "critical" }]; // archived tool at risk
        // archived tool ignored → active tool is safe → 100%
        expect(computeRiskExposure(tools, risks)).toBe(100);
    });
});

// ─── computeRenewalHealth ────────────────────────────────────────────────────

describe("computeRenewalHealth", () => {
    it("returns null when there are no active spend items with renewals", () => {
        expect(computeRenewalHealth([])).toBeNull();
    });

    it("returns 100 when all renewals are more than 30 days away", () => {
        const items: SpendInput[] = [
            makeSpend({ renewalDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) }),
        ];
        expect(computeRenewalHealth(items)).toBe(100);
    });

    it("returns 0 when all renewals are within 30 days", () => {
        const items: SpendInput[] = [
            makeSpend({ renewalDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) }),
            makeSpend({ id: "s2", renewalDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) }),
        ];
        expect(computeRenewalHealth(items)).toBe(0);
    });

    it("calculates partial health when some renewals are urgent", () => {
        const items: SpendInput[] = [
            makeSpend({ id: "s1", renewalDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) }), // healthy
            makeSpend({ id: "s2", renewalDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) }), // urgent
        ];
        expect(computeRenewalHealth(items)).toBe(50);
    });

    it("ignores items with no renewal date", () => {
        const items: SpendInput[] = [
            makeSpend({ renewalDate: null }),  // no renewal — excluded
            makeSpend({ id: "s2", renewalDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) }), // healthy
        ];
        expect(computeRenewalHealth(items)).toBe(100);
    });

    it("ignores canceled items", () => {
        const items: SpendInput[] = [
            makeSpend({ status: "canceled", renewalDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) }), // canceled — excluded
        ];
        // No active spend with renewals → null
        expect(computeRenewalHealth(items)).toBeNull();
    });
});

// ─── computeTeamUtilization ──────────────────────────────────────────────────

describe("computeTeamUtilization", () => {
    it("returns null when there are no active tools", () => {
        expect(computeTeamUtilization([], [], [])).toBeNull();
    });

    it("returns 0 when no tools have recent notes or decisions", () => {
        const tools: ToolInput[] = [makeTool({ id: "t1" }), makeTool({ id: "t2" })];
        expect(computeTeamUtilization(tools, [], [])).toBe(0);
    });

    it("returns 100 when all active tools have recent notes", () => {
        const tools: ToolInput[] = [makeTool({ id: "t1" }), makeTool({ id: "t2" })];
        const notes: NoteInput[] = [
            { toolId: "t1", createdAt: new Date() },
            { toolId: "t2", createdAt: new Date() },
        ];
        expect(computeTeamUtilization(tools, notes, [])).toBe(100);
    });

    it("counts decisions as utilization", () => {
        const tools: ToolInput[] = [makeTool({ id: "t1" })];
        const decisions: DecisionInput[] = [{ toolId: "t1", createdAt: new Date() }];
        expect(computeTeamUtilization(tools, [], decisions)).toBe(100);
    });

    it("calculates partial utilization: 1 of 2 tools utilized = 50%", () => {
        const tools: ToolInput[] = [makeTool({ id: "t1" }), makeTool({ id: "t2" })];
        const notes: NoteInput[] = [{ toolId: "t1", createdAt: new Date() }];
        expect(computeTeamUtilization(tools, notes, [])).toBe(50);
    });

    it("ignores decisions with null toolId", () => {
        const tools: ToolInput[] = [makeTool({ id: "t1" })];
        const decisions: DecisionInput[] = [{ toolId: null, createdAt: new Date() }];
        expect(computeTeamUtilization(tools, [], decisions)).toBe(0);
    });

    it("ignores archived tools", () => {
        const tools: ToolInput[] = [
            makeTool({ id: "t1", status: "active" }),
            makeTool({ id: "t2", status: "archived" }),
        ];
        const notes: NoteInput[] = [{ toolId: "t1", createdAt: new Date() }];
        // Only active tool t1, and it has a note → 100%
        expect(computeTeamUtilization(tools, notes, [])).toBe(100);
    });
});

// ─── buildBreakdown ───────────────────────────────────────────────────────────

describe("buildBreakdown", () => {
    it("returns all six dimensions", () => {
        const breakdown = buildBreakdown({
            tools: [makeTool()],
            spendItems: [makeSpend()],
            researchedToolNames: new Set(["slack"]),
            toolCategories: ["communication"],
            spendCategories: [],
            risks: [],
            recentNotes: [],
            recentDecisions: [],
        });

        expect(breakdown).toHaveProperty("toolQuality");
        expect(breakdown).toHaveProperty("spendEfficiency");
        expect(breakdown).toHaveProperty("coverageGaps");
        expect(breakdown).toHaveProperty("riskExposure");
        expect(breakdown).toHaveProperty("renewalHealth");
        expect(breakdown).toHaveProperty("teamUtilization");
    });

    it("all dimensions are numbers between 0 and 100, or null for unconfigured", () => {
        const breakdown = buildBreakdown({
            tools: [makeTool()],
            spendItems: [makeSpend()],
            researchedToolNames: new Set(),
            toolCategories: [],
            spendCategories: [],
            risks: [],
            recentNotes: [],
            recentDecisions: [],
        });

        for (const value of Object.values(breakdown)) {
            if (value === null) continue;
            expect(typeof value).toBe("number");
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThanOrEqual(100);
        }
    });
});

// ─── generateRecommendations ─────────────────────────────────────────────────

describe("generateRecommendations", () => {
    it("returns at least one recommendation for any input", () => {
        const recs = generateRecommendations(makeBreakdown());
        expect(recs.length).toBeGreaterThan(0);
    });

    it("returns a positive message when all dimensions are high", () => {
        const recs = generateRecommendations(makeBreakdown({
            toolQuality: 90, spendEfficiency: 90, coverageGaps: 90,
            riskExposure: 90, renewalHealth: 90, teamUtilization: 90,
        }));
        expect(recs[0]).toContain("strong");
    });

    it("flags low tool quality", () => {
        const recs = generateRecommendations(makeBreakdown({ toolQuality: 30 }));
        expect(recs.some(r => r.toLowerCase().includes("score"))).toBe(true);
    });

    it("flags low spend efficiency", () => {
        const recs = generateRecommendations(makeBreakdown({ spendEfficiency: 40 }));
        expect(recs.some(r => r.toLowerCase().includes("spend"))).toBe(true);
    });

    it("flags coverage gaps", () => {
        const recs = generateRecommendations(makeBreakdown({ coverageGaps: 30 }));
        expect(recs.some(r => r.toLowerCase().includes("gap") || r.toLowerCase().includes("coverage"))).toBe(true);
    });

    it("flags risk exposure", () => {
        const recs = generateRecommendations(makeBreakdown({ riskExposure: 50 }));
        expect(recs.some(r => r.toLowerCase().includes("risk"))).toBe(true);
    });

    it("flags upcoming renewals", () => {
        const recs = generateRecommendations(makeBreakdown({ renewalHealth: 40 }));
        expect(recs.some(r => r.toLowerCase().includes("renewal"))).toBe(true);
    });

    it("flags low team utilization", () => {
        const recs = generateRecommendations(makeBreakdown({ teamUtilization: 20 }));
        expect(recs.some(r => r.toLowerCase().includes("review") || r.toLowerCase().includes("note"))).toBe(true);
    });

    it("returns multiple recommendations when multiple dimensions are low", () => {
        const recs = generateRecommendations(makeBreakdown({
            toolQuality: 20, spendEfficiency: 30, coverageGaps: 10,
            riskExposure: 40, renewalHealth: 30, teamUtilization: 10,
        }));
        expect(recs.length).toBeGreaterThan(1);
    });
});
