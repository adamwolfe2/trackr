import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock db
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();

vi.mock("@/lib/db", () => ({
    db: {
        select: (...args: unknown[]) => {
            mockSelect(...args);
            return { from: (...fArgs: unknown[]) => { mockFrom(...fArgs); return { where: mockWhere }; } };
        },
    },
}));

vi.mock("@/lib/db/schema", () => ({
    apiLogs: {
        estimatedCost: "estimated_cost",
        workspaceId: "workspace_id",
        createdAt: "created_at",
    },
}));

// Need to mock drizzle operators
vi.mock("drizzle-orm", () => ({
    eq: vi.fn((...args: unknown[]) => ({ type: "eq", args })),
    gte: vi.fn((...args: unknown[]) => ({ type: "gte", args })),
    sql: vi.fn((...args: unknown[]) => ({ type: "sql", args })),
    and: vi.fn((...args: unknown[]) => ({ type: "and", args })),
}));

import { checkCostCap } from "../cost-cap";

describe("checkCostCap", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("allows when usage is under budget", async () => {
        mockWhere.mockResolvedValue([{ total: "0.50" }]);

        const result = await checkCostCap("ws-123", "free");

        expect(result.allowed).toBe(true);
        expect(result.warned).toBe(false);
        expect(result.usage).toBe(0.5);
        expect(result.budget).toBe(1);
        expect(result.pctUsed).toBe(50);
    });

    it("warns at 80% usage", async () => {
        mockWhere.mockResolvedValue([{ total: "0.85" }]);

        const result = await checkCostCap("ws-123", "free");

        expect(result.allowed).toBe(true);
        expect(result.warned).toBe(true);
        expect(result.pctUsed).toBe(85);
    });

    it("blocks at 100% usage", async () => {
        mockWhere.mockResolvedValue([{ total: "1.20" }]);

        const result = await checkCostCap("ws-123", "free");

        expect(result.allowed).toBe(false);
        expect(result.warned).toBe(false);
        expect(result.usage).toBe(1.2);
    });

    it("uses correct budget for team tier", async () => {
        mockWhere.mockResolvedValue([{ total: "12.00" }]);

        const result = await checkCostCap("ws-456", "team");

        expect(result.allowed).toBe(true);
        expect(result.warned).toBe(true); // 80% of 15
        expect(result.budget).toBe(15);
    });

    it("uses correct budget for enterprise tier", async () => {
        mockWhere.mockResolvedValue([{ total: "50.00" }]);

        const result = await checkCostCap("ws-789", "enterprise");

        expect(result.allowed).toBe(true);
        expect(result.warned).toBe(false);
        expect(result.budget).toBe(120);
    });

    it("handles zero usage", async () => {
        mockWhere.mockResolvedValue([{ total: "0" }]);

        const result = await checkCostCap("ws-new", "free");

        expect(result.allowed).toBe(true);
        expect(result.warned).toBe(false);
        expect(result.usage).toBe(0);
        expect(result.pctUsed).toBe(0);
    });
});
