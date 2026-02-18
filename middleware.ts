import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Gracefully handle missing Clerk credentials (e.g., during local builds)
const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const clerkHandler = hasClerkKey
    ? clerkMiddleware()
    : (_req: NextRequest) => NextResponse.next();

export default clerkHandler;

export const config = {
    matcher: [
        // Skip Next.js internals, static files, and special routes
        '/((?!_next|_not-found|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
