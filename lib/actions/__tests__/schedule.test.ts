import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@/lib/db", () => ({
    db: {
        query: {
            workspaceMembers: { findFirst: vi.fn() },
            tools: { findFirst: vi.fn() },
        },
        update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn() })) })),
    },
}));

vi.mock("@clerk/nextjs/server", () => ({
    currentUser: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { updateResearchSchedule } from "@/lib/actions/schedule";
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
            const mockWhere = vi.fn().mockResolvedValue(undefined);
            const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
            vi.mocked(db.update).mockReturnValue({ set: mockSet } as never);

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
