import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getWorkspaceId } from "@/lib/db/queries";
import { OpenAI } from "openai";
import { cachedFetch, buildCacheKey } from "@/lib/services/research-cache";

export async function POST(req: NextRequest) {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 403 });

    const body = await req.json();
    const toolName = typeof body.toolName === "string" ? body.toolName.trim() : "";
    const seats = typeof body.seats === "number" && body.seats > 0 ? body.seats : 1;

    if (!toolName || toolName.length > 200) {
        return NextResponse.json({ error: "Invalid tool name" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
    }

    const client = new OpenAI({ apiKey });

    try {
        // Cache by normalized tool name (case-insensitive) — pricing rarely changes
        const normalizedName = toolName.toLowerCase().replace(/[^a-z0-9]/g, "");
        const cacheKey = buildCacheKey("cost-estimate", normalizedName, String(seats));

        const result = await cachedFetch(cacheKey, 7 * 24 * 3600, async () => {
            const completion = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `You are a SaaS pricing expert. Return ONLY valid JSON, no markdown or explanation.`,
                    },
                    {
                        role: "user",
                        content: `What is the typical per-seat monthly cost for "${toolName}"? The company has ${seats} seat(s).

Return JSON: { "estimatedMonthlyCostPerSeat": number, "totalMonthlyCost": number, "confidence": "high"|"medium"|"low", "source": string }

Rules:
- estimatedMonthlyCostPerSeat = typical per-user monthly price (use the most common business tier)
- totalMonthlyCost = estimatedMonthlyCostPerSeat * ${seats}
- confidence: "high" if well-known SaaS with public pricing, "medium" if pricing is semi-public or variable, "low" if guessing
- source: brief note on where pricing comes from (e.g. "Public pricing page, Pro tier")
- If the tool is free, return 0 for costs with "high" confidence`,
                    },
                ],
                response_format: { type: "json_object" },
                max_tokens: 200,
            });

            const parsed = JSON.parse(completion.choices[0].message.content || "{}");
            return {
                estimatedMonthlyCostPerSeat: parsed.estimatedMonthlyCostPerSeat ?? 0,
                totalMonthlyCost: parsed.totalMonthlyCost ?? 0,
                confidence: parsed.confidence ?? "low",
                source: parsed.source ?? "",
            };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Cost estimate failed:", error);
        return NextResponse.json({ error: "Failed to estimate cost" }, { status: 500 });
    }
}
