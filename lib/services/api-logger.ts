import { db } from "@/lib/db";
import { apiLogs } from "@/lib/db/schema";

type LogEntry = {
    service: string;
    endpoint: string;
    method?: string;
    statusCode?: number;
    durationMs?: number;
    tokensIn?: number;
    tokensOut?: number;
    estimatedCost?: number;
    workspaceId?: string;
    toolId?: string;
    metadata?: Record<string, unknown>;
};

export function logApiCall(entry: LogEntry) {
    // Fire-and-forget — never block the caller
    db.insert(apiLogs).values({
        service: entry.service,
        endpoint: entry.endpoint,
        method: entry.method ?? "POST",
        statusCode: entry.statusCode,
        durationMs: entry.durationMs,
        tokensIn: entry.tokensIn,
        tokensOut: entry.tokensOut,
        estimatedCost: entry.estimatedCost?.toString(),
        workspaceId: entry.workspaceId,
        toolId: entry.toolId,
        metadata: entry.metadata,
    }).catch((err) => {
        console.error("[API Logger] Failed to log:", err);
    });
}

// Cost estimation helpers (per-unit pricing)
export const COST_MAP = {
    firecrawl: { map: 0.01, scrape: 0.015 },
    tavily: { search: 0.01 },
    perplexity: { "sonar-reasoning-pro": 0.05 }, // rough estimate per call
    openai: {
        "gpt-4o-input": 2.50 / 1_000_000,   // $2.50/1M input tokens
        "gpt-4o-output": 10.00 / 1_000_000,  // $10/1M output tokens
        "embedding": 0.02 / 1_000_000,       // $0.02/1M tokens
    },
    resend: { send: 0 }, // free tier
    slack: { post: 0 },  // free
} as const;

/** Estimate OpenAI cost from token counts */
export function estimateOpenAICost(tokensIn: number, tokensOut: number, model = "gpt-4o"): number {
    if (model.includes("gpt-4o")) {
        return tokensIn * COST_MAP.openai["gpt-4o-input"] + tokensOut * COST_MAP.openai["gpt-4o-output"];
    }
    if (model.includes("embedding")) {
        return (tokensIn + tokensOut) * COST_MAP.openai.embedding;
    }
    return 0;
}
