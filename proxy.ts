import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit, getRateLimitHeaders } from "@/lib/middleware/rate-limit";

// Routes that handle their own auth (API key, HMAC, webhook signature, etc.)
// Each of these MUST implement its own authentication — see route files

/** Prefix-matched: any path starting with these bypasses Clerk entirely */
const BYPASS_PREFIXES = [
    "/api/extension/",       // API key auth (extension-auth.ts)
    "/api/cron/",            // CRON_SECRET verification
    "/api/audit/",           // Public — no auth required
];

/** Exact-matched: only these specific paths bypass Clerk */
const BYPASS_EXACT = [
    "/api/slack/commands",   // Slack HMAC signature verification
    "/api/slack/callback",   // Slack OAuth flow (state HMAC)
    "/api/stripe/webhook",   // Stripe webhook signature
    "/api/webhooks/clerk",   // Svix signature verification (Clerk user.created etc.)
];

/**
 * Public routes — everything NOT listed here requires a valid Clerk session.
 * auth.protect() redirects unauthenticated users to /sign-in at the edge,
 * before any layout/page code runs.
 */
const isPublicRoute = createRouteMatcher([
    "/",
    "/about",
    "/pricing",
    "/blog(.*)",
    "/changelog",
    "/chrome",
    "/contact",
    "/deck",
    "/for(.*)",
    "/partners",
    "/playbook",
    "/privacy",
    "/process",
    "/research(.*)",
    "/scorecard(.*)",
    "/security",
    "/slack",
    "/spend-report",
    "/terms",
    "/vs(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/share(.*)",
    "/invite(.*)",
    "/.well-known(.*)",
]);

function getIp(req: NextRequest): string {
    return (
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        req.headers.get("x-real-ip") ??
        "unknown"
    );
}

async function applyRateLimit(req: NextRequest, userId: string | null | undefined) {
    const { pathname } = req.nextUrl;
    const method = req.method;

    // Only rate-limit API routes
    if (!pathname.startsWith("/api/")) return null;
    // Skip webhooks
    if (pathname.startsWith("/api/webhooks/")) return null;
    // Skip GET requests to non-export routes
    if (method === "GET" && !pathname.startsWith("/api/export/")) return null;

    if (method === "POST" && /^\/api\/tools\/[^/]+\/research$/.test(pathname)) {
        return rateLimit(`research:${userId ?? getIp(req)}`, { limit: 5, windowSeconds: 60 });
    } else if (method === "POST" && pathname === "/api/chat") {
        return rateLimit(`chat:${userId ?? getIp(req)}`, { limit: 10, windowSeconds: 60 });
    } else if (method === "GET" && pathname.startsWith("/api/export/")) {
        return rateLimit(`export:${userId ?? getIp(req)}`, { limit: 2, windowSeconds: 60 });
    } else if (method === "POST" && pathname.startsWith("/api/")) {
        return rateLimit(`post:${getIp(req)}`, { limit: 30, windowSeconds: 60 });
    }

    return null;
}

// Fail closed: if Clerk key is missing in production, block all protected routes
const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isBuilding = process.env.NEXT_PHASE === "phase-production-build";
const clerk = hasClerkKey ? clerkMiddleware(async (auth, req: NextRequest) => {
    // Protect non-public routes at the edge — redirects to /sign-in before page renders
    if (!isPublicRoute(req)) {
        await auth.protect();
    }
    const { userId } = await auth();
    const rl = await applyRateLimit(req, userId);
    if (rl && !rl.success) {
        return NextResponse.json(
            { error: "Too many requests. Please try again shortly." },
            { status: 429, headers: getRateLimitHeaders(rl) }
        );
    }
}) : null;

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
