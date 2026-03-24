import { db } from "@/lib/db";
import { tools, workspaceMembers } from "@/lib/db/schema";
import { and, cosineDistance, desc, eq, gt, isNotNull, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/ai/embedding";
import { rateLimit, getRateLimitHeaders } from "@/lib/middleware/rate-limit";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";

const SearchSchema = z.object({
    query: z.string().min(1, "Query is required").max(500, "Query too long"),
});

export async function POST(req: NextRequest) {
    let user;
    try {
        user = await currentUser();
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });
    if (!member) return NextResponse.json({ error: "No workspace found" }, { status: 403 });

    // Rate limit: 30 searches per minute per authenticated user
    const rl = await rateLimit(`search:${user.id}`, { limit: 30, windowSeconds: 60 });

    if (!rl.success) {
        return NextResponse.json(
            { error: "Too many requests. Please slow down." },
            { status: 429, headers: getRateLimitHeaders(rl) }
        );
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = SearchSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? "Invalid input" },
            { status: 400 }
        );
    }

    const { query } = parsed.data;

    try {
        const queryEmbedding = await generateEmbedding(query);
        const similarity = sql<number>`1 - (${cosineDistance(tools.embedding, queryEmbedding)})`;

        const similarTools = await db
            .select({
                id: tools.id,
                name: tools.name,
                status: tools.status,
                matchScore: similarity,
            })
            .from(tools)
            .where(and(eq(tools.workspaceId, member.workspaceId), isNotNull(tools.embedding), gt(similarity, 0.5)))
            .orderBy(desc(similarity))
            .limit(5);

        return NextResponse.json(
            { results: similarTools },
            { headers: getRateLimitHeaders(rl) }
        );
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
