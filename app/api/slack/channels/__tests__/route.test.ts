import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
    currentUser: vi.fn(),
}));

vi.mock("@/lib/db/queries", () => ({
    getWorkspaceId: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            workspaces: { findFirst: vi.fn() },
        },
    },
}));

vi.mock("@/lib/services/slack", () => ({
    listChannels: vi.fn(),
}));

import { currentUser } from "@clerk/nextjs/server";
import { getWorkspaceId } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { listChannels } from "@/lib/services/slack";
import { GET } from "../route";

const MOCK_USER = { id: "user_1" };

describe("GET /api/slack/channels", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 401 when not authenticated", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const res = await GET();
        expect(res.status).toBe(401);
    });

    it("returns empty channels with error message when no workspace found", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue(null);

        const res = await GET();
        const body = await res.json();
        expect(body.channels).toEqual([]);
        expect(body.error).toBe("No workspace found");
    });

    it("returns channels from listChannels with workspace bot token", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_1");
        (db.query.workspaces.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            slackBotToken: "xoxb-workspace-token",
        });
        const mockChannels = [
            { id: "C001", name: "general" },
            { id: "C002", name: "random" },
        ];
        (listChannels as ReturnType<typeof vi.fn>).mockResolvedValue(mockChannels);

        const res = await GET();
        const body = await res.json();
        expect(res.status).toBe(200);
        expect(body.channels).toEqual(mockChannels);
        expect(listChannels).toHaveBeenCalledWith("xoxb-workspace-token");
    });

    it("falls back to undefined token when workspace has no slackBotToken", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_1");
        (db.query.workspaces.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            slackBotToken: null,
        });
        (listChannels as ReturnType<typeof vi.fn>).mockResolvedValue([]);

        const res = await GET();
        expect(listChannels).toHaveBeenCalledWith(undefined);
        const body = await res.json();
        expect(body.channels).toEqual([]);
    });

    it("returns error message when listChannels throws", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_1");
        (db.query.workspaces.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            slackBotToken: null,
        });
        (listChannels as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Slack API error"));

        const res = await GET();
        const body = await res.json();
        expect(body.channels).toEqual([]);
        expect(body.error).toBe("Failed to connect to Slack");
    });
});
