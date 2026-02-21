import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { reports, tools, workspaceMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { rateLimit } from "@/lib/middleware/rate-limit";

const ShareSchema = z.object({
    reportId: z.string().uuid("reportId must be a valid UUID"),
});

export async function POST(req: NextRequest) {
    const user = await currentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = rateLimit(`share:${user.id}`, { limit: 10, windowSeconds: 60 });
    if (!rl.success) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = ShareSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const { reportId } = parsed.data;

    // Get report and verify user has access
    const report = await db.query.reports.findFirst({
        where: eq(reports.id, reportId),
    });

    if (!report) {
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Verify user belongs to the tool's workspace
    const tool = await db.query.tools.findFirst({
        where: eq(tools.id, report.toolId),
        columns: { workspaceId: true },
    });

    if (!tool) {
        return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.userId, user.id),
            eq(workspaceMembers.workspaceId, tool.workspaceId)
        ),
    });

    if (!member) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // If already has a share token, return existing URL
    if (report.shareToken) {
        const url = `${process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com"}/share/${report.shareToken}`;
        return NextResponse.json({ url, token: report.shareToken });
    }

    // Generate new share token
    const token = crypto.randomUUID().replace(/-/g, "");

    await db.update(reports)
        .set({ shareToken: token })
        .where(eq(reports.id, reportId));

    const url = `${process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com"}/share/${token}`;
    return NextResponse.json({ url, token });
}
