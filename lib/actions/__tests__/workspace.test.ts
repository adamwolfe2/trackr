import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
    currentUser: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

vi.mock("@/lib/db/queries", () => ({
    getWorkspaceId: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            workspaceMembers: { findFirst: vi.fn() },
            workspaces: { findFirst: vi.fn() },
            subscriptions: { findFirst: vi.fn() },
            pendingInvitations: { findFirst: vi.fn() },
        },
        update: vi.fn(),
        insert: vi.fn(),
        delete: vi.fn(),
        select: vi.fn(),
    },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return {
        ...actual,
        eq: vi.fn((...args) => args),
        and: vi.fn((...args) => args),
        gt: vi.fn((...args) => args),
        count: vi.fn(() => "count"),
    };
});

vi.mock("@/lib/config/subscriptions", () => ({
    getPlanLimits: vi.fn().mockReturnValue({
        name: "Free",
        limits: { members: 3, research: 10 },
    }),
}));

vi.mock("@/lib/services/slack", () => ({
    disconnectSlack: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/email/resend", () => ({
    sendInviteEmail: vi.fn().mockResolvedValue(undefined),
}));

import { currentUser } from "@clerk/nextjs/server";
import { getWorkspaceId } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { getPlanLimits } from "@/lib/config/subscriptions";
import {
    updateWorkspaceName,
    inviteMember,
    removeMember,
    regenerateApiKey,
    updateSlackSettings,
    cancelInvitation,
} from "../workspace";

const MOCK_USER = { id: "user_1", firstName: "Adam", lastName: "Wolfe" };
const OWNER = { id: "mem_1", userId: "user_1", workspaceId: "ws_1", role: "owner" };
const ADMIN = { id: "mem_1", userId: "user_1", workspaceId: "ws_1", role: "admin" };
const VIEWER = { id: "mem_1", userId: "user_1", workspaceId: "ws_1", role: "viewer" };
const MEMBER_TO_REMOVE = { id: "mem_2", userId: "user_2", workspaceId: "ws_1", role: "viewer" };

/** Make db chainable: db.update/insert/delete return fluent objects */
function setupDbChains() {
    const where = vi.fn().mockResolvedValue({});
    const set = vi.fn().mockReturnValue({ where });
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set });

    const returning = vi.fn().mockResolvedValue([]);
    const onConflictDoNothing = vi.fn().mockResolvedValue({});
    const values = vi.fn().mockReturnValue({ returning, onConflictDoNothing });
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values });

    const deleteWhere = vi.fn().mockResolvedValue({});
    (db.delete as ReturnType<typeof vi.fn>).mockReturnValue({ where: deleteWhere });

    const fromWhere = vi.fn().mockResolvedValue([{ value: 1 }]);
    const from = vi.fn().mockReturnValue({ where: fromWhere });
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from });
}

