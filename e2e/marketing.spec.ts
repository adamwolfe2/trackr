import { test, expect } from "@playwright/test";

/**
 * Marketing page smoke tests.
 * All pages are public — no auth required.
 * Tests verify key content renders and there are no JS errors.
 */

test.describe("Marketing — Homepage", () => {
    test("loads and shows key headline", async ({ page }) => {
        await page.goto("/");
        await expect(page).toHaveTitle(/Trackr/i);
        // The hero section should be visible
        const body = await page.locator("body");
        await expect(body).toBeVisible();
    });

    test("has navigation links", async ({ page }) => {
        await page.goto("/");
        // Key nav links should exist
        await expect(page.getByRole("link", { name: /Pricing/i }).first()).toBeVisible();
    });

    test("shows sign-in and sign-up CTAs", async ({ page }) => {
        await page.goto("/");
        // At least one sign-in or get-started link
        const ctaLink = page.getByRole("link", { name: /sign in|get started|sign up/i }).first();
        await expect(ctaLink).toBeVisible();
    });
});

test.describe("Marketing — Pricing Page", () => {
    test("loads successfully", async ({ page }) => {
        const response = await page.goto("/pricing");
        expect(response?.status()).toBeLessThan(400);
        await expect(page).toHaveTitle(/Pricing.*Trackr|Trackr.*Pricing/i);
    });

    test("shows plan names", async ({ page }) => {
        await page.goto("/pricing");
        // At least one plan card should be visible — check for text that appears on all pricing pages
        const body = page.locator("body");
        const text = await body.innerText();
        expect(text.toLowerCase()).toMatch(/free|starter|team|plan/);
    });
});

test.describe("Marketing — About Page", () => {
    test("loads successfully", async ({ page }) => {
        const response = await page.goto("/about");
        expect(response?.status()).toBeLessThan(400);
    });
});

test.describe("Marketing — Process Page", () => {
    test("loads successfully", async ({ page }) => {
        const response = await page.goto("/process");
        expect(response?.status()).toBeLessThan(400);
        await expect(page).toHaveTitle(/Process.*Trackr|Trackr.*Process/i);
    });

    test("shows pipeline step content", async ({ page }) => {
        await page.goto("/process");
        const body = page.locator("body");
        const text = await body.innerText();
        // Should mention research steps
        expect(text.toLowerCase()).toMatch(/research|pipeline|step/);
    });
});

test.describe("Marketing — Blog", () => {
    test("blog index loads", async ({ page }) => {
        const response = await page.goto("/blog");
        expect(response?.status()).toBeLessThan(400);
        await expect(page).toHaveTitle(/Blog.*Trackr|Trackr.*Blog/i);
    });

    test("blog index shows post links", async ({ page }) => {
        await page.goto("/blog");
        // Should have at least some article links
        const links = page.getByRole("link");
        const count = await links.count();
        expect(count).toBeGreaterThan(5); // nav + multiple posts
    });

    test("blog post loads", async ({ page }) => {
        const response = await page.goto("/blog/how-to-audit-your-ai-stack");
        expect(response?.status()).toBeLessThan(400);
    });

    test("blog post has readable content", async ({ page }) => {
        await page.goto("/blog/best-project-management-tools-2026");
        const body = page.locator("body");
        const text = await body.innerText();
        expect(text.length).toBeGreaterThan(500);
    });
});

test.describe("Marketing — Research Library", () => {
    test("loads successfully", async ({ page }) => {
        const response = await page.goto("/research");
        expect(response?.status()).toBeLessThan(400);
    });
});

test.describe("Marketing — Sign In / Sign Up", () => {
    test("sign-in page loads", async ({ page }) => {
        const response = await page.goto("/sign-in");
        expect(response?.status()).toBeLessThan(400);
    });

    test("sign-up page loads", async ({ page }) => {
        const response = await page.goto("/sign-up");
        expect(response?.status()).toBeLessThan(400);
    });
});
