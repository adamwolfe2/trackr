import { describe, it, expect, vi, beforeEach } from "vitest";

// Set CRON_SECRET before importing the route
process.env.CRON_SECRET = "test_secret_123";

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            researchJobs: { findMany: vi.fn() },
            reports: { findFirst: vi.fn() },
        },
        update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue(undefined),
            }),
        }),
    },
}));

import { db } from "@/lib/db";
import { GET } from "../route";

function makeRequest(authHeader?: string) {
    return {
        headers: {
            get: (key: string) => (key === "Authorization" ? (authHeader ?? null) : null),
        },
    } as unknown as Request;
}

const VALID_AUTH = "Bearer test_secret_123";

describe("GET /api/cron/recover-stuck-jobs", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (db.query.researchJobs.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.reports.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        (db.update as ReturnType<typeof vi.fn>).mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue(undefined),
            }),
        });
    });

    it("returns 401 for missing Authorization header", async () => {
        const res = await GET(makeRequest());
        expect(res.status).toBe(401);
    });

    it("returns 401 for wrong secret", async () => {
        const res = await GET(makeRequest("Bearer wrong_secret"));
        expect(res.status).toBe(401);
    });

    it("returns 200 with recovered: 0 when no stuck jobs", async () => {
        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.recovered).toBe(0);
    });

    it("recovers stuck jobs and reverts tool status to failed (no existing report)", async () => {
        const stuckJobs = [
            { id: "job_1", toolId: "tool_1", triggeredAt: new Date(Date.now() - 15 * 60_000) },
        ];
        (db.query.researchJobs.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(stuckJobs);
        (db.query.reports.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.recovered).toBe(1);
        expect(body.toolIds).toContain("tool_1");
        expect(db.update).toHaveBeenCalled();
    });

    it("reverts tool status to active when an existing report exists", async () => {
        const stuckJobs = [
            { id: "job_2", toolId: "tool_2", triggeredAt: new Date(Date.now() - 15 * 60_000) },
        ];
        (db.query.researchJobs.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(stuckJobs);
        (db.query.reports.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "rpt_1" });

        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.recovered).toBe(1);
    });

    it("deduplicates toolIds when multiple jobs share the same tool", async () => {
        const stuckJobs = [
            { id: "job_3", toolId: "tool_3", triggeredAt: new Date(Date.now() - 15 * 60_000) },
            { id: "job_4", toolId: "tool_3", triggeredAt: new Date(Date.now() - 12 * 60_000) },
        ];
        (db.query.researchJobs.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(stuckJobs);
        (db.query.reports.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.recovered).toBe(2); // 2 jobs
        expect(body.toolIds).toEqual(["tool_3"]); // deduplicated to 1 unique tool
    });

    it("returns 500 on internal database error", async () => {
        (db.query.researchJobs.findMany as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("DB unavailable"));
        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(500);
    });
});
