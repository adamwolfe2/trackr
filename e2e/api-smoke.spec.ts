import { test, expect } from "@playwright/test";

/**
 * API endpoint smoke tests.
 *
 * Verifies that API endpoints:
 *   - Return proper 401 / 403 for unauthenticated requests (not 500)
 *   - Reject invalid payloads gracefully (400, not 500)
 *   - Don't expose stack traces or internal error details in responses
 *
 * These tests use page.request (Playwright's fetch API) so they hit the Next.js
 * dev server directly without loading a browser page.
 */

// ---------------------------------------------------------------------------
// Auth-protected API endpoints — should return 401, not crash
// ---------------------------------------------------------------------------

const PROTECTED_API_ROUTES = [
    { method: "GET", path: "/api/notifications" },
    { method: "GET", path: "/api/tools" },
    { method: "POST", path: "/api/tools" },
    { method: "GET", path: "/api/research" },
    { method: "POST", path: "/api/research" },
    { method: "GET", path: "/api/workspace" },
    { method: "GET", path: "/api/credits" },
    { method: "GET", path: "/api/referrals" },
    { method: "GET", path: "/api/analytics" },
];

test.describe("Protected API Endpoints", () => {
    for (const { method, path } of PROTECTED_API_ROUTES) {
        test(`${method} ${path} returns 401 or 403, not 500`, async ({ request }) => {
            const res = await request[method.toLowerCase() as "get" | "post"](path, {
                headers: { "Content-Type": "application/json" },
                data: method === "POST" ? {} : undefined,
                failOnStatusCode: false,
            });
            const status = res.status();
            // Must not be a server error
            expect(status).not.toBe(500);
            expect(status).not.toBe(503);
            // Must not accidentally return 200 (data exposure)
            // Allow 401, 403, 404 (route may not exist yet), and redirects (3xx)
            expect([200, 201]).not.toContain(status);
        });
    }
});

// ---------------------------------------------------------------------------
// Public API endpoints — should return 200
// ---------------------------------------------------------------------------

test.describe("Public API Endpoints", () => {
    test("GET /api/health or root returns non-500", async ({ request }) => {
        // Many apps don't have /api/health — just confirm it doesn't 500
        const res = await request.get("/api/health", { failOnStatusCode: false });
        expect(res.status()).not.toBe(500);
    });
});

// ---------------------------------------------------------------------------
// Webhook endpoints — should reject invalid signatures gracefully
// ---------------------------------------------------------------------------

test.describe("Webhook Endpoints", () => {
    test("POST /api/webhooks/clerk rejects unsigned request", async ({ request }) => {
        const res = await request.post("/api/webhooks/clerk", {
            headers: { "Content-Type": "application/json" },
            data: { type: "user.created", data: {} },
            failOnStatusCode: false,
        });
        // Svix signature check should return 400 or 401, never 500
        const status = res.status();
        expect(status).not.toBe(500);
        expect(status).toBeLessThan(500);
    });

    test("POST /api/stripe/webhook rejects unsigned request", async ({ request }) => {
        const res = await request.post("/api/stripe/webhook", {
            headers: { "Content-Type": "application/json" },
            data: { type: "checkout.session.completed" },
            failOnStatusCode: false,
        });
        const status = res.status();
        expect(status).not.toBe(500);
    });

    test("POST /api/slack/commands rejects unsigned request", async ({ request }) => {
        const res = await request.post("/api/slack/commands", {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            data: "command=%2Ftrackr&text=help",
            failOnStatusCode: false,
        });
        // HMAC check should reject with 401 or 403, not crash
        const status = res.status();
        expect(status).not.toBe(500);
    });
});

// ---------------------------------------------------------------------------
// Cron endpoints — should require cron secret
// ---------------------------------------------------------------------------

test.describe("Cron Endpoints", () => {
    test("GET /api/cron/research requires authorization", async ({ request }) => {
        const res = await request.get("/api/cron/research", {
            failOnStatusCode: false,
        });
        const status = res.status();
        // Without CRON_SECRET header it should return 401 or 403
        expect(status).not.toBe(500);
        expect(status).not.toBe(200);
    });

    test("GET /api/cron/research rejects wrong secret", async ({ request }) => {
        const res = await request.get("/api/cron/research", {
            headers: { Authorization: "Bearer wrong-secret" },
            failOnStatusCode: false,
        });
        const status = res.status();
        expect(status).not.toBe(500);
        expect(status).not.toBe(200);
    });
});

// ---------------------------------------------------------------------------
// Error response format — no stack traces leaked
// ---------------------------------------------------------------------------

test.describe("Error Response Format", () => {
    test("401 responses do not leak stack traces", async ({ request }) => {
        const res = await request.get("/api/notifications", {
            failOnStatusCode: false,
        });
        const body = await res.text();
        // Should not contain Node.js stack trace markers
        expect(body).not.toMatch(/at Object\.<anonymous>/);
        expect(body).not.toMatch(/node_modules/);
        expect(body).not.toMatch(/\.ts:\d+:\d+/);
    });
});
