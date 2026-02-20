import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
    currentUser: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            workspaceMembers: { findFirst: vi.fn() },
            tools: { findFirst: vi.fn() },
            researchJobs: { findFirst: vi.fn() },
        },
    },
}));

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { GET } from "../route";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";
const MOCK_MEMBER = { id: "mem_1", workspaceId: "ws_1", userId: "usr_1" };
const MOCK_TOOL = { id: VALID_UUID, status: "active", researchLogs: ["Step 1 complete", "Step 2 complete"] };

function makeParams(id: string) {
    return { params: Promise.resolve({ id }) };
}

function makeRequest() {
    return {} as Request;
}

describe("GET /api/tools/[id]/logs", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "usr_1" });
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_MEMBER);
        (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_TOOL);
        (db.query.researchJobs.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    });

    it("returns 401 when not authenticated", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const res = await GET(makeRequest(), makeParams(VALID_UUID));
        expect(res.status).toBe(401);
    });

    it("returns 403 when no workspace found", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const res = await GET(makeRequest(), makeParams(VALID_UUID));
        expect(res.status).toBe(403);
    });

    it("returns 404 when tool not found in workspace", async () => {
        (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const res = await GET(makeRequest(), makeParams(VALID_UUID));
        expect(res.status).toBe(404);
    });

    it("returns 200 with logs for active tool", async () => {
        const res = await GET(makeRequest(), makeParams(VALID_UUID));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.logs).toEqual(["Step 1 complete", "Step 2 complete"]);
        expect(body.status).toBe("active");
        expect(body.errorMessage).toBeNull();
    });

    it("returns errorMessage from latest failed job for failed tool", async () => {
        (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            ...MOCK_TOOL,
            status: "failed",
        });
        (db.query.researchJobs.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            errorMessage: "Research timed out",
        });

        const res = await GET(makeRequest(), makeParams(VALID_UUID));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.status).toBe("failed");
        expect(body.errorMessage).toBe("Research timed out");
    });

    it("returns null errorMessage when no failed job record exists", async () => {
        (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            ...MOCK_TOOL,
            status: "failed",
        });
        (db.query.researchJobs.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

        const res = await GET(makeRequest(), makeParams(VALID_UUID));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.errorMessage).toBeNull();
    });
});
