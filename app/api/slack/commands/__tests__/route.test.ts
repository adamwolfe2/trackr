import { describe, it, expect, vi, beforeEach } from "vitest";

// Set required env vars before import
process.env.SLACK_SIGNING_SECRET = "test_slack_secret_abc";
process.env.NEXT_PUBLIC_APP_URL = "https://trytrackr.com";

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            workspaces: { findFirst: vi.fn() },
            subscriptions: { findFirst: vi.fn() },
            tools: { findMany: vi.fn() },
        },
        select: vi.fn().mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([{ value: 0 }]),
            }),
        }),
        insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([{ id: "tool_new_1" }]),
            }),
        }),
    },
}));

vi.mock("@/lib/config/subscriptions", () => ({
    getPlanLimits: vi.fn().mockReturnValue({
        name: "Team",
        slug: "team",
        limits: { tools: Infinity, research: 50, members: 10 },
    }),
}));

vi.mock("next/server", async (importOriginal) => {
    const actual = await importOriginal<typeof import("next/server")>();
    return {
        ...actual,
        after: vi.fn((fn: () => void) => fn()),
    };
});

vi.mock("@/lib/actions/research", () => ({
    performDeepResearch: vi.fn().mockResolvedValue(undefined),
}));

import { db } from "@/lib/db";
import { POST } from "../route";

// Helper to create a proper Slack HMAC signature
import { createHmac } from "crypto";

function makeSlackRequest(formData: Record<string, string>, validSig = true) {
    const body = new URLSearchParams(formData).toString();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const secret = "test_slack_secret_abc";
    const baseString = `v0:${timestamp}:${body}`;
    const computedSig = "v0=" + createHmac("sha256", secret).update(baseString).digest("hex");
    const signature = validSig ? computedSig : "v0=bad_signature";

    return {
        text: () => Promise.resolve(body),
        headers: {
            get: (key: string) => {
                if (key === "x-slack-request-timestamp") return timestamp;
                if (key === "x-slack-signature") return signature;
                return null;
            },
        },
    } as unknown as Request;
}

const MOCK_WORKSPACE = { id: "ws_1", name: "Acme Corp", slackChannelId: "C_test" };

describe("POST /api/slack/commands", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (db.query.workspaces.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_WORKSPACE);
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.select as ReturnType<typeof vi.fn>).mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([{ value: 0 }]),
            }),
        });
        (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([{ id: "tool_new_1" }]),
            }),
        });
    });

    it("returns 401 for invalid signature", async () => {
        const res = await POST(makeSlackRequest({ command: "/trackr", text: "help", channel_id: "C_test" }, false));
        expect(res.status).toBe(401);
    });

    it("returns help response for /trackr help", async () => {
        const res = await POST(makeSlackRequest({ command: "/trackr", text: "help", channel_id: "C_test" }));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.response_type).toBe("ephemeral");
        expect(JSON.stringify(body)).toContain("/trackr research");
    });

    it("returns help response for /trackr (no subcommand)", async () => {
        const res = await POST(makeSlackRequest({ command: "/trackr", text: "", channel_id: "C_test" }));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(JSON.stringify(body)).toContain("research");
    });

    it("returns ephemeral error when no URL provided for research", async () => {
        const res = await POST(makeSlackRequest({ command: "/trackr", text: "research", channel_id: "C_test" }));
        const body = await res.json();
        expect(body.response_type).toBe("ephemeral");
        expect(body.text).toMatch(/Usage/i);
    });

    it("returns ephemeral error when channel not connected to workspace", async () => {
        (db.query.workspaces.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const res = await POST(makeSlackRequest({ command: "/trackr", text: "research https://notion.so", channel_id: "C_unconnected" }));
        const body = await res.json();
        expect(body.response_type).toBe("ephemeral");
        expect(body.text).toMatch(/isn't connected|not connected/i);
    });

    it("starts research and returns in_channel response for valid URL", async () => {
        const res = await POST(makeSlackRequest({ command: "/trackr", text: "research https://linear.app", channel_id: "C_test" }));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.response_type).toBe("in_channel");
        expect(JSON.stringify(body.blocks)).toContain("Researching");
    });

    it("returns status response for /trackr status", async () => {
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { id: "t1", status: "active" },
            { id: "t2", status: "queued" },
        ]);
        const res = await POST(makeSlackRequest({ command: "/trackr", text: "status", channel_id: "C_test" }));
        const body = await res.json();
        expect(body.response_type).toBe("ephemeral");
        expect(JSON.stringify(body)).toContain("Acme Corp");
    });
});
