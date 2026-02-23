import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tools, workspaceMembers } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, inArray, and } from "drizzle-orm";

// GET /api/research/bulk-status?ids=id1,id2,...
// Returns lightweight status for an array of tool IDs (for live polling).
export async function GET(req: Request) {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const idsParam = searchParams.get("ids") ?? "";
        const ids = idsParam
            .split(",")
            .map(s => s.trim())
            .filter(s => /^[0-9a-f-]{36}$/.test(s)) // basic UUID validation
            .slice(0, 50);

        if (!ids.length) return NextResponse.json([]);

        const member = await db.query.workspaceMembers.findFirst({
            where: eq(workspaceMembers.userId, user.id),
            columns: { workspaceId: true },
        });
        if (!member) return NextResponse.json({ error: "No workspace" }, { status: 403 });

        const rows = await db
            .select({
                id: tools.id,
                name: tools.name,
                status: tools.status,
                overallScore: tools.overallScore,
                logoUrl: tools.logoUrl,
                websiteUrl: tools.websiteUrl,
            })
            .from(tools)
            .where(
                and(
                    inArray(tools.id, ids),
                    eq(tools.workspaceId, member.workspaceId),
                ),
            );

        return NextResponse.json(rows);
    } catch (err) {
        console.error("[bulk-status]", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
