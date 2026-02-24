import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { after } from "next/server";
import { db } from "@/lib/db";
import { tools, subscriptions } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { getWorkspaceId } from "@/lib/db/queries";
import { performDeepResearch } from "@/lib/actions/research";
import { rateLimit } from "@/lib/middleware/rate-limit";
import { z } from "zod";

const StartResearchSchema = z.object({
    toolId: z.string().uuid("toolId must be a valid UUID"),
});

export const maxDuration = 300; // research pipeline takes 2-5 min; after() needs this headroom

/**
 * POST /api/research/start
 *
 * Kicks off deep research in the background using next/server after().
 * Returns immediately so the client connection doesn't timeout on Vercel.
 */
export async function POST(req: NextRequest) {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) return NextResponse.json({ error: "No workspace found" }, { status: 403 });

    // Rate limit: 5 research starts per minute per user
    const rl = await rateLimit(`research-start:${user.id}`, { limit: 5, windowSeconds: 60 });
    if (!rl.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = StartResearchSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? "Invalid request" },
            { status: 400 }
        );
    }

    const { toolId } = parsed.data;

    // Verify tool exists and belongs to this workspace
    const tool = await db.query.tools.findFirst({
        where: and(eq(tools.id, toolId), eq(tools.workspaceId, workspaceId)),
        columns: { id: true, status: true },
    });
    if (!tool) return NextResponse.json({ error: "Tool not found" }, { status: 404 });

    // Atomically claim the tool for research — the ne() condition ensures only one
    // concurrent request succeeds, preventing duplicate research jobs from rapid clicks.
    const [claimed] = await db.update(tools)
        .set({ status: "researching" })
        .where(and(
            eq(tools.id, toolId),
            eq(tools.workspaceId, workspaceId),
            ne(tools.status, "researching"),
        ))
        .returning({ id: tools.id });

    if (!claimed) {
        return NextResponse.json({ error: "Research already in progress" }, { status: 409 });
    }

    // Kick off research in the background — returns immediately
    after(() => performDeepResearch(toolId));

    return NextResponse.json({ success: true, message: "Research started" });
}
