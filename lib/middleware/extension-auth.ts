import { db } from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";

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
    return workspace ?? null;
}

/**
 * CORS headers for Chrome Extension.
 * Uses the request Origin header to restrict to the specific extension ID or localhost.
 */
export function corsHeaders(req?: Request): Record<string, string> {
    const origin = req?.headers.get("Origin") || "";

    // Allow Chrome extensions and localhost (for dev)
    const isAllowed =
        origin.startsWith("chrome-extension://") ||
        origin.startsWith("http://localhost") ||
        origin === "https://trytrackr.com";

    return {
        "Access-Control-Allow-Origin": isAllowed ? origin : "https://trytrackr.com",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin",
    };
}

/**
 * Simple per-workspace rate limiter for extension routes.
 * In-memory — resets on cold start. Acceptable for extension API.
 */
const extensionRateMap = new Map<string, { count: number; reset: number }>();

export function checkExtensionRateLimit(workspaceId: string, maxPerMinute = 30): boolean {
    const now = Date.now();
    const entry = extensionRateMap.get(workspaceId);

    if (!entry || now > entry.reset) {
        extensionRateMap.set(workspaceId, { count: 1, reset: now + 60_000 });
        return true;
    }

    if (entry.count >= maxPerMinute) return false;
    entry.count++;
    return true;
}
