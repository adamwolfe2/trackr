// NOT "use server" — enrichFeedItems is an internal function called only
// from the /api/cron/feed route (CRON_SECRET auth). Must not be a server action.

import { db } from "@/lib/db";
import { feedItems, workspaces } from "@/lib/db/schema";
import { and, eq, isNull, desc, gte } from "drizzle-orm";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const EnrichmentSchema = z.object({
    items: z.array(z.object({
        url: z.string(),
        summary: z.string().describe("2-3 sentence summary of the article"),
        relevanceScore: z.number().min(0).max(1).describe("How relevant this is to the company context: 0 = not relevant, 1 = highly relevant"),
        categories: z.array(z.string()).describe("1-3 topic categories like 'AI', 'Sales Tech', 'Productivity'"),
    })),
});

/**
 * Enrich feed items that have no summary yet with AI-generated summaries and relevance scores.
 * Processes items from the last 48 hours in batches of 10.
 */
export async function enrichFeedItems(workspaceId: string): Promise<number> {
    const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.id, workspaceId),
    });
    if (!workspace) return 0;

    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const unenriched = await db.query.feedItems.findMany({
        where: and(
            eq(feedItems.workspaceId, workspaceId),
            isNull(feedItems.relevanceScore),
            gte(feedItems.createdAt, twoDaysAgo),
        ),
        orderBy: [desc(feedItems.createdAt)],
        limit: 20,
    });

    if (unenriched.length === 0) return 0;

    // Process in batches of 10
    let enrichedCount = 0;
    for (let i = 0; i < unenriched.length; i += 10) {
        const batch = unenriched.slice(i, i + 10);

        const itemList = batch.map((item, idx) =>
            `[${idx + 1}] "${item.title}" — ${item.source || "unknown"}\nSnippet: ${item.summary || "No snippet available"}\nURL: ${item.url}`
        ).join("\n\n");

        try {
            const result = await generateObject({
                model: openai("gpt-4o-mini"),
                schema: EnrichmentSchema,
                prompt: `You are a tech industry analyst. Analyze these articles for relevance to this company:

Company Context: ${workspace.companyContext || workspace.name || "a B2B technology company"}

Articles:
${itemList}

For each article, generate a concise 2-3 sentence summary, a relevance score (0-1) based on how useful this would be to the company above, and 1-3 topic categories. Return results for ALL articles, using the URL as the key.`,
            });

            // Map results back by URL
            const resultMap = new Map(result.object.items.map(r => [r.url, r]));

            for (const item of batch) {
                const enrichment = resultMap.get(item.url);
                if (enrichment) {
                    await db.update(feedItems).set({
                        summary: enrichment.summary,
                        relevanceScore: String(enrichment.relevanceScore),
                        categories: enrichment.categories,
                    }).where(eq(feedItems.id, item.id));
                    enrichedCount++;
                } else {
                    // Fallback: set a low relevance so we don't re-process
                    await db.update(feedItems).set({
                        relevanceScore: "0.3",
                    }).where(eq(feedItems.id, item.id));
                    enrichedCount++;
                }
            }
        } catch {
            // Mark items with fallback score to prevent infinite re-processing
            for (const item of batch) {
                await db.update(feedItems).set({ relevanceScore: "0.3" }).where(eq(feedItems.id, item.id));
            }
        }
    }

    return enrichedCount;
}
