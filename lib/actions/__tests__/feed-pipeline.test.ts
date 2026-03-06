import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            feedChannels: { findFirst: vi.fn(), findMany: vi.fn() },
        },
        update: vi.fn(),
        insert: vi.fn(),
    },
}));

vi.mock("@/lib/db/schema", () => ({
    feedChannels: {},
    feedItems: {},
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return {
        ...actual,
        eq: vi.fn((...args: unknown[]) => args),
        and: vi.fn((...args: unknown[]) => args),
    };
});

vi.mock("@/lib/services/tavily", () => ({
    tavily: {
        search: vi.fn(),
    },
}));

vi.mock("fast-xml-parser", () => ({
    XMLParser: vi.fn().mockImplementation(function () {
        return {
            parse: vi.fn().mockReturnValue({}),
        };
    }),
}));

import { db } from "@/lib/db";
import { tavily } from "@/lib/services/tavily";
import { ingestChannel, ingestAllChannels, createDefaultChannels } from "../feed-pipeline";

function setupDbChains() {
    const onConflict = vi.fn().mockResolvedValue({});
    const insertValues = vi.fn().mockReturnValue({ onConflictDoNothing: onConflict });
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: insertValues });

    const updateWhere = vi.fn().mockResolvedValue({});
    const updateSet = vi.fn().mockReturnValue({ where: updateWhere });
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: updateSet });
}

const TOPIC_CHANNEL = {
    id: "ch_1",
    workspaceId: "ws_1",
    type: "topic",
    enabled: true,
    config: { keywords: ["AI tools", "SaaS"] },
};

const RSS_CHANNEL = {
    id: "ch_2",
    workspaceId: "ws_1",
    type: "rss",
    enabled: true,
    config: { feedUrl: "https://techcrunch.com/feed/" },
};

describe("ingestChannel", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains();
        (db.query.feedChannels.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(TOPIC_CHANNEL);
        (tavily.search as ReturnType<typeof vi.fn>).mockResolvedValue({ results: [], answer: "" });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("returns 0 when channel is not found", async () => {
        (db.query.feedChannels.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const result = await ingestChannel("ch_missing");
        expect(result).toBe(0);
    });

    it("returns 0 when channel is disabled", async () => {
        (db.query.feedChannels.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            ...TOPIC_CHANNEL,
            enabled: false,
        });
        const result = await ingestChannel("ch_1");
        expect(result).toBe(0);
    });

    it("always updates lastFetchedAt even when no items ingested", async () => {
        await ingestChannel("ch_1");
        const setArgs = (
            (db.update as ReturnType<typeof vi.fn>).mock.results[0].value.set as ReturnType<typeof vi.fn>
        ).mock.calls[0][0];
        expect(setArgs.lastFetchedAt).toBeInstanceOf(Date);
    });

    it("topic channel: calls tavily.search with keywords", async () => {
        await ingestChannel("ch_1");
        expect(tavily.search).toHaveBeenCalledTimes(1);
        const query = (tavily.search as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
        expect(query).toContain("AI tools");
        expect(query).toContain("SaaS");
    });

    it("topic channel: inserts each result into feedItems", async () => {
        (tavily.search as ReturnType<typeof vi.fn>).mockResolvedValue({
            results: [
                { title: "Article 1", url: "https://example.com/1", content: "Content 1" },
                { title: "Article 2", url: "https://example.com/2", content: "Content 2" },
            ],
        });
        const result = await ingestChannel("ch_1");
        // Batch insert: 1 call for all results + 1 update for lastFetchedAt
        expect(db.insert).toHaveBeenCalledTimes(1);
        expect(result).toBe(2);
    });

    it("topic channel: returns 0 when keywords list is empty", async () => {
        (db.query.feedChannels.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            ...TOPIC_CHANNEL,
            config: { keywords: [] },
        });
        const result = await ingestChannel("ch_1");
        expect(result).toBe(0);
        expect(tavily.search).not.toHaveBeenCalled();
    });

    it("RSS channel: returns 0 when feedUrl is missing", async () => {
        (db.query.feedChannels.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            ...RSS_CHANNEL,
            config: {},
        });
        const result = await ingestChannel("ch_2");
        expect(result).toBe(0);
    });

    it("RSS channel: returns 0 when fetch fails (non-ok status)", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, text: async () => "" }));
        (db.query.feedChannels.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(RSS_CHANNEL);
        const result = await ingestChannel("ch_2");
        expect(result).toBe(0);
    });

    it("RSS channel: returns 0 when fetch throws (network error)", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));
        (db.query.feedChannels.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(RSS_CHANNEL);
        const result = await ingestChannel("ch_2");
        expect(result).toBe(0);
    });

    it("RSS channel: inserts items parsed from RSS feed", async () => {
        const rssXml = `<?xml version="1.0"?><rss><channel><item><title>Post</title><link>https://tc.com/p</link><pubDate>${new Date().toISOString()}</pubDate><description>Body</description></item></channel></rss>`;
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: true,
            text: async () => rssXml,
        }));

        const { XMLParser } = await import("fast-xml-parser");
        (XMLParser as unknown as ReturnType<typeof vi.fn>).mockImplementation(function () {
            return {
                parse: vi.fn().mockReturnValue({
                    rss: {
                        channel: {
                            item: {
                                title: "Post",
                                link: "https://tc.com/p",
                                pubDate: new Date().toISOString(),
                                description: "Body",
                            },
                        },
                    },
                }),
            };
        });
        (db.query.feedChannels.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(RSS_CHANNEL);
        const result = await ingestChannel("ch_2");
        expect(db.insert).toHaveBeenCalledTimes(1);
        expect(result).toBe(1);
    });
});

