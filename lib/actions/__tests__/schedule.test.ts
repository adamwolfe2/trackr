import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted so mocks are available inside vi.mock factory
const { mockReturning, mockWhere, mockSet, mockUpdate } = vi.hoisted(() => {
    const mockReturning = vi.fn().mockResolvedValue([{ id: "00000000-0000-0000-0000-000000000002" }]);
    const mockWhere = vi.fn(() => ({ returning: mockReturning }));
    const mockSet = vi.fn(() => ({ where: mockWhere }));
    const mockUpdate = vi.fn(() => ({ set: mockSet }));
    return { mockReturning, mockWhere, mockSet, mockUpdate };
});

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            workspaceMembers: { findFirst: vi.fn() },
            tools: { findFirst: vi.fn() },
        },
        update: mockUpdate,
    },
}));

vi.mock("@clerk/nextjs/server", () => ({
    currentUser: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { updateResearchSchedule, updateBulkResearchSchedule } from "@/lib/actions/schedule";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

const mockMember = { workspaceId: "00000000-0000-0000-0000-000000000001" };
const mockTool = { id: "00000000-0000-0000-0000-000000000002" };
const VALID_TOOL_ID = "00000000-0000-0000-0000-000000000002";

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(currentUser).mockResolvedValue({ id: "user_1" } as ReturnType<typeof currentUser> extends Promise<infer T> ? T : never);
    vi.mocked(db.query.workspaceMembers.findFirst).mockResolvedValue(mockMember as never);
    vi.mocked(db.query.tools.findFirst).mockResolvedValue(mockTool as never);
    // Reset update chain
    mockReturning.mockResolvedValue([{ id: VALID_TOOL_ID }]);
    mockWhere.mockReturnValue({ returning: mockReturning });
    mockSet.mockReturnValue({ where: mockWhere });
    mockUpdate.mockReturnValue({ set: mockSet });
});

describe("updateResearchSchedule", () => {
    it("rejects non-UUID tool IDs", async () => {
        const result = await updateResearchSchedule("not-a-uuid", "weekly");
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/Invalid tool ID/i);
    });

    it("rejects invalid intervals", async () => {
        const result = await updateResearchSchedule(VALID_TOOL_ID, "daily" as never);
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/Invalid interval/i);
    });

    it("returns error when user not authenticated", async () => {
        vi.mocked(currentUser).mockResolvedValue(null);
        const result = await updateResearchSchedule(VALID_TOOL_ID, "weekly");
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/Not authenticated/i);
    });

    it("accepts valid intervals", async () => {
        for (const interval of ["manual", "weekly", "biweekly", "monthly"] as const) {
            vi.clearAllMocks();
            vi.mocked(currentUser).mockResolvedValue({ id: "user_1" } as ReturnType<typeof currentUser> extends Promise<infer T> ? T : never);
            vi.mocked(db.query.workspaceMembers.findFirst).mockResolvedValue(mockMember as never);
            vi.mocked(db.query.tools.findFirst).mockResolvedValue(mockTool as never);
            const whereInner = vi.fn().mockResolvedValue(undefined);
            const setInner = vi.fn().mockReturnValue({ where: whereInner });
            mockUpdate.mockReturnValue({ set: setInner });

            const result = await updateResearchSchedule(VALID_TOOL_ID, interval);
            expect(result.success).toBe(true);
        }
    });

    it("returns error if tool not found in workspace", async () => {
        vi.mocked(db.query.tools.findFirst).mockResolvedValue(undefined as never);
        const result = await updateResearchSchedule(VALID_TOOL_ID, "weekly");
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/Tool not found/i);
    });
});

describe("updateBulkResearchSchedule", () => {
    const VALID_ID_1 = "00000000-0000-0000-0000-000000000002";
    const VALID_ID_2 = "00000000-0000-0000-0000-000000000003";

    it("rejects empty array", async () => {
        const result = await updateBulkResearchSchedule([], "weekly");
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/No tools selected/i);
    });

    it("rejects invalid tool IDs", async () => {
        const result = await updateBulkResearchSchedule(["not-a-uuid"], "weekly");
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/Invalid tool ID/i);
    });

    it("rejects invalid interval", async () => {
        const result = await updateBulkResearchSchedule([VALID_ID_1], "daily" as never);
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/Invalid interval/i);
    });

    it("returns error when unauthenticated", async () => {
        vi.mocked(currentUser).mockResolvedValue(null);
        const result = await updateBulkResearchSchedule([VALID_ID_1], "weekly");
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/Not authenticated/i);
    });

    it("updates multiple tools and returns count", async () => {
        mockReturning.mockResolvedValue([{ id: VALID_ID_1 }, { id: VALID_ID_2 }]);
        const result = await updateBulkResearchSchedule([VALID_ID_1, VALID_ID_2], "monthly");
        expect(result.success).toBe(true);
        expect(result.updated).toBe(2);
    });
});
