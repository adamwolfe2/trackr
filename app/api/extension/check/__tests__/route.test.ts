import { describe, it, expect, vi, beforeEach } from "vitest";

const MOCK_WORKSPACE = { id: "ws_1", name: "Test Workspace" };

vi.mock("@/lib/middleware/extension-auth", () => ({
    getWorkspaceFromApiKey: vi.fn(),
    corsHeaders: vi.fn().mockReturnValue({ "Access-Control-Allow-Origin": "*" }),
    checkExtensionRateLimit: vi.fn().mockReturnValue(true),
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            softwareSpend: { findFirst: vi.fn() },
            tools: { findFirst: vi.fn() },
        },
    },
}));

import { getWorkspaceFromApiKey, checkExtensionRateLimit } from "@/lib/middleware/extension-auth";
import { db } from "@/lib/db";
import { GET } from "../route";

function makeRequest(domain?: string, apiKey?: string) {
    const url = new URL(`https://trackr.com/api/extension/check${domain ? `?domain=${domain}` : ""}`);
    return {
        headers: {
            get: (key: string) => (key === "Authorization" ? (apiKey ? `Bearer ${apiKey}` : null) : null),
            has: () => false,
        },
        nextUrl: url,
    } as unknown as import("next/server").NextRequest;
}

describe("GET /api/extension/check", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (getWorkspaceFromApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_WORKSPACE);
        (checkExtensionRateLimit as ReturnType<typeof vi.fn>).mockReturnValue(true);
        (db.query.softwareSpend.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    });

    it("returns 401 when API key is missing", async () => {
        (getWorkspaceFromApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const res = await GET(makeRequest("notion.so"));
        expect(res.status).toBe(401);
    });

    it("returns 429 when rate limit is exceeded", async () => {
        (checkExtensionRateLimit as ReturnType<typeof vi.fn>).mockReturnValue(false);
        const res = await GET(makeRequest("notion.so", "valid_key"));
        expect(res.status).toBe(429);
    });

    it("returns 400 when domain is missing", async () => {
        const res = await GET(makeRequest(undefined, "valid_key"));
        expect(res.status).toBe(400);
    });

    it("returns 200 with inStack: false when tool not in software spend", async () => {
        const res = await GET(makeRequest("notion.so", "valid_key"));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.inStack).toBe(false);
        expect(body.tool).toBeNull();
    });

    it("returns 200 with inStack: true when domain found in software spend", async () => {
        (db.query.softwareSpend.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "spend_1",
            toolName: "Notion",
            status: "active",
            monthlyCost: "50.00",
            seatCount: 5,
            workspaceId: "ws_1",
            vendorUrl: "notion.so",
        });

        const res = await GET(makeRequest("notion.so", "valid_key"));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.inStack).toBe(true);
        expect(body.tool.name).toBe("Notion");
        expect(body.tool.status).toBe("active");
    });

    it("includes score when a matching tool research record exists", async () => {
        (db.query.softwareSpend.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "spend_1",
            toolName: "Notion",
            status: "active",
            monthlyCost: "50.00",
            seatCount: 5,
            workspaceId: "ws_1",
            vendorUrl: "notion.so",
        });
        (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            overallScore: "88",
        });

        const res = await GET(makeRequest("notion.so", "valid_key"));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.tool.score).toBe("88");
    });
});
