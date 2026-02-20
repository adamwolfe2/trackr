import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tools } from "@/lib/db/schema";
import { getWorkspaceFromApiKey, corsHeaders } from "@/lib/middleware/extension-auth";
import { rateLimit } from "@/lib/middleware/rate-limit";
import { after } from "next/server";
import { performDeepResearch } from "@/lib/actions/research";

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
    const headers = corsHeaders();

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

    try {
        // Generate embedding in parallel with logo preview if available
        let embedding = null;
        let logoUrl = null;
        try {
            const { generateEmbedding } = await import("@/lib/ai/embedding");
            const { previewTool } = await import("@/lib/actions/preview");
            const [emb, preview] = await Promise.all([
                generateEmbedding(`${toolName}: ${url}`).catch(() => null),
                previewTool(url).catch(() => null),
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
