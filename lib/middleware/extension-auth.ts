import { db } from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createHash, timingSafeEqual } from "crypto";

function hashApiKey(key: string): string {
    return createHash("sha256").update(key).digest("hex");
}

/**
 * Authenticate Chrome Extension requests via Bearer API key.
 * Returns the workspace row if valid, null otherwise.
 */
export async function getWorkspaceFromApiKey(req: Request) {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return null;
    const apiKey = auth.slice(7);
    if (!apiKey) return null;

    const hashedKey = hashApiKey(apiKey);
    const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.apiKey, hashedKey),
    });
    if (!workspace?.apiKey) return null;

    // Constant-time comparison to prevent timing oracle attacks
    const storedBuf = Buffer.from(workspace.apiKey, "hex");
    const incomingBuf = Buffer.from(hashedKey, "hex");
    if (storedBuf.length !== incomingBuf.length || !timingSafeEqual(storedBuf, incomingBuf)) {
        return null;
    }
    return workspace;
}

/**
 * CORS headers for Chrome Extension.
 * Uses the request Origin header to restrict to the specific extension ID or localhost.
 */
export function corsHeaders(req?: Request): Record<string, string> {
    const origin = req?.headers.get("Origin") || "";

    // Allow Chrome extensions (strict pattern), localhost dev ports, and production domain
    const productionOrigin = process.env.NEXT_PUBLIC_APP_URL ?? "https://trytrackr.com";
    const isAllowed =
        /^chrome-extension:\/\/[a-z0-9]{20,}$/.test(origin) ||
        origin === "http://localhost:3000" ||
        origin === "http://localhost:3001" ||
        origin === productionOrigin;

    return {
        "Access-Control-Allow-Origin": isAllowed ? origin : "",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin",
    };
}

/**
 * Per-workspace rate limiter for extension routes.
 * Delegates to the shared rateLimit() which uses Upstash Redis in production
 * (persistent across cold starts) with an in-memory fallback for local dev.
 */
import { rateLimit } from "@/lib/middleware/rate-limit";

export async function checkExtensionRateLimit(workspaceId: string, maxPerMinute = 30): Promise<boolean> {
    const result = await rateLimit(`ext-workspace:${workspaceId}`, {
        limit: maxPerMinute,
        windowSeconds: 60,
    });
    return result.success;
}
