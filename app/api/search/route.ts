import { db } from "@/lib/db";
import { tools } from "@/lib/db/schema";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/ai/embedding";

export async function POST(req: Request) {
    try {
        const { query } = await req.json();
        if (!query) return NextResponse.json({ error: "Query required" }, { status: 400 });

        const queryEmbedding = await generateEmbedding(query);

        const similarity = sql<number>`1 - (${cosineDistance(tools.embedding, queryEmbedding)})`;

        const similarTools = await db
            .select({
                id: tools.id,
                name: tools.name,
                status: tools.status, // Return status
                matchScore: similarity,
            })
            .from(tools)
            .where(gt(similarity, 0.5)) // Threshold
            .orderBy(desc(similarity))
            .limit(5);

        return NextResponse.json({ results: similarTools });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
