import { db } from "@/lib/db";
import { tools, workspaceMembers } from "@/lib/db/schema";
import { and, eq, ne, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const member = await db.query.workspaceMembers.findFirst({
            where: eq(workspaceMembers.userId, user.id),
        });
        if (!member) return NextResponse.json({ error: "No workspace found" }, { status: 403 });

        const workspaceTools = await db.query.tools.findMany({
            where: and(
                eq(tools.workspaceId, member.workspaceId),
                ne(tools.status, "archived")
            ),
            columns: { id: true, name: true, overallScore: true, status: true, websiteUrl: true },
            orderBy: [sql`${tools.overallScore} desc nulls last`],
            limit: 30,
        });

        return NextResponse.json({ tools: workspaceTools }, { headers: { "Cache-Control": "private, s-maxage=30, stale-while-revalidate=120" } });
    } catch (err) {
        console.error("[api/tools/palette]", err);
        return NextResponse.json({ error: "Failed to load tools" }, { status: 500 });
    }
}
