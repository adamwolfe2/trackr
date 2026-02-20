import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { listChannels } from "@/lib/services/slack";
import { getWorkspaceId } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    } catch {
        return NextResponse.json({ channels: [], error: "Failed to connect to Slack" });
    }
}
