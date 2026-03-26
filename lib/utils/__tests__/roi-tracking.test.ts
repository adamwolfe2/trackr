import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            auditSubmissions: { findFirst: vi.fn() },
        },
        select: vi.fn(),
    },
}));

vi.mock("@/lib/db/schema", () => ({
    auditSubmissions: {},
    softwareSpend: { workspaceId: "workspaceId", toolName: "toolName" },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return {
        ...actual,
        eq: vi.fn((...args: unknown[]) => args),
        and: vi.fn((...args: unknown[]) => args),
    };
});

import { db } from "@/lib/db";
import { getROIForWorkspace } from "../roi-tracking";

function setupSelectChain(rows: Array<{ toolName: string }>) {
    const whereRes = vi.fn().mockResolvedValue(rows);
    const fromRes = vi.fn().mockReturnValue({ where: whereRes });
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: fromRes });
}

describe("getROIForWorkspace", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupSelectChain([]);
    });

    it("returns null when no audit submission exists", async () => {
        (db.query.auditSubmissions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const result = await getROIForWorkspace("ws_1");
        expect(result).toBeNull();
    });

    it("returns null when submission exists but scorecard is null", async () => {
        (db.query.auditSubmissions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            scorecard: null,
        });
        const result = await getROIForWorkspace("ws_1");
        expect(result).toBeNull();
    });

    it("returns null when scorecard has no roiProjection", async () => {
        (db.query.auditSubmissions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            scorecard: { aiNativeScore: { score: 50 } },
        });
        const result = await getROIForWorkspace("ws_1");
        expect(result).toBeNull();
    });

    it("returns null when recommendedTools is empty", async () => {
        (db.query.auditSubmissions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            scorecard: {
                roiProjection: {
                    currentAnnualWaste: 50000,
                    projectedSavings: 30000,
                    paybackMonths: 4,
                    assumptions: [],
                },
                recommendedTools: [],
            },
        });
        const result = await getROIForWorkspace("ws_1");
        expect(result).toBeNull();
    });

    it("calculates correct adoption rate: 2 of 4 recommended tools = 50%", async () => {
        (db.query.auditSubmissions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            scorecard: {
                roiProjection: {
                    currentAnnualWaste: 60000,
                    projectedSavings: 40000,
                    paybackMonths: 3,
                    assumptions: ["Assumption 1"],
                },
                recommendedTools: [
                    { name: "HubSpot" },
                    { name: "Notion" },
                    { name: "Slack" },
                    { name: "Linear" },
                ],
            },
        });
        setupSelectChain([
            { toolName: "HubSpot" },
            { toolName: "Notion" },
        ]);

        const result = await getROIForWorkspace("ws_1");
        expect(result).not.toBeNull();
        expect(result!.adoptionRate).toBe(50);
        expect(result!.recommendedTools.filter(t => t.adopted)).toHaveLength(2);
    });

    it("matches tools case-insensitively: 'HubSpot' matches 'hubspot'", async () => {
        (db.query.auditSubmissions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            scorecard: {
                roiProjection: {
                    currentAnnualWaste: 60000,
                    projectedSavings: 40000,
                    paybackMonths: 3,
                    assumptions: [],
                },
                recommendedTools: [{ name: "HubSpot" }],
            },
        });
        setupSelectChain([{ toolName: "hubspot" }]);

        const result = await getROIForWorkspace("ws_1");
        expect(result).not.toBeNull();
        expect(result!.adoptionRate).toBe(100);
        expect(result!.recommendedTools[0].adopted).toBe(true);
    });

    it("calculates adjusted savings: projectedSavings * adoptionRate / 100", async () => {
        (db.query.auditSubmissions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            scorecard: {
                roiProjection: {
                    currentAnnualWaste: 80000,
                    projectedSavings: 40000,
                    paybackMonths: 6,
                    assumptions: ["A1", "A2"],
                },
                recommendedTools: [
                    { name: "Slack" },
                    { name: "Linear" },
                ],
            },
        });
        setupSelectChain([{ toolName: "Slack" }]);

        const result = await getROIForWorkspace("ws_1");
        expect(result).not.toBeNull();
        expect(result!.adoptionRate).toBe(50);
        expect(result!.adjustedSavings).toBe(20000);
    });

    it("zero adoption: 0 tools adopted = 0% rate = $0 adjusted savings", async () => {
        (db.query.auditSubmissions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            scorecard: {
                roiProjection: {
                    currentAnnualWaste: 80000,
                    projectedSavings: 40000,
                    paybackMonths: 6,
                    assumptions: [],
                },
                recommendedTools: [
                    { name: "Slack" },
                    { name: "Linear" },
                ],
            },
        });
        setupSelectChain([]);

        const result = await getROIForWorkspace("ws_1");
        expect(result).not.toBeNull();
        expect(result!.adoptionRate).toBe(0);
        expect(result!.adjustedSavings).toBe(0);
    });

    it("full adoption: all tools adopted = 100% rate = full projected savings", async () => {
        (db.query.auditSubmissions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            scorecard: {
                roiProjection: {
                    currentAnnualWaste: 80000,
                    projectedSavings: 40000,
                    paybackMonths: 6,
                    assumptions: [],
                },
                recommendedTools: [
                    { name: "Slack" },
                    { name: "Linear" },
                ],
            },
        });
        setupSelectChain([
            { toolName: "Slack" },
            { toolName: "Linear" },
        ]);

        const result = await getROIForWorkspace("ws_1");
        expect(result).not.toBeNull();
        expect(result!.adoptionRate).toBe(100);
        expect(result!.adjustedSavings).toBe(40000);
        expect(result!.projectedAnnualSavings).toBe(40000);
        expect(result!.currentAnnualWaste).toBe(80000);
        expect(result!.paybackMonths).toBe(6);
    });
});
