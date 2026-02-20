import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @slack/web-api to avoid requiring real tokens
const { MockWebClient, mockConversationsList, mockChatPostMessage } = vi.hoisted(() => {
    const mockConversationsList = vi.fn();
    const mockChatPostMessage = vi.fn();
    const MockWebClient = vi.fn().mockImplementation(function () {
        return {
            conversations: { list: mockConversationsList },
            chat: { postMessage: mockChatPostMessage },
        };
    });
    return { MockWebClient, mockConversationsList, mockChatPostMessage };
});

vi.mock("@slack/web-api", () => ({
    WebClient: MockWebClient,
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            workspaces: { findFirst: vi.fn() },
        },
        update: vi.fn(),
    },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return { ...actual, eq: vi.fn((...args) => args) };
});

import { db } from "@/lib/db";
import {
    getSlackClient,
    postMessage,
    listChannels,
    researchCompleteBlocks,
    researchFailedBlocks,
    renewalAlertBlocks,
    toolAddedBlocks,
} from "../slack";

function restoreMockWebClient() {
    MockWebClient.mockImplementation(function () {
        return {
            conversations: { list: mockConversationsList },
            chat: { postMessage: mockChatPostMessage },
        };
    });
}

describe("getSlackClient", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        restoreMockWebClient();
        delete process.env.SLACK_BOT_TOKEN;
    });

    it("returns a client when botToken is provided", () => {
        const client = getSlackClient("xoxb-test-token");
        expect(client).not.toBeNull();
        expect(MockWebClient).toHaveBeenCalledWith("xoxb-test-token");
    });

    it("returns null when no botToken and no env var", () => {
        const client = getSlackClient();
        expect(client).toBeNull();
    });

    it("returns a client from env var when no botToken provided", () => {
        process.env.SLACK_BOT_TOKEN = "xoxb-env-token";
        const client = getSlackClient();
        expect(client).not.toBeNull();
    });
});

describe("postMessage", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        restoreMockWebClient();
        delete process.env.SLACK_BOT_TOKEN;
    });

    it("returns null when no Slack client is available", async () => {
        const result = await postMessage("C001", "Hello");
        expect(result).toBeNull();
    });

    it("calls chat.postMessage with the correct arguments", async () => {
        mockChatPostMessage.mockResolvedValue({ ok: true });
        const blocks = [{ type: "section", text: { type: "mrkdwn", text: "Hello" } }];
        await postMessage("C001", "Hello", blocks, "xoxb-token");
        expect(mockChatPostMessage).toHaveBeenCalledWith({
            channel: "C001",
            text: "Hello",
            blocks,
            unfurl_links: false,
        });
    });
});

describe("listChannels", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        restoreMockWebClient();
        delete process.env.SLACK_BOT_TOKEN;
    });

    it("returns empty array when no Slack client is available", async () => {
        const channels = await listChannels();
        expect(channels).toEqual([]);
    });

    it("returns sorted channels from API", async () => {
        mockConversationsList.mockResolvedValue({
            channels: [
                { id: "C002", name: "general" },
                { id: "C001", name: "announcements" },
                { id: "C003", name: "random" },
            ],
        });
        const channels = await listChannels("xoxb-token");
        expect(channels).toEqual([
            { id: "C001", name: "announcements" },
            { id: "C002", name: "general" },
            { id: "C003", name: "random" },
        ]);
    });

    it("filters out channels without id or name", async () => {
        mockConversationsList.mockResolvedValue({
            channels: [
                { id: "C001", name: "general" },
                { id: null, name: "no-id" },
                { id: "C003", name: null },
            ],
        });
        const channels = await listChannels("xoxb-token");
        expect(channels).toHaveLength(1);
        expect(channels[0].id).toBe("C001");
    });

    it("handles missing channels array gracefully", async () => {
        mockConversationsList.mockResolvedValue({});
        const channels = await listChannels("xoxb-token");
        expect(channels).toEqual([]);
    });
});

