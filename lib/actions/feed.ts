"use server";

import { db } from "@/lib/db";
import { feedChannels, feedItems, workspaceMembers } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// ── Helpers ─────────────────────────────────────────────────────────────────

async function getWorkspaceId(): Promise<string> {
    let user;
    try {
        user = await currentUser();
    } catch {
        throw new Error("Authentication error — please refresh and try again.");
    }
    if (!user) throw new Error("Unauthorized");
    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });
    if (!member) throw new Error("No workspace");
    return member.workspaceId;
}

// ── Channel CRUD ────────────────────────────────────────────────────────────

export type ChannelConfig = {
    keywords?: string[];
    domains?: string[];
    feedUrl?: string;
};

export async function createFeedChannel(data: {
    name: string;
    type: "topic" | "rss";
    config: ChannelConfig;
}) {
    // Validate inputs
    const name = data.name.trim();
    if (!name || name.length > 100) throw new Error("Channel name must be 1-100 characters");

    if (data.type === "topic") {
        const keywords = data.config.keywords?.map(k => k.trim()).filter(Boolean);
        if (!keywords || keywords.length === 0) throw new Error("At least one keyword is required");
        if (keywords.length > 10) throw new Error("Maximum 10 keywords per channel");
    } else if (data.type === "rss") {
        const feedUrl = data.config.feedUrl?.trim();
        if (!feedUrl) throw new Error("Feed URL is required");
        try {
            const parsed = new URL(feedUrl);
            if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Invalid feed URL");
            const h = parsed.hostname.toLowerCase();
            if (h === "localhost" || h === "0.0.0.0" || h.endsWith(".local") || h.endsWith(".internal") ||
                /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.)/.test(h)) {
                throw new Error("Invalid feed URL");
            }
        } catch (err) {
            throw new Error(err instanceof Error && err.message !== "Invalid feed URL" ? "Invalid feed URL" : (err as Error).message);
        }
    }

    const workspaceId = await getWorkspaceId();
    const [channel] = await db.insert(feedChannels).values({
        workspaceId,
        name,
        type: data.type,
        config: data.config,
    }).returning();
    revalidatePath("/feed");
    return channel;
}

export async function updateFeedChannel(id: string, data: {
    name?: string;
    enabled?: boolean;
    config?: ChannelConfig;
}) {
    const workspaceId = await getWorkspaceId();
    await db.update(feedChannels)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(feedChannels.id, id), eq(feedChannels.workspaceId, workspaceId)));
    revalidatePath("/feed");
    return { success: true };
}

export async function deleteFeedChannel(id: string) {
    const workspaceId = await getWorkspaceId();
    await db.delete(feedChannels)
        .where(and(eq(feedChannels.id, id), eq(feedChannels.workspaceId, workspaceId)));
    revalidatePath("/feed");
    return { success: true };
}

// ── Feed Item Actions ───────────────────────────────────────────────────────

export async function markFeedItemRead(id: string) {
    const workspaceId = await getWorkspaceId();
    await db.update(feedItems)
        .set({ isRead: true })
        .where(and(eq(feedItems.id, id), eq(feedItems.workspaceId, workspaceId)));
    revalidatePath("/feed");
}

export async function toggleFeedItemSaved(id: string) {
    const workspaceId = await getWorkspaceId();
    await db.execute(sql`
        UPDATE feed_items
        SET is_saved = NOT is_saved
        WHERE id = ${id} AND workspace_id = ${workspaceId}
    `);
    revalidatePath("/feed");
}

export async function markAllRead(channelId?: string) {
    const workspaceId = await getWorkspaceId();
    if (channelId) {
        await db.update(feedItems)
            .set({ isRead: true })
            .where(and(
                eq(feedItems.workspaceId, workspaceId),
                eq(feedItems.channelId, channelId),
                eq(feedItems.isRead, false),
            ));
    } else {
        await db.update(feedItems)
            .set({ isRead: true })
            .where(and(
                eq(feedItems.workspaceId, workspaceId),
                eq(feedItems.isRead, false),
            ));
    }
    revalidatePath("/feed");
}
