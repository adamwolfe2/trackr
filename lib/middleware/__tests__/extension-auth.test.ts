import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            workspaces: { findFirst: vi.fn() },
        },
    },
}));

import { db } from "@/lib/db";
import { getWorkspaceFromApiKey, corsHeaders, checkExtensionRateLimit } from "../extension-auth";

// Helper to make a request with Authorization header
function makeRequest(authHeader?: string) {
    return {
        headers: {
            get: (key: string) => (key === "Authorization" ? (authHeader ?? null) : key === "Origin" ? "chrome-extension://abc123" : null),
        },
    } as unknown as Request;
}

const MOCK_WORKSPACE = { id: "ws_1", name: "Acme Corp", apiKey: "hashed_key" };

describe("getWorkspaceFromApiKey", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (db.query.workspaces.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_WORKSPACE);
    });

    it("returns null when Authorization header is missing", async () => {
        const result = await getWorkspaceFromApiKey(makeRequest());
        expect(result).toBeNull();
    });

    it("returns null when Authorization header does not start with Bearer", async () => {
        const result = await getWorkspaceFromApiKey(makeRequest("Basic abc123"));
        expect(result).toBeNull();
    });

    it("returns null when Bearer token is empty", async () => {
        const result = await getWorkspaceFromApiKey(makeRequest("Bearer "));
        expect(result).toBeNull();
    });

    it("returns workspace when valid API key matches hashed key", async () => {
        // The route hashes the key with SHA-256 before querying
        // Mock returns MOCK_WORKSPACE regardless of hash — just verify the DB was queried
        const result = await getWorkspaceFromApiKey(makeRequest("Bearer valid_api_key_123"));
        expect(result).toBe(MOCK_WORKSPACE);
        expect(db.query.workspaces.findFirst).toHaveBeenCalled();
    });

    it("returns null when no workspace matches the hashed key", async () => {
        (db.query.workspaces.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const result = await getWorkspaceFromApiKey(makeRequest("Bearer some_key"));
        expect(result).toBeNull();
    });
});

describe("corsHeaders", () => {
    it("allows chrome-extension origins", () => {
        const req = { headers: { get: () => "chrome-extension://abc123" } } as unknown as Request;
        const headers = corsHeaders(req);
        expect(headers["Access-Control-Allow-Origin"]).toBe("chrome-extension://abc123");
    });

    it("allows localhost origins", () => {
        const req = { headers: { get: () => "http://localhost:3000" } } as unknown as Request;
        const headers = corsHeaders(req);
        expect(headers["Access-Control-Allow-Origin"]).toBe("http://localhost:3000");
    });

    it("falls back to trytrackr.com for unknown origins", () => {
        const req = { headers: { get: () => "https://evil.com" } } as unknown as Request;
        const headers = corsHeaders(req);
        expect(headers["Access-Control-Allow-Origin"]).toBe("https://trytrackr.com");
    });

    it("includes required CORS headers", () => {
        const req = { headers: { get: () => null } } as unknown as Request;
        const headers = corsHeaders(req);
        expect(headers["Access-Control-Allow-Methods"]).toContain("GET");
        expect(headers["Access-Control-Allow-Headers"]).toContain("Authorization");
    });
});

describe("checkExtensionRateLimit", () => {
    it("returns true for first request within limit", () => {
        const result = checkExtensionRateLimit("ws_rl_test_1", 30);
        expect(result).toBe(true);
    });

    it("returns false after exceeding max requests", () => {
        const wsId = "ws_rl_exceed_test";
        // First max requests should pass
        for (let i = 0; i < 3; i++) {
            checkExtensionRateLimit(wsId, 3);
        }
        // Next request should be rate limited
        const result = checkExtensionRateLimit(wsId, 3);
        expect(result).toBe(false);
    });

    it("uses 30 as default max per minute", () => {
        const result = checkExtensionRateLimit("ws_rl_default_test");
        expect(result).toBe(true);
    });
});
