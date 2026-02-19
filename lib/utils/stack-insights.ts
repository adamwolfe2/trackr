import { classifyTool, type ToolClassification } from "@/lib/config/ai-tools";

// Minimal shape needed from softwareSpend rows
export type SpendEntryInput = {
    id: string;
    toolName: string;
    category: string | null;
    monthlyCost: string | null;
    seatCount: number | null;
    status: string;
};

export type ToolWithInsight = SpendEntryInput & {
    aiClassification: ToolClassification["classification"] | "unknown";
    aiAlternative?: string;
    normalizedCategory?: string;
    hoursPerUserPerMonth: number;
};

export type OpportunityPriority = "HIGH" | "MED" | "LOW";

export type Opportunity = {
    priority: OpportunityPriority;
    message: string;
    savingsPerMonth?: number;
};

export type StackInsights = {
    score: number;
    label: string;
    benchmarkText: string;
    aiNativeCount: number;
    aiEnabledCount: number;
    traditionalCount: number;
    unknownCount: number;
    timeSavedPerMonth: number;
    timeSavedPerYear: number;
    dollarValueSaved: number;
    totalActiveSpend: number;
    opportunities: Opportunity[];
    enrichedTools: ToolWithInsight[];
};

const HOURLY_RATE = 75;

function benchmarkLabel(score: number): { label: string; benchmarkText: string } {
    if (score >= 40) return { label: "AI Leader", benchmarkText: "Top 10% of companies" };
    if (score >= 20) return { label: "Early Adopter", benchmarkText: "Ahead of 75% of companies" };
    if (score >= 8) return { label: "Developing", benchmarkText: "At the industry average" };
    return { label: "Just Starting", benchmarkText: "Big opportunity ahead" };
}

