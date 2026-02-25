import { db } from "@/lib/db";
import { tools, workspaceMembers, reports, softwareSpend, painPoints } from "@/lib/db/schema";
import { and, cosineDistance, desc, eq, gt, inArray, isNotNull, sql } from "drizzle-orm";
import { generateEmbedding } from "@/lib/ai/embedding";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getRateLimitHeaders } from "@/lib/middleware/rate-limit";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { computeStackInsights } from "@/lib/utils/stack-insights";
import { checkFeatureAccess } from "@/lib/middleware/require-subscription";

export const maxDuration = 30;

// AI SDK v6 sends UIMessage[] where content may be "" with text in parts[].text
const UIMessageSchema = z.object({
    role: z.string(),
    content: z.string().optional().default(""),
    parts: z.array(z.object({
        type: z.string(),
        text: z.string().optional(),
    }).passthrough()).optional(),
}).passthrough();

const ChatSchema = z.object({
    messages: z.array(UIMessageSchema).min(1).max(50),
});

export async function POST(req: NextRequest) {
    if (!process.env.OPENAI_API_KEY) {
        console.error("[api/chat] OPENAI_API_KEY is not configured");
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

    // Normalize UIMessage[] → CoreMessage[] (extract text from parts when content is empty)
    const messages = parsed.data.messages
        .filter(m => ["user", "assistant", "system"].includes(m.role))
        .map(m => {
            const text = m.content ||
                m.parts?.filter((p: { type: string; text?: string }) => p.type === "text" && p.text)
                    .map((p: { type: string; text?: string }) => p.text ?? "")
                    .join("") ||
                "";
            return { role: m.role as "user" | "assistant" | "system", content: text };
        });

    if (messages.length === 0) {
        return NextResponse.json({ error: "No valid messages" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const query = lastMessage?.content ?? "";
    const wsId = member.workspaceId;
    const workspace = (member as { workspace?: { name: string; companyContext: string | null } }).workspace ?? { name: "", companyContext: null };

    try {
        // Fetch all context in parallel
        const [queryEmbedding, spendEntries, activePainPoints] = await Promise.all([
            generateEmbedding(query).catch(() => null),
            db.query.softwareSpend.findMany({
                where: eq(softwareSpend.workspaceId, wsId),
            }),
            db.query.painPoints.findMany({
                where: and(eq(painPoints.workspaceId, wsId), eq(painPoints.active, true)),
            }),
        ]);

        // pgvector similarity search for tools relevant to the question (skip if embedding failed)
        let relevantTools: { id: string; name: string; overallScore: string | null; status: string; websiteUrl: string | null; category: string[] | null; similarity: number }[] = [];
        if (queryEmbedding) {
            const similarity = sql<number>`1 - (${cosineDistance(tools.embedding, queryEmbedding)})`;
            relevantTools = await db
                .select({
                    id: tools.id,
                    name: tools.name,
                    overallScore: tools.overallScore,
                    status: tools.status,
                    websiteUrl: tools.websiteUrl,
                    category: tools.category,
                    similarity,
                })
                .from(tools)
                .where(and(eq(tools.workspaceId, wsId), isNotNull(tools.embedding), gt(similarity, 0.35)))
                .orderBy(desc(similarity))
                .limit(5);
        }

        // Fetch full reports for relevant tools
        let toolContext = "";
        if (relevantTools.length > 0) {
            const toolIds = relevantTools.map(t => t.id);
            const latestReports = await db
                .selectDistinctOn([reports.toolId], {
                    toolId: reports.toolId,
                    summary: reports.summary,
                    pros: reports.pros,
                    cons: reports.cons,
                    scorecardSnapshot: reports.scorecardSnapshot,
                    pricing: reports.pricing,
                    features: reports.features,
                    competitors: reports.competitors,
                    integrations: reports.integrations,
                })
                .from(reports)
                .where(inArray(reports.toolId, toolIds))
                .orderBy(reports.toolId, desc(reports.createdAt));

            const reportMap = new Map(latestReports.map(r => [r.toolId, r]));

            toolContext = relevantTools
                .map(t => {
                    const r = reportMap.get(t.id);
                    const lines = [
                        `### ${t.name}`,
                        `Score: ${t.overallScore ?? "N/A"}/10 | Status: ${t.status} | URL: ${t.websiteUrl ?? "N/A"}`,
                    ];
                    if (t.category?.length) lines.push(`Categories: ${t.category.join(", ")}`);
                    if (r?.summary) lines.push(`Summary: ${r.summary}`);
                    if (r?.scorecardSnapshot) {
                        const sc = r.scorecardSnapshot as Record<string, { score?: number; justification?: string }>;
                        const dims = Object.entries(sc)
                            .filter(([, v]) => v?.score != null)
                            .map(([k, v]) => `${k}: ${v.score}/10`)
                            .join(", ");
                        if (dims) lines.push(`Scorecard: ${dims}`);
                    }
                    if (r?.pricing) {
                        const p = r.pricing;
                        lines.push(`Pricing: ${typeof p === "string" ? p : JSON.stringify(p).slice(0, 300)}`);
                    }
                    if (r?.pros?.length) lines.push(`Pros: ${r.pros.join("; ")}`);
                    if (r?.cons?.length) lines.push(`Cons: ${r.cons.join("; ")}`);
                    if (r?.competitors?.length) lines.push(`Competitors: ${r.competitors.join(", ")}`);
                    if (r?.integrations?.length) lines.push(`Integrations: ${r.integrations.slice(0, 10).join(", ")}`);
                    return lines.join("\n");
                })
                .join("\n\n---\n\n");
        }

        // Compute stack insights
        const insights = computeStackInsights(spendEntries);

        // Build spend summary (top tools by cost)
        const activeSpend = spendEntries
            .filter(e => e.status === "active")
            .sort((a, b) => (parseFloat(b.monthlyCost ?? "0") || 0) - (parseFloat(a.monthlyCost ?? "0") || 0));
        const spendLines = activeSpend.slice(0, 15).map(e => {
            const cost = parseFloat(e.monthlyCost ?? "0") || 0;
            const seats = e.seatCount ?? 0;
            const cls = insights.enrichedTools.find(t => t.id === e.id);
            return `- ${e.toolName}: $${cost}/mo, ${seats} seats${e.category ? `, ${e.category}` : ""}${cls ? ` [${cls.classification}]` : ""}`;
        });

        // Build pain points summary
        const painPointLines = activePainPoints.slice(0, 8).map(pp =>
            `- ${pp.title}${pp.description ? `: ${pp.description.slice(0, 120)}` : ""}${pp.category ? ` (${pp.category})` : ""}`
        );

        // Build opportunities summary
        const oppLines = insights.opportunities.map(o => `- [${o.priority}] ${o.title}${o.description ? `: ${o.description}` : ""}`);

        // Assemble system prompt
        const systemPrompt = `You are Trackr AI, an expert AI procurement and software stack advisor for ${workspace.name || "this workspace"}.

${workspace.companyContext ? `## Company Context\n${workspace.companyContext}\n` : ""}
## Software Stack Overview
- AI Nativeness Score: ${insights.score}/100 (${insights.label} — ${insights.benchmarkText})
- Total monthly spend: $${Math.round(insights.totalActiveSpend)}/mo ($${Math.round(insights.totalActiveSpend * 12)}/yr)
- Stack composition: ${insights.aiNativeCount} AI-native, ${insights.aiEnabledCount} AI-enabled, ${insights.traditionalCount} traditional, ${insights.unknownCount} unclassified
- Estimated time saved by AI tools: ~${Math.round(insights.timeSavedPerMonth)} hrs/mo (~$${Math.round(insights.dollarValueSaved)}/yr value)
- Active tools: ${activeSpend.length}

${spendLines.length > 0 ? `### Top Tools by Spend\n${spendLines.join("\n")}\n` : ""}
${oppLines.length > 0 ? `### AI Stack Opportunities\n${oppLines.join("\n")}\n` : ""}
${painPointLines.length > 0 ? `### Team Pain Points\n${painPointLines.join("\n")}\n` : ""}
${toolContext ? `## Researched Tool Reports\n${toolContext}\n` : ""}
## Instructions
- When asked about spend, reference actual dollar amounts from the stack data above.
- When asked about pain points, connect them to specific tools or opportunities.
- When comparing tools, use scorecard dimensions (features, pricing_value, ease_of_use, integration_depth, support_quality, security, ai_capabilities).
- Be specific with numbers. Never fabricate data — if it's not in the context above, say so.
- Keep responses concise. Use tables for comparisons. Use bullet points for lists.
- If asked about a tool not in the workspace, say so and suggest they research it via Trackr's research pipeline.`;

        const result = await streamText({
            model: openai("gpt-4o"),
            messages: [
                { role: "system", content: systemPrompt },
                ...messages,
            ],
        });

        return result.toUIMessageStreamResponse();
    } catch (err) {
        console.error("[api/chat]", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
