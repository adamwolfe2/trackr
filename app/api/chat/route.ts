import * as Sentry from "@sentry/nextjs";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { workspaceMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getRateLimitHeaders } from "@/lib/middleware/rate-limit";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { checkFeatureAccess } from "@/lib/middleware/require-subscription";
import { buildSystemPrompt } from "@/lib/ai/trackr-knowledge";
import { chatTools, toolExecutors, toolLabels } from "@/lib/ai/chat-tools";

export const maxDuration = 30;

const MessageSchema = z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1).max(4000),
});

const ChatSchema = z.object({
    messages: z.array(MessageSchema).min(1).max(50),
});

export async function POST(req: NextRequest) {
    if (!process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json({ error: "AI service is not configured" }, { status: 503 });
    }

    let user;
    try {
        user = await currentUser();
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
        with: { workspace: true },
    });
    if (!member) return NextResponse.json({ error: "No workspace found" }, { status: 403 });

    // Premium feature gate: Ask AI requires Startup+ plan
    const plan = await checkFeatureAccess(member.workspaceId, "askAI");
    if (!plan) {
        return NextResponse.json(
            { error: "Ask AI requires a Startup or Enterprise plan. Please upgrade." },
            { status: 403 }
        );
    }

    const rl = await rateLimit(`chat:${user.id}`, { limit: 20, windowSeconds: 60 });

    if (!rl.success) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429, headers: getRateLimitHeaders(rl) }
        );
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = ChatSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const messages = parsed.data.messages;
    const wsId = member.workspaceId;
    const workspace = (member as { workspace?: { name: string; companyContext: string | null } }).workspace ?? { name: "", companyContext: null };

    const anthropic = new Anthropic();

    const systemPrompt = buildSystemPrompt({
        workspaceName: workspace.name,
        companyContext: workspace.companyContext,
        toolDescriptions: chatTools,
    });

    // Convert to Anthropic message format
    const anthropicMessages: Anthropic.MessageParam[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
    }));

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();

            function emit(event: string, data: Record<string, unknown>) {
                controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
            }

            try {
                // Tool-use loop (max 5 rounds)
                const loopMessages: Anthropic.MessageParam[] = [...anthropicMessages];

                for (let round = 0; round < 5; round++) {
                    const response = await anthropic.messages.create({
                        model: "claude-sonnet-4-20250514",
                        system: systemPrompt,
                        messages: loopMessages,
                        tools: chatTools,
                        max_tokens: 4096,
                    });

                    // Collect text and tool_use blocks
                    const textParts: string[] = [];
                    const toolUseBlocks: Anthropic.ContentBlock[] = [];

                    for (const block of response.content) {
                        if (block.type === "text") {
                            textParts.push(block.text);
                        } else if (block.type === "tool_use") {
                            toolUseBlocks.push(block);
                        }
                    }

                    // If there are tool calls, execute them
                    if (toolUseBlocks.length > 0) {
                        // Emit tool_start for each
                        for (const block of toolUseBlocks) {
                            if (block.type === "tool_use") {
                                emit("tool_start", {
                                    name: block.name,
                                    label: toolLabels[block.name] ?? `Running ${block.name}...`,
                                });
                            }
                        }

                        // Execute all tools in parallel
                        const toolResults = await Promise.all(
                            toolUseBlocks.map(async (block) => {
                                if (block.type !== "tool_use") return null;
                                try {
                                    const executor = toolExecutors[block.name];
                                    if (!executor) {
                                        return {
                                            type: "tool_result" as const,
                                            tool_use_id: block.id,
                                            content: JSON.stringify({ error: `Unknown tool: ${block.name}` }),
                                        };
                                    }
                                    const result = await executor(
                                        block.input as Record<string, unknown>,
                                        wsId
                                    );
                                    emit("tool_done", { name: block.name });
                                    return {
                                        type: "tool_result" as const,
                                        tool_use_id: block.id,
                                        content: result,
                                    };
                                } catch (err) {
                                    emit("tool_done", { name: block.name });
                                    return {
                                        type: "tool_result" as const,
                                        tool_use_id: block.id,
                                        content: JSON.stringify({ error: "Tool execution failed" }),
                                        is_error: true,
                                    };
                                }
                            })
                        );

                        // Push assistant message + tool results for next loop
                        loopMessages.push({ role: "assistant", content: response.content });
                        loopMessages.push({
                            role: "user",
                            content: toolResults.filter(Boolean) as Anthropic.ToolResultBlockParam[],
                        });

                        // If stop_reason is end_turn, emit any text and break
                        if (response.stop_reason === "end_turn") {
                            if (textParts.length > 0) {
                                emit("text", { text: textParts.join("") });
                            }
                            break;
                        }

                        // Otherwise continue the tool loop
                        continue;
                    }

                    // No tool calls — emit text and break
                    if (textParts.length > 0) {
                        emit("text", { text: textParts.join("") });
                    }
                    break;
                }

                emit("done", {});
            } catch (err) {
                Sentry.captureException(err);
                emit("error", { message: "Something went wrong. Please try again." });
            } finally {
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
}
