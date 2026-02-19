import { db } from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Authenticate Chrome Extension requests via Bearer API key.
 * Returns the workspace row if valid, null otherwise.
 */
export async function getWorkspaceFromApiKey(req: Request) {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return null;
    const apiKey = auth.slice(7);
    if (!apiKey) return null;

    const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.apiKey, apiKey),
    });
    return workspace ?? null;
}

/** Standard CORS headers for Chrome Extension origin */
export function corsHeaders(): Record<string, string> {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
    };
}
