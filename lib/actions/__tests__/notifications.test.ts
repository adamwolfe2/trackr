import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
    currentUser: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

vi.mock("@/lib/db", () => {
    // Chainable mock for db.select().from().where() — built inline so hoisting works
    const whereImpl = () => Promise.resolve([{ value: 0 }]);
    const fromImpl = () => ({ where: whereImpl });
    const selectImpl = () => ({ from: fromImpl });

    return {
        db: {
            query: {
                workspaceMembers: { findFirst: vi.fn() },
                researchJobs: { findMany: vi.fn() },
                softwareSpend: { findMany: vi.fn() },
                toolSuggestions: { findMany: vi.fn() },
                referrals: { findFirst: vi.fn() },
                subscriptions: { findFirst: vi.fn() },
                tools: { findMany: vi.fn(), findFirst: vi.fn() },
            },
            select: selectImpl,
            update: vi.fn(),
        },
    };
});

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
        lt: vi.fn((...args) => args),
        isNotNull: vi.fn((col) => col),
        count: vi.fn(() => "count()"),
        inArray: vi.fn((...args) => args),
    };
});

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getNotifications, markNotificationsRead } from "../notifications";

vi.mock("@/lib/db/schema", () => ({
    researchJobs: {},
    workspaceMembers: {},
    softwareSpend: {},
    toolSuggestions: {},
    subscriptions: {},
    tools: {},
}));

vi.mock("@/lib/config/subscriptions", () => ({
    getPlanLimits: vi.fn(() => ({
        name: "Free",
        slug: "free",
        limits: { research: 5, tools: 15, members: 1, competitors: 0 },
        features: {},
    })),
}));

vi.mock("@/lib/db/referrals-schema", () => ({
    referrals: {},
}));

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
        (db.query.referrals.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
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

    it("returns no job notifications when DB query returns empty (workspace-scoped at DB level)", async () => {
        // The DB query now filters by workspace via inArray subquery, so cross-workspace
        // jobs are never returned. Verify the code handles an empty result correctly.
        (db.query.researchJobs.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
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
        const JOB_OLD = "00000000-0000-0000-0000-000000000001";
        const JOB_NEW = "00000000-0000-0000-0000-000000000002";
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            ...MOCK_MEMBER,
            seenJobIds: [JOB_OLD],
        });
        await markNotificationsRead([JOB_OLD, JOB_NEW]);
        const setArgs = (
            (db.update as ReturnType<typeof vi.fn>).mock.results[0].value.set as ReturnType<typeof vi.fn>
        ).mock.calls[0][0];
        // JOB_OLD should only appear once (deduped via Set)
        expect(setArgs.seenJobIds).toEqual(expect.arrayContaining([JOB_OLD, JOB_NEW]));
        expect(setArgs.seenJobIds.filter((id: string) => id === JOB_OLD)).toHaveLength(1);
    });

    it("persists updated seenJobIds to database", async () => {
        const JOB_NEW = "00000000-0000-0000-0000-000000000002";
        await markNotificationsRead([JOB_NEW]);
        expect(db.update).toHaveBeenCalledTimes(1);
        const setArgs = (
            (db.update as ReturnType<typeof vi.fn>).mock.results[0].value.set as ReturnType<typeof vi.fn>
        ).mock.calls[0][0];
        expect(setArgs.seenJobIds).toContain(JOB_NEW);
    });

    it("caps seenJobIds at 200 entries to prevent unbounded growth", async () => {
        // Start with 195 existing IDs (stored in DB — format doesn't matter for existing)
        const existing = Array.from({ length: 195 }, (_, i) => `existing-id-${i}`);
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            ...MOCK_MEMBER,
            seenJobIds: existing,
        });
        // Add 10 new valid UUIDs → merged total = 205 → capped at 200
        const newIds = Array.from({ length: 10 }, (_, i) =>
            `00000000-0000-0000-0000-${String(i).padStart(12, "0")}`
        );
        await markNotificationsRead(newIds);
        const setArgs = (
            (db.update as ReturnType<typeof vi.fn>).mock.results[0].value.set as ReturnType<typeof vi.fn>
        ).mock.calls[0][0];
        expect(setArgs.seenJobIds).toHaveLength(200);
    });

    it("stores compound notification IDs like renewal-<uuid>, stale-<uuid>, sub-<uuid>", async () => {
        // Previously these were silently dropped because the UUID-only regex rejected them.
        // They must now be accepted so non-job notifications can be marked as read.
        const compoundIds = [
            "renewal-00000000-0000-0000-0000-000000000001",
            "stale-00000000-0000-0000-0000-000000000002",
            "suggestion-00000000-0000-0000-0000-000000000003",
            "sub-00000000-0000-0000-0000-000000000004",
            "referral-00000000-0000-0000-0000-000000000005",
            "renewal-decision-00000000-0000-0000-0000-000000000006",
        ];
        await markNotificationsRead(compoundIds);
        expect(db.update).toHaveBeenCalledTimes(1);
        const setArgs = (
            (db.update as ReturnType<typeof vi.fn>).mock.results[0].value.set as ReturnType<typeof vi.fn>
        ).mock.calls[0][0];
        expect(setArgs.seenJobIds).toEqual(expect.arrayContaining(compoundIds));
    });

    it("still rejects IDs with spaces, quotes, or other unsafe characters", async () => {
        const unsafeIds = [
            "valid-id-123", // this one is valid
            "id with spaces",
            "id'with'quotes",
            "id<with>tags",
            "", // empty
        ];
        await markNotificationsRead(unsafeIds);
        const setArgs = (
            (db.update as ReturnType<typeof vi.fn>).mock.results[0].value.set as ReturnType<typeof vi.fn>
        ).mock.calls[0][0];
        // Only the valid-id-123 should be stored
        expect(setArgs.seenJobIds).toContain("valid-id-123");
        expect(setArgs.seenJobIds).not.toContain("id with spaces");
        expect(setArgs.seenJobIds).not.toContain("id'with'quotes");
        expect(setArgs.seenJobIds).not.toContain("");
    });
});

