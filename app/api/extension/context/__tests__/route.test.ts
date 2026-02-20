import { describe, it, expect, vi, beforeEach } from "vitest";

const MOCK_WORKSPACE = { id: "ws_1", name: "Acme Corp" };

vi.mock("@/lib/middleware/extension-auth", () => ({
    getWorkspaceFromApiKey: vi.fn(),
    corsHeaders: vi.fn().mockReturnValue({ "Access-Control-Allow-Origin": "*" }),
    checkExtensionRateLimit: vi.fn().mockReturnValue(true),
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            softwareSpend: { findMany: vi.fn() },
        },
    },
}));

vi.mock("@/lib/utils/stack-insights", () => ({
    computeStackInsights: vi.fn().mockReturnValue({
        score: 72,
        label: "AI-Forward",
        benchmarkText: "top quartile",
        totalActiveSpend: 1200,
        aiNativeCount: 5,
        aiEnabledCount: 3,
        traditionalCount: 2,
        unknownCount: 1,
        timeSavedPerMonth: 40,
        dollarValueSaved: 3200,
        opportunities: [{ priority: "high", title: "Consolidate duplicates" }],
        enrichedTools: [],
    }),
}));

import { getWorkspaceFromApiKey, checkExtensionRateLimit } from "@/lib/middleware/extension-auth";
import { db } from "@/lib/db";
import { GET } from "../route";

function makeRequest(apiKey?: string) {
    return {
        headers: {
            get: (key: string) => (key === "Authorization" ? (apiKey ? `Bearer ${apiKey}` : null) : null),
        },
        nextUrl: new URL("https://trackr.com/api/extension/context"),
    } as unknown as import("next/server").NextRequest;
}

describe("GET /api/extension/context", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (getWorkspaceFromApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_WORKSPACE);
        (checkExtensionRateLimit as ReturnType<typeof vi.fn>).mockReturnValue(true);
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { id: "spend_1", toolName: "Notion", status: "active", monthlyCost: "50", seatCount: 10, category: "productivity", workspaceId: "ws_1" },
            { id: "spend_2", toolName: "Slack", status: "active", monthlyCost: "100", seatCount: 50, category: "communication", workspaceId: "ws_1" },
        ]);
    });

    it("returns 401 for missing/invalid API key", async () => {
        (getWorkspaceFromApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const res = await GET(makeRequest());
        expect(res.status).toBe(401);
    });

    it("returns 429 when rate limit exceeded", async () => {
        (checkExtensionRateLimit as ReturnType<typeof vi.fn>).mockReturnValue(false);
        const res = await GET(makeRequest("valid_key"));
        expect(res.status).toBe(429);
    });

    it("returns 200 with workspace context and AI insights", async () => {
        const res = await GET(makeRequest("valid_key"));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.workspaceName).toBe("Acme Corp");
        expect(body.aiScore).toBe(72);
        expect(body.aiLabel).toBe("AI-Forward");
        expect(body.stackCount).toBe(2); // 2 active entries
        expect(body.opportunityCount).toBe(1);
    });

    it("returns stackCount of 0 for empty spend", async () => {
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        const res = await GET(makeRequest("valid_key"));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.stackCount).toBe(0);
    });
});
