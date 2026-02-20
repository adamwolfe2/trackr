import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that handle their own auth (API key, HMAC, webhook signature, etc.)
// Each of these MUST implement its own authentication — see route files

/** Prefix-matched: any path starting with these bypasses Clerk */
const BYPASS_PREFIXES = [
    "/api/extension/",       // API key auth (extension-auth.ts)
    "/api/cron/",            // CRON_SECRET verification
];

/** Exact-matched: only these specific paths bypass Clerk */
const BYPASS_EXACT = [
    "/api/slack/commands",   // Slack HMAC signature verification
    "/api/slack/callback",   // Slack OAuth flow (state HMAC)
    "/api/stripe/webhook",   // Stripe webhook signature
    "/api/webhooks/clerk",   // Svix signature verification (Clerk user.created etc.)
];

// Fail closed: if Clerk key is missing in production, block all protected routes
const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isBuilding = process.env.NEXT_PHASE === "phase-production-build";
const clerk = hasClerkKey ? clerkMiddleware() : null;

export default function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    if (
        BYPASS_PREFIXES.some((prefix) => path.startsWith(prefix)) ||
        BYPASS_EXACT.includes(path)
    ) {
        return NextResponse.next();
    }

    // If Clerk is not configured and we're not in a build, block the request
    if (!clerk && !isBuilding) {
        return NextResponse.json({ error: "Authentication unavailable" }, { status: 503 });
    }

    return clerk ? clerk(req, {} as never) : NextResponse.next();
}

export const config = {
    matcher: [
        // Skip Next.js internals, static files, and special routes
        '/((?!_next|_not-found|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
