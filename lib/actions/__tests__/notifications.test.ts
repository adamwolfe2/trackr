import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
    currentUser: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            workspaceMembers: { findFirst: vi.fn() },
            researchJobs: { findMany: vi.fn() },
            softwareSpend: { findMany: vi.fn() },
            toolSuggestions: { findMany: vi.fn() },
        },
        update: vi.fn(),
    },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return {
        ...actual,
        eq: vi.fn((...args) => args),
        and: vi.fn((...args) => args),
        ne: vi.fn((...args) => args),
        desc: vi.fn((col) => col),
        gte: vi.fn((...args) => args),
        lte: vi.fn((...args) => args),
    };
});

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getNotifications, markNotificationsRead } from "../notifications";

const MOCK_USER = { id: "user_1" };
const MOCK_MEMBER = {
    id: "mem_1",
    userId: "user_1",
    workspaceId: "ws_1",
    seenJobIds: [],
};

describe("getNotifications", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_MEMBER);
        (db.query.researchJobs.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.toolSuggestions.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    });

    it("returns empty array when not logged in", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const result = await getNotifications();
        expect(result).toEqual([]);
    });

    it("returns empty array when no workspace member found", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const result = await getNotifications();
        expect(result).toEqual([]);
    });

    it("returns empty array when there are no jobs, renewals, or suggestions", async () => {
        const result = await getNotifications();
        expect(result).toEqual([]);
    });

    it("returns job_complete notification for completed research jobs in this workspace", async () => {
        (db.query.researchJobs.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            {
                id: "job_1",
                status: "complete",
                toolId: "tool_1",
                completedAt: new Date("2026-02-01"),
                triggeredAt: new Date("2026-02-01"),
                tool: { id: "tool_1", workspaceId: "ws_1", name: "Linear" },
            },
        ]);
        const result = await getNotifications();
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe("job_complete");
        expect(result[0].read).toBe(false);
        expect(result[0].link).toBe("/tools/tool_1");
    });

    it("returns job_failed notification for failed research jobs", async () => {
        (db.query.researchJobs.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            {
                id: "job_2",
                status: "failed",
                toolId: "tool_1",
                completedAt: null,
                triggeredAt: new Date("2026-02-01"),
                tool: { id: "tool_1", workspaceId: "ws_1", name: "HubSpot" },
            },
        ]);
        const result = await getNotifications();
        expect(result[0].type).toBe("job_failed");
        expect(result[0].title).toBe("Research Failed");
    });

    it("filters out jobs from other workspaces", async () => {
        (db.query.researchJobs.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            {
                id: "job_other",
                status: "complete",
                toolId: "tool_x",
                completedAt: new Date("2026-02-01"),
                triggeredAt: new Date("2026-02-01"),
                tool: { id: "tool_x", workspaceId: "ws_OTHER", name: "Stranger Tool" },
            },
        ]);
        const result = await getNotifications();
        expect(result).toHaveLength(0);
    });

    it("marks notification as read when jobId is in seenJobIds", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            ...MOCK_MEMBER,
            seenJobIds: ["job_seen"],
        });
        (db.query.researchJobs.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            {
                id: "job_seen",
                status: "complete",
                toolId: "tool_1",
                completedAt: new Date(),
                triggeredAt: new Date(),
                tool: { id: "tool_1", workspaceId: "ws_1", name: "Linear" },
            },
        ]);
        const result = await getNotifications();
        expect(result[0].read).toBe(true);
    });

    it("returns renewal_soon notification for upcoming renewals", async () => {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { id: "spend_1", toolName: "Slack", renewalDate: tomorrow },
        ]);
        const result = await getNotifications();
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe("renewal_soon");
        expect(result[0].link).toBe("/stack");
    });

    it("returns new_suggestion notification for recent suggestions", async () => {
        (db.query.toolSuggestions.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            {
                id: "sug_1",
                toolName: "Loom",
                reason: "Used by many similar teams for async video",
                createdAt: new Date(),
            },
        ]);
        const result = await getNotifications();
        expect(result[0].type).toBe("new_suggestion");
        expect(result[0].link).toBe("/feed");
    });

    it("combines and sorts all notification types by date (newest first)", async () => {
        const oldDate = new Date("2026-01-01");
        const newDate = new Date("2026-02-15");

        (db.query.researchJobs.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            {
                id: "job_old",
                status: "complete",
                toolId: "tool_1",
                completedAt: oldDate,
                triggeredAt: oldDate,
                tool: { id: "tool_1", workspaceId: "ws_1", name: "OldTool" },
            },
        ]);
        (db.query.toolSuggestions.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            {
                id: "sug_new",
                toolName: "NewTool",
                reason: "trending",
                createdAt: newDate,
            },
        ]);

        const result = await getNotifications();
        expect(result).toHaveLength(2);
        // Newest first
        expect(result[0].type).toBe("new_suggestion");
        expect(result[1].type).toBe("job_complete");
    });

    it("truncates suggestion reason to 80 chars in message", async () => {
        const longReason = "x".repeat(100);
        (db.query.toolSuggestions.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { id: "sug_1", toolName: "Loom", reason: longReason, createdAt: new Date() },
        ]);
        const result = await getNotifications();
        expect(result[0].message).toContain("x".repeat(80));
        expect(result[0].message.length).toBeLessThan(longReason.length + 20);
    });
});

describe("markNotificationsRead", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_MEMBER);

        const updateWhere = vi.fn().mockResolvedValue({});
        const updateSet = vi.fn().mockReturnValue({ where: updateWhere });
        (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: updateSet });
    });

    it("does nothing when not logged in", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await markNotificationsRead(["job_1"]);
        expect(db.update).not.toHaveBeenCalled();
    });

    it("does nothing when notificationIds is empty", async () => {
        await markNotificationsRead([]);
        expect(db.update).not.toHaveBeenCalled();
    });

    it("throws when notificationIds exceeds 500", async () => {
        const ids = Array.from({ length: 501 }, (_, i) => `id_${i}`);
        await expect(markNotificationsRead(ids)).rejects.toThrow("Too many notification IDs");
    });

    it("does nothing when member is not found", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await markNotificationsRead(["job_1"]);
        expect(db.update).not.toHaveBeenCalled();
    });

    it("merges new IDs with existing seenJobIds deduplicating", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            ...MOCK_MEMBER,
            seenJobIds: ["job_old"],
        });
        await markNotificationsRead(["job_old", "job_new"]);
        const setArgs = (
            (db.update as ReturnType<typeof vi.fn>).mock.results[0].value.set as ReturnType<typeof vi.fn>
        ).mock.calls[0][0];
        // job_old should only appear once (deduped via Set)
        expect(setArgs.seenJobIds).toEqual(expect.arrayContaining(["job_old", "job_new"]));
        expect(setArgs.seenJobIds.filter((id: string) => id === "job_old")).toHaveLength(1);
    });

    it("caps seenJobIds at 200 entries to prevent unbounded growth", async () => {
        // Start with 195 existing IDs
        const existing = Array.from({ length: 195 }, (_, i) => `old_${i}`);
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            ...MOCK_MEMBER,
            seenJobIds: existing,
        });
        // Add 10 new ones → merged total = 205 → capped at 200
        const newIds = Array.from({ length: 10 }, (_, i) => `new_${i}`);
        await markNotificationsRead(newIds);
        const setArgs = (
            (db.update as ReturnType<typeof vi.fn>).mock.results[0].value.set as ReturnType<typeof vi.fn>
        ).mock.calls[0][0];
        expect(setArgs.seenJobIds).toHaveLength(200);
    });
});
