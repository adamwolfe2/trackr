import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tools, subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getWorkspaceFromApiKey, corsHeaders } from "@/lib/middleware/extension-auth";
import { rateLimit } from "@/lib/middleware/rate-limit";
import { after } from "next/server";
import { performDeepResearch } from "@/lib/actions/research";
import { getPlanLimits } from "@/lib/config/subscriptions";

export async function OPTIONS(req: NextRequest) {
    return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

export async function POST(req: NextRequest) {
    const headers = corsHeaders(req);

    // Auth via API key
    const workspace = await getWorkspaceFromApiKey(req);
    if (!workspace) {
        return NextResponse.json(
            { error: "Invalid or missing API key" },
            { status: 401, headers }
        );
    }

    // Rate limit: 5 submissions per minute per workspace
    const rl = rateLimit(`ext-research:${workspace.id}`, { limit: 5, windowSeconds: 60 });
    if (!rl.success) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429, headers }
        );
    }

    // Parse body
    let body: { url?: string; title?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400, headers }
        );
    }

    const { url, title } = body;
    if (!url || typeof url !== "string") {
        return NextResponse.json(
            { error: "url is required" },
            { status: 400, headers }
        );
    }

    // Derive a tool name from the title or URL domain
    const toolName = title?.trim() || new URL(url).hostname.replace("www.", "");

    // Check tool count limit
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, workspace.id),
    });
    const limits = getPlanLimits(subscription);
    const toolCount = await db.query.tools.findMany({
        where: eq(tools.workspaceId, workspace.id),
        columns: { id: true },
    });
    if (limits.limits.tools !== Infinity && toolCount.length >= limits.limits.tools) {
        return NextResponse.json(
            { error: `Tool limit reached (${limits.limits.tools} on ${limits.name} plan)` },
            { status: 403, headers }
        );
    }

    try {
        // Generate embedding in parallel with logo preview if available
        let embedding = null;
        let logoUrl = null;
        try {
            const { generateEmbedding } = await import("@/lib/ai/embedding");
            const { previewToolInternal } = await import("@/lib/actions/preview");
            const [emb, preview] = await Promise.all([
                generateEmbedding(`${toolName}: ${url}`).catch(() => null),
                previewToolInternal(url).catch(() => null),
            ]);
            embedding = emb;
            logoUrl = (preview && "image" in preview && preview.image) ? preview.image : null;
        } catch {
            // Non-critical — proceed without embedding/logo
        }

        // Create tool entry with status "queued"
        const [newTool] = await db.insert(tools).values({
            workspaceId: workspace.id,
            name: toolName,
            websiteUrl: url,
            logoUrl,
            status: "queued",
            submittedBy: "chrome-extension",
            embedding,
        }).returning();

        // Kick off deep research in the background
        after(() => performDeepResearch(newTool.id));

        return NextResponse.json(
            { success: true, toolId: newTool.id },
            { status: 200, headers }
        );
    } catch (error: unknown) {
        console.error("Extension research error:", error instanceof Error ? error.message : error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers }
        );
    }
}
