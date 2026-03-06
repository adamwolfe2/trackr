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
        },
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        execute: vi.fn(),
    },
}));

vi.mock("@/lib/db/queries", () => ({
    getWorkspaceId: vi.fn().mockResolvedValue("ws_1"),
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return {
        ...actual,
        eq: vi.fn((...args) => args),
        and: vi.fn((...args) => args),
        sql: actual.sql,
    };
});

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getWorkspaceId } from "@/lib/db/queries";
import {
    createFeedChannel,
    deleteFeedChannel,
    updateFeedChannel,
    markFeedItemRead,
    markAllRead,
} from "../feed";

const MOCK_USER = { id: "user_1" };
const MOCK_MEMBER = { id: "mem_1", userId: "user_1", workspaceId: "ws_1" };
const MOCK_CHANNEL = { id: "00000000-0000-0000-0000-000000000010", workspaceId: "ws_1", name: "AI News" };

function setupDbChains() {
    const returning = vi.fn().mockResolvedValue([MOCK_CHANNEL]);
    const insertValues = vi.fn().mockReturnValue({ returning });
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: insertValues });

    const updateWhere = vi.fn().mockResolvedValue({});
    const updateSet = vi.fn().mockReturnValue({ where: updateWhere });
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: updateSet });

    const deleteWhere = vi.fn().mockResolvedValue({});
    (db.delete as ReturnType<typeof vi.fn>).mockReturnValue({ where: deleteWhere });

    (db.execute as ReturnType<typeof vi.fn>).mockResolvedValue({});
}

describe("createFeedChannel", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_1");
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_MEMBER);
    });

    it("throws Unauthorized when not logged in", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(createFeedChannel({ name: "AI News", type: "topic", config: { keywords: ["AI"] } }))
            .rejects.toThrow("Unauthorized");
    });

    it("throws when channel name is empty", async () => {
        await expect(createFeedChannel({ name: "", type: "topic", config: { keywords: ["AI"] } }))
            .rejects.toThrow("Channel name must be 1-100 characters");
    });

    it("throws when channel name exceeds 100 characters", async () => {
        await expect(createFeedChannel({ name: "x".repeat(101), type: "topic", config: { keywords: ["AI"] } }))
            .rejects.toThrow("Channel name must be 1-100 characters");
    });

    it("throws when topic channel has no keywords", async () => {
        await expect(createFeedChannel({ name: "AI News", type: "topic", config: { keywords: [] } }))
            .rejects.toThrow("At least one keyword is required");
    });

    it("throws when topic channel has more than 10 keywords", async () => {
        const keywords = Array.from({ length: 11 }, (_, i) => `keyword${i}`);
        await expect(createFeedChannel({ name: "AI News", type: "topic", config: { keywords } }))
            .rejects.toThrow("Maximum 10 keywords per channel");
    });

    it("throws when RSS channel has no feedUrl", async () => {
        await expect(createFeedChannel({ name: "RSS Feed", type: "rss", config: {} }))
            .rejects.toThrow("Feed URL is required");
    });

    it("throws when RSS channel has invalid feedUrl", async () => {
        await expect(createFeedChannel({ name: "RSS Feed", type: "rss", config: { feedUrl: "not-a-url" } }))
            .rejects.toThrow("Invalid feed URL");
    });

    it("creates topic channel with valid keywords", async () => {
        const result = await createFeedChannel({
            name: "AI News",
            type: "topic",
            config: { keywords: ["AI", "machine learning"] },
        });
        expect(result).toEqual(MOCK_CHANNEL);
        expect(db.insert).toHaveBeenCalledTimes(1);
    });

    it("creates RSS channel with valid feedUrl", async () => {
        const result = await createFeedChannel({
            name: "TechCrunch AI",
            type: "rss",
            config: { feedUrl: "https://techcrunch.com/feed/" },
        });
        expect(result).toEqual(MOCK_CHANNEL);
        expect(db.insert).toHaveBeenCalledTimes(1);
    });

    it("trims whitespace from channel name", async () => {
        // "  AI News  " should trim to "AI News" and succeed
        const result = await createFeedChannel({
            name: "  AI News  ",
            type: "topic",
            config: { keywords: ["AI"] },
        });
        expect(result).toEqual(MOCK_CHANNEL);
    });
});

describe("deleteFeedChannel", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_1");
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_MEMBER);
    });

    it("throws when not logged in", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(deleteFeedChannel("00000000-0000-0000-0000-000000000010")).rejects.toThrow("Unauthorized");
    });

    it("calls db.delete with channel id", async () => {
        await deleteFeedChannel("00000000-0000-0000-0000-000000000010");
        expect(db.delete).toHaveBeenCalledTimes(1);
    });
});

describe("updateFeedChannel", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_1");
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_MEMBER);
    });

    it("throws when not logged in", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(updateFeedChannel("00000000-0000-0000-0000-000000000010", { name: "Updated" })).rejects.toThrow("Unauthorized");
    });

    it("calls db.update with provided data", async () => {
        await updateFeedChannel("00000000-0000-0000-0000-000000000010", { name: "Updated Name", enabled: false });
        expect(db.update).toHaveBeenCalledTimes(1);
    });
});

describe("markFeedItemRead", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_1");
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_MEMBER);
    });

    it("throws when not logged in", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(markFeedItemRead("00000000-0000-0000-0000-000000000020")).rejects.toThrow("Unauthorized");
    });

    it("calls db.update to mark item as read", async () => {
        await markFeedItemRead("00000000-0000-0000-0000-000000000020");
        const setArgs = (
            (db.update as ReturnType<typeof vi.fn>).mock.results[0].value.set as ReturnType<typeof vi.fn>
        ).mock.calls[0][0];
        expect(setArgs.isRead).toBe(true);
    });
});

describe("markAllRead", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_1");
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_MEMBER);
    });

    it("throws when not logged in", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(markAllRead()).rejects.toThrow("Unauthorized");
    });

    it("marks all items in workspace as read when no channelId", async () => {
        await markAllRead();
        expect(db.update).toHaveBeenCalledTimes(1);
    });

    it("marks all items in specific channel as read when channelId provided", async () => {
        await markAllRead("00000000-0000-0000-0000-000000000010");
        expect(db.update).toHaveBeenCalledTimes(1);
    });
});
