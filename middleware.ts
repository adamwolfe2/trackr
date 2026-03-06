import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Public routes — accessible without Clerk auth.
 * Everything NOT matched here is protected by default.
 */
const isPublicRoute = createRouteMatcher([
    // Marketing / static pages
    "/",
    "/about",
    "/audit(.*)",
    "/alternatives(.*)",
    "/apply(.*)",
    "/blog(.*)",
    "/changelog",
    "/chrome",
    "/contact",
    "/deck",
    "/faq",
    "/for(.*)",
    "/glossary(.*)",
    "/industries(.*)",
    "/invite(.*)",
    "/legal(.*)",
    "/partners",
    "/playbook",
    "/pricing",
    "/privacy",
    "/process",
    "/r(.*)",
    "/research(.*)",
    "/scorecard",
    "/security",
    "/share(.*)",
    "/slack",
    "/spend-report",
    "/stack/(.*)",  // public tool stack pages (not dashboard /stack)
    "/terms",
    "/use-cases(.*)",
    "/vs(.*)",
    // Auth pages
    "/sign-in(.*)",
    "/sign-up(.*)",
    // Admin (own password-based auth)
    "/admin(.*)",
    // Webhooks — must never require Clerk auth
    "/api/stripe/webhook",
    "/api/webhooks/(.*)",
    // Public API endpoints
    "/api/votes(.*)",
    "/api/embed/(.*)",
    "/api/audit/submit",
    "/api/architect/apply",
    "/api/health",
    // Extension API (API-key auth)
    "/api/extension/(.*)",
    // Cron jobs (CRON_SECRET header auth)
    "/api/cron/(.*)",
    // Slack (signing-secret + OAuth auth)
    "/api/slack/(.*)",
    // Architect routes (own auth)
    "/api/architect/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and static files
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
