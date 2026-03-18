import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

/**
 * Authenticate cron route requests.
 *
 * 1. In production, verifies the `x-vercel-cron` header is present
 *    (Vercel sets this on all cron invocations — cannot be spoofed by external callers).
 * 2. Validates the CRON_SECRET bearer token via constant-time comparison.
 *
 * Returns null on success, or a NextResponse error to return immediately.
 */
export function verifyCronRequest(req: Request): NextResponse | null {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
        return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    // In production, require the Vercel cron header to prevent external invocation
    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction) {
        const vercelCronHeader = req.headers.get("x-vercel-cron");
        if (!vercelCronHeader) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
    }

    // Validate bearer token
    const authHeader = req.headers.get("Authorization") || "";
    const expected = `Bearer ${cronSecret}`;
    if (
        authHeader.length !== expected.length ||
        !timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
    ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return null;
}
