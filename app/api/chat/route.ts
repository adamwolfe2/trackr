import { db } from "@/lib/db";
import { tools } from "@/lib/db/schema";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { generateEmbedding } from "@/lib/ai/embedding";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const lastMessage = messages[messages.length - 1];
        const query = lastMessage.content;

        // 1. Generate Embedding for query
        const queryEmbedding = await generateEmbedding(query);

        // 2. Search for relevant tools
        const similarity = sql<number>`1 - (${cosineDistance(tools.embedding, queryEmbedding)})`;
        const relevantTools = await db
            .select({
                name: tools.name,
                overallScore: tools.overallScore,
                status: tools.status,
                websiteUrl: tools.websiteUrl,
                similarity,
            })
            .from(tools)
            .where(gt(similarity, 0.4)) // Slightly lower threshold for broader context
            .orderBy(desc(similarity))
            .limit(5);

        // 3. Construct Context
        const context = relevantTools.map(t =>
            `Tool: ${t.name}\nScore: ${t.overallScore}\nStatus: ${t.status}\nURL: ${t.websiteUrl}`
        ).join("\n---\n");

        // 4. Stream Response
        const result = await streamText({
            model: openai("gpt-4o"),
            messages: [
                {
                    role: "system",
                    content: `You are 'Trackr AI', an assistant for the user's software procurement workspace.
                    
                    Answer the user's question based on the following tools found in their workspace:
                    ${context}

                    If no relevant tools are found, state that you couldn't find any matching tools in the workspace.
                    Be concise and helpful.`
                },
                ...messages
            ],
        });

        return result.toTextStreamResponse();

    } catch (error) {
        console.error("Chat error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
