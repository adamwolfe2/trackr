import { WebClient } from "@slack/web-api";
import { db } from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

let _client: WebClient | null = null;

/**
 * Get a Slack client using the provided token, or fall back to the global env var.
 */
export function getSlackClient(botToken?: string): WebClient | null {
    if (botToken) return new WebClient(botToken);

    // Fallback to global env var for backwards compatibility
    const token = process.env.SLACK_BOT_TOKEN;
    if (!token) return null;
    if (!_client) _client = new WebClient(token);
    return _client;
}

/**
 * Get a Slack client for a specific workspace using its stored OAuth token.
 * Falls back to the global env var if no workspace token is stored.
 */
export async function getWorkspaceSlackClient(workspaceId: string): Promise<WebClient | null> {
    const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.id, workspaceId),
        columns: { slackBotToken: true },
    });

    if (workspace?.slackBotToken) {
        return new WebClient(workspace.slackBotToken);
    }

    // Fallback to global env var
    return getSlackClient();
}

/**
 * Disconnect Slack from a workspace by clearing all OAuth fields.
 */
export async function disconnectSlack(workspaceId: string) {
    await db.update(workspaces)
        .set({
            slackBotToken: null,
            slackTeamId: null,
            slackTeamName: null,
            slackEnabled: false,
            slackChannelId: null,
        })
        .where(eq(workspaces.id, workspaceId));
}

/**
 * Post a message to a Slack channel using Block Kit.
 * Accepts an optional botToken to use a workspace-specific client.
 */
export async function postMessage(channelId: string, text: string, blocks?: object[], botToken?: string) {
    const client = getSlackClient(botToken);
    if (!client) return null;

    return client.chat.postMessage({
        channel: channelId,
        text, // Fallback for notifications
        blocks: blocks as never[],
        unfurl_links: false,
    });
}

/**
 * List public channels the bot can post to.
 * Accepts an optional botToken to use a workspace-specific client.
 */
export async function listChannels(botToken?: string) {
    const client = getSlackClient(botToken);
    if (!client) return [];

    const result = await client.conversations.list({
        types: "public_channel",
        limit: 200,
        exclude_archived: true,
    });

    return (result.channels || [])
        .filter((c) => c.id && c.name)
        .map((c) => ({ id: c.id!, name: c.name! }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

// --- Notification Builders ---

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com";

export function researchCompleteBlocks(toolName: string, toolId: string, score: number, previousScore?: number | null) {
    let scoreDelta = "";
    if (previousScore != null) {
        const delta = score - previousScore;
        if (Math.abs(delta) >= 0.1) {
            scoreDelta = ` (${delta > 0 ? "+" : ""}${delta.toFixed(1)} vs last)`;
        }
    }
    return [
        {
            type: "header",
            text: { type: "plain_text", text: `Research Complete: ${toolName}`, emoji: false },
        },
        {
            type: "section",
            fields: [
                { type: "mrkdwn", text: `*Score*\n${score.toFixed(1)}/10${scoreDelta}` },
                { type: "mrkdwn", text: `*Status*\nReport ready` },
            ],
        },
        {
            type: "actions",
            elements: [
                {
                    type: "button",
                    text: { type: "plain_text", text: "View Report" },
                    url: `${APP_URL}/tools/${toolId}`,
                    style: "primary",
                },
            ],
        },
    ];
}

export function researchFailedBlocks(toolName: string, toolId: string, error: string) {
    return [
        {
            type: "header",
            text: { type: "plain_text", text: `Research Failed: ${toolName}`, emoji: false },
        },
        {
            type: "section",
            text: { type: "mrkdwn", text: `Something went wrong:\n\`\`\`${error}\`\`\`` },
        },
        {
            type: "actions",
            elements: [
                {
                    type: "button",
                    text: { type: "plain_text", text: "Retry" },
                    url: `${APP_URL}/tools/${toolId}`,
                },
            ],
        },
    ];
}

export function renewalAlertBlocks(tools: Array<{ name: string; renewalDate: Date; monthlyCost: string | null }>) {
    const lines = tools.map((t) => {
        const date = new Date(t.renewalDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const cost = t.monthlyCost && parseFloat(t.monthlyCost) > 0
            ? `$${parseFloat(t.monthlyCost).toLocaleString()}/mo`
            : "";
        return `- *${t.name}* — renews ${date} ${cost}`;
    }).join("\n");

    return [
        {
            type: "header",
            text: { type: "plain_text", text: `${tools.length} Upcoming Renewal${tools.length !== 1 ? "s" : ""}`, emoji: false },
        },
        {
            type: "section",
            text: { type: "mrkdwn", text: lines },
        },
        {
            type: "actions",
            elements: [
                {
                    type: "button",
                    text: { type: "plain_text", text: "Review Stack" },
                    url: `${APP_URL}/stack`,
                },
            ],
        },
    ];
}

export function toolAddedBlocks(toolName: string, addedBy: string) {
    return [
        {
            type: "section",
            text: { type: "mrkdwn", text: `*${addedBy}* added *${toolName}* to the research queue.` },
        },
    ];
}
