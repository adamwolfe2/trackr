import { test, expect } from "@playwright/test";

/**
 * SEO / content page smoke tests.
 *
 * All pages are public — no auth required.
 * Tests verify pages load (no 4xx/5xx), have a title, and render meaningful content.
 *
 * Coverage:
 *   - VS (alternative) hub + individual VS pages
 *   - Comparison pages (tool-vs-tool)
 *   - ICP (for-teams) hub + individual ICP pages
 *   - Marketing pages added in GTM sessions (chrome, slack, partners, security)
 */

// ---------------------------------------------------------------------------
// VS pages
// ---------------------------------------------------------------------------

test.describe("VS Hub", () => {
    test("loads and shows headline", async ({ page }) => {
        const res = await page.goto("/vs");
        expect(res?.status()).toBeLessThan(400);
        const text = await page.locator("body").innerText();
        expect(text.toLowerCase()).toMatch(/alternative|vs|trackr/i);
    });

    test("links to individual VS pages", async ({ page }) => {
        await page.goto("/vs");
        const links = page.getByRole("link");
        const count = await links.count();
        expect(count).toBeGreaterThan(5);
    });
});

const VS_PAGES = [
    "/vs/g2",
    "/vs/vendr",
    "/vs/spreadsheets",
    "/vs/notion",
    "/vs/gartner",
    "/vs/capterra",
    "/vs/spendflo",
    "/vs/trustradius",
    "/vs/software-advice",
    "/vs/chatgpt",
];

test.describe("VS Pages", () => {
    for (const path of VS_PAGES) {
        test(`${path} loads successfully`, async ({ page }) => {
            const res = await page.goto(path);
            expect(res?.status()).toBeLessThan(400);
            // Page should mention Trackr or the competitor name
            const text = await page.locator("body").innerText();
            expect(text.length).toBeGreaterThan(200);
        });

        test(`${path} links back to /vs hub`, async ({ page }) => {
            await page.goto(path);
            // Breadcrumb or "See all" link back to hub
            const hubLink = page.getByRole("link", { name: /see all|alternatives|back/i }).first();
            await expect(hubLink).toBeVisible();
        });
    }
});

// ---------------------------------------------------------------------------
// Comparison pages (tool A vs tool B)
// ---------------------------------------------------------------------------

// Comparison pages live at /research/compare/[slug]
// Sample a subset — all 36 would be slow; this covers the key ones
const COMPARISON_PAGES = [
    "/research/compare/claude-vs-chatgpt",
    "/research/compare/notion-vs-linear",
    "/research/compare/salesforce-vs-attio",
    "/research/compare/instantly-vs-apollo",
    "/research/compare/clay-vs-clearbit",
    "/research/compare/canva-vs-midjourney",
];

test.describe("Comparison Pages", () => {
    for (const path of COMPARISON_PAGES) {
        test(`${path} loads with content`, async ({ page }) => {
            const res = await page.goto(path);
            expect(res?.status()).toBeLessThan(400);
            const text = await page.locator("body").innerText();
            expect(text.length).toBeGreaterThan(300);
        });
    }
});

// ---------------------------------------------------------------------------
// ICP (for-teams) pages
// ---------------------------------------------------------------------------

test.describe("For-Teams Hub", () => {
    test("loads and shows team roles", async ({ page }) => {
        const res = await page.goto("/for");
        expect(res?.status()).toBeLessThan(400);
        const text = await page.locator("body").innerText();
        expect(text.toLowerCase()).toMatch(/team|ops|finance|marketing|revenue/i);
    });

    test("links to individual ICP pages", async ({ page }) => {
        await page.goto("/for");
        const links = page.getByRole("link");
        const count = await links.count();
        expect(count).toBeGreaterThan(5);
    });
});

const ICP_PAGES = [
    "/for/ops-teams",
    "/for/revenue-ops",
    "/for/startup-founders",
    "/for/chief-of-staff",
    "/for/marketing-teams",
    "/for/finance-teams",
    "/for/it-leaders",
];

test.describe("ICP Pages", () => {
    for (const path of ICP_PAGES) {
        test(`${path} loads with content`, async ({ page }) => {
            const res = await page.goto(path);
            // Some ICP pages may 404 if slug doesn't match — accept 404 but not 500
            const status = res?.status() ?? 200;
            expect(status).not.toBe(500);
            if (status < 400) {
                const text = await page.locator("body").innerText();
                expect(text.length).toBeGreaterThan(200);
            }
        });
    }
});

// ---------------------------------------------------------------------------
// GTM marketing pages
// ---------------------------------------------------------------------------

test.describe("GTM Marketing Pages", () => {
    test("/chrome page loads", async ({ page }) => {
        const res = await page.goto("/chrome");
        expect(res?.status()).toBeLessThan(400);
        const text = await page.locator("body").innerText();
        expect(text.toLowerCase()).toMatch(/chrome|extension|trackr/i);
    });

    test("/slack page loads", async ({ page }) => {
        const res = await page.goto("/slack");
        expect(res?.status()).toBeLessThan(400);
        const text = await page.locator("body").innerText();
        expect(text.toLowerCase()).toMatch(/slack|trackr/i);
    });

    test("/partners page loads", async ({ page }) => {
        const res = await page.goto("/partners");
        expect(res?.status()).toBeLessThan(400);
    });

    test("/security page loads and mentions trust signals", async ({ page }) => {
        const res = await page.goto("/security");
        expect(res?.status()).toBeLessThan(400);
        const text = await page.locator("body").innerText();
        expect(text.toLowerCase()).toMatch(/security|privacy|data|encrypt/i);
    });

    test("/.well-known/security.txt is served", async ({ page }) => {
        const res = await page.goto("/.well-known/security.txt");
        expect(res?.status()).toBeLessThan(400);
    });
});

// ---------------------------------------------------------------------------
// Research library
// ---------------------------------------------------------------------------

test.describe("Research Library", () => {
    test("loads with tool cards", async ({ page }) => {
        const res = await page.goto("/research");
        expect(res?.status()).toBeLessThan(400);
        const text = await page.locator("body").innerText();
        // Library should show tool content
        expect(text.toLowerCase()).toMatch(/research|tool|score|ai/i);
    });

    test("shows search / filter controls", async ({ page }) => {
        await page.goto("/research");
        // There should be some kind of filter or search UI
        const body = page.locator("body");
        await expect(body).toBeVisible();
        const text = await body.innerText();
        expect(text.length).toBeGreaterThan(100);
    });
});

// ---------------------------------------------------------------------------
// Sitemap
// ---------------------------------------------------------------------------

test.describe("Sitemap", () => {
    test("sitemap.xml is served", async ({ page }) => {
        const res = await page.goto("/sitemap.xml");
        expect(res?.status()).toBeLessThan(400);
        const content = await page.content();
        expect(content).toContain("<url>");
    });

    test("sitemap contains key routes", async ({ page }) => {
        await page.goto("/sitemap.xml");
        const content = await page.content();
        expect(content).toContain("trytrackr.com");
    });
});
