export const dynamic = "force-dynamic";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { feedChannels, feedItems, toolSuggestions, workspaceMembers } from "@/lib/db/schema";
import { eq, and, desc, ne } from "drizzle-orm";
import { FeedClient } from "./client";

export default async function FeedPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });
    if (!member) redirect("/onboarding");

    const wsId = member.workspaceId;

    const [channels, items, suggestions] = await Promise.all([
        db.query.feedChannels.findMany({
            where: eq(feedChannels.workspaceId, wsId),
            orderBy: [desc(feedChannels.createdAt)],
        }),
        db.query.feedItems.findMany({
            where: eq(feedItems.workspaceId, wsId),
            orderBy: [desc(feedItems.createdAt)],
            limit: 100,
            with: { channel: true },
        }),
        db.query.toolSuggestions.findMany({
            where: and(
                eq(toolSuggestions.workspaceId, wsId),
                ne(toolSuggestions.status, "dismissed"),
            ),
            orderBy: [desc(toolSuggestions.confidence)],
            limit: 10,
            with: { matchedPainPoint: true },
        }),
    ]);

    return <FeedClient channels={channels} items={items} suggestions={suggestions} />;
}
