import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        DATABASE_URL: z.string().url(),
        CLERK_SECRET_KEY: z.string().min(1),
        CLERK_WEBHOOK_SECRET: z.string().min(1),
        FIRECRAWL_API_KEY: z.string().min(1),
        OPENAI_API_KEY: z.string().min(1),
        PERPLEXITY_API_KEY: z.string().optional(),
        STRIPE_SECRET_KEY: z.string().optional(),
        STRIPE_WEBHOOK_SECRET: z.string().optional(),
        NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    },
    client: {
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
        NEXT_PUBLIC_APP_URL: z.string().url(),
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
    },
    experimental__runtimeEnv: {
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    },
});
