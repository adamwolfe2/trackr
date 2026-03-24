import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createHmac } from "crypto";
import { getWorkspaceId } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

/**
 * Generate a signed state parameter that encodes the workspace ID and timestamp.
 * Format: workspaceId.timestamp.signature
 * Timestamp prevents replay attacks (callback verifies <10 min window).
 */
function generateState(workspaceId: string): string {
    const secret = process.env.SLACK_CLIENT_SECRET;
    if (!secret) throw new Error("SLACK_CLIENT_SECRET not configured");

    const timestamp = Math.floor(Date.now() / 1000);
    const payload = `${workspaceId}.${timestamp}`;

    const signature = createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

    return `${payload}.${signature}`;
}

export async function GET() {
    const user = await currentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) {
        return NextResponse.json({ error: "No workspace found" }, { status: 400 });
    }

    const clientId = process.env.SLACK_CLIENT_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!clientId || !appUrl) {
        return NextResponse.json({ error: "Slack OAuth not configured" }, { status: 500 });
    }

    try {
        const state = generateState(workspaceId);
        const redirectUri = `${appUrl}/api/slack/callback`;
        const scopes = "channels:read,chat:write,commands";

        const authorizeUrl = new URL("https://slack.com/oauth/v2/authorize");
        authorizeUrl.searchParams.set("client_id", clientId);
        authorizeUrl.searchParams.set("scope", scopes);
        authorizeUrl.searchParams.set("redirect_uri", redirectUri);
        authorizeUrl.searchParams.set("state", state);

        return NextResponse.redirect(authorizeUrl.toString());
    } catch {
        return NextResponse.json({ error: "Failed to initiate Slack OAuth" }, { status: 500 });
    }
}
