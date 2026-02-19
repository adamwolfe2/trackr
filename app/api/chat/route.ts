import { db } from "@/lib/db";
import { tools, workspaceMembers, reports } from "@/lib/db/schema";
import { and, cosineDistance, desc, eq, gt, inArray, isNotNull, sql } from "drizzle-orm";
import { generateEmbedding } from "@/lib/ai/embedding";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextRequest } from "next/server";
import { rateLimit } from "@/lib/middleware/rate-limit";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";

export const maxDuration = 30;

const ChatSchema = z.object({
    messages: z.array(z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().max(4000),
    })).min(1).max(50),
});

export async function POST(req: NextRequest) {
    const user = await currentUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });
    if (!member) return new Response("No workspace found", { status: 403 });

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = rateLimit(`chat:${ip}`, { limit: 20, windowSeconds: 60 });

    if (!rl.success) {
        return new Response("Too many requests", { status: 429 });
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return new Response("Invalid JSON", { status: 400 });
    }

    const parsed = ChatSchema.safeParse(body);
    if (!parsed.success) {
        return new Response("Invalid request", { status: 400 });
    }

    const { messages } = parsed.data;
    const lastMessage = messages[messages.length - 1];
    const query = lastMessage?.content ?? "";

    try {
        const queryEmbedding = await generateEmbedding(query);
        const similarity = sql<number>`1 - (${cosineDistance(tools.embedding, queryEmbedding)})`;

        const relevantTools = await db
            .select({
                id: tools.id,
                name: tools.name,
                overallScore: tools.overallScore,
                status: tools.status,
                websiteUrl: tools.websiteUrl,
                similarity,
            })
            .from(tools)
            .where(and(eq(tools.workspaceId, member.workspaceId), isNotNull(tools.embedding), gt(similarity, 0.4)))
            .orderBy(desc(similarity))
            .limit(5);

        // Fetch the most recent report for each relevant tool to enrich context
        const reportMap = new Map<string, { summary: string | null; pros: string[] | null; cons: string[] | null }>();
        if (relevantTools.length > 0) {
            const toolIds = relevantTools.map(t => t.id);
            const latestReports = await db
                .selectDistinctOn([reports.toolId], {
                    toolId: reports.toolId,
                    summary: reports.summary,
                    pros: reports.pros,
                    cons: reports.cons,
                })
                .from(reports)
                .where(inArray(reports.toolId, toolIds))
                .orderBy(reports.toolId, desc(reports.createdAt));
            for (const r of latestReports) {
                reportMap.set(r.toolId, { summary: r.summary, pros: r.pros, cons: r.cons });
            }
        }

        const context = relevantTools
            .map(t => {
                const report = reportMap.get(t.id);
                let entry = `Tool: ${t.name}\nScore: ${t.overallScore ?? "N/A"}\nStatus: ${t.status}\nURL: ${t.websiteUrl ?? "N/A"}`;
                if (report?.summary) entry += `\nSummary: ${report.summary}`;
                if (report?.pros?.length) entry += `\nPros: ${report.pros.join("; ")}`;
                if (report?.cons?.length) entry += `\nCons: ${report.cons.join("; ")}`;
                return entry;
            })
            .join("\n---\n");

        const result = await streamText({
            model: openai("gpt-4o"),
            messages: [
                {
                    role: "system",
                    content: `You are Trackr AI, an intelligent assistant for software procurement decisions.

Your workspace tools:
${context || "No relevant tools found in this workspace yet."}

Be concise, data-driven, and helpful. Reference specific tool names and scores when relevant.`,
                },
                ...messages,
            ],
        });

        return result.toTextStreamResponse();
    } catch {
        return new Response("Internal Server Error", { status: 500 });
    }
}
