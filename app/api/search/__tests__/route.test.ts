import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
    currentUser: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            workspaceMembers: { findFirst: vi.fn() },
        },
        select: vi.fn(),
    },
}));

vi.mock("@/lib/ai/embedding", () => ({
    generateEmbedding: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
}));

vi.mock("@/lib/middleware/rate-limit", () => ({
    rateLimit: vi.fn().mockReturnValue({ success: true, remaining: 29, reset: Date.now() + 60000 }),
    getRateLimitHeaders: vi.fn().mockReturnValue({}),
}));

// Mock drizzle operators used in the route
vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return {
        ...actual,
        cosineDistance: vi.fn().mockReturnValue("cosine_distance_expr"),
        sql: vi.fn().mockReturnValue("similarity_expr"),
    };
});

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/middleware/rate-limit";
import { POST } from "../route";

function makeRequest(body: unknown, ip?: string) {
    return {
        json: () => Promise.resolve(body),
        headers: { get: (key: string) => (key === "x-forwarded-for" ? (ip ?? null) : null) },
        nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as import("next/server").NextRequest;
}

const MOCK_MEMBER = { id: "mem_1", workspaceId: "ws_1", userId: "usr_1" };

describe("POST /api/search", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "usr_1" });
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_MEMBER);
        (rateLimit as ReturnType<typeof vi.fn>).mockReturnValue({ success: true, remaining: 29, reset: Date.now() + 60000 });

        // Default: select chain returns empty results
        (db.select as ReturnType<typeof vi.fn>).mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    orderBy: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue([]),
                    }),
                }),
            }),
        });
    });

    it("returns 401 when not authenticated", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const res = await POST(makeRequest({ query: "test" }));
        expect(res.status).toBe(401);
    });

    it("returns 403 when user has no workspace", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const res = await POST(makeRequest({ query: "test" }));
        expect(res.status).toBe(403);
    });

    it("returns 429 when rate limit is exceeded", async () => {
        (rateLimit as ReturnType<typeof vi.fn>).mockReturnValue({ success: false, remaining: 0, reset: Date.now() + 60000 });
        const res = await POST(makeRequest({ query: "test" }));
        expect(res.status).toBe(429);
    });

    it("returns 400 for invalid JSON", async () => {
        const req = {
            json: () => Promise.reject(new Error("bad json")),
            headers: { get: () => null },
            nextUrl: { searchParams: new URLSearchParams() },
        } as unknown as import("next/server").NextRequest;
        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it("returns 400 for missing query", async () => {
        const res = await POST(makeRequest({}));
        expect(res.status).toBe(400);
    });

    it("returns 400 for empty string query", async () => {
        const res = await POST(makeRequest({ query: "" }));
        expect(res.status).toBe(400);
    });

    it("returns 400 for query over 500 chars", async () => {
        const res = await POST(makeRequest({ query: "x".repeat(501) }));
        expect(res.status).toBe(400);
    });

    it("returns 200 with results for valid query", async () => {
        const mockResults = [{ id: "tool_1", name: "Notion", status: "active", matchScore: 0.92 }];
        (db.select as ReturnType<typeof vi.fn>).mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    orderBy: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue(mockResults),
                    }),
                }),
            }),
        });

        const res = await POST(makeRequest({ query: "project management" }));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.results).toBeDefined();
    });
});
