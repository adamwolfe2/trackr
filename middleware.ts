import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that never require authentication
const isPublicRoute = createRouteMatcher([
    // Marketing
    "/",
    "/pricing(.*)",
    "/about(.*)",
    "/blog(.*)",
    "/changelog(.*)",
    "/process(.*)",
    "/terms(.*)",
    "/privacy(.*)",
    "/security(.*)",
    "/chrome(.*)",
    "/slack(.*)",
    "/partners(.*)",
    "/playbook(.*)",
    "/deck(.*)",
    // Auth
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/onboarding(.*)",
    // Public content
    "/research(.*)",
    "/vs(.*)",
    "/for(.*)",
    "/audit(.*)",
    "/share(.*)",
    "/invite(.*)",
    "/spend-report(.*)",
    // API routes with their own auth (webhooks, crons, extension, Slack)
    "/api/webhooks/(.*)",
    "/api/cron/(.*)",
    "/api/extension/(.*)",
    "/api/slack/(.*)",
    "/api/audit/(.*)",
    "/api/reports/share(.*)",
    // Static and system
    "/robots.txt",
    "/.well-known/(.*)",
    "/sitemap.xml",
    "/apple-icon.png",
    "/favicon.ico",
    "/og.png",
]);

export default clerkMiddleware(
    async (auth, request: NextRequest) => {
        // Fail closed in production if Clerk key is missing
        if (
            process.env.NODE_ENV === "production" &&
            !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
        ) {
            return new NextResponse("Service temporarily unavailable", {
                status: 503,
            });
        }

        // Public routes pass through without auth check
        if (isPublicRoute(request)) {
            return NextResponse.next();
        }

        // All other routes require authentication
        // auth.protect() redirects to sign-in if not authenticated
        await auth.protect();
    }
);

export const config = {
    matcher: [
        // Skip Next.js internals and all static files unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
