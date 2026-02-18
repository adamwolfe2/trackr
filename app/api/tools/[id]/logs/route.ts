import { db } from "@/lib/db";
import { tools, workspaceMembers } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });
    if (!member) return NextResponse.json({ error: "No workspace found" }, { status: 403 });

    const { id } = await params;

    try {
        const tool = await db.query.tools.findFirst({
            where: and(eq(tools.id, id), eq(tools.workspaceId, member.workspaceId)),
            columns: {
                // @ts-ignore
                researchLogs: true,
                status: true
            }
        });

        if (!tool) {
            return NextResponse.json({ error: "Tool not found" }, { status: 404 });
        }

        // @ts-ignore
        const logs = tool.researchLogs || [];

        return NextResponse.json({ logs, status: tool.status });
    } catch (error) {
        console.error("Failed to fetch logs:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
