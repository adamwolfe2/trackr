import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Clerk middleware — runs at the edge before every request.
 *
 * Public routes: marketing pages, blog, research library, API webhooks, cron.
 * Everything else (dashboard, onboarding, admin, settings, etc.) requires auth.
 */
const isPublicRoute = createRouteMatcher([
    // Marketing
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
    // Auth
    "/sign-in(.*)",
    "/sign-up(.*)",
    // Shared / public tool pages
    "/share(.*)",
    // Public invite accept (checked inside the route)
    "/invite(.*)",
    // Well-known
    "/.well-known(.*)",
    // API — webhooks and cron do their own signature verification
    "/api/webhooks(.*)",
    "/api/slack/commands",
    "/api/slack/callback",
    "/api/stripe/webhook",
    "/api/cron(.*)",
    // Next internals
    "/_next(.*)",
    "/favicon.ico",
    "/apple-icon.png",
    "/robots.txt",
    "/sitemap.xml",
]);

export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip static files and internals, but always run on pages and API routes
        "/((?!_next/static|_next/image|favicon\\.ico|apple-icon\\.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
        "/(api|trpc)(.*)",
    ],
};
