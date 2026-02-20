import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { softwareSpend } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getWorkspaceFromApiKey, corsHeaders, checkExtensionRateLimit } from "@/lib/middleware/extension-auth";
import { computeStackInsights } from "@/lib/utils/stack-insights";

export async function OPTIONS(req: NextRequest) {
    return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

export async function GET(req: NextRequest) {
    const headers = corsHeaders(req);

    // Auth via API key
    const workspace = await getWorkspaceFromApiKey(req);
    if (!workspace) {
        return NextResponse.json(
            { error: "Invalid or missing API key" },
            { status: 401, headers }
        );
    }

    if (!checkExtensionRateLimit(workspace.id, 20)) {
        return NextResponse.json(
            { error: "Rate limit exceeded" },
            { status: 429, headers }
        );
    }

    try {
        // Fetch all software spend entries for this workspace
        const spendEntries = await db.query.softwareSpend.findMany({
            where: eq(softwareSpend.workspaceId, workspace.id),
        });

        // Compute stack insights
        const insights = computeStackInsights(
            spendEntries.map((e) => ({
                id: e.id,
                toolName: e.toolName,
                category: e.category,
                monthlyCost: e.monthlyCost,
                seatCount: e.seatCount,
                status: e.status,
            }))
        );

        return NextResponse.json(
            {
                workspaceName: workspace.name,
                aiScore: insights.score,
                aiLabel: insights.label,
                stackCount: spendEntries.filter((e) => e.status === "active").length,
                opportunityCount: insights.opportunities.length,
            },
            { status: 200, headers }
        );
    } catch (err) {
        if (process.env.NODE_ENV === "development") {
            console.error("[api/extension/context]", err);
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers }
        );
    }
}
