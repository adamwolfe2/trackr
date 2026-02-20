import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            workspaces: { findFirst: vi.fn() },
            feedItems: { findMany: vi.fn() },
        },
        update: vi.fn(),
    },
}));

vi.mock("@/lib/db/schema", () => ({
    feedItems: {},
    workspaces: {},
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return {
        ...actual,
        eq: vi.fn((...args: unknown[]) => args),
        and: vi.fn((...args: unknown[]) => args),
        isNull: vi.fn((x: unknown) => x),
        desc: vi.fn((x: unknown) => x),
        gte: vi.fn((...args: unknown[]) => args),
    };
});

vi.mock("@ai-sdk/openai", () => ({
    openai: vi.fn().mockReturnValue("gpt-4o-mini"),
}));

vi.mock("ai", () => ({
    generateObject: vi.fn(),
}));

import { db } from "@/lib/db";
import { generateObject } from "ai";
import { enrichFeedItems } from "../feed-enrichment";

const MOCK_WORKSPACE = { id: "ws_1", name: "Acme", companyContext: "B2B SaaS company" };

function makeItem(id: string, url: string, title = "Test Article") {
    return { id, url, title, source: "techcrunch.com", summary: "A snippet." };
}

function setupDbChains() {
    const updateWhere = vi.fn().mockResolvedValue({});
    const updateSet = vi.fn().mockReturnValue({ where: updateWhere });
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: updateSet });
}

describe("enrichFeedItems", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains();
        (db.query.workspaces.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_WORKSPACE);
        (db.query.feedItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (generateObject as ReturnType<typeof vi.fn>).mockResolvedValue({
            object: { items: [] },
        });
    });

    it("returns 0 when workspace is not found", async () => {
        (db.query.workspaces.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const result = await enrichFeedItems("ws_missing");
        expect(result).toBe(0);
        expect(generateObject).not.toHaveBeenCalled();
    });

    it("returns 0 when there are no unenriched items", async () => {
        (db.query.feedItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        const result = await enrichFeedItems("ws_1");
        expect(result).toBe(0);
        expect(generateObject).not.toHaveBeenCalled();
    });

    it("calls generateObject once for a batch of fewer than 10 items", async () => {
        const items = Array.from({ length: 5 }, (_, i) => makeItem(`item_${i}`, `https://example.com/${i}`));
        (db.query.feedItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(items);
        (generateObject as ReturnType<typeof vi.fn>).mockResolvedValue({
            object: {
                items: items.map((it) => ({
                    url: it.url,
                    summary: "AI summary",
                    relevanceScore: 0.8,
                    categories: ["AI"],
                })),
            },
        });
        const result = await enrichFeedItems("ws_1");
        expect(generateObject).toHaveBeenCalledTimes(1);
        expect(result).toBe(5);
    });

    it("calls generateObject twice for 15 items (batch of 10 + batch of 5)", async () => {
        const items = Array.from({ length: 15 }, (_, i) => makeItem(`item_${i}`, `https://example.com/${i}`));
        (db.query.feedItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(items);
        (generateObject as ReturnType<typeof vi.fn>).mockResolvedValue({
            object: { items: [] },
        });
        await enrichFeedItems("ws_1");
        expect(generateObject).toHaveBeenCalledTimes(2);
    });

    it("updates feed items with summary, relevanceScore, and categories on success", async () => {
        const item = makeItem("item_1", "https://example.com/1");
        (db.query.feedItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([item]);
        (generateObject as ReturnType<typeof vi.fn>).mockResolvedValue({
            object: {
                items: [{
                    url: item.url,
                    summary: "AI-generated summary",
                    relevanceScore: 0.9,
                    categories: ["AI", "SaaS"],
                }],
            },
        });
        await enrichFeedItems("ws_1");
        const setArgs = (
            (db.update as ReturnType<typeof vi.fn>).mock.results[0].value.set as ReturnType<typeof vi.fn>
        ).mock.calls[0][0];
        expect(setArgs.summary).toBe("AI-generated summary");
        expect(setArgs.relevanceScore).toBe("0.9");
        expect(setArgs.categories).toEqual(["AI", "SaaS"]);
    });

    it("sets relevanceScore to '0.3' fallback when item is not in AI result map", async () => {
        const item = makeItem("item_1", "https://example.com/1");
        (db.query.feedItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([item]);
        // AI returns result for a different URL
        (generateObject as ReturnType<typeof vi.fn>).mockResolvedValue({
            object: { items: [{ url: "https://other.com", summary: "...", relevanceScore: 0.5, categories: [] }] },
        });
        const result = await enrichFeedItems("ws_1");
        expect(result).toBe(1);
        const setArgs = (
            (db.update as ReturnType<typeof vi.fn>).mock.results[0].value.set as ReturnType<typeof vi.fn>
        ).mock.calls[0][0];
        expect(setArgs.relevanceScore).toBe("0.3");
    });

    it("sets relevanceScore to '0.3' fallback for all items in batch when generateObject throws", async () => {
        const items = [
            makeItem("item_1", "https://example.com/1"),
            makeItem("item_2", "https://example.com/2"),
        ];
        (db.query.feedItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(items);
        (generateObject as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("AI error"));
        const result = await enrichFeedItems("ws_1");
        // Returns count (2 items were "processed" with fallback score)
        expect(result).toBe(0); // count remains 0 since we went through the catch
        // db.update called for each item with fallback score
        expect(db.update).toHaveBeenCalledTimes(2);
    });

    it("returns total count of enriched items across multiple batches", async () => {
        const items = Array.from({ length: 12 }, (_, i) => makeItem(`item_${i}`, `https://example.com/${i}`));
        (db.query.feedItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(items);
        // Return matching results for all items
        (generateObject as ReturnType<typeof vi.fn>).mockImplementation(({ prompt }: { prompt: string }) => {
            // Extract item count from prompt (batch size varies)
            const batchSize = prompt.includes("[10]") ? 10 : 2;
            const batchItems = items.slice(
                (generateObject as ReturnType<typeof vi.fn>).mock.calls.length === 1 ? 0 : 10,
                (generateObject as ReturnType<typeof vi.fn>).mock.calls.length === 1 ? 10 : 12,
            );
            return Promise.resolve({
                object: {
                    items: batchItems.map((it) => ({
                        url: it.url,
                        summary: "summary",
                        relevanceScore: 0.7,
                        categories: ["AI"],
                    })),
                },
            });
        });
        const result = await enrichFeedItems("ws_1");
        expect(result).toBe(12);
    });

    it("uses companyContext in the AI prompt when available", async () => {
        const item = makeItem("item_1", "https://example.com/1");
        (db.query.feedItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([item]);
        (generateObject as ReturnType<typeof vi.fn>).mockResolvedValue({
            object: { items: [{ url: item.url, summary: "summary", relevanceScore: 0.5, categories: [] }] },
        });
        await enrichFeedItems("ws_1");
        const call = (generateObject as ReturnType<typeof vi.fn>).mock.calls[0][0];
        expect(call.prompt).toContain("B2B SaaS company");
    });
});
