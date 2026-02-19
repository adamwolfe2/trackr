"use server";

import { db } from "@/lib/db";
import { feedItems, toolSuggestions, softwareSpend, tools, painPoints, workspaceMembers } from "@/lib/db/schema";
import { eq, and, gte, desc, isNotNull, sql } from "drizzle-orm";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const ToolExtractionSchema = z.object({
    articles: z.array(z.object({
        articleIndex: z.number().describe("1-based index of the article this tool was found in"),
        tools: z.array(z.object({
            name: z.string().describe("Name of the software tool or SaaS product"),
            url: z.string().describe("Best guess at the tool's website URL"),
            description: z.string().describe("One-sentence description of what it does"),
            confidence: z.number().min(0).max(1).describe("How confident you are this is a real, distinct tool: 0-1"),
        })),
    })),
});

/**
 * Extract tool mentions from high-relevance feed items.
 * Runs as part of the cron enrichment pipeline.
 * Returns per-article tool mappings to avoid assigning all tools to every item.
 */
export async function extractToolsFromFeedItems(workspaceId: string): Promise<number> {
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Find items with relevance >= 0.5 that haven't been processed for tool extraction yet
    const items = await db.query.feedItems.findMany({
        where: and(
            eq(feedItems.workspaceId, workspaceId),
            gte(feedItems.createdAt, twoDaysAgo),
            isNotNull(feedItems.relevanceScore),
            sql`(${feedItems.extractedTools})::text = '[]'`,
            sql`(${feedItems.relevanceScore})::numeric >= 0.5`,
        ),
        orderBy: [desc(feedItems.relevanceScore)],
        limit: 10,
    });

    if (items.length === 0) return 0;

    const itemTexts = items.map((item, idx) =>
        `[${idx + 1}] "${item.title}" — ${item.source || "unknown"}\n${item.summary || ""}\nURL: ${item.url}`
    ).join("\n\n");

    try {
        const result = await generateObject({
            model: openai("gpt-4o-mini"),
            schema: ToolExtractionSchema,
            prompt: `You are an expert at identifying software tools and SaaS products mentioned in tech articles.

For EACH article below, extract any specific software tools, SaaS products, or AI tools mentioned as notable products (not just passing references). Only include tools that someone could actually sign up for and use.

Do NOT include:
- General concepts (e.g., "AI", "machine learning")
- Companies that aren't software tools
- The publishing website itself

Articles:
${itemTexts}

Return results grouped by articleIndex (1-based). Include an entry for every article, even if no tools were found (empty tools array).`,
        });

        // Build a per-article tools map
        const articleToolsMap = new Map<number, typeof result.object.articles[0]["tools"]>();
        for (const article of result.object.articles) {
            articleToolsMap.set(article.articleIndex, article.tools.filter(t => t.confidence >= 0.5));
        }

        let totalExtracted = 0;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemTools = articleToolsMap.get(i + 1) ?? [];
            totalExtracted += itemTools.length;

            await db.update(feedItems).set({
                extractedTools: itemTools.length > 0
                    ? itemTools
                    : [{ name: "__processed", url: "", description: "", confidence: 0 }],
            }).where(eq(feedItems.id, item.id));
        }

        return totalExtracted;
    } catch (error) {
        console.error("Tool extraction failed:", error);
        // Mark items as processed to prevent re-processing
        for (const item of items) {
            await db.update(feedItems).set({
                extractedTools: [{ name: "__error", url: "", description: "", confidence: 0 }],
            }).where(eq(feedItems.id, item.id));
        }
        return 0;
    }
}

/**
 * Match extracted tools against the workspace's existing stack and pain points
 * to generate suggestions.
 */
export async function generateSuggestions(workspaceId: string): Promise<number> {
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Get all extracted tools from recent feed items
    const recentItems = await db.query.feedItems.findMany({
        where: and(
            eq(feedItems.workspaceId, workspaceId),
            gte(feedItems.createdAt, twoDaysAgo),
            sql`jsonb_array_length(${feedItems.extractedTools}) > 0`,
        ),
    });

    // Collect all extracted tools
    type ExtractedTool = { name: string; url: string; description: string; confidence: number };
    const allExtracted: { tool: ExtractedTool; feedItemId: string }[] = [];
    for (const item of recentItems) {
        const extracted = (item.extractedTools as ExtractedTool[]) || [];
        for (const t of extracted) {
            if (t.confidence >= 0.6 && t.name !== "__processed" && t.name !== "__error") {
                allExtracted.push({ tool: t, feedItemId: item.id });
            }
        }
    }

    if (allExtracted.length === 0) return 0;

    // Get existing tools and spend to check for duplicates
    const [existingTools, existingSpend, activePainPoints] = await Promise.all([
        db.query.tools.findMany({
            where: eq(tools.workspaceId, workspaceId),
            columns: { name: true },
        }),
        db.query.softwareSpend.findMany({
            where: eq(softwareSpend.workspaceId, workspaceId),
            columns: { toolName: true },
        }),
        db.query.painPoints.findMany({
            where: and(eq(painPoints.workspaceId, workspaceId), eq(painPoints.active, true)),
        }),
    ]);

    const existingNames = new Set([
        ...existingTools.map(t => t.name.toLowerCase()),
        ...existingSpend.map(t => t.toolName.toLowerCase()),
    ]);

    // Also check existing suggestions to avoid duplicates
    const existingSuggestions = await db.query.toolSuggestions.findMany({
        where: eq(toolSuggestions.workspaceId, workspaceId),
        columns: { toolName: true },
    });
    const suggestedNames = new Set(existingSuggestions.map(s => s.toolName.toLowerCase()));

    let created = 0;

    // Deduplicate extracted tools by name
    const seen = new Set<string>();
    for (const { tool, feedItemId } of allExtracted) {
        const lowerName = tool.name.toLowerCase();
        if (existingNames.has(lowerName) || suggestedNames.has(lowerName) || seen.has(lowerName)) continue;
        seen.add(lowerName);

        // Check if it matches any pain point (simple keyword matching)
        let matchedPainPointId: string | null = null;
        let confidenceBoost = 0;
        for (const pp of activePainPoints) {
            const ppText = `${pp.title} ${pp.description || ""}`.toLowerCase();
            const toolText = `${tool.name} ${tool.description}`.toLowerCase();
            // Simple word overlap check
            const toolWords = toolText.split(/\s+/).filter(w => w.length > 3);
            const matches = toolWords.filter(w => ppText.includes(w));
            if (matches.length >= 2) {
                matchedPainPointId = pp.id;
                confidenceBoost = 0.15;
                break;
            }
        }

        const finalConfidence = Math.min(1, tool.confidence + confidenceBoost);

        try {
            await db.insert(toolSuggestions).values({
                workspaceId,
                toolName: tool.name,
                websiteUrl: tool.url || null,
                reason: tool.description || `Discovered in your intelligence feed`,
                sourceFeedItemId: feedItemId,
                matchedPainPointId,
                confidence: String(finalConfidence),
                status: "new",
            });
            created++;
        } catch {
            // Duplicate or constraint violation — skip
        }
    }

    return created;
}

// ── User actions for suggestions ────────────────────────────────────────────

async function getWorkspaceId(): Promise<string> {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");
    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });
    if (!member) throw new Error("No workspace");
    return member.workspaceId;
}

export async function dismissSuggestion(id: string) {
    const workspaceId = await getWorkspaceId();
    await db.update(toolSuggestions)
        .set({ status: "dismissed" })
        .where(and(eq(toolSuggestions.id, id), eq(toolSuggestions.workspaceId, workspaceId)));
    revalidatePath("/feed");
}
