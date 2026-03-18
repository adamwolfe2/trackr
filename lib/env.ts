import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        // Database
        DATABASE_URL: z.string().min(1),

        // Clerk
        CLERK_SECRET_KEY: z.string().min(1),
        CLERK_WEBHOOK_SECRET: z.string().optional(),

        // Stripe — required for billing
        STRIPE_SECRET_KEY: z.string().min(1),
        STRIPE_WEBHOOK_SECRET: z.string().min(1),

        // Scheduled jobs
        CRON_SECRET: z.string().min(1),

        // AI services
        OPENAI_API_KEY: z.string().optional(),
        PERPLEXITY_API_KEY: z.string().optional(),
        TAVILY_API_KEY: z.string().min(1),

        // Email
        RESEND_API_KEY: z.string().min(1),

        // Upstash Redis (rate limiting) — optional, falls back to in-memory
        KV_REST_API_URL: z.string().optional(),
        KV_REST_API_TOKEN: z.string().optional(),

        // Sentry — optional, gracefully skipped if absent
        SENTRY_AUTH_TOKEN: z.string().optional(),
        SENTRY_ORG: z.string().optional(),
        SENTRY_PROJECT: z.string().optional(),

        // Slack — optional integration
        SLACK_CLIENT_ID: z.string().optional(),
        SLACK_CLIENT_SECRET: z.string().optional(),
        SLACK_SIGNING_SECRET: z.string().optional(),

        // Firecrawl — optional, used for URL scraping
        FIRECRAWL_API_KEY: z.string().optional(),

        // xAI/Grok — optional enrichment provider
        XAI_API_KEY: z.string().optional(),

        // Admin access — at least one should be set for /admin dashboard
        ADMIN_PASSWORD: z.string().optional(),
        ADMIN_EMAILS: z.string().optional(),
    },
    client: {
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
        NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
        NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
    },
    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
        CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        CRON_SECRET: process.env.CRON_SECRET,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
        TAVILY_API_KEY: process.env.TAVILY_API_KEY,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        KV_REST_API_URL: process.env.KV_REST_API_URL,
        KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
        SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN?.trim(),
        SENTRY_ORG: process.env.SENTRY_ORG?.trim(),
        SENTRY_PROJECT: process.env.SENTRY_PROJECT?.trim(),
        SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID,
        SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET,
        SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET,
        FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY,
        XAI_API_KEY: process.env.XAI_API_KEY,
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
        ADMIN_EMAILS: process.env.ADMIN_EMAILS,
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
        NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    },
    skipValidation: !!process.env.SKIP_ENV_VALIDATION || process.env.NODE_ENV === "test",
});
