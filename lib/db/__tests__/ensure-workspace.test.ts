import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            workspaceMembers: { findFirst: vi.fn() },
            workspaces: { findFirst: vi.fn() },
        },
        insert: vi.fn(),
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
        expect(result).toEqual({ workspaceId: "ws_1", workspace: MOCK_WORKSPACE, created: false });
        expect(db.insert).not.toHaveBeenCalled();
    });

    it("creates new workspace when user has none", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const newWorkspace = { id: "ws_new", name: "User's Workspace", slug: "ws-user_new" };

        // First insert (workspace) returns the new workspace
        // Second insert (member) returns nothing (void)
        (db.insert as ReturnType<typeof vi.fn>)
            .mockReturnValueOnce({
                values: vi.fn().mockReturnValue({
                    onConflictDoNothing: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([newWorkspace]),
                    }),
                }),
            })
            .mockReturnValueOnce({
                values: vi.fn().mockReturnValue({
                    onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
                }),
            });

        const result = await ensureWorkspace("user_new12345");
        expect(result.created).toBe(true);
        expect(result.workspaceId).toBe("ws_new");
        expect(db.insert).toHaveBeenCalledTimes(2);
    });

    it("uses displayName hint for workspace name", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const capturedValues: Array<Record<string, unknown>> = [];

        (db.insert as ReturnType<typeof vi.fn>)
            .mockReturnValueOnce({
                values: vi.fn().mockImplementation((v) => {
                    capturedValues.push(v);
                    return {
                        onConflictDoNothing: vi.fn().mockReturnValue({
                            returning: vi.fn().mockResolvedValue([{ id: "ws_1", slug: "ws-user_xyz" }]),
                        }),
                    };
                }),
            })
            .mockReturnValueOnce({
                values: vi.fn().mockReturnValue({
                    onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
                }),
            });

        await ensureWorkspace("user_xyz12345", { displayName: "Sarah" });
        expect((capturedValues[0].name as string)).toContain("Sarah");
    });

    it("falls back to email prefix when no displayName provided", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const capturedValues: Array<Record<string, unknown>> = [];

        (db.insert as ReturnType<typeof vi.fn>)
            .mockReturnValueOnce({
                values: vi.fn().mockImplementation((v) => {
                    capturedValues.push(v);
                    return {
                        onConflictDoNothing: vi.fn().mockReturnValue({
                            returning: vi.fn().mockResolvedValue([{ id: "ws_1", slug: "ws-user_xyz" }]),
                        }),
                    };
                }),
            })
            .mockReturnValueOnce({
                values: vi.fn().mockReturnValue({
                    onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
                }),
            });

        await ensureWorkspace("user_xyz12345", { email: "sarah@acme.com" });
        expect((capturedValues[0].name as string)).toContain("sarah");
    });

    it("falls back to 'User' when no hints provided", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const capturedValues: Array<Record<string, unknown>> = [];

        (db.insert as ReturnType<typeof vi.fn>)
            .mockReturnValueOnce({
                values: vi.fn().mockImplementation((v) => {
                    capturedValues.push(v);
                    return {
                        onConflictDoNothing: vi.fn().mockReturnValue({
                            returning: vi.fn().mockResolvedValue([{ id: "ws_1", slug: "ws-user_xyz" }]),
                        }),
                    };
                }),
            })
            .mockReturnValueOnce({
                values: vi.fn().mockReturnValue({
                    onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
                }),
            });

        await ensureWorkspace("user_xyz12345");
        expect((capturedValues[0].name as string)).toContain("User");
    });

    it("handles slug conflict: finds workspace by slug when INSERT returns nothing", async () => {
        // No existing member
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        // Workspace by slug lookup (race winner)
        (db.query.workspaces.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_WORKSPACE);

        // Workspace INSERT returns [] (conflict, not inserted)
        (db.insert as ReturnType<typeof vi.fn>)
            .mockReturnValueOnce({
                values: vi.fn().mockReturnValue({
                    onConflictDoNothing: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([]), // conflict — not created
                    }),
                }),
            })
            .mockReturnValueOnce({
                values: vi.fn().mockReturnValue({
                    onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
                }),
            });

        const result = await ensureWorkspace("user_abc12345");
        expect(result.created).toBe(false);
        expect(result.workspaceId).toBe("ws_1");
        expect(db.query.workspaces.findFirst).toHaveBeenCalled();
    });

    it("throws when workspace not found after slug conflict", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        // Workspace by slug also returns nothing (unexpected DB state)
        (db.query.workspaces.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

        (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({
            values: vi.fn().mockReturnValue({
                onConflictDoNothing: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([]), // conflict, not created
                }),
            }),
        });

        await expect(ensureWorkspace("user_abc12345")).rejects.toThrow();
    });

    it("logs and creates workspace when member exists but workspace is null (orphaned member)", async () => {
        // Orphaned member — workspace join returns null workspace
        const orphanedMember = { ...MOCK_MEMBER, workspace: null };
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(orphanedMember);
        // Should proceed to create a new workspace
        const newWorkspace = { id: "ws_new", slug: "ws-user_abc" };

        (db.insert as ReturnType<typeof vi.fn>)
            .mockReturnValueOnce({
                values: vi.fn().mockReturnValue({
                    onConflictDoNothing: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([newWorkspace]),
                    }),
                }),
            })
            .mockReturnValueOnce({
                values: vi.fn().mockReturnValue({
                    onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
                }),
            });

        const result = await ensureWorkspace("user_abc12345");
        expect(result.created).toBe(true);
        expect(result.workspaceId).toBe("ws_new");
    });
});
