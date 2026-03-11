import { describe, it, expect, vi, beforeEach } from "vitest";

const {
    mockRateLimit,
    mockDbInsert,
    mockDbSelect,
    mockDbQueryFindFirst,
} = vi.hoisted(() => ({
    mockRateLimit: vi.fn(),
    mockDbInsert: vi.fn(),
    mockDbSelect: vi.fn(),
    mockDbQueryFindFirst: vi.fn(),
}));

vi.mock("@/lib/middleware/rate-limit", () => ({
    rateLimit: mockRateLimit,
    getRateLimitHeaders: vi.fn().mockReturnValue({}),
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            communityVotes: { findFirst: mockDbQueryFindFirst },
        },
        insert: mockDbInsert,
        select: mockDbSelect,
    },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return { ...actual, eq: vi.fn((...args) => args), sql: vi.fn((...args) => args) };
});

import { NextRequest } from "next/server";
import { GET, POST } from "../route";

function makeGetRequest(slug?: string) {
    const url = slug
        ? `http://localhost/api/votes?slug=${encodeURIComponent(slug)}`
        : "http://localhost/api/votes";
    return new NextRequest(url);
}

function makePostRequest(body: unknown, ip = "1.2.3.4") {
    return new NextRequest("http://localhost/api/votes", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    });
}

describe("GET /api/votes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockDbQueryFindFirst.mockResolvedValue(null);
        mockDbSelect.mockReturnValue({
            from: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([]),
            }),
        });
    });

    it("returns vote counts for a valid slug", async () => {
        mockDbQueryFindFirst.mockResolvedValue({ upVotes: 10, downVotes: 2 });
        const res = await GET(makeGetRequest("notion"));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.up).toBe(10);
        expect(body.down).toBe(2);
    });

    it("returns zero counts when slug has no votes yet", async () => {
        mockDbQueryFindFirst.mockResolvedValue(null);
        const res = await GET(makeGetRequest("new-tool"));
        const body = await res.json();
        expect(body.up).toBe(0);
        expect(body.down).toBe(0);
    });

    it("returns 400 for invalid slug (SQL injection attempt)", async () => {
        const res = await GET(makeGetRequest("'; DROP TABLE votes; --"));
        expect(res.status).toBe(400);
    });

    it("returns 400 for slug that is too long", async () => {
        const longSlug = "a".repeat(201);
        const res = await GET(makeGetRequest(longSlug));
        expect(res.status).toBe(400);
    });

    it("returns all votes map when no slug provided", async () => {
        mockDbSelect.mockReturnValue({
            from: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                    { toolSlug: "notion", upVotes: 5, downVotes: 1 },
                    { toolSlug: "linear", upVotes: 8, downVotes: 0 },
                ]),
            }),
        });
        const res = await GET(makeGetRequest());
        const body = await res.json();
        expect(body.votes).toHaveProperty("notion");
        expect(body.votes["notion"]).toEqual({ up: 5, down: 1 });
    });
});

describe("POST /api/votes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRateLimit.mockResolvedValue({ success: true });
        mockDbInsert.mockReturnValue({
            values: vi.fn().mockReturnValue({
                onConflictDoUpdate: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{ up: 6, down: 1 }]),
                }),
            }),
        });
    });

    it("returns 429 when rate limited", async () => {
        mockRateLimit.mockResolvedValue({ success: false });
        const res = await POST(makePostRequest({ slug: "notion", type: "up" }));
        expect(res.status).toBe(429);
    });

    it("returns 400 for unparseable JSON body", async () => {
        const req = new NextRequest("http://localhost/api/votes", {
            method: "POST",
            body: "not json at all",
            headers: { "Content-Type": "application/json", "x-forwarded-for": "1.2.3.4" },
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it("returns 400 for invalid vote type", async () => {
        const res = await POST(makePostRequest({ slug: "notion", type: "middle" }));
        expect(res.status).toBe(400);
    });

    it("returns 400 for invalid slug format", async () => {
        const res = await POST(makePostRequest({ slug: "<script>alert(1)</script>", type: "up" }));
        expect(res.status).toBe(400);
    });

    it("returns 400 when slug is missing", async () => {
        const res = await POST(makePostRequest({ type: "up" }));
        expect(res.status).toBe(400);
    });

    it("returns 200 with updated vote counts for a valid up vote", async () => {
        const res = await POST(makePostRequest({ slug: "notion", type: "up" }));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toHaveProperty("up");
        expect(body).toHaveProperty("down");
    });

    it("returns 200 for a valid down vote", async () => {
        const res = await POST(makePostRequest({ slug: "linear", type: "down" }));
        expect(res.status).toBe(200);
    });

    it("accepts prevType for vote changing", async () => {
        const res = await POST(makePostRequest({ slug: "notion", type: "down", prevType: "up" }));
        expect(res.status).toBe(200);
    });

    it("uses rightmost x-forwarded-for IP for rate limiting to prevent header spoofing", async () => {
        await POST(makePostRequest({ slug: "notion", type: "up" }, "10.0.0.1, 203.0.113.1"));
        expect(mockRateLimit).toHaveBeenCalledWith(
            expect.stringContaining("203.0.113.1"),
            expect.any(Object)
        );
    });
});