describe("researchCompleteBlocks", () => {
    it("returns an array with 3 block types: header, section, actions", () => {
        const blocks = researchCompleteBlocks("Linear", "tool_1", 8.7);
        expect(blocks).toHaveLength(3);
        expect(blocks[0].type).toBe("header");
        expect(blocks[1].type).toBe("section");
        expect(blocks[2].type).toBe("actions");
    });

    it("includes tool name in header", () => {
        const blocks = researchCompleteBlocks("Notion", "tool_2", 9.0);
        const header = blocks[0] as { type: string; text: { text: string } };
        expect(header.text.text).toContain("Notion");
    });

    it("formats score to one decimal place", () => {
        const blocks = researchCompleteBlocks("Slack", "tool_3", 7.5) as Array<{
            type: string;
            fields?: Array<{ text: string }>;
        }>;
        const section = blocks[1];
        const scoreField = section.fields?.find((f) => f.text.includes("Score"));
        expect(scoreField?.text).toContain("7.5/10");
    });

    it("includes tool URL in action button", () => {
        const blocks = researchCompleteBlocks("Linear", "tool_abc", 8.0) as Array<{
            type: string;
            elements?: Array<{ url: string }>;
        }>;
        const actions = blocks[2];
        expect(actions.elements?.[0].url).toContain("tool_abc");
    });
});

describe("researchFailedBlocks", () => {
    it("returns an array with 3 blocks", () => {
        const blocks = researchFailedBlocks("Linear", "tool_1", "Timeout error");
        expect(blocks).toHaveLength(3);
    });

    it("includes error message in section block", () => {
        const blocks = researchFailedBlocks("Linear", "tool_1", "API rate limit") as Array<{
            type: string;
            text?: { text: string };
        }>;
        const section = blocks[1];
        expect(section.text?.text).toContain("API rate limit");
    });

    it("includes tool name in header", () => {
        const blocks = researchFailedBlocks("HubSpot", "tool_2", "error") as Array<{
            type: string;
            text?: { type: string; text: string };
        }>;
        expect(blocks[0].text?.text).toContain("HubSpot");
    });
});

describe("renewalAlertBlocks", () => {
    const baseDate = new Date("2026-03-15");

    it("uses singular 'Renewal' for one tool", () => {
        const blocks = renewalAlertBlocks([{ name: "Linear", renewalDate: baseDate, monthlyCost: "50" }]) as Array<{
            type: string;
            text?: { text: string };
        }>;
        const header = blocks[0] as { type: string; text: { text: string } };
        expect(header.text.text).toBe("1 Upcoming Renewal");
    });

    it("uses plural 'Renewals' for multiple tools", () => {
        const tools = [
            { name: "Linear", renewalDate: baseDate, monthlyCost: "50" },
            { name: "Notion", renewalDate: baseDate, monthlyCost: "20" },
        ];
        const blocks = renewalAlertBlocks(tools) as Array<{ type: string; text: { text: string } }>;
        expect(blocks[0].text.text).toBe("2 Upcoming Renewals");
    });

    it("includes cost when monthlyCost > 0", () => {
        const blocks = renewalAlertBlocks([{ name: "Slack", renewalDate: baseDate, monthlyCost: "75" }]) as Array<{
            type: string;
            text?: { text: string };
        }>;
        const section = blocks[1];
        expect(section.text?.text).toContain("$75");
    });

    it("omits cost when monthlyCost is 0", () => {
        const blocks = renewalAlertBlocks([{ name: "Slack", renewalDate: baseDate, monthlyCost: "0" }]) as Array<{
            type: string;
            text?: { text: string };
        }>;
        const section = blocks[1];
        expect(section.text?.text).not.toContain("$");
    });

    it("omits cost when monthlyCost is null", () => {
        const blocks = renewalAlertBlocks([{ name: "Slack", renewalDate: baseDate, monthlyCost: null }]) as Array<{
            type: string;
            text?: { text: string };
        }>;
        const section = blocks[1];
        expect(section.text?.text).not.toContain("$");
    });

    it("includes review stack button", () => {
        const blocks = renewalAlertBlocks([{ name: "X", renewalDate: baseDate, monthlyCost: null }]) as Array<{
            type: string;
            elements?: Array<{ text: { text: string } }>;
        }>;
        const actions = blocks[2];
        expect(actions.elements?.[0].text.text).toBe("Review Stack");
    });
});

describe("toolAddedBlocks", () => {
    it("returns a section block with tool name and user", () => {
        const blocks = toolAddedBlocks("Linear", "Adam") as Array<{
            type: string;
            text: { text: string };
        }>;
        expect(blocks).toHaveLength(1);
        expect(blocks[0].type).toBe("section");
        expect(blocks[0].text.text).toContain("Linear");
        expect(blocks[0].text.text).toContain("Adam");
    });
});
