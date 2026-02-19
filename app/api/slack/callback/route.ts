import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { db } from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Verify and extract workspace ID from the signed state parameter.
 * Returns the workspace ID if valid, null otherwise.
 */
function verifyState(state: string): string | null {
    const secret = process.env.SLACK_CLIENT_SECRET;
    if (!secret) return null;

    const parts = state.split(".");
    if (parts.length !== 2) return null;

    const [workspaceId, signature] = parts;

    const expectedSignature = createHmac("sha256", secret)
        .update(workspaceId)
        .digest("hex")
        .slice(0, 16);

    if (signature !== expectedSignature) return null;

    return workspaceId;
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com";

    // Handle user denying the OAuth request
    if (error) {
        return NextResponse.redirect(`${appUrl}/workspace?slack=denied`);
    }

    if (!code || !state) {
        return NextResponse.redirect(`${appUrl}/workspace?slack=error`);
    }

    // Verify state parameter
    const workspaceId = verifyState(state);
    if (!workspaceId) {
        return NextResponse.redirect(`${appUrl}/workspace?slack=error`);
    }

    // Exchange code for token
    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    const redirectUri = `${appUrl}/api/slack/callback`;

    if (!clientId || !clientSecret) {
        return NextResponse.redirect(`${appUrl}/workspace?slack=error`);
    }

    try {
        const tokenResponse = await fetch("https://slack.com/api/oauth.v2.access", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                code,
                redirect_uri: redirectUri,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenData.ok) {
            console.error("Slack OAuth error:", tokenData.error);
            return NextResponse.redirect(`${appUrl}/workspace?slack=error`);
        }

        // Extract the bot token and team info
        const botToken = tokenData.access_token;
        const teamId = tokenData.team?.id;
        const teamName = tokenData.team?.name;

        if (!botToken) {
            console.error("Slack OAuth: no access_token in response");
            return NextResponse.redirect(`${appUrl}/workspace?slack=error`);
        }

        // Store OAuth data on the workspace
        await db.update(workspaces)
            .set({
                slackBotToken: botToken,
                slackTeamId: teamId || null,
                slackTeamName: teamName || null,
                slackEnabled: true,
            })
            .where(eq(workspaces.id, workspaceId));

        return NextResponse.redirect(`${appUrl}/workspace?slack=connected`);
    } catch (err) {
        console.error("Slack OAuth exchange failed:", err);
        return NextResponse.redirect(`${appUrl}/workspace?slack=error`);
    }
}
