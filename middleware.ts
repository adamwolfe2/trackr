import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that handle their own auth (API key, HMAC, etc.) — skip Clerk
const BYPASS_CLERK = ["/api/extension/", "/api/slack/commands", "/api/cron/", "/admin/"];

// Gracefully handle missing Clerk credentials (e.g., during local builds)
const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const clerk = hasClerkKey ? clerkMiddleware() : null;

export default function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    if (BYPASS_CLERK.some((prefix) => path.startsWith(prefix))) {
        return NextResponse.next();
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
