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
    "/api/admin/",           // ADMIN_PASSWORD bearer auth
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
    "/sitemap.xml",
    "/robots.txt",
    "/apple-icon.png",
    "/advertise",
    "/advertise/(.*)",
    "/apply(.*)",
    "/audit(.*)",
    "/legal(.*)",
    "/api/architect/apply",
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
    const { userId } = await auth();
    if (!isPublicRoute(req) && !userId) {
        // API routes return 401 JSON — never redirect (redirects break API clients)
        if (req.nextUrl.pathname.startsWith("/api/")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // Page routes redirect to sign-in
        const signInUrl = new URL("/sign-in", req.url);
        signInUrl.searchParams.set("redirect_url", req.url);
        return NextResponse.redirect(signInUrl);
    }
    const rl = await applyRateLimit(req, userId);
    if (rl && !rl.success) {
        return NextResponse.json(
            { error: "Too many requests. Please try again shortly." },
            { status: 429, headers: getRateLimitHeaders(rl) }
        );
    }
}) : null;

/** Persist architect referral code in a 30-day cookie when visiting /audit?arc=CODE */
function applyArcCodeCookie(req: NextRequest, res: NextResponse): void {
    const { pathname, searchParams } = req.nextUrl;
    if (pathname !== "/audit") return;
    const arcCode = searchParams.get("arc");
    if (!arcCode) return;
    const existing = req.cookies.get("trackr_arc")?.value;
    // First-touch: never overwrite an existing attribution — first architect wins
    if (existing) return;
    res.cookies.set("trackr_arc", arcCode.toUpperCase(), {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
    });
}

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    if (
        BYPASS_PREFIXES.some((prefix) => path.startsWith(prefix)) ||
        BYPASS_EXACT.includes(path)
    ) {
        const res = NextResponse.next();
        applyArcCodeCookie(req, res);
        return res;
    }

    // If Clerk is not configured and we're not in a build, block the request
    if (!clerk && !isBuilding) {
        return NextResponse.json({ error: "Authentication unavailable" }, { status: 503 });
    }

    const res = (await (clerk ? clerk(req, {} as never) : Promise.resolve(NextResponse.next()))) as NextResponse;
    applyArcCodeCookie(req, res);
    return res;
}

export const config = {
    matcher: [
        // Skip Next.js internals, static files, and special routes
        '/((?!_next|_not-found|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
