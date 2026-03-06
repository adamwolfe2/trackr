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

vi.mock("@/lib/ai/embedding", () => ({
    generateEmbedding: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/middleware/rate-limit", () => ({
    rateLimit: vi.fn().mockReturnValue({ success: true, remaining: 19, reset: Date.now() + 60000 }),
    getRateLimitHeaders: vi.fn().mockReturnValue({}),
}));

vi.mock("@/lib/middleware/require-subscription", () => ({
    checkFeatureAccess: vi.fn().mockResolvedValue({ slug: "startup" }),
}));

vi.mock("@/lib/utils/stack-insights", () => ({
    computeStackInsights: vi.fn().mockReturnValue({
        score: 50,
        label: "Mixed",
        benchmarkText: "average",
        totalActiveSpend: 500,
        aiNativeCount: 2,
        aiEnabledCount: 2,
        traditionalCount: 3,
        unknownCount: 0,
        timeSavedPerMonth: 10,
        dollarValueSaved: 800,
        opportunities: [],
        enrichedTools: [],
    }),
}));

vi.mock("ai", () => ({
    streamText: vi.fn().mockResolvedValue({
        toUIMessageStreamResponse: vi.fn().mockReturnValue(new Response("streamed", { status: 200 })),
    }),
}));

vi.mock("@ai-sdk/openai", () => ({
    openai: vi.fn().mockReturnValue("gpt-4o-model"),
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return {
        ...actual,
        cosineDistance: vi.fn().mockReturnValue("cosine_expr"),
        sql: vi.fn().mockReturnValue("similarity_expr"),
    };
});

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
        process.env.OPENAI_API_KEY = "sk-test-key";
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "usr_1" });
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_MEMBER);
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.painPoints.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
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

    it("returns 200 streaming response for valid request", async () => {
        const res = await POST(makeRequest({ messages: VALID_MESSAGES }));
        expect(res.status).toBe(200);
    });
});
