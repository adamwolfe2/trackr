import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.CRON_SECRET = "test_research_cron_secret";

vi.mock("next/server", async () => {
    const actual = await vi.importActual<typeof import("next/server")>("next/server");
    return { ...actual, after: vi.fn((fn: () => Promise<void>) => fn()) };
});

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            researchJobs: { findMany: vi.fn() },
            tools: { findMany: vi.fn() },
        },
        update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue(undefined),
            }),
        }),
    },
}));

vi.mock("@/lib/actions/research", () => ({
    performDeepResearch: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return {
        ...actual,
        eq: vi.fn((...args) => args),
        and: vi.fn((...args) => args),
        ne: vi.fn((...args) => args),
        lte: vi.fn((...args) => args),
        lt: vi.fn((...args) => args),
        isNotNull: vi.fn((...args) => args),
        inArray: vi.fn((...args) => args),
    };
});

import { db } from "@/lib/db";
import { performDeepResearch } from "@/lib/actions/research";
import { GET } from "../route";

const VALID_AUTH = "Bearer test_research_cron_secret";

function makeRequest(authHeader?: string) {
    return {
        headers: { get: (key: string) => (key === "Authorization" ? (authHeader ?? null) : null) },
    } as unknown as Request;
}

describe("GET /api/cron/research", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (db.query.researchJobs.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.update as ReturnType<typeof vi.fn>).mockReturnValue({
            set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
        });
    });

    // ── Auth ──────────────────────────────────────────────────────────────────

    it("returns 401 for missing Authorization header", async () => {
        const res = await GET(makeRequest());
        expect(res.status).toBe(401);
    });

    it("returns 401 for wrong secret", async () => {
        const res = await GET(makeRequest("Bearer wrong_secret"));
        expect(res.status).toBe(401);
    });

    it("returns 401 for malformed Bearer token", async () => {
        const res = await GET(makeRequest("Basic test_research_cron_secret"));
        expect(res.status).toBe(401);
    });

    it("returns 200 with valid auth when nothing to process", async () => {
        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.scheduled).toBe(0);
        expect(body.recovered).toBe(0);
    });

    // ── Stuck-job recovery ────────────────────────────────────────────────────

    it("recovers stuck jobs and marks them failed", async () => {
        const stuckJobs = [
            { id: "job_1", toolId: "t_1" },
            { id: "job_2", toolId: "t_2" },
        ];
        (db.query.researchJobs.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(stuckJobs);

        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.recovered).toBe(2);

        // Should update both tools and jobs
        expect(db.update).toHaveBeenCalledTimes(2);
    });

    it("reports zero recovered when no stuck jobs", async () => {
        (db.query.researchJobs.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

        const res = await GET(makeRequest(VALID_AUTH));
        const body = await res.json();
        expect(body.recovered).toBe(0);
    });

    // ── Scheduled research ────────────────────────────────────────────────────

    it("triggers performDeepResearch for each due tool", async () => {
        const dueTools = [
            { id: "tool_a", researchInterval: "weekly" },
            { id: "tool_b", researchInterval: "monthly" },
        ];
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(dueTools);

        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.scheduled).toBe(2);
        expect(body.toolIds).toEqual(["tool_a", "tool_b"]);

        expect(performDeepResearch).toHaveBeenCalledTimes(2);
        expect(performDeepResearch).toHaveBeenCalledWith("tool_a");
        expect(performDeepResearch).toHaveBeenCalledWith("tool_b");
    });

    it("does not call performDeepResearch when no tools are due", async () => {
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        await GET(makeRequest(VALID_AUTH));
        expect(performDeepResearch).not.toHaveBeenCalled();
    });

    it("returns toolIds in response for traceability", async () => {
        const dueTools = [{ id: "tool_xyz", researchInterval: "biweekly" }];
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(dueTools);

        const res = await GET(makeRequest(VALID_AUTH));
        const body = await res.json();
        expect(body.toolIds).toContain("tool_xyz");
    });

    it("advances nextResearchAt by batching tools by interval", async () => {
        const dueTools = [
            { id: "tool_1", researchInterval: "weekly" },
            { id: "tool_2", researchInterval: "weekly" },
            { id: "tool_3", researchInterval: "monthly" },
        ];
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(dueTools);

        await GET(makeRequest(VALID_AUTH));

        // 2 intervals (weekly + monthly) = 2 update calls for nextResearchAt
        // Plus possibly stuck-jobs updates if any — but no stuck jobs here
        expect(db.update).toHaveBeenCalledTimes(2);
    });

    it("gracefully continues when performDeepResearch throws", async () => {
        const dueTools = [{ id: "tool_fail", researchInterval: "weekly" }];
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(dueTools);
        (performDeepResearch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("research failed"));

        // Should NOT throw — route catches errors
        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
    });
});
