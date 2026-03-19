import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/** Max age for OAuth state tokens (10 minutes) */
const STATE_MAX_AGE_SEC = 600;

/**
 * Verify and extract workspace ID from the signed state parameter.
 * Format: workspaceId.timestamp.signature
 * Returns the workspace ID if valid and not expired, null otherwise.
 */
function verifyState(state: string): string | null {
    const secret = process.env.SLACK_CLIENT_SECRET;
    if (!secret) return null;

    const parts = state.split(".");
    // Support both old format (workspaceId.signature) and new (workspaceId.timestamp.signature)
    if (parts.length !== 3 && parts.length !== 2) return null;

    if (parts.length === 3) {
        const [workspaceId, timestampStr, signature] = parts;
        if (!workspaceId || !timestampStr || !signature) return null;

        const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!UUID_RE.test(workspaceId)) return null;

        // Verify timestamp is within window
        const timestamp = parseInt(timestampStr, 10);
        if (isNaN(timestamp)) return null;
        const age = Math.floor(Date.now() / 1000) - timestamp;
        if (age < 0 || age > STATE_MAX_AGE_SEC) return null;

        const payload = `${workspaceId}.${timestampStr}`;
        const expectedSignature = createHmac("sha256", secret)
            .update(payload)
            .digest("hex");

        try {
            const sigBuf = Buffer.from(signature, "utf8");
            const expectedBuf = Buffer.from(expectedSignature, "utf8");
            if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) return null;
        } catch {
            return null;
        }

        return workspaceId;
    }

    // Legacy 2-part format (workspaceId.signature) — backwards compat
    const [workspaceId, signature] = parts;
    if (!workspaceId || !signature) return null;

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_RE.test(workspaceId)) return null;

    const expectedSignature = createHmac("sha256", secret)
        .update(workspaceId)
        .digest("hex")
        .slice(0, 32);

    try {
        const sigBuf = Buffer.from(signature, "utf8");
        const expectedBuf = Buffer.from(expectedSignature, "utf8");
        if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) return null;
    } catch {
        return null;
    }

    return workspaceId;
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
        return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

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
            return NextResponse.redirect(`${appUrl}/workspace?slack=error`);
        }

        // Extract the bot token and team info
        const botToken = tokenData.access_token;
        const teamId = tokenData.team?.id;
        const teamName = tokenData.team?.name;

        if (!botToken) {
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
        console.error("[api/slack/callback] OAuth token exchange failed:", err);
        return NextResponse.redirect(`${appUrl}/workspace?slack=error`);
    }
}
