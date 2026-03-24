import { db } from "@/lib/db";
import { tools, researchJobs, workspaceMembers } from "@/lib/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { rateLimit, getRateLimitHeaders } from "@/lib/middleware/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limit: 60 req/min per user (polling endpoint — generous limit)
    const rl = await rateLimit(`tool-logs:${user.id}`, { limit: 60, windowSeconds: 60 });
    if (!rl.success) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: getRateLimitHeaders(rl) });
    }

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });
    if (!member) return NextResponse.json({ error: "No workspace found" }, { status: 403 });

    const { id } = await params;

    try {
        const tool = await db.query.tools.findFirst({
            where: and(eq(tools.id, id), eq(tools.workspaceId, member.workspaceId)),
            columns: {
                researchLogs: true,
                status: true,
                overallScore: true,
                name: true,
            }
        });

        if (!tool) {
            return NextResponse.json({ error: "Tool not found" }, { status: 404 });
        }

        const logs = (tool as Record<string, unknown>).researchLogs || [];

        // Include error message from the latest failed job
        let errorMessage: string | null = null;
        if (tool.status === "failed") {
            const latestJob = await db.query.researchJobs.findFirst({
                where: and(eq(researchJobs.toolId, id), eq(researchJobs.status, "failed")),
                orderBy: [desc(researchJobs.triggeredAt)],
                columns: { errorMessage: true },
            });
            errorMessage = latestJob?.errorMessage ?? null;
        }

        return NextResponse.json({ logs, status: tool.status, errorMessage, score: tool.overallScore ?? null, toolName: tool.name ?? null });
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
