import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { softwareSpend, tools } from "@/lib/db/schema";
import { eq, and, ilike, or } from "drizzle-orm";
import { getWorkspaceFromApiKey, corsHeaders } from "@/lib/middleware/extension-auth";

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

    const domain = req.nextUrl.searchParams.get("domain")?.trim();
    if (!domain) {
        return NextResponse.json(
            { error: "domain query parameter is required" },
            { status: 400, headers }
        );
    }

    try {
        // Search softwareSpend where vendorUrl contains the domain,
        // OR toolName fuzzy-matches the domain (without TLD)
        const domainBase = domain.replace(/\.(com|io|co|app|dev|org|net|ai|so)$/, "");

        // Escape LIKE wildcards to prevent injection
        const escapedDomain = domain.replace(/[\\%_]/g, '\\$&');
        const escapedBase = domainBase.replace(/[\\%_]/g, '\\$&');

        const match = await db.query.softwareSpend.findFirst({
            where: and(
                eq(softwareSpend.workspaceId, workspace.id),
                or(
                    ilike(softwareSpend.vendorUrl, `%${escapedDomain}%`),
                    ilike(softwareSpend.toolName, `%${escapedBase}%`)
                )
            ),
        });

        if (!match) {
            return NextResponse.json(
                { inStack: false, tool: null },
                { status: 200, headers }
            );
        }

        // Try to find matching tool entry for score
        let score: string | null = null;
        const toolMatch = await db.query.tools.findFirst({
            where: and(
                eq(tools.workspaceId, workspace.id),
                or(
                    ilike(tools.name, `%${escapedBase}%`),
                    ilike(tools.websiteUrl, `%${escapedDomain}%`)
                )
            ),
            columns: { overallScore: true },
        });
        if (toolMatch?.overallScore) {
            score = toolMatch.overallScore;
        }

        return NextResponse.json(
            {
                inStack: true,
                tool: {
                    name: match.toolName,
                    status: match.status,
                    monthlyCost: match.monthlyCost,
                    seatCount: match.seatCount,
                    score,
                },
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
