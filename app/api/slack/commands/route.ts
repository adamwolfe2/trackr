import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workspaces, tools } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createHmac, timingSafeEqual } from "crypto";
import { after } from "next/server";
import { performDeepResearch } from "@/lib/actions/research";

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
                return handleStatus(channelId);
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

    // Normalize URL
    let url = urlArg;
    if (!url.startsWith("http")) url = "https://" + url;

    try {
        new URL(url);
    } catch {
        return NextResponse.json({
            response_type: "ephemeral",
            text: `Invalid URL: \`${urlArg}\`. Try something like \`notion.so\` or \`https://linear.app\`.`,
        });
    }

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
        } catch (e) {
            console.error("[Slack /trackr research] Research failed:", e);
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

async function handleStatus(channelId: string) {
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
                        url: `${process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com"}/tools`,
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
