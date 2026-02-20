import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            workspaceMembers: { findFirst: vi.fn() },
        },
        transaction: vi.fn(),
    },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return { ...actual, eq: vi.fn((...args) => args) };
});

import { db } from "@/lib/db";
import { ensureWorkspace } from "../ensure-workspace";

const MOCK_WORKSPACE = { id: "ws_1", name: "Adam's Workspace", slug: "ws-user_abc" };
const MOCK_MEMBER = { id: "mem_1", userId: "user_abc12345", workspaceId: "ws_1", workspace: MOCK_WORKSPACE };

describe("ensureWorkspace", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("returns existing workspace when user already has one", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_MEMBER);
        const result = await ensureWorkspace("user_abc12345");
        expect(result).toEqual({
            workspaceId: "ws_1",
            workspace: MOCK_WORKSPACE,
            created: false,
        });
        expect(db.transaction).not.toHaveBeenCalled();
    });

    it("creates new workspace in a transaction when user has none", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const newWorkspace = { id: "ws_new", name: "User's Workspace", slug: "ws-user_new" };
        (db.transaction as ReturnType<typeof vi.fn>).mockImplementation(async (fn) => {
            const tx = {
                insert: vi.fn().mockReturnValue({
                    values: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([newWorkspace]),
                    }),
                }),
            };
            return fn(tx);
        });

        const result = await ensureWorkspace("user_new12345");
        expect(result.created).toBe(true);
        expect(result.workspaceId).toBe("ws_new");
        expect(db.transaction).toHaveBeenCalledTimes(1);
    });

    it("uses displayName hint for workspace name", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const capturedValues: Array<Record<string, unknown>> = [];
        (db.transaction as ReturnType<typeof vi.fn>).mockImplementation(async (fn) => {
            const tx = {
                insert: vi.fn().mockReturnValue({
                    values: vi.fn().mockImplementation((v) => {
                        capturedValues.push(v);
                        return { returning: vi.fn().mockResolvedValue([{ id: "ws_1" }]) };
                    }),
                }),
            };
            return fn(tx);
        });

        await ensureWorkspace("user_xyz12345", { displayName: "Sarah" });
        const wsValues = capturedValues[0];
        expect((wsValues.name as string)).toContain("Sarah");
    });

    it("falls back to email prefix when no displayName provided", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const capturedValues: Array<Record<string, unknown>> = [];
        (db.transaction as ReturnType<typeof vi.fn>).mockImplementation(async (fn) => {
            const tx = {
                insert: vi.fn().mockReturnValue({
                    values: vi.fn().mockImplementation((v) => {
                        capturedValues.push(v);
                        return { returning: vi.fn().mockResolvedValue([{ id: "ws_1" }]) };
                    }),
                }),
            };
            return fn(tx);
        });

        await ensureWorkspace("user_xyz12345", { email: "sarah@acme.com" });
        const wsValues = capturedValues[0];
        expect((wsValues.name as string)).toContain("sarah");
    });

    it("falls back to 'User' when no hints provided", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const capturedValues: Array<Record<string, unknown>> = [];
        (db.transaction as ReturnType<typeof vi.fn>).mockImplementation(async (fn) => {
            const tx = {
                insert: vi.fn().mockReturnValue({
                    values: vi.fn().mockImplementation((v) => {
                        capturedValues.push(v);
                        return { returning: vi.fn().mockResolvedValue([{ id: "ws_1" }]) };
                    }),
                }),
            };
            return fn(tx);
        });

        await ensureWorkspace("user_xyz12345");
        const wsValues = capturedValues[0];
        expect((wsValues.name as string)).toContain("User");
    });

    it("handles race condition: re-queries after unique constraint violation", async () => {
        // First findFirst returns null (no workspace)
        // Transaction throws unique constraint error
        // Second findFirst (in catch block) returns the race winner
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>)
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(MOCK_MEMBER);

        (db.transaction as ReturnType<typeof vi.fn>).mockRejectedValue(
            new Error("unique constraint violation on slug")
        );

        const result = await ensureWorkspace("user_abc12345");
        expect(result.created).toBe(false);
        expect(result.workspaceId).toBe("ws_1");
    });

    it("re-throws when race condition recovery also finds nothing", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>)
            .mockResolvedValueOnce(null)  // initial check
            .mockResolvedValueOnce(null); // recovery check also fails

        (db.transaction as ReturnType<typeof vi.fn>).mockRejectedValue(
            new Error("unique constraint violation")
        );

        await expect(ensureWorkspace("user_abc12345")).rejects.toThrow("unique constraint violation");
    });
});
