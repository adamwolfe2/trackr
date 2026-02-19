import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { softwareSpend } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getWorkspaceFromApiKey, corsHeaders } from "@/lib/middleware/extension-auth";
import { computeStackInsights } from "@/lib/utils/stack-insights";

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
    const headers = corsHeaders();

    // Auth via API key
    const workspace = await getWorkspaceFromApiKey(req);
    if (!workspace) {
        return NextResponse.json(
            { error: "Invalid or missing API key" },
            { status: 401, headers }
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
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: message },
            { status: 500, headers }
        );
    }
}