describe("getNotifications — referral_signup type", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_MEMBER);
        (db.query.researchJobs.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.toolSuggestions.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.referrals.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    });

    it("returns no referral notification when referral row is null", async () => {
        const result = await getNotifications();
        expect(result.some(n => n.type === "referral_signup")).toBe(false);
    });

    it("returns no referral notification when signups is 0", async () => {
        (db.query.referrals.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "ref_1",
            referrerWorkspaceId: "ws_1",
            code: "ABC123",
            signups: 0,
            clicks: 5,
            createdAt: new Date(),
        });
        const result = await getNotifications();
        expect(result.some(n => n.type === "referral_signup")).toBe(false);
    });

    it("returns referral_signup notification when signups > 0", async () => {
        (db.query.referrals.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "ref_1",
            referrerWorkspaceId: "ws_1",
            code: "ABC123",
            signups: 3,
            clicks: 10,
            createdAt: new Date(),
        });
        const result = await getNotifications();
        const notification = result.find(n => n.type === "referral_signup");
        expect(notification).toBeDefined();
        expect(notification?.title).toBe("Referral Signups");
        expect(notification?.message).toContain("3 workspaces");
        expect(notification?.message).toContain("15 research credits");
        expect(notification?.link).toBe("/referrals");
    });

    it("uses singular 'workspace' when signups is 1", async () => {
        (db.query.referrals.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "ref_1",
            referrerWorkspaceId: "ws_1",
            code: "ABC123",
            signups: 1,
            clicks: 2,
            createdAt: new Date(),
        });
        const result = await getNotifications();
        const notification = result.find(n => n.type === "referral_signup");
        expect(notification?.message).toContain("1 workspace signed up");
    });
});

describe("getNotifications — subscription_change type", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_MEMBER);
        (db.query.researchJobs.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.toolSuggestions.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.referrals.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    });

    it("returns no subscription notification when no subscription exists", async () => {
        const result = await getNotifications();
        expect(result.some(n => n.type === "subscription_change")).toBe(false);
    });

    it("returns subscription_change notification for past_due status", async () => {
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "sub_1",
            workspaceId: "ws_1",
            status: "past_due",
            planId: "price_team",
            currentPeriodEnd: null,
            updatedAt: new Date(),
            creditBalance: 0,
        });
        const result = await getNotifications();
        const notification = result.find(n => n.type === "subscription_change");
        expect(notification).toBeDefined();
        expect(notification?.title).toBe("Payment Due");
        expect(notification?.link).toBe("/settings/billing");
    });

    it("returns subscription_change notification for canceled status", async () => {
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "sub_1",
            workspaceId: "ws_1",
            status: "canceled",
            planId: "price_team",
            currentPeriodEnd: null,
            updatedAt: new Date(),
            creditBalance: 0,
        });
        const result = await getNotifications();
        const notification = result.find(n => n.type === "subscription_change");
        expect(notification?.title).toBe("Subscription Cancelled");
    });

    it("returns trial ending notification when trialing with < 3 days left", async () => {
        const soonEnd = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "sub_1",
            workspaceId: "ws_1",
            status: "trialing",
            planId: "price_team",
            currentPeriodEnd: soonEnd,
            updatedAt: new Date(),
            creditBalance: 0,
        });
        const result = await getNotifications();
        const notification = result.find(n => n.type === "subscription_change");
        expect(notification?.title).toBe("Trial Ending Soon");
        expect(notification?.link).toBe("/settings/billing");
    });

    it("returns no trial notification when trialing with > 3 days left", async () => {
        const farEnd = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days from now
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "sub_1",
            workspaceId: "ws_1",
            status: "trialing",
            planId: "price_team",
            currentPeriodEnd: farEnd,
            updatedAt: new Date(),
            creditBalance: 0,
        });
        const result = await getNotifications();
        expect(result.some(n => n.type === "subscription_change")).toBe(false);
    });

    it("marks subscription notification as read when id is in seenJobIds", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            ...MOCK_MEMBER,
            seenJobIds: ["sub-sub_1"],
        });
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "sub_1",
            workspaceId: "ws_1",
            status: "past_due",
            planId: "price_team",
            currentPeriodEnd: null,
            updatedAt: new Date(),
            creditBalance: 0,
        });
        const result = await getNotifications();
        const notification = result.find(n => n.type === "subscription_change");
        expect(notification?.read).toBe(true);
    });
});
