import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { reports, tools, workspaceMembers } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
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

    const rl = await rateLimit(`share:${user.id}`, { limit: 10, windowSeconds: 60 });
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

    // Verify workspace membership FIRST (before any report lookup)
    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
        columns: { workspaceId: true },
    });
    if (!member) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch report only if it belongs to this workspace (prevents cross-workspace info disclosure)
    const report = await db.query.reports.findFirst({
        where: eq(reports.id, reportId),
    });

    if (!report) {
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Verify the report's tool belongs to the caller's workspace
    const tool = await db.query.tools.findFirst({
        where: and(eq(tools.id, report.toolId), eq(tools.workspaceId, member.workspaceId)),
        columns: { id: true },
    });

    if (!tool) {
        // Return 404 (not 403) to avoid leaking whether the reportId exists in another workspace
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://trytrackr.com";

    // If already has a share token, return existing URL
    if (report.shareToken) {
        return NextResponse.json({
            url: `${appUrl}/share/${report.shareToken}`,
            token: report.shareToken,
        });
    }

    // Generate and write new share token — only if shareToken is still null.
    // The isNull() condition in the WHERE clause means concurrent requests that
    // race here only one will write; we re-fetch to return whatever was stored.
    const token = crypto.randomUUID().replace(/-/g, "");

    await db.update(reports)
        .set({ shareToken: token })
        .where(and(eq(reports.id, reportId), isNull(reports.shareToken)));

    // Re-fetch the stored token (handles the race: another request may have won)
    const saved = await db.query.reports.findFirst({
        where: eq(reports.id, reportId),
        columns: { shareToken: true },
    });
    const finalToken = saved?.shareToken ?? token;

    return NextResponse.json({ url: `${appUrl}/share/${finalToken}`, token: finalToken });
}