export function computeStackInsights(entries: SpendEntryInput[]): StackInsights {
    // Only score active + evaluating tools (not canceled/canceling)
    const relevant = entries.filter(e => e.status === "active" || e.status === "evaluating");

    // Enrich each tool with AI classification
    const enrichedTools: ToolWithInsight[] = relevant.map(entry => {
        const classification = classifyTool(entry.toolName);
        return {
            ...entry,
            aiClassification: classification?.classification ?? "unknown",
            aiAlternative: classification?.aiAlternative,
            normalizedCategory: classification?.category ?? entry.category ?? undefined,
            hoursPerUserPerMonth: classification?.hoursPerUserPerMonth ?? 0,
        };
    });

    const totalTools = enrichedTools.length;

    let aiNativeCount = 0;
    let aiEnabledCount = 0;
    let traditionalCount = 0;
    let unknownCount = 0;
    let scorePoints = 0;

    for (const t of enrichedTools) {
        if (t.aiClassification === "ai-native") { aiNativeCount++; scorePoints += 2; }
        else if (t.aiClassification === "ai-enabled") { aiEnabledCount++; scorePoints += 1; }
        else if (t.aiClassification === "traditional") traditionalCount++;
        else unknownCount++;
    }

    const maxPoints = totalTools * 2;
    const rawScore = maxPoints > 0 ? (scorePoints / maxPoints) * 100 : 0;
    const score = Math.min(100, Math.round(rawScore));

    const { label, benchmarkText } = benchmarkLabel(score);

    // Time saved — only from AI tools
    const timeSavedPerMonth = enrichedTools
        .filter(t => t.aiClassification === "ai-native" || t.aiClassification === "ai-enabled")
        .reduce((sum, t) => {
            const seats = Math.max(t.seatCount ?? 1, 1);
            return sum + t.hoursPerUserPerMonth * seats;
        }, 0);

    const timeSavedPerYear = timeSavedPerMonth * 12;
    const dollarValueSaved = timeSavedPerYear * HOURLY_RATE;

    const totalActiveSpend = entries
        .filter(e => e.status === "active")
        .reduce((sum, e) => sum + (parseFloat(e.monthlyCost ?? "0") || 0), 0);

    // ── Opportunity engine ─────────────────────────────────────────────
    const opportunities: Opportunity[] = [];

    // 1. Redundancy: 3+ tools in same category
    const categoryCount: Record<string, { tools: ToolWithInsight[]; totalCost: number }> = {};
    for (const t of enrichedTools) {
        const cat = t.normalizedCategory ?? t.category ?? "Other";
        if (!categoryCount[cat]) categoryCount[cat] = { tools: [], totalCost: 0 };
        categoryCount[cat].tools.push(t);
        categoryCount[cat].totalCost += parseFloat(t.monthlyCost ?? "0") || 0;
    }
    for (const [cat, { tools: catTools, totalCost }] of Object.entries(categoryCount)) {
        if (catTools.length >= 3) {
            const savings = Math.round(totalCost * 0.3);
            opportunities.push({
                priority: "HIGH",
                message: `${catTools.length} ${cat} tools — consider consolidating${savings > 0 ? `, save ~$${savings}/mo` : ""}`,
                savingsPerMonth: savings,
            });
        }
    }

    // 2. Duplicate comms: Slack + Teams both active
    const hasSlack = enrichedTools.some(t => t.toolName.toLowerCase().includes("slack"));
    const hasTeams = enrichedTools.some(t =>
        t.toolName.toLowerCase().includes("microsoft teams") || t.toolName.toLowerCase() === "teams"
    );
    if (hasSlack && hasTeams) {
        opportunities.push({
            priority: "HIGH",
            message: "Both Slack and Microsoft Teams active — pick one to reduce cost and context switching",
        });
    }

    // 3. No AI dev tool: has dev tools but no AI-native dev tool
    const hasDevTools = enrichedTools.some(t => {
        const cat = (t.normalizedCategory ?? t.category ?? "").toLowerCase();
        return cat.includes("dev") || cat === "development" || cat === "engineering";
    });
    const hasAiDevTool = enrichedTools.some(t =>
        t.aiClassification === "ai-native" &&
        (t.normalizedCategory ?? "").toLowerCase().includes("dev")
    );
    if (hasDevTools && !hasAiDevTool) {
        opportunities.push({
            priority: "MED",
            message: "No AI coding tool detected — GitHub Copilot or Cursor saves ~30h/dev/month",
        });
    }

    // 4. AI upgrade: tool has aiAlternative AND monthlyCost > 0
    for (const t of enrichedTools) {
        if (
            t.aiAlternative &&
            t.aiClassification === "traditional" &&
            (parseFloat(t.monthlyCost ?? "0") || 0) > 0
        ) {
            opportunities.push({
                priority: "MED",
                message: `Replace ${t.toolName} with ${t.aiAlternative} for built-in AI at similar cost`,
            });
            if (opportunities.length >= 5) break;
        }
    }

    // 5. Incomplete data: active tools with no seatCount
    const missingSeats = enrichedTools.filter(
        t => t.status === "active" && (t.seatCount === null || t.seatCount === 0)
    ).length;
    if (missingSeats > 0) {
        opportunities.push({
            priority: "LOW",
            message: `Add seat counts to ${missingSeats} tool${missingSeats > 1 ? "s" : ""} for full ROI picture`,
        });
    }

    // 6. Category AI gap: category has only traditional tools, AI alternative exists
    if (opportunities.length < 5) {
        const gapCategories = new Set<string>();
        for (const [cat, { tools: catTools }] of Object.entries(categoryCount)) {
            const allTraditional = catTools.every(
                t => t.aiClassification === "traditional" || t.aiClassification === "unknown"
            );
            const hasAltSuggestion = catTools.some(t => t.aiAlternative);
            if (allTraditional && hasAltSuggestion && !gapCategories.has(cat)) {
                gapCategories.add(cat);
                const alt = catTools.find(t => t.aiAlternative)?.aiAlternative;
                opportunities.push({
                    priority: "MED",
                    message: `No AI tool in ${cat}${alt ? ` — consider ${alt}` : ""}`,
                });
                if (opportunities.length >= 5) break;
            }
        }
    }

    // Sort: HIGH → MED → LOW, then limit to 5
    const priorityOrder: Record<OpportunityPriority, number> = { HIGH: 0, MED: 1, LOW: 2 };
    const sortedOpportunities = opportunities
        .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
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