describe("workspace server actions", () => {
    beforeEach(() => {
        // resetAllMocks clears queued mockResolvedValueOnce values too (unlike clearAllMocks)
        vi.resetAllMocks();
        setupDbChains();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_1");
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(OWNER);
        (db.query.workspaces.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "ws_1", name: "Acme" });
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        (db.query.pendingInvitations.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        // Restore getPlanLimits after vi.resetAllMocks() clears it
        (getPlanLimits as ReturnType<typeof vi.fn>).mockReturnValue({
            name: "Free",
            limits: { members: 3, research: 10 },
        });
    });

    describe("updateWorkspaceName", () => {
        it("throws Unauthorized when not logged in", async () => {
            (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            const fd = new FormData();
            fd.set("name", "New Name");
            await expect(updateWorkspaceName(fd)).rejects.toThrow("Unauthorized");
        });

        it("throws when name is empty", async () => {
            const fd = new FormData();
            fd.set("name", "");
            await expect(updateWorkspaceName(fd)).rejects.toThrow("Workspace name is required");
        });

        it("throws when name exceeds 200 characters", async () => {
            const fd = new FormData();
            fd.set("name", "x".repeat(201));
            await expect(updateWorkspaceName(fd)).rejects.toThrow("too long");
        });

        it("throws when no workspace found", async () => {
            (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            const fd = new FormData();
            fd.set("name", "New Name");
            await expect(updateWorkspaceName(fd)).rejects.toThrow("No workspace found");
        });

        it("throws when user is not owner or admin", async () => {
            (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(VIEWER);
            const fd = new FormData();
            fd.set("name", "New Name");
            await expect(updateWorkspaceName(fd)).rejects.toThrow("Only workspace owners");
        });

        it("succeeds for owner with valid name", async () => {
            const fd = new FormData();
            fd.set("name", "Acme Inc");
            const result = await updateWorkspaceName(fd);
            expect(result).toEqual({ success: true });
        });
    });

    describe("removeMember", () => {
        it("throws Unauthorized when not logged in", async () => {
            (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            await expect(removeMember("00000000-0000-0000-0000-000000000002")).rejects.toThrow("Unauthorized");
        });

        it("throws when current user is not owner or admin", async () => {
            (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(VIEWER);
            await expect(removeMember("00000000-0000-0000-0000-000000000002")).rejects.toThrow("Only workspace owners");
        });

        it("throws when member to remove is not found", async () => {
            (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>)
                .mockResolvedValueOnce(OWNER)         // current user check
                .mockResolvedValueOnce(null);          // member to remove
            await expect(removeMember("00000000-0000-0000-0000-000000000002")).rejects.toThrow("Member not found");
        });

        it("throws when trying to remove the workspace owner", async () => {
            (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>)
                .mockResolvedValueOnce(OWNER)                             // current user
                .mockResolvedValueOnce({ ...MEMBER_TO_REMOVE, role: "owner" }); // target is also owner
            await expect(removeMember("00000000-0000-0000-0000-000000000002")).rejects.toThrow("Cannot remove the workspace owner");
        });

        it("succeeds for valid non-owner member removal", async () => {
            (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>)
                .mockResolvedValueOnce(OWNER)           // current user
                .mockResolvedValueOnce(MEMBER_TO_REMOVE); // target viewer
            const result = await removeMember("00000000-0000-0000-0000-000000000002");
            expect(result).toEqual({ success: true });
        });
    });

    describe("regenerateApiKey", () => {
        it("throws Unauthorized when not logged in", async () => {
            (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            await expect(regenerateApiKey()).rejects.toThrow("Unauthorized");
        });

        it("throws when user is not owner or admin", async () => {
            (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(VIEWER);
            await expect(regenerateApiKey()).rejects.toThrow("Only workspace owners or admins");
        });

        it("returns a new API key with trk_ prefix", async () => {
            const key = await regenerateApiKey();
            expect(typeof key).toBe("string");
            expect(key).toMatch(/^trk_[a-f0-9]{32}$/);
        });

        it("returns a different key on each call", async () => {
            const key1 = await regenerateApiKey();
            const key2 = await regenerateApiKey();
            expect(key1).not.toBe(key2);
        });
    });

    describe("updateSlackSettings", () => {
        it("throws Unauthorized when not logged in", async () => {
            (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            await expect(updateSlackSettings("C001", true)).rejects.toThrow("Unauthorized");
        });

        it("throws when user is not owner or admin", async () => {
            (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(VIEWER);
            await expect(updateSlackSettings("C001", true)).rejects.toThrow(
                "Only workspace owners or admins"
            );
        });

        it("succeeds for admin updating slack settings", async () => {
            (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(ADMIN);
            const result = await updateSlackSettings("C001", true);
            expect(result).toEqual({ success: true });
        });

        it("succeeds with null channelId (disabling Slack)", async () => {
            const result = await updateSlackSettings(null, false);
            expect(result).toEqual({ success: true });
        });
    });

    const VALID_INV_UUID = "550e8400-e29b-41d4-a716-446655440099";

    describe("cancelInvitation", () => {
        it("throws for invalid (non-UUID) id", async () => {
            await expect(cancelInvitation("inv_1")).rejects.toThrow("Invalid invitation ID");
        });

        it("throws Unauthorized when not logged in", async () => {
            (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            await expect(cancelInvitation(VALID_INV_UUID)).rejects.toThrow("Unauthorized");
        });

        it("throws when user is not owner or admin", async () => {
            (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(VIEWER);
            await expect(cancelInvitation(VALID_INV_UUID)).rejects.toThrow("Only workspace owners or admins");
        });

        it("throws when invitation is not found in this workspace", async () => {
            // pendingInvitations.findFirst returns null (invitation not found)
            (db.query.pendingInvitations.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            await expect(cancelInvitation(VALID_INV_UUID)).rejects.toThrow("Invitation not found");
        });

        it("succeeds when owner cancels a valid invitation", async () => {
            (db.query.pendingInvitations.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
                id: VALID_INV_UUID,
                workspaceId: "ws_1",
                email: "invite@acme.com",
            });
            const result = await cancelInvitation(VALID_INV_UUID);
            expect(result).toEqual({ success: true });
        });
    });

    describe("inviteMember", () => {
        function makeFormData(email: string) {
            return { get: (key: string) => (key === "email" ? email : null) } as unknown as FormData;
        }

        it("throws Unauthorized when not logged in", async () => {
            (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            await expect(inviteMember(makeFormData("a@b.com"))).rejects.toThrow("Unauthorized");
        });

        it("throws when email is missing", async () => {
            await expect(inviteMember(makeFormData(""))).rejects.toThrow("Valid email is required");
        });

        it("throws when email format is invalid", async () => {
            await expect(inviteMember(makeFormData("not-an-email"))).rejects.toThrow("Valid email is required");
        });

        it("throws when no workspace found", async () => {
            (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            await expect(inviteMember(makeFormData("alice@acme.com"))).rejects.toThrow("No workspace found");
        });

        it("throws when user is not owner or admin", async () => {
            (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(VIEWER);
            await expect(inviteMember(makeFormData("alice@acme.com"))).rejects.toThrow("Only workspace owners can invite");
        });

        it("throws when member limit is reached", async () => {
            // memberCount = 3 (Free plan limit)
            const where = vi.fn().mockResolvedValue([{ value: 3 }]);
            const from = vi.fn().mockReturnValue({ where });
            (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from });
            await expect(inviteMember(makeFormData("alice@acme.com"))).rejects.toThrow(/allows up to 3 member/);
        });

        it("inserts a new invitation when none exists", async () => {
            (db.query.pendingInvitations.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            const result = await inviteMember(makeFormData("alice@acme.com"));
            expect(result).toMatchObject({ success: true, message: expect.stringContaining("alice@acme.com") });
            expect(db.insert).toHaveBeenCalledTimes(1);
        });

        it("does not insert a duplicate when an active invite already exists", async () => {
            (db.query.pendingInvitations.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
                id: "inv_existing",
                workspaceId: "ws_1",
                email: "alice@acme.com",
                expiresAt: new Date(Date.now() + 86400000),
            });
            const result = await inviteMember(makeFormData("alice@acme.com"));
            // Returns success (re-sends email) but does NOT insert a duplicate row
            expect(result).toMatchObject({ success: true });
            expect(db.insert).not.toHaveBeenCalled();
        });

        it("normalizes email to lowercase before inserting", async () => {
            (db.query.pendingInvitations.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            await inviteMember(makeFormData("  Alice@ACME.COM  "));
            // Action should succeed — the email is lowercased so it's valid
            expect(db.insert).toHaveBeenCalledTimes(1);
        });
    });
});
