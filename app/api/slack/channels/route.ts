import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { listChannels } from "@/lib/services/slack";
import { getWorkspaceId } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { rateLimit, getRateLimitHeaders } from "@/lib/middleware/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limit: 10 req/min per user (UI channel list — infrequent)
    const rl = await rateLimit(`slack-channels:${user.id}`, { limit: 10, windowSeconds: 60 });
    if (!rl.success) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: getRateLimitHeaders(rl) });
    }

    try {
        const workspaceId = await getWorkspaceId(user.id);
        if (!workspaceId) {
            return NextResponse.json({ channels: [], error: "No workspace found" });
        }

        // Fetch the workspace's Slack bot token
        const workspace = await db.query.workspaces.findFirst({
            where: eq(workspaces.id, workspaceId),
            columns: { slackBotToken: true },
        });

        // Use workspace-specific token if available, otherwise falls back to global env var
        const channels = await listChannels(workspace?.slackBotToken ?? undefined);
        return NextResponse.json({ channels });
    } catch (err) {
        console.error("[api/slack/channels]", err);
        return NextResponse.json({ channels: [], error: "Failed to connect to Slack" });
    }
}
