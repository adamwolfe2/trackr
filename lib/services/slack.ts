import { WebClient } from "@slack/web-api";

let _client: WebClient | null = null;

export function getSlackClient(): WebClient | null {
    const token = process.env.SLACK_BOT_TOKEN;
    if (!token) return null;
    if (!_client) _client = new WebClient(token);
    return _client;
}

/**
 * Post a message to a Slack channel using Block Kit.
 */
export async function postMessage(channelId: string, text: string, blocks?: object[]) {
    const client = getSlackClient();
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
 */
export async function listChannels() {
    const client = getSlackClient();
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

export function researchCompleteBlocks(toolName: string, toolId: string, score: number) {
    return [
        {
            type: "header",
            text: { type: "plain_text", text: `Research Complete: ${toolName}`, emoji: false },
        },
        {
            type: "section",
            fields: [
                { type: "mrkdwn", text: `*Score*\n${score.toFixed(1)}/10` },
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
