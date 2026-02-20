import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            feedItems: { findMany: vi.fn() },
            tools: { findMany: vi.fn() },
            softwareSpend: { findMany: vi.fn() },
            painPoints: { findMany: vi.fn() },
            toolSuggestions: { findMany: vi.fn() },
        },
        update: vi.fn(),
        insert: vi.fn(),
    },
}));

vi.mock("@/lib/db/schema", () => ({
    feedItems: {},
    toolSuggestions: {},
    softwareSpend: {},
    tools: {},
    painPoints: {},
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return {
        ...actual,
        eq: vi.fn((...args: unknown[]) => args),
        and: vi.fn((...args: unknown[]) => args),
        gte: vi.fn((...args: unknown[]) => args),
        desc: vi.fn((x: unknown) => x),
        isNotNull: vi.fn((x: unknown) => x),
        sql: actual.sql,
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
import { extractToolsFromFeedItems, generateSuggestions } from "../suggestions-pipeline";

function setupDbChains() {
    const onConflict = vi.fn().mockResolvedValue({});
    const insertValues = vi.fn().mockReturnValue({ onConflictDoNothing: onConflict });
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: insertValues });

    const updateWhere = vi.fn().mockResolvedValue({});
    const updateSet = vi.fn().mockReturnValue({ where: updateWhere });
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: updateSet });
}

const MOCK_FEED_ITEM = {
    id: "item_1",
    workspaceId: "ws_1",
    title: "New AI Tool Released",
    url: "https://example.com/ai-tool",
    source: "techcrunch.com",
    summary: "A new AI tool for teams",
    extractedTools: [],
    relevanceScore: "0.8",
};

const MOCK_EXTRACTION_RESULT = {
    articles: [{
        articleIndex: 1,
        tools: [{
            name: "NewTool",
            url: "https://newtool.com",
            description: "An AI-powered tool for productivity",
            confidence: 0.85,
        }],
    }],
};

// ── extractToolsFromFeedItems ─────────────────────────────────────────────────

describe("extractToolsFromFeedItems", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains();
        (db.query.feedItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (generateObject as ReturnType<typeof vi.fn>).mockResolvedValue({
            object: MOCK_EXTRACTION_RESULT,
        });
    });

    it("returns 0 when there are no qualifying feed items", async () => {
        const result = await extractToolsFromFeedItems("ws_1");
        expect(result).toBe(0);
        expect(generateObject).not.toHaveBeenCalled();
    });

    it("calls generateObject with feed item texts", async () => {
        (db.query.feedItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_FEED_ITEM]);
        await extractToolsFromFeedItems("ws_1");
        expect(generateObject).toHaveBeenCalledTimes(1);
        const call = (generateObject as ReturnType<typeof vi.fn>).mock.calls[0][0];
        expect(call.prompt).toContain("New AI Tool Released");
    });

    it("returns count of extracted tools with confidence >= 0.5", async () => {
        (db.query.feedItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_FEED_ITEM]);
        (generateObject as ReturnType<typeof vi.fn>).mockResolvedValue({
            object: {
                articles: [{
                    articleIndex: 1,
                    tools: [
                        { name: "Tool A", url: "https://a.com", description: "Tool A", confidence: 0.8 },
                        { name: "Tool B", url: "https://b.com", description: "Tool B", confidence: 0.3 }, // below threshold
                    ],
                }],
            },
        });
        const result = await extractToolsFromFeedItems("ws_1");
        expect(result).toBe(1); // only Tool A passes confidence >= 0.5
    });

    it("updates feedItems.extractedTools with found tools", async () => {
        (db.query.feedItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_FEED_ITEM]);
        await extractToolsFromFeedItems("ws_1");
        const setArgs = (
            (db.update as ReturnType<typeof vi.fn>).mock.results[0].value.set as ReturnType<typeof vi.fn>
        ).mock.calls[0][0];
        expect(setArgs.extractedTools).toHaveLength(1);
        expect(setArgs.extractedTools[0].name).toBe("NewTool");
    });

    it("sets __processed placeholder when no tools found for an article", async () => {
        (db.query.feedItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_FEED_ITEM]);
        (generateObject as ReturnType<typeof vi.fn>).mockResolvedValue({
            object: {
                articles: [{ articleIndex: 1, tools: [] }],
            },
        });
        await extractToolsFromFeedItems("ws_1");
        const setArgs = (
            (db.update as ReturnType<typeof vi.fn>).mock.results[0].value.set as ReturnType<typeof vi.fn>
        ).mock.calls[0][0];
        expect(setArgs.extractedTools[0].name).toBe("__processed");
    });

    it("sets __error placeholder for all items when generateObject throws", async () => {
        const items = [MOCK_FEED_ITEM, { ...MOCK_FEED_ITEM, id: "item_2" }];
        (db.query.feedItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(items);
        (generateObject as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("AI error"));
        const result = await extractToolsFromFeedItems("ws_1");
        expect(result).toBe(0);
        expect(db.update).toHaveBeenCalledTimes(2);
        // Each update should set extractedTools to the __error placeholder
        const allSetArgs = (db.update as ReturnType<typeof vi.fn>).mock.results.map(
            (r) => (r.value.set as ReturnType<typeof vi.fn>).mock.calls[0][0]
        );
        expect(allSetArgs.every((args) => args.extractedTools[0].name === "__error")).toBe(true);
    });
});

