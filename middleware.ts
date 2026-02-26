import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getRateLimitHeaders } from "@/lib/middleware/rate-limit";

function getIp(req: NextRequest): string {
    return (
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        req.headers.get("x-real-ip") ??
        "unknown"
    );
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
    const { pathname } = req.nextUrl;
    const method = req.method;

    // Skip: Clerk auth routes
    if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
        return;
    }

    // Skip: webhook callbacks must never be rate-limited
    if (pathname.startsWith("/api/webhooks/")) {
        return;
    }

    // Only rate-limit API routes
    if (!pathname.startsWith("/api/")) {
        return;
    }

    // Skip GET requests to non-export routes
    if (method === "GET" && !pathname.startsWith("/api/export/")) {
        return;
    }

    const { userId } = await auth();

    let result;

    if (method === "POST" && /^\/api\/tools\/[^/]+\/research$/.test(pathname)) {
        // Research requests: 5/min per user
        const id = userId ?? getIp(req);
        result = await rateLimit(`research:${id}`, { limit: 5, windowSeconds: 60 });
    } else if (method === "POST" && pathname === "/api/chat") {
        // Chat: 10/min per user
        const id = userId ?? getIp(req);
        result = await rateLimit(`chat:${id}`, { limit: 10, windowSeconds: 60 });
    } else if (method === "GET" && pathname.startsWith("/api/export/")) {
        // Export: 2/min per user
        const id = userId ?? getIp(req);
        result = await rateLimit(`export:${id}`, { limit: 2, windowSeconds: 60 });
    } else if (method === "POST" && pathname.startsWith("/api/")) {
        // All other POSTs: 30/min per IP
        const ip = getIp(req);
        result = await rateLimit(`post:${ip}`, { limit: 30, windowSeconds: 60 });
    }

    if (result && !result.success) {
        return NextResponse.json(
            { error: "Too many requests. Please try again shortly." },
            { status: 429, headers: getRateLimitHeaders(result) }
        );
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and static assets
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
