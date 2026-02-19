import { classifyTool, type AiClassification } from "@/lib/config/ai-tools";

// Re-export for consumers
export type { AiClassification };

// Extend AiClassification with "unknown" for unmatched tools
type AiClassificationWithUnknown = AiClassification | "unknown";

// ── Input type (matches DB query shape) ────────────────────────────────
export type SpendEntry = {
    id: string;
    toolName: string;
    category: string | null;
    monthlyCost: string | null;
    seatCount: number | null;
    status: string;
};

// ── Output types ───────────────────────────────────────────────────────
export type Opportunity = {
    priority: "high" | "medium" | "low";
    title: string;
    description: string;
};

export type ToolWithInsight = {
    id: string;
    toolName: string;
    classification: AiClassificationWithUnknown;
    matched: boolean;
    category?: string;
    monthlyCost: number;
    seatCount: number | null;
    hoursPerUserPerMonth: number;
};

export type StackInsights = {
    score: number; // 0-100
    label: string; // "AI Leader" | "Early Adopter" | "Developing" | "Just Starting"
    benchmarkText: string;
    aiNativeCount: number;
    aiEnabledCount: number;
    traditionalCount: number;
    unknownCount: number;
    timeSavedPerMonth: number; // hours
    timeSavedPerYear: number;
    dollarValueSaved: number; // annual at $75/hr
    totalActiveSpend: number; // monthly
    opportunities: Opportunity[];
    enrichedTools: ToolWithInsight[];
};

// ── Constants ──────────────────────────────────────────────────────────
const HOURLY_RATE = 75;

// ── Helpers ────────────────────────────────────────────────────────────
function benchmarkLabel(score: number): { label: string; benchmarkText: string } {
    if (score >= 40) return { label: "AI Leader", benchmarkText: "Top 10% of companies" };
    if (score >= 20) return { label: "Early Adopter", benchmarkText: "Ahead of 75% of companies" };
    if (score >= 8) return { label: "Developing", benchmarkText: "At the industry average" };
    return { label: "Just Starting", benchmarkText: "Big opportunity ahead" };
}

function parseCost(raw: string | null): number {
    return parseFloat(raw ?? "0") || 0;
}

function isDevCategory(cat: string): boolean {
    const lower = cat.toLowerCase();
    return lower.includes("dev") || lower === "development" || lower === "engineering";
}

