import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHash } from "crypto";

function hashTestKey(key: string): string {
    return createHash("sha256").update(key).digest("hex");
}

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
            get: (key: string) => (key === "Authorization" ? (authHeader ?? null) : key === "Origin" ? "chrome-extension://abcdefghijklmnopqrstuvwxyzabcdef" : null),
        },
    } as unknown as Request;
}

const TEST_API_KEY = "trk_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4";
const MOCK_WORKSPACE = { id: "ws_1", name: "Acme Corp", apiKey: hashTestKey(TEST_API_KEY) };

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
        // The route hashes the key with SHA-256; mock stores the real hash so timingSafeEqual passes
        const result = await getWorkspaceFromApiKey(makeRequest(`Bearer ${TEST_API_KEY}`));
        expect(result).toBe(MOCK_WORKSPACE);
        expect(db.query.workspaces.findFirst).toHaveBeenCalled();
    });

    it("returns null when no workspace matches the hashed key", async () => {
        (db.query.workspaces.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const result = await getWorkspaceFromApiKey(makeRequest("Bearer trk_00000000000000000000000000000000"));
        expect(result).toBeNull();
    });
});

describe("corsHeaders", () => {
    it("allows chrome-extension origins with valid ID format", () => {
        // Chrome extension IDs are 32 lowercase letters; use a realistic mock ID
        const extOrigin = "chrome-extension://abcdefghijklmnopqrstuvwxyzabcdef";
        const req = { headers: { get: () => extOrigin } } as unknown as Request;
        const headers = corsHeaders(req);
        expect(headers["Access-Control-Allow-Origin"]).toBe(extOrigin);
    });

    it("allows localhost origins in development", () => {
        const prev = process.env.NODE_ENV;
        process.env.NODE_ENV = "development";
        const req = { headers: { get: () => "http://localhost:3000" } } as unknown as Request;
        const headers = corsHeaders(req);
        expect(headers["Access-Control-Allow-Origin"]).toBe("http://localhost:3000");
        process.env.NODE_ENV = prev;
    });

    it("blocks localhost origins in production", () => {
        const prev = process.env.NODE_ENV;
        process.env.NODE_ENV = "production";
        const req = { headers: { get: () => "http://localhost:3000" } } as unknown as Request;
        const headers = corsHeaders(req);
        expect(headers["Access-Control-Allow-Origin"]).toBe("");
        process.env.NODE_ENV = prev;
    });

    it("returns empty string for unknown origins (not trytrackr.com)", () => {
        const req = { headers: { get: () => "https://evil.com" } } as unknown as Request;
        const headers = corsHeaders(req);
        expect(headers["Access-Control-Allow-Origin"]).toBe("");
    });

    it("includes required CORS headers", () => {
        const req = { headers: { get: () => null } } as unknown as Request;
        const headers = corsHeaders(req);
        expect(headers["Access-Control-Allow-Methods"]).toContain("GET");
        expect(headers["Access-Control-Allow-Headers"]).toContain("Authorization");
    });
});

describe("checkExtensionRateLimit", () => {
    it("returns true for first request within limit", async () => {
        const result = await checkExtensionRateLimit("ws_rl_test_1", 30);
        expect(result).toBe(true);
    });

    it("returns false after exceeding max requests", async () => {
        const wsId = "ws_rl_exceed_test";
        // First max requests should pass
        for (let i = 0; i < 3; i++) {
            await checkExtensionRateLimit(wsId, 3);
        }
        // Next request should be rate limited
        const result = await checkExtensionRateLimit(wsId, 3);
        expect(result).toBe(false);
    });

    it("uses 30 as default max per minute", async () => {
        const result = await checkExtensionRateLimit("ws_rl_default_test");
        expect(result).toBe(true);
    });
});
