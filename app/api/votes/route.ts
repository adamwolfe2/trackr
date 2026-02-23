import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { communityVotes } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

// GET /api/votes — returns all vote counts or a single tool's counts
export async function GET(req: NextRequest) {
    const slug = req.nextUrl.searchParams.get("slug");

    if (slug) {
        const row = await db.query.communityVotes?.findFirst({
            where: eq(communityVotes.toolSlug, slug),
        });
        return NextResponse.json({
            up: row?.upVotes ?? 0,
            down: row?.downVotes ?? 0,
        });
    }

    // Return all votes as a map
    const rows = await db.select().from(communityVotes);
    const map: Record<string, { up: number; down: number }> = {};
    for (const row of rows) {
        map[row.toolSlug] = { up: row.upVotes, down: row.downVotes };
    }
    return NextResponse.json({ votes: map });
}

// POST /api/votes — cast or change a vote (no auth required)
// body: { slug: string, type: 'up' | 'down', prevType?: 'up' | 'down' }
export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    if (!body || !body.slug || !["up", "down"].includes(body.type)) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { slug, type, prevType } = body as {
        slug: string;
        type: "up" | "down";
        prevType?: "up" | "down";
    };

    // Calculate deltas — if changing vote, undo the old one
    const upDelta = (type === "up" ? 1 : 0) - (prevType === "up" ? 1 : 0);
    const downDelta = (type === "down" ? 1 : 0) - (prevType === "down" ? 1 : 0);

    // UPSERT: initialize row (with 0 seed so it doesn't conflict with migration seeds)
    // then increment the deltas atomically
    const [updated] = await db
        .insert(communityVotes)
        .values({
            toolSlug: slug,
            upVotes: Math.max(0, upDelta),
            downVotes: Math.max(0, downDelta),
        })
        .onConflictDoUpdate({
            target: communityVotes.toolSlug,
            set: {
                upVotes: sql`GREATEST(0, ${communityVotes.upVotes} + ${upDelta})`,
                downVotes: sql`GREATEST(0, ${communityVotes.downVotes} + ${downDelta})`,
                updatedAt: new Date(),
            },
        })
        .returning({ up: communityVotes.upVotes, down: communityVotes.downVotes });

    return NextResponse.json({ up: updated.up, down: updated.down });
}
