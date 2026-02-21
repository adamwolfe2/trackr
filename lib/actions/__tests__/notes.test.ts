import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
    currentUser: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

const { mockDbInsertValues } = vi.hoisted(() => {
    const mockDbInsertValues = vi.fn().mockResolvedValue({});
    return { mockDbInsertValues };
});

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            workspaceMembers: { findFirst: vi.fn() },
            tools: { findFirst: vi.fn() },
        },
        insert: vi.fn().mockReturnValue({ values: mockDbInsertValues }),
    },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return { ...actual, eq: vi.fn((...args) => args), and: vi.fn((...args) => args) };
});

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { addNote } from "../notes";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

const MOCK_USER = { id: "user_1" };
const MOCK_MEMBER = { id: "mem_1", userId: "user_1", workspaceId: "ws_1" };
const MOCK_TOOL = { id: VALID_UUID, workspaceId: "ws_1", name: "Linear" };

describe("addNote", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_MEMBER);
        (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_TOOL);
    });

    it("throws Unauthorized when not authenticated", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(addNote(VALID_UUID, "Some note content")).rejects.toThrow("Unauthorized");
    });

    it("throws when user is not a workspace member", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(addNote(VALID_UUID, "Some note content")).rejects.toThrow(
            "not a member of any workspace"
        );
    });

    it("throws when tool is not found (workspace-scoped query returns null)", async () => {
        (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        // Now returns "Not authorized" (unified message — workspace-scoped query returns null
        // for both missing tools and tools from other workspaces)
        await expect(addNote(VALID_UUID, "Some note content")).rejects.toThrow("Not authorized");
    });

    it("throws when tool belongs to a different workspace (workspace-scoped query returns null)", async () => {
        // Simulate workspace-scoped query returning null (tool exists but not in caller's workspace)
        (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(addNote(VALID_UUID, "Some note content")).rejects.toThrow("Not authorized");
    });

    it("throws when content is empty (Zod validation)", async () => {
        await expect(addNote(VALID_UUID, "")).rejects.toThrow("cannot be empty");
    });

    it("throws when content exceeds 10000 characters", async () => {
        await expect(addNote(VALID_UUID, "x".repeat(10001))).rejects.toThrow("too long");
    });

    it("throws when toolId is not a valid UUID (Zod validation)", async () => {
        await expect(addNote("not-a-uuid", "Valid content here")).rejects.toThrow();
    });

    it("inserts the note and returns success for valid input", async () => {
        const result = await addNote(VALID_UUID, "This is a useful note about Linear.");
        expect(result).toEqual({ success: true });
        expect(mockDbInsertValues).toHaveBeenCalledTimes(1);
        const insertCall = mockDbInsertValues.mock.calls[0][0];
        expect(insertCall.toolId).toBe(VALID_UUID);
        expect(insertCall.content).toBe("This is a useful note about Linear.");
        expect(insertCall.workspaceMemberId).toBe("mem_1");
        expect(insertCall.noteType).toBe("general");
    });
});
