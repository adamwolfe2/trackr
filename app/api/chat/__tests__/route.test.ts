import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
    currentUser: vi.fn(),
}));

vi.mock("@/lib/db", () => {
    const selectChain = {
        from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([]),
                }),
            }),
        }),
    };
    return {
        db: {
            query: {
                workspaceMembers: { findFirst: vi.fn() },
                softwareSpend: { findMany: vi.fn() },
                painPoints: { findMany: vi.fn() },
            },
            selectDistinctOn: vi.fn(),
            select: vi.fn().mockReturnValue(selectChain),
        },
    };
});

vi.mock("@/lib/middleware/rate-limit", () => ({
    rateLimit: vi.fn().mockReturnValue({ success: true, remaining: 19, reset: Date.now() + 60000 }),
    getRateLimitHeaders: vi.fn().mockReturnValue({}),
}));

vi.mock("@/lib/middleware/require-subscription", () => ({
    checkFeatureAccess: vi.fn().mockResolvedValue({ slug: "startup" }),
}));

vi.mock("@anthropic-ai/sdk", () => {
    class MockAnthropic {
        messages = {
            create: vi.fn().mockResolvedValue({
                content: [{ type: "text", text: "Here is your answer." }],
                stop_reason: "end_turn",
            }),
        };
    }
    return { default: MockAnthropic };
});

vi.mock("@/lib/ai/trackr-knowledge", () => ({
    buildSystemPrompt: vi.fn().mockReturnValue("You are Trackr AI."),
}));

vi.mock("@/lib/ai/chat-tools", () => ({
    chatTools: [],
    toolExecutors: {},
    toolLabels: {},
}));

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/middleware/rate-limit";
import { checkFeatureAccess } from "@/lib/middleware/require-subscription";
import { POST } from "../route";

function makeRequest(body: unknown) {
    return {
        json: () => Promise.resolve(body),
        headers: { get: () => null },
        nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as import("next/server").NextRequest;
}

const MOCK_MEMBER = {
    id: "mem_1",
    workspaceId: "ws_1",
    userId: "usr_1",
    workspace: { name: "Acme", companyContext: null },
};

const VALID_MESSAGES = [{ role: "user" as const, content: "What tools do we use for project management?" }];

describe("POST /api/chat", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.ANTHROPIC_API_KEY = "sk-ant-test-key";
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "usr_1" });
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_MEMBER);
        (rateLimit as ReturnType<typeof vi.fn>).mockReturnValue({ success: true, remaining: 19, reset: Date.now() + 60000 });
        (checkFeatureAccess as ReturnType<typeof vi.fn>).mockResolvedValue({ slug: "startup" });
    });

    it("returns 401 when not authenticated", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const res = await POST(makeRequest({ messages: VALID_MESSAGES }));
        expect(res.status).toBe(401);
    });

    it("returns 403 when no workspace found", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const res = await POST(makeRequest({ messages: VALID_MESSAGES }));
        expect(res.status).toBe(403);
    });

    it("returns 403 when plan does not include Ask AI", async () => {
        (checkFeatureAccess as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const res = await POST(makeRequest({ messages: VALID_MESSAGES }));
        expect(res.status).toBe(403);
        const body = await res.json();
        expect(body.error).toMatch(/Startup/);
    });

    it("returns 429 when rate limited", async () => {
        (rateLimit as ReturnType<typeof vi.fn>).mockReturnValue({ success: false, remaining: 0, reset: Date.now() + 60000 });
        const res = await POST(makeRequest({ messages: VALID_MESSAGES }));
        expect(res.status).toBe(429);
    });

    it("returns 400 for invalid JSON", async () => {
        const req = {
            json: () => Promise.reject(new Error("bad json")),
            headers: { get: () => null },
        } as unknown as import("next/server").NextRequest;
        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it("returns 400 for missing messages array", async () => {
        const res = await POST(makeRequest({}));
        expect(res.status).toBe(400);
    });

    it("returns 400 for empty messages array", async () => {
        const res = await POST(makeRequest({ messages: [] }));
        expect(res.status).toBe(400);
    });

    it("returns 200 SSE streaming response for valid request", async () => {
        const res = await POST(makeRequest({ messages: VALID_MESSAGES }));
        expect(res.status).toBe(200);
        expect(res.headers.get("Content-Type")).toBe("text/event-stream");
    });
});