describe("ingestAllChannels", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains();
        (db.query.feedChannels.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.feedChannels.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        (tavily.search as ReturnType<typeof vi.fn>).mockResolvedValue({ results: [], answer: "" });
    });

    it("returns 0 when workspace has no enabled channels", async () => {
        const result = await ingestAllChannels("ws_1");
        expect(result).toBe(0);
    });

    it("returns sum of all channel ingestion counts", async () => {
        (db.query.feedChannels.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { id: "ch_1" },
            { id: "ch_2" },
        ]);
        (db.query.feedChannels.findFirst as ReturnType<typeof vi.fn>)
            .mockResolvedValueOnce({ ...TOPIC_CHANNEL, id: "ch_1" })
            .mockResolvedValueOnce({ ...TOPIC_CHANNEL, id: "ch_2" });

        (tavily.search as ReturnType<typeof vi.fn>).mockResolvedValue({
            results: [{ title: "A", url: "https://example.com/a", content: "c" }],
        });

        const result = await ingestAllChannels("ws_1");
        expect(result).toBe(2); // 1 item per channel × 2 channels
    });

    it("continues processing other channels when one channel fails", async () => {
        (db.query.feedChannels.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { id: "ch_fail" },
            { id: "ch_ok" },
        ]);
        (db.query.feedChannels.findFirst as ReturnType<typeof vi.fn>)
            .mockRejectedValueOnce(new Error("DB error"))
            .mockResolvedValueOnce({ ...TOPIC_CHANNEL, id: "ch_ok" });

        (tavily.search as ReturnType<typeof vi.fn>).mockResolvedValue({
            results: [{ title: "A", url: "https://example.com/a", content: "c" }],
        });

        const result = await ingestAllChannels("ws_1");
        expect(result).toBe(1); // ch_fail returns 0 (throws caught), ch_ok returns 1
    });
});

describe("createDefaultChannels", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains();
    });

    it("inserts 2 default channels when no companyContext provided", async () => {
        await createDefaultChannels("ws_1");
        expect(db.insert).toHaveBeenCalledTimes(2);
    });

    it("inserts 3 channels when companyContext is long enough (> 20 chars)", async () => {
        await createDefaultChannels("ws_1", "A company that builds B2B SaaS tools for engineering teams.");
        expect(db.insert).toHaveBeenCalledTimes(3);
    });

    it("inserts only 2 channels when companyContext is too short (<= 20 chars)", async () => {
        await createDefaultChannels("ws_1", "Short context");
        expect(db.insert).toHaveBeenCalledTimes(2);
    });

    it("inserts only 2 channels when companyContext is null", async () => {
        await createDefaultChannels("ws_1", null);
        expect(db.insert).toHaveBeenCalledTimes(2);
    });

    it("creates channels with 'topic' type", async () => {
        await createDefaultChannels("ws_1");
        const calls = (db.insert as ReturnType<typeof vi.fn>).mock.results.map(
            (r) => (r.value.values as ReturnType<typeof vi.fn>).mock.calls[0][0]
        );
        expect(calls.every((c: { type: string }) => c.type === "topic")).toBe(true);
    });
});
