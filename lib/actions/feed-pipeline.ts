// Internal feed pipeline functions — NOT server actions.
// Called only from cron routes (CRON_SECRET auth), never from clients.

import { db } from "@/lib/db";
import { feedChannels, feedItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { tavily } from "@/lib/services/tavily";
import { XMLParser } from "fast-xml-parser";
import type { ChannelConfig } from "./feed";

export async function ingestChannel(channelId: string) {
    const channel = await db.query.feedChannels.findFirst({
        where: eq(feedChannels.id, channelId),
    });
    if (!channel || !channel.enabled) return 0;

    const config = channel.config as ChannelConfig;
    let insertedCount = 0;

    if (channel.type === "topic") {
        insertedCount = await ingestTopic(channel.workspaceId, channelId, config);
    } else if (channel.type === "rss") {
        insertedCount = await ingestRss(channel.workspaceId, channelId, config);
    }

    // Update lastFetchedAt
    await db.update(feedChannels)
        .set({ lastFetchedAt: new Date() })
        .where(eq(feedChannels.id, channelId));

    return insertedCount;
}

async function ingestTopic(workspaceId: string, channelId: string, config: ChannelConfig): Promise<number> {
    const keywords = config.keywords ?? [];
    if (keywords.length === 0) return 0;

    const query = keywords.join(" ") + " " + new Date().toISOString().slice(0, 7); // add current month for recency
    const result = await tavily.search(query, {
        searchDepth: "basic",
        maxResults: 8,
        includeDomains: config.domains?.length ? config.domains : undefined,
        includeAnswer: false,
    });

    const rows = result.results.map(item => ({
        workspaceId,
        channelId,
        title: item.title,
        url: item.url,
        source: extractDomain(item.url),
        publishedAt: new Date(),
        summary: item.content?.slice(0, 400) || null,
    }));

    if (rows.length === 0) return 0;

    try {
        await db.insert(feedItems).values(rows).onConflictDoNothing();
    } catch (err) {
        console.error("[feed-pipeline] Failed to batch insert feed items:", err);
    }
    return rows.length;
}

async function ingestRss(workspaceId: string, channelId: string, config: ChannelConfig): Promise<number> {
    const feedUrl = config.feedUrl;
    if (!feedUrl) return 0;

    try {
        const response = await fetch(feedUrl, {
            headers: { "User-Agent": "Trackr/1.0 (RSS Reader)" },
            signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) return 0;

        const xml = await response.text();
        const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
        const parsed = parser.parse(xml);

        // Handle both RSS 2.0 and Atom feeds
        const entries = extractFeedEntries(parsed);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const rows = entries.slice(0, 20)
            .filter(entry => {
                const pubDate = entry.publishedAt ? new Date(entry.publishedAt) : null;
                return !(pubDate && pubDate < oneDayAgo);
            })
            .map(entry => ({
                workspaceId,
                channelId,
                title: entry.title || "Untitled",
                url: entry.url,
                source: extractDomain(feedUrl),
                publishedAt: entry.publishedAt ? new Date(entry.publishedAt) : new Date(),
                summary: entry.summary?.slice(0, 400) || null,
            }));

        if (rows.length === 0) return 0;

        try {
            await db.insert(feedItems).values(rows).onConflictDoNothing();
        } catch (err) {
            console.error("[feed-pipeline] Failed to batch insert RSS items:", err);
        }
        return rows.length;
    } catch (err) {
        console.error("[feed-pipeline] RSS ingestion failed:", err);
        return 0;
    }
}

type ParsedEntry = { title: string; url: string; publishedAt?: string; summary?: string };

function extractFeedEntries(parsed: Record<string, unknown>): ParsedEntry[] {
    const entries: ParsedEntry[] = [];

    // RSS 2.0: rss.channel.item
    const rss = parsed.rss as Record<string, unknown> | undefined;
    const channel = rss?.channel as Record<string, unknown> | undefined;
    const items = channel?.item;
    if (items) {
        const arr = Array.isArray(items) ? items : [items];
        for (const item of arr) {
            const i = item as Record<string, unknown>;
            if (i.link && typeof i.link === "string") {
                entries.push({
                    title: String(i.title || ""),
                    url: String(i.link),
                    publishedAt: i.pubDate ? String(i.pubDate) : undefined,
                    summary: i.description ? stripHtml(String(i.description)) : undefined,
                });
            }
        }
    }

    // Atom: feed.entry
    const feed = parsed.feed as Record<string, unknown> | undefined;
    const atomEntries = feed?.entry;
    if (atomEntries) {
        const arr = Array.isArray(atomEntries) ? atomEntries : [atomEntries];
        for (const entry of arr) {
            const e = entry as Record<string, unknown>;
            const link = e.link as Record<string, unknown> | string | undefined;
            const href = typeof link === "string" ? link : (link as Record<string, unknown>)?.["@_href"];
            if (href && typeof href === "string") {
                entries.push({
                    title: String(e.title || ""),
                    url: href,
                    publishedAt: e.published ? String(e.published) : e.updated ? String(e.updated) : undefined,
                    summary: e.summary ? stripHtml(String(e.summary)) : undefined,
                });
            }
        }
    }

    return entries;
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim();
}

function extractDomain(url: string): string {
    try {
        return new URL(url).hostname.replace("www.", "");
    } catch {
        return url;
    }
}

export async function ingestAllChannels(workspaceId: string): Promise<number> {
    const channels = await db.query.feedChannels.findMany({
        where: and(eq(feedChannels.workspaceId, workspaceId), eq(feedChannels.enabled, true)),
    });

    // Process channels in parallel batches of 3 to avoid rate limits
    const BATCH_SIZE = 3;
    let total = 0;
    for (let i = 0; i < channels.length; i += BATCH_SIZE) {
        const batch = channels.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(
            batch.map(ch => ingestChannel(ch.id))
        );
        for (const result of results) {
            if (result.status === "fulfilled") {
                total += result.value;
            } else {
                console.error(`[feed-pipeline] Channel ingestion failed:`, result.reason);
            }
        }
    }
    return total;
}

export async function createDefaultChannels(workspaceId: string, companyContext?: string | null) {
    const defaults = [
        {
            name: "AI Tools & Launches",
            type: "topic" as const,
            config: { keywords: ["AI tools", "product launches", "AI SaaS", "funding announcements"] },
        },
        {
            name: "SaaS Industry",
            type: "topic" as const,
            config: { keywords: ["SaaS B2B", "software trends", "enterprise software"] },
        },
    ];

    // If company context has industry info, add an industry-specific channel
    if (companyContext && companyContext.length > 20) {
        const industry = companyContext.slice(0, 100).replace(/[^a-zA-Z\s]/g, " ").trim();
        defaults.push({
            name: "Your Industry",
            type: "topic" as const,
            config: { keywords: [industry, "AI tools", "technology"] },
        });
    }

    await db.insert(feedChannels).values(
        defaults.map(d => ({
            workspaceId,
            name: d.name,
            type: d.type,
            config: d.config,
        }))
    );
}
