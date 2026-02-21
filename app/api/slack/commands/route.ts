import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workspaces, tools, subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createHmac, timingSafeEqual } from "crypto";
import { after } from "next/server";
import { performDeepResearch } from "@/lib/actions/research";
import { getPlanLimits } from "@/lib/config/subscriptions";

export const dynamic = "force-dynamic";

// Verify Slack request signature
function verifySlackSignature(body: string, timestamp: string, signature: string): boolean {
    const secret = process.env.SLACK_SIGNING_SECRET;
    if (!secret) return false;

    // Reject requests older than 5 minutes
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp, 10)) > 300) return false;

    const baseString = `v0:${timestamp}:${body}`;
    const computed = "v0=" + createHmac("sha256", secret).update(baseString).digest("hex");

    try {
        return timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
    } catch {
        return false;
    }
}

export async function POST(req: Request) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
        return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const body = await req.text();
    const timestamp = req.headers.get("x-slack-request-timestamp") || "";
    const signature = req.headers.get("x-slack-signature") || "";

    if (!verifySlackSignature(body, timestamp, signature)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const params = new URLSearchParams(body);
    const command = params.get("command");
    const text = (params.get("text") || "").trim();
    const channelId = params.get("channel_id") || "";

    if (command === "/trackr") {
        const subcommand = text.split(" ")[0]?.toLowerCase();
        const arg = text.slice(subcommand.length).trim();

        switch (subcommand) {
            case "research":
                return handleResearch(arg, channelId);
            case "status":
                return handleStatus(appUrl, channelId);
            case "help":
            default:
                return handleHelp();
        }
    }

    return NextResponse.json({ text: "Unknown command" });
}

async function handleResearch(urlArg: string, channelId: string) {
    if (!urlArg) {
        return NextResponse.json({
            response_type: "ephemeral",
            text: "Usage: `/trackr research <url>`\nExample: `/trackr research notion.so`",
        });
    }

    // Normalize and validate URL — only allow https:// for security
    let url = urlArg.trim();
    if (!url.startsWith("https://") && !url.startsWith("http://")) url = "https://" + url;

    let parsedUrl: URL;
    try {
        parsedUrl = new URL(url);
    } catch {
        return NextResponse.json({
            response_type: "ephemeral",
            text: `Invalid URL: \`${urlArg}\`. Try something like \`notion.so\` or \`https://linear.app\`.`,
        });
    }

    if (parsedUrl.protocol !== "https:") {
        return NextResponse.json({
            response_type: "ephemeral",
            text: "Only HTTPS URLs are supported. Please use a URL starting with `https://`.",
        });
    }
    url = parsedUrl.href;

    // Find workspace by slack channel
    const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.slackChannelId, channelId),
    });

    if (!workspace) {
        return NextResponse.json({
            response_type: "ephemeral",
            text: "This channel isn't connected to a Trackr workspace. Go to *Workspace Settings* in Trackr to connect a Slack channel.",
        });
    }

    // Extract tool name from URL
    let toolName: string;
    try {
        toolName = new URL(url).hostname.replace(/^www\./, "").split(".")[0];
        toolName = toolName.charAt(0).toUpperCase() + toolName.slice(1);
    } catch {
        toolName = urlArg;
    }

    // Check tool count limit
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, workspace.id),
    });
    const limits = getPlanLimits(subscription);
    const toolCount = await db.query.tools.findMany({
        where: eq(tools.workspaceId, workspace.id),
        columns: { id: true },
    });
    if (limits.limits.tools !== Infinity && toolCount.length >= limits.limits.tools) {
        return NextResponse.json({
            response_type: "ephemeral",
            text: `Tool limit reached (${limits.limits.tools} on ${limits.name} plan). Upgrade at trytrackr.com to add more.`,
        });
    }

    // Create tool and kick off research
    const [tool] = await db.insert(tools).values({
        workspaceId: workspace.id,
        name: toolName,
        websiteUrl: url,
        status: "queued",
    }).returning();

    // Fire-and-forget research
    after(async () => {
        try {
            await performDeepResearch(tool.id);
        } catch {
            // Research failure is handled by the job status update
        }
    });

    return NextResponse.json({
        response_type: "in_channel",
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `Researching *${toolName}* (<${url}|${new URL(url).hostname}>)... I'll post the results here when done.`,
                },
            },
        ],
    });
}

async function handleStatus(appUrl: string, channelId: string) {
    const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.slackChannelId, channelId),
    });

    if (!workspace) {
        return NextResponse.json({
            response_type: "ephemeral",
            text: "This channel isn't connected to a Trackr workspace.",
        });
    }

    const allTools = await db.query.tools.findMany({
        where: eq(tools.workspaceId, workspace.id),
        columns: { id: true, status: true },
    });

    const active = allTools.filter(t => t.status === "active").length;
    const researching = allTools.filter(t => t.status === "queued" || t.status === "researching").length;
    const total = allTools.length;

    return NextResponse.json({
        response_type: "ephemeral",
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*${workspace.name}* — ${total} tools\n\n*${active}* researched · *${researching}* in queue`,
                },
            },
            {
                type: "actions",
                elements: [
                    {
                        type: "button",
                        text: { type: "plain_text", text: "Open Trackr" },
                        url: `${appUrl}/tools`,
                    },
                ],
            },
        ],
    });
}

function handleHelp() {
    return NextResponse.json({
        response_type: "ephemeral",
        blocks: [
            {
                type: "header",
                text: { type: "plain_text", text: "Trackr Commands", emoji: false },
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: [
                        "`/trackr research <url>` — Research a tool (posts results to channel)",
                        "`/trackr status` — See workspace stats",
                        "`/trackr help` — Show this message",
                    ].join("\n"),
                },
            },
        ],
    });
}
