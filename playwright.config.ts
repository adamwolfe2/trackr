import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

// Load .env.local so real Clerk/DB keys are available when starting the dev server
loadEnv({ path: ".env.local", override: false });

/**
 * E2E tests for Trackr.
 *
 * Tests cover two categories:
 *   1. Public pages (marketing, blog, research library) — no auth needed
 *   2. Auth-redirect flows — verify protected routes redirect unauthenticated users
 *
 * The webServer config starts `next dev` locally. In CI, the same stub env vars
 * used for unit tests are sufficient because all tested flows are unauthenticated.
 */

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? "github" : "list",
    timeout: 30_000,

    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
        trace: "on-first-retry",
        // Don't send cookies across test isolation
        storageState: undefined,
    },

    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],

    webServer: process.env.PLAYWRIGHT_BASE_URL
        ? undefined // Use external URL — don't start a local server
        : {
              command: "pnpm dev",
              url: "http://localhost:3000",
              reuseExistingServer: !process.env.CI,
              timeout: 120_000,
              env: {
                  // Stub values so the dev server starts without real credentials
                  DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://test:test@localhost:5432/test",
                  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
                      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "pk_test_e2e_stub",
                  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ?? "sk_test_e2e_stub",
                  CLERK_WEBHOOK_SECRET: "whsec_e2e_stub",
                  OPENAI_API_KEY: "sk-e2e-stub",
                  STRIPE_SECRET_KEY: "sk_test_e2e_stub",
                  STRIPE_WEBHOOK_SECRET: "whsec_e2e_stub",
                  FIRECRAWL_API_KEY: "fc_e2e_stub",
                  TAVILY_API_KEY: "tvly_e2e_stub",
                  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
                  CRON_SECRET: "cron_e2e_stub",
                  PERPLEXITY_API_KEY: "pplx_e2e_stub",
                  RESEND_API_KEY: "re_e2e_stub",
                  SLACK_CLIENT_ID: "slack_client_e2e_stub",
                  SLACK_CLIENT_SECRET: "slack_secret_e2e_stub",
              },
          },
});
