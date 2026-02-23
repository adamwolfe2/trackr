"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { tools, subscriptions } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, count } from "drizzle-orm";
import { performDeepResearch } from "@/lib/actions/research";
import { ensureWorkspace } from "@/lib/db/ensure-workspace";

export type ParsedTool = {
    name: string;
    url: string;
    confidence: "high" | "medium";
};

export type BulkSubmitResult = {
    name: string;
    url: string;
    toolId?: string;
    status: "queued" | "duplicate" | "limit_reached" | "error";
    error?: string;
};

export async function parseBulkInput(rawText: string): Promise<{
    tools: ParsedTool[];
    error?: string;
}> {
    if (!rawText || rawText.trim().length < 2) {
        return { tools: [], error: "Please enter some tool names or URLs." };
    }

    const user = await currentUser();
    if (!user) return { tools: [], error: "Unauthorized" };

    try {
        const { default: OpenAI } = await import("openai");
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 1200,
            temperature: 0,
            messages: [
                {
                    role: "system",
                    content: `You are a software tool extraction assistant. Extract software tool/product names and their official website URLs from pasted text.

Rules:
- Extract each distinct software tool, SaaS product, AI tool, or platform mentioned
- If a full URL is provided, use it exactly (confidence: "high")
- If only a domain is provided (e.g., "notion.so"), prefix with https:// (confidence: "high")
- If only a name is provided, infer the most likely official domain (confidence: "medium")
  - Examples: "Notion" → "https://notion.so", "Linear" → "https://linear.app", "Clay" → "https://clay.com", "Cursor" → "https://cursor.sh", "Figma" → "https://figma.com", "Slack" → "https://slack.com"
- Skip anything that's clearly not a software tool
- Deduplicate: if the same tool appears multiple times, include it once
- Max 50 tools

Return ONLY valid JSON with this exact shape — no markdown, no explanation:
{"tools": [{"name": "Notion", "url": "https://notion.so", "confidence": "high"}]}`,
                },
                {
                    role: "user",
                    content: rawText.slice(0, 8000),
                },
            ],
            response_format: { type: "json_object" },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) return { tools: [], error: "Failed to parse tools. Try again." };

        const parsed = JSON.parse(content);
        const arr = Array.isArray(parsed) ? parsed : (parsed.tools ?? []);

        const valid: ParsedTool[] = arr
            .filter((t: unknown) => {
                if (typeof t !== "object" || t === null) return false;
                const obj = t as Record<string, unknown>;
                return typeof obj.name === "string" && typeof obj.url === "string";
            })
            .map((t: Record<string, unknown>) => ({
                name: (t.name as string).trim().slice(0, 200),
                url: (t.url as string).startsWith("http") ? (t.url as string) : `https://${t.url}`,
                confidence: (t.confidence === "high" ? "high" : "medium") as "high" | "medium",
            }))
            .slice(0, 50);

        return { tools: valid };
    } catch (err) {
        console.error("[bulk-research] parseBulkInput error:", err);
        return { tools: [], error: "Failed to extract tools. Please try again." };
    }
}

export async function bulkSubmitAndResearch(parsedTools: ParsedTool[]): Promise<{
    results: BulkSubmitResult[];
    totalQueued: number;
}> {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");
    if (!parsedTools.length) return { results: [], totalQueued: 0 };

    const { workspaceId } = await ensureWorkspace(user.id, {
        displayName: user.firstName || user.username || undefined,
        email: user.primaryEmailAddress?.emailAddress,
    });

    // Check plan limits upfront
    const { getPlanLimits } = await import("@/lib/config/subscriptions");
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, workspaceId),
    });
    const plan = getPlanLimits(subscription ?? undefined);

    const [{ value: existingCount }] = await db
        .select({ value: count() })
        .from(tools)
        .where(eq(tools.workspaceId, workspaceId));

    const maxTools = plan.limits.tools;
    const slotsAvailable = maxTools === Infinity
        ? parsedTools.length
        : Math.max(0, maxTools - existingCount);

    const { generateEmbedding } = await import("@/lib/ai/embedding");

    const results: BulkSubmitResult[] = [];
    const toolIdsToResearch: string[] = [];

    for (let i = 0; i < parsedTools.length; i++) {
        const pt = parsedTools[i];

        if (i >= slotsAvailable) {
            results.push({ name: pt.name, url: pt.url, status: "limit_reached" });
            continue;
        }

        try {
            // Normalize URL for duplicate detection
            const normalizedUrl = pt.url.replace(/\/+$/, "").toLowerCase();

            // Check for existing tool in this workspace with same URL
            const existing = await db.query.tools.findFirst({
                where: eq(tools.websiteUrl, pt.url),
                columns: { id: true, workspaceId: true },
            });
            if (existing?.workspaceId === workspaceId) {
                results.push({ name: pt.name, url: pt.url, toolId: existing.id, status: "duplicate" });
                continue;
            }
            void normalizedUrl; // suppress unused warning

            // Generate embedding (best-effort)
            const embedding = await generateEmbedding(`${pt.name}: ${pt.url}`).catch(() => null);

            // Quick logo via Google favicon service
            let logoUrl: string | null = null;
            try {
                const domain = new URL(pt.url).hostname.replace("www.", "");
                logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
            } catch { /* ignore */ }

            const [newTool] = await db.insert(tools).values({
                workspaceId,
                name: pt.name,
                websiteUrl: pt.url,
                logoUrl,
                status: "queued",
                submittedBy: user.id,
                embedding,
            }).returning();

            results.push({ name: pt.name, url: pt.url, toolId: newTool.id, status: "queued" });
            toolIdsToResearch.push(newTool.id);
        } catch (err) {
            console.error(`[bulk-research] Failed to insert ${pt.name}:`, err);
            results.push({ name: pt.name, url: pt.url, status: "error", error: "Failed to add tool" });
        }
    }

    // Kick off research sequentially in the background (one at a time, per user's request)
    if (toolIdsToResearch.length > 0) {
        after(async () => {
            for (const toolId of toolIdsToResearch) {
                try {
                    await performDeepResearch(toolId);
                } catch (err) {
                    console.error(`[bulk-research] Research failed for tool ${toolId}:`, err);
                }
            }
        });
    }

    revalidatePath("/tools");
    revalidatePath("/queue");

    return { results, totalQueued: toolIdsToResearch.length };
}