// ── Main computation ───────────────────────────────────────────────────
export function computeStackInsights(entries: SpendEntry[]): StackInsights {
    // Only include active entries
    const active = entries.filter((e) => e.status === "active");

    // Enrich each tool with AI classification
    const enrichedTools: ToolWithInsight[] = active.map((entry) => {
        const result = classifyTool(entry.toolName);
        return {
            id: entry.id,
            toolName: entry.toolName,
            classification: result.matched ? result.classification : "unknown",
            matched: result.matched,
            category: result.category ?? entry.category ?? undefined,
            monthlyCost: parseCost(entry.monthlyCost),
            seatCount: entry.seatCount,
            hoursPerUserPerMonth: result.hoursPerUserPerMonth,
        };
    });

    // ── Score ──────────────────────────────────────────────────────────
    const totalTools = enrichedTools.length;
    let aiNativeCount = 0;
    let aiEnabledCount = 0;
    let traditionalCount = 0;
    let unknownCount = 0;
    let scorePoints = 0;

    for (const t of enrichedTools) {
        switch (t.classification) {
            case "ai-native":
                aiNativeCount++;
                scorePoints += 2;
                break;
            case "ai-enabled":
                aiEnabledCount++;
                scorePoints += 1;
                break;
            case "traditional":
                traditionalCount++;
                break;
            default:
                unknownCount++;
                break;
        }
    }

    const maxPoints = totalTools * 2;
    const rawScore = maxPoints > 0 ? (scorePoints / maxPoints) * 100 : 0;
    const score = Math.min(100, Math.round(rawScore));

    const { label, benchmarkText } = benchmarkLabel(score);

    // ── Time saved (AI tools only: native + enabled) ───────────────────
    const timeSavedPerMonth = enrichedTools
        .filter((t) => t.classification === "ai-native" || t.classification === "ai-enabled")
        .reduce((sum, t) => {
            const seats = Math.max(t.seatCount ?? 1, 1);
            return sum + t.hoursPerUserPerMonth * seats;
        }, 0);

    const timeSavedPerYear = timeSavedPerMonth * 12;
    const dollarValueSaved = timeSavedPerYear * HOURLY_RATE;

    // ── Total active monthly spend ─────────────────────────────────────
    const totalActiveSpend = enrichedTools.reduce((sum, t) => sum + t.monthlyCost, 0);

    // ── Opportunity engine ─────────────────────────────────────────────
    const opportunities: Opportunity[] = [];

    // Build category lookup
    const categoryBuckets: Record<string, ToolWithInsight[]> = {};
    for (const t of enrichedTools) {
        const cat = t.category ?? "Other";
        if (!categoryBuckets[cat]) categoryBuckets[cat] = [];
        categoryBuckets[cat].push(t);
    }

    // 1. Redundancy (high): 3+ tools in same category
    for (const [cat, catTools] of Object.entries(categoryBuckets)) {
        if (catTools.length >= 3) {
            const totalCost = catTools.reduce((s, t) => s + t.monthlyCost, 0);
            const savings = Math.round(totalCost * 0.3);
            const savingsPart = savings > 0 ? `, save ~$${savings}/mo` : "";
            opportunities.push({
                priority: "high",
                title: `${catTools.length} ${cat} tools — consider consolidating${savingsPart}`,
                description: `You have ${catTools.length} tools in the ${cat} category. Consolidating could reduce cost and complexity.`,
            });
        }
    }

    // 2. Duplicate comms (high): Slack + Teams (microsoft) both active
    const hasSlack = enrichedTools.some((t) => t.toolName.toLowerCase().includes("slack"));
    const hasTeams = enrichedTools.some((t) => {
        const name = t.toolName.toLowerCase();
        return name.includes("microsoft teams") || name === "teams";
    });
    if (hasSlack && hasTeams) {
        opportunities.push({
            priority: "high",
            title: "Both Slack and Teams active — pick one",
            description:
                "Running both Slack and Microsoft Teams creates context switching overhead. Consolidate to one platform.",
        });
    }

    // 3. No AI dev tool (medium): has dev-category tool but no ai-native dev tool
    const hasDevTool = enrichedTools.some((t) => t.category !== undefined && isDevCategory(t.category));
    const hasAiNativeDevTool = enrichedTools.some(
        (t) =>
            t.classification === "ai-native" && t.category !== undefined && isDevCategory(t.category)
    );
    if (hasDevTool && !hasAiNativeDevTool) {
        opportunities.push({
            priority: "medium",
            title: "Add GitHub Copilot or Cursor — ~35h/dev/month saved",
            description:
                "Your team uses development tools but has no AI-native coding assistant. Adding one can dramatically boost developer productivity.",
        });
    }

    // 4. AI upgrade (medium): tool has aiAlternative AND monthlyCost > 0
    for (const t of enrichedTools) {
        if (t.classification !== "traditional" || !t.matched) continue;
        const mapEntry = classifyTool(t.toolName);
        if (mapEntry.aiAlternative && t.monthlyCost > 0) {
            opportunities.push({
                priority: "medium",
                title: `Replace ${t.toolName} with ${mapEntry.aiAlternative} for built-in AI`,
                description: `${t.toolName} is a traditional tool costing $${t.monthlyCost}/mo. ${mapEntry.aiAlternative} offers built-in AI capabilities.`,
            });
        }
    }

    // 5. Category AI gap (medium): category has only traditional/unknown tools, AI alternative exists
    for (const [cat, catTools] of Object.entries(categoryBuckets)) {
        const allTraditionalOrUnknown = catTools.every(
            (t) => t.classification === "traditional" || t.classification === "unknown"
        );
        if (!allTraditionalOrUnknown) continue;
        const toolWithAlt = catTools.find((t) => {
            const m = classifyTool(t.toolName);
            return m.aiAlternative;
        });
        if (toolWithAlt) {
            const alt = classifyTool(toolWithAlt.toolName).aiAlternative;
            opportunities.push({
                priority: "medium",
                title: `No AI tool in ${cat} detected`,
                description: `All tools in ${cat} are traditional.${alt ? ` Consider ${alt} for AI-powered capabilities.` : ""}`,
            });
        }
    }

    // 6. Incomplete data (low): N active tools with no seatCount
    const missingSeatCount = enrichedTools.filter(
        (t) => t.seatCount === null || t.seatCount === 0
    ).length;
    if (missingSeatCount > 0) {
        opportunities.push({
            priority: "low",
            title: `Add seat counts to ${missingSeatCount} tool${missingSeatCount > 1 ? "s" : ""} for accurate time savings`,
            description: `${missingSeatCount} active tool${missingSeatCount > 1 ? "s are" : " is"} missing seat counts. Adding this data improves time-saved and ROI calculations.`,
        });
    }

    // Sort by priority (high -> medium -> low) and cap at 5
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    const sortedOpportunities = opportunities
        .sort((a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9))
        .slice(0, 5);

    return {
        score,
        label,
        benchmarkText,
        aiNativeCount,
        aiEnabledCount,
        traditionalCount,
        unknownCount,
        timeSavedPerMonth,
        timeSavedPerYear,
        dollarValueSaved,
        totalActiveSpend,
        opportunities: sortedOpportunities,
        enrichedTools,
    };
}
