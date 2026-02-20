import { describe, it, expect, vi, beforeEach } from "vitest";

const MOCK_WORKSPACE = { id: "ws_1", name: "Acme Corp" };

vi.mock("@/lib/middleware/extension-auth", () => ({
    getWorkspaceFromApiKey: vi.fn(),
    corsHeaders: vi.fn().mockReturnValue({ "Access-Control-Allow-Origin": "*" }),
    checkExtensionRateLimit: vi.fn().mockReturnValue(true),
}));

vi.mock("@/lib/middleware/rate-limit", () => ({
    rateLimit: vi.fn().mockReturnValue({ success: true, remaining: 4, reset: Date.now() + 60000 }),
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            subscriptions: { findFirst: vi.fn() },
            tools: { findMany: vi.fn() },
        },
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

vi.mock("@/lib/ai/embedding", () => ({
    generateEmbedding: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
}));

vi.mock("@/lib/actions/preview", () => ({
    previewToolInternal: vi.fn().mockResolvedValue({ image: "https://logo.clearbit.com/notion.so" }),
}));

import { getWorkspaceFromApiKey } from "@/lib/middleware/extension-auth";
import { rateLimit } from "@/lib/middleware/rate-limit";
import { db } from "@/lib/db";
import { POST } from "../route";

function makeRequest(body: unknown, apiKey?: string) {
    return {
        json: () => Promise.resolve(body),
        headers: {
            get: (key: string) => (key === "Authorization" ? (apiKey ? `Bearer ${apiKey}` : null) : null),
        },
        nextUrl: new URL("https://trackr.com/api/extension/research"),
    } as unknown as import("next/server").NextRequest;
}

describe("POST /api/extension/research", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (getWorkspaceFromApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_WORKSPACE);
        (rateLimit as ReturnType<typeof vi.fn>).mockReturnValue({ success: true, remaining: 4, reset: Date.now() + 60000 });
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([{ id: "tool_new_1" }]),
            }),
        });
    });

    it("returns 401 for missing/invalid API key", async () => {
        (getWorkspaceFromApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const res = await POST(makeRequest({ url: "https://notion.so" }));
        expect(res.status).toBe(401);
    });

    it("returns 429 when rate limited", async () => {
        (rateLimit as ReturnType<typeof vi.fn>).mockReturnValue({ success: false, remaining: 0, reset: Date.now() + 60000 });
        const res = await POST(makeRequest({ url: "https://notion.so" }, "valid_key"));
        expect(res.status).toBe(429);
    });

    it("returns 400 for invalid JSON", async () => {
        const req = {
            json: () => Promise.reject(new Error("bad json")),
            headers: { get: () => "Bearer valid_key" },
            nextUrl: new URL("https://trackr.com/api/extension/research"),
        } as unknown as import("next/server").NextRequest;
        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it("returns 400 when url is missing", async () => {
        const res = await POST(makeRequest({}, "valid_key"));
        expect(res.status).toBe(400);
    });

    it("returns 403 when tool limit is reached", async () => {
        const { getPlanLimits } = await import("@/lib/config/subscriptions");
        (getPlanLimits as ReturnType<typeof vi.fn>).mockReturnValue({
            name: "Free",
            slug: "free",
            limits: { tools: 3, research: 5, members: 1 },
        });
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { id: "t1" }, { id: "t2" }, { id: "t3" },
        ]);

        const res = await POST(makeRequest({ url: "https://notion.so" }, "valid_key"));
        expect(res.status).toBe(403);
        const body = await res.json();
        expect(body.error).toMatch(/limit/i);
    });

    it("returns 200 with toolId for valid request", async () => {
        const res = await POST(makeRequest({ url: "https://notion.so", title: "Notion" }, "valid_key"));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.toolId).toBe("tool_new_1");
    });
});
