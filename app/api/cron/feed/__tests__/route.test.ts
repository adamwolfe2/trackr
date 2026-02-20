import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.CRON_SECRET = "test_cron_secret_456";

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            feedChannels: { findMany: vi.fn() },
        },
    },
}));

vi.mock("@/lib/actions/feed-pipeline", () => ({
    ingestAllChannels: vi.fn().mockResolvedValue(0),
}));

vi.mock("@/lib/actions/feed-enrichment", () => ({
    enrichFeedItems: vi.fn().mockResolvedValue(0),
}));

vi.mock("@/lib/actions/suggestions-pipeline", () => ({
    extractToolsFromFeedItems: vi.fn().mockResolvedValue(0),
    generateSuggestions: vi.fn().mockResolvedValue(0),
}));

import { db } from "@/lib/db";
import { ingestAllChannels } from "@/lib/actions/feed-pipeline";
import { enrichFeedItems } from "@/lib/actions/feed-enrichment";
import { GET } from "../route";

const VALID_AUTH = "Bearer test_cron_secret_456";

function makeRequest(authHeader?: string) {
    return {
        headers: { get: (key: string) => (key === "Authorization" ? (authHeader ?? null) : null) },
    } as unknown as Request;
}

describe("GET /api/cron/feed", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (db.query.feedChannels.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    });

    it("returns 401 for missing Authorization", async () => {
        const res = await GET(makeRequest());
        expect(res.status).toBe(401);
    });

    it("returns 401 for wrong secret", async () => {
        const res = await GET(makeRequest("Bearer wrong_secret"));
        expect(res.status).toBe(401);
    });

    it("returns 200 with zero counts when no channels are enabled", async () => {
        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.workspaces).toBe(0);
        expect(body.ingested).toBe(0);
    });

    it("processes each unique workspace once and returns totals", async () => {
        (db.query.feedChannels.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { workspaceId: "ws_1" },
            { workspaceId: "ws_1" }, // duplicate — should be deduped
            { workspaceId: "ws_2" },
        ]);
        (ingestAllChannels as ReturnType<typeof vi.fn>).mockResolvedValue(5);
        (enrichFeedItems as ReturnType<typeof vi.fn>).mockResolvedValue(3);

        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.workspaces).toBe(2); // deduplicated
        expect(body.ingested).toBe(10); // 5 per workspace × 2 workspaces
        expect(body.enriched).toBe(6); // 3 per workspace × 2 workspaces
    });

    it("continues processing remaining workspaces when one fails", async () => {
        (db.query.feedChannels.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { workspaceId: "ws_fail" },
            { workspaceId: "ws_ok" },
        ]);
        (ingestAllChannels as ReturnType<typeof vi.fn>)
            .mockRejectedValueOnce(new Error("DB error")) // ws_fail throws
            .mockResolvedValueOnce(3); // ws_ok succeeds

        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
        const body = await res.json();
        // Should still process ws_ok and report 3 ingested
        expect(body.ingested).toBe(3);
    });
});
