import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
    currentUser: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            reports: { findFirst: vi.fn() },
            tools: { findFirst: vi.fn() },
            workspaceMembers: { findFirst: vi.fn() },
        },
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
    },
}));

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { POST } from "../route";

function makeRequest(body: unknown) {
    return {
        json: () => Promise.resolve(body),
    } as unknown as import("next/server").NextRequest;
}

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";
const MOCK_USER = { id: "usr_test" };
const MOCK_REPORT = { id: "rpt_1", toolId: "tool_1", shareToken: null };
const MOCK_TOOL = { workspaceId: "ws_1" };
const MOCK_MEMBER = { id: "mem_1", userId: "usr_test", workspaceId: "ws_1" };

describe("POST /api/reports/share", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (db.query.reports.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_REPORT);
        (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_TOOL);
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_MEMBER);

        const updateChain = { set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) };
        (db.update as ReturnType<typeof vi.fn>).mockReturnValue(updateChain);
    });

    it("returns 401 when user is not authenticated", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const res = await POST(makeRequest({ reportId: "rpt_1" }));
        expect(res.status).toBe(401);
    });

    it("returns 400 for invalid request body (malformed JSON path)", async () => {
        const req = {
            json: () => Promise.reject(new Error("bad json")),
        } as unknown as import("next/server").NextRequest;
        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it("returns 400 for missing reportId", async () => {
        const res = await POST(makeRequest({}));
        expect(res.status).toBe(400);
    });

    it("returns 400 for non-UUID reportId", async () => {
        const res = await POST(makeRequest({ reportId: "not-a-uuid" }));
        expect(res.status).toBe(400);
    });

    it("returns 404 when report not found", async () => {
        (db.query.reports.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const res = await POST(makeRequest({ reportId: VALID_UUID }));
        expect(res.status).toBe(404);
    });

    it("returns 403 when user is not a workspace member", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const res = await POST(makeRequest({ reportId: VALID_UUID }));
        expect(res.status).toBe(403);
    });

    it("returns existing share URL if token already exists", async () => {
        (db.query.reports.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            ...MOCK_REPORT,
            shareToken: "existing_token_abc",
        });
        const res = await POST(makeRequest({ reportId: VALID_UUID }));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.token).toBe("existing_token_abc");
        expect(body.url).toContain("existing_token_abc");
        // Should not call db.update for existing token
        expect(db.update).not.toHaveBeenCalled();
    });

    it("generates new share token and updates report", async () => {
        const res = await POST(makeRequest({ reportId: VALID_UUID }));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.token).toBeDefined();
        expect(body.url).toContain(body.token);
        expect(db.update).toHaveBeenCalled();
    });
});
