import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.CRON_SECRET = "test_secret_123";

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            researchJobs: { findMany: vi.fn() },
            tools: { findMany: vi.fn() },
        },
        select: vi.fn(),
    },
}));

vi.mock("@/lib/db/schema", () => ({
    researchJobs: {},
    tools: {},
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return {
        ...actual,
        eq: vi.fn((...args: unknown[]) => args),
        and: vi.fn((...args: unknown[]) => args),
        lte: vi.fn((...args: unknown[]) => args),
        gte: vi.fn((...args: unknown[]) => args),
        inArray: vi.fn((...args: unknown[]) => args),
        count: vi.fn(() => "count()"),
    };
});

vi.mock("next/server", () => ({
    NextResponse: {
        json: (body: unknown, init?: ResponseInit) =>
            new Response(JSON.stringify(body), {
                ...init,
                headers: { "Content-Type": "application/json", ...init?.headers },
            }),
    },
    after: vi.fn((fn: () => void) => fn()),
}));

vi.mock("@/lib/actions/research", () => ({
    performDeepResearch: vi.fn().mockResolvedValue({ success: true }),
}));

import { db } from "@/lib/db";
import { after } from "next/server";
import { performDeepResearch } from "@/lib/actions/research";
import { GET } from "../route";

const VALID_AUTH = "Bearer test_secret_123";

function makeRequest(authHeader?: string) {
    return {
        headers: {
            get: (key: string) => (key === "Authorization" ? (authHeader ?? null) : null),
        },
    } as unknown as Request;
}

/** Creates a failed job that completed `minutesAgo` minutes ago */
function makeFailedJob(toolId: string, minutesAgo: number) {
    return {
        id: `job_${toolId}`,
        toolId,
        completedAt: new Date(Date.now() - minutesAgo * 60_000),
    };
}

function setupSelectChain(rows: { toolId: string; total: number }[]) {
    const groupBy = vi.fn().mockResolvedValue(rows);
    const where = vi.fn().mockReturnValue({ groupBy });
    const from = vi.fn().mockReturnValue({ where });
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from });
}

describe("GET /api/cron/auto-retry-failed", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (db.query.researchJobs.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        setupSelectChain([]);
    });

    it("returns 401 for missing Authorization header", async () => {
        const res = await GET(makeRequest());
        expect(res.status).toBe(401);
    });

    it("returns 401 for wrong secret", async () => {
        const res = await GET(makeRequest("Bearer wrong_secret"));
        expect(res.status).toBe(401);
    });

    it("returns 200 with retried: 0 when no candidate failed jobs", async () => {
        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.retried).toBe(0);
    });

    it("returns retried: 0 when no tools have exactly 1 job (already retried)", async () => {
        (db.query.researchJobs.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            makeFailedJob("tool_1", 30),
        ]);
        // tool_1 has 2 total jobs (already retried manually)
        setupSelectChain([{ toolId: "tool_1", total: 2 }]);

        const res = await GET(makeRequest(VALID_AUTH));
        const body = await res.json();
        expect(body.retried).toBe(0);
        expect(performDeepResearch).not.toHaveBeenCalled();
    });

    it("retries a tool with exactly 1 failed job", async () => {
        (db.query.researchJobs.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            makeFailedJob("tool_1", 10),
        ]);
        setupSelectChain([{ toolId: "tool_1", total: 1 }]);
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "tool_1" }]);

        const res = await GET(makeRequest(VALID_AUTH));
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.retried).toBe(1);
        expect(body.toolIds).toContain("tool_1");
        expect(after).toHaveBeenCalledTimes(1);
        expect(performDeepResearch).toHaveBeenCalledWith("tool_1");
    });

    it("deduplicates multiple failed jobs for the same tool", async () => {
        // Two job rows for the same tool (e.g. two batched failures) — should only retry once
        (db.query.researchJobs.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            makeFailedJob("tool_1", 20),
            makeFailedJob("tool_1", 15), // same tool
        ]);
        // But jobCounts says total === 1 because it's the same job counted once (deduplicated by toolId)
        setupSelectChain([{ toolId: "tool_1", total: 1 }]);
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "tool_1" }]);

        const res = await GET(makeRequest(VALID_AUTH));
        const body = await res.json();
        expect(body.retried).toBe(1);
        expect(performDeepResearch).toHaveBeenCalledTimes(1);
    });

    it("skips tools that are no longer in 'failed' status (manually retried between queries)", async () => {
        (db.query.researchJobs.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            makeFailedJob("tool_1", 10),
        ]);
        setupSelectChain([{ toolId: "tool_1", total: 1 }]);
        // Tool is now "researching" — user already clicked retry
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]); // no failed tools returned

        const res = await GET(makeRequest(VALID_AUTH));
        const body = await res.json();
        expect(body.retried).toBe(0);
        expect(performDeepResearch).not.toHaveBeenCalled();
    });

    it("retries multiple eligible tools in one run", async () => {
        (db.query.researchJobs.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            makeFailedJob("tool_1", 10),
            makeFailedJob("tool_2", 25),
        ]);
        setupSelectChain([
            { toolId: "tool_1", total: 1 },
            { toolId: "tool_2", total: 1 },
        ]);
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { id: "tool_1" },
            { id: "tool_2" },
        ]);

        const res = await GET(makeRequest(VALID_AUTH));
        const body = await res.json();
        expect(body.retried).toBe(2);
        expect(performDeepResearch).toHaveBeenCalledTimes(2);
        expect(performDeepResearch).toHaveBeenCalledWith("tool_1");
        expect(performDeepResearch).toHaveBeenCalledWith("tool_2");
    });

    it("returns 500 on internal error", async () => {
        (db.query.researchJobs.findMany as ReturnType<typeof vi.fn>).mockRejectedValue(
            new Error("DB connection lost")
        );
        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(500);
    });
});