// ── generateSuggestions ───────────────────────────────────────────────────────

describe("generateSuggestions", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains();
        // Default: no qualifying feed items
        (db.query.feedItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.painPoints.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.toolSuggestions.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    });

    it("returns 0 when no feed items have extracted tools with confidence >= 0.6", async () => {
        (db.query.feedItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            {
                ...MOCK_FEED_ITEM,
                extractedTools: [{ name: "Tool", url: "https://t.com", description: "x", confidence: 0.5 }],
            },
        ]);
        const result = await generateSuggestions("ws_1");
        expect(result).toBe(0);
    });

    it("returns 0 when allExtracted is empty", async () => {
        const result = await generateSuggestions("ws_1");
        expect(result).toBe(0);
        expect(db.insert).not.toHaveBeenCalled();
    });

    it("skips tools already in the workspace stack (tools table)", async () => {
        (db.query.feedItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{
            ...MOCK_FEED_ITEM,
            extractedTools: [{ name: "Slack", url: "https://slack.com", description: "Chat", confidence: 0.9 }],
        }]);
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ name: "Slack" }]);
        const result = await generateSuggestions("ws_1");
        expect(result).toBe(0);
        expect(db.insert).not.toHaveBeenCalled();
    });

    it("skips tools already in the softwareSpend table", async () => {
        (db.query.feedItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{
            ...MOCK_FEED_ITEM,
            extractedTools: [{ name: "Notion", url: "https://notion.so", description: "Notes", confidence: 0.9 }],
        }]);
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ toolName: "Notion" }]);
        const result = await generateSuggestions("ws_1");
        expect(result).toBe(0);
    });

    it("skips tools already suggested (toolSuggestions table)", async () => {
        (db.query.feedItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{
            ...MOCK_FEED_ITEM,
            extractedTools: [{ name: "Linear", url: "https://linear.app", description: "PM", confidence: 0.9 }],
        }]);
        (db.query.toolSuggestions.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ toolName: "Linear" }]);
        const result = await generateSuggestions("ws_1");
        expect(result).toBe(0);
    });

    it("inserts a new suggestion for a new tool", async () => {
        (db.query.feedItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{
            ...MOCK_FEED_ITEM,
            extractedTools: [{ name: "NewTool", url: "https://newtool.com", description: "New AI tool", confidence: 0.9 }],
        }]);
        const result = await generateSuggestions("ws_1");
        expect(result).toBe(1);
        expect(db.insert).toHaveBeenCalledTimes(1);
    });

    it("is case-insensitive when deduplicating tool names", async () => {
        (db.query.feedItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{
            ...MOCK_FEED_ITEM,
            extractedTools: [{ name: "slack", url: "https://slack.com", description: "Chat", confidence: 0.9 }],
        }]);
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ name: "Slack" }]);
        const result = await generateSuggestions("ws_1");
        expect(result).toBe(0); // "slack" matches "Slack" case-insensitively
    });

    it("deduplicates tools extracted from multiple feed items in same session", async () => {
        const extractedTool = { name: "NewTool", url: "https://newtool.com", description: "AI tool", confidence: 0.9 };
        (db.query.feedItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { ...MOCK_FEED_ITEM, id: "item_1", extractedTools: [extractedTool] },
            { ...MOCK_FEED_ITEM, id: "item_2", extractedTools: [extractedTool] }, // same tool in both items
        ]);
        const result = await generateSuggestions("ws_1");
        expect(result).toBe(1); // only 1 suggestion created despite 2 items
    });

    it("skips __processed and __error placeholder tools", async () => {
        (db.query.feedItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{
            ...MOCK_FEED_ITEM,
            extractedTools: [
                { name: "__processed", url: "", description: "", confidence: 0.9 },
                { name: "__error", url: "", description: "", confidence: 0.9 },
            ],
        }]);
        const result = await generateSuggestions("ws_1");
        expect(result).toBe(0);
    });

    it("boosts confidence by 0.15 when tool matches a pain point", async () => {
        (db.query.feedItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{
            ...MOCK_FEED_ITEM,
            extractedTools: [{
                name: "ProjectTool",
                url: "https://projecttool.com",
                description: "project management task tracking",
                confidence: 0.7,
            }],
        }]);
        (db.query.painPoints.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{
            id: "pp_1",
            title: "project management",
            description: "task tracking is hard",
            active: true,
        }]);
        await generateSuggestions("ws_1");
        const insertValues = (db.insert as ReturnType<typeof vi.fn>).mock.results[0].value.values as ReturnType<typeof vi.fn>;
        const insertedData = insertValues.mock.calls[0][0];
        // confidence = min(1, 0.7 + 0.15) = 0.85
        expect(parseFloat(insertedData.confidence)).toBeCloseTo(0.85, 2);
        expect(insertedData.matchedPainPointId).toBe("pp_1");
    });
});
