/**
 * Pure computation engine for Stack Health Score.
 *
 * Takes workspace data, returns a score 0-100 with a six-dimension breakdown.
 * No DB access — all data is passed in from the caller.
 */

export type HealthBreakdown = {
    toolQuality: number;       // 0-100  — Average of active tools' overallScore (0-10 → 0-100)
    spendEfficiency: number;   // 0-100  — % of spend on researched/active tools
    coverageGaps: number;      // 0-100  — How many critical categories are covered
    riskExposure: number;      // 0-100  — Inverse: % of tools WITHOUT risk issues = score
    renewalHealth: number;     // 0-100  — % of renewals with >30 days notice
    teamUtilization: number;   // 0-100  — % of tools with notes/decisions in last 90 days
};

const WEIGHTS = {
    toolQuality: 0.30,
    spendEfficiency: 0.20,
    coverageGaps: 0.15,
    riskExposure: 0.15,
    renewalHealth: 0.10,
    teamUtilization: 0.10,
} as const;

/** Weighted average of the six dimensions → 0-100. */
export function computeHealthScore(breakdown: HealthBreakdown): number {
    const weighted =
        breakdown.toolQuality * WEIGHTS.toolQuality +
        breakdown.spendEfficiency * WEIGHTS.spendEfficiency +
        breakdown.coverageGaps * WEIGHTS.coverageGaps +
        breakdown.riskExposure * WEIGHTS.riskExposure +
        breakdown.renewalHealth * WEIGHTS.renewalHealth +
        breakdown.teamUtilization * WEIGHTS.teamUtilization;

    return Math.round(Math.min(100, Math.max(0, weighted)));
}

// ─── Dimension calculators ──────────────────────────────────────────────────

export type ToolInput = {
    id: string;
    overallScore: string | null; // numeric(4,2) comes as string from Drizzle
    status: string;
};

export type SpendInput = {
    id: string;
    toolName: string;
    monthlyCost: string | null;
    status: string;
    renewalDate: Date | null;
};

export type NoteInput = {
    toolId: string;
    createdAt: Date;
};

export type RiskInput = {
    toolId: string;
    alertLevel: string; // low | medium | high | critical
};

export type DecisionInput = {
    toolId: string | null;
    createdAt: Date;
};

/**
 * Compute toolQuality: average overallScore (0-10 scale) of active tools → 0-100.
 */
export function computeToolQuality(tools: ToolInput[]): number {
    const activeScored = tools.filter(
        (t) => t.status === "active" && t.overallScore !== null
    );
    if (activeScored.length === 0) return 50; // Neutral score for new workspaces with no active tools
    const sum = activeScored.reduce(
        (s, t) => s + (parseFloat(t.overallScore!) || 0),
        0
    );
    const avg = sum / activeScored.length; // 0-10
    return Math.round(Math.min(100, Math.max(0, avg * 10)));
}

/**
 * Compute spendEfficiency: % of total spend allocated to researched/active tools.
 * A tool is "researched" if a matching tool record exists with status active.
 */
export function computeSpendEfficiency(
    spendItems: SpendInput[],
    researchedToolNames: Set<string>
): number {
    const activeSpend = spendItems.filter((s) => s.status === "active");
    if (activeSpend.length === 0) return 100; // no spend = no waste

    const totalSpend = activeSpend.reduce(
        (s, e) => s + (parseFloat(e.monthlyCost ?? "0") || 0),
        0
    );
    if (totalSpend <= 0) return 100;

    const researchedSpend = activeSpend
        .filter((s) => researchedToolNames.has(s.toolName.toLowerCase()))
        .reduce((s, e) => s + (parseFloat(e.monthlyCost ?? "0") || 0), 0);

    return Math.round((researchedSpend / totalSpend) * 100);
}

/**
 * CRITICAL_CATEGORIES sourced from typical companyContext / workspace config.
 * A workspace that covers more of these gets a higher score.
 */
const CRITICAL_CATEGORIES = [
    "project management",
    "communication",
    "security",
    "analytics",
    "crm",
    "development",
    "design",
    "ai",
    "finance",
    "hr",
];

/**
 * Compute coverageGaps: what % of critical categories are represented in the
 * workspace's active tool set.
 */
export function computeCoverageGaps(
    toolCategories: string[],
    spendCategories: string[]
): number {
    const covered = new Set<string>();
    const all = [...toolCategories, ...spendCategories].map((c) =>
        c.toLowerCase()
    );

    for (const cat of CRITICAL_CATEGORIES) {
        if (all.some((c) => c.includes(cat) || cat.includes(c))) {
            covered.add(cat);
        }
    }

    return Math.round((covered.size / CRITICAL_CATEGORIES.length) * 100);
}

/**
 * Compute riskExposure: % of tools that do NOT have medium/high/critical risk alerts.
 * Higher = better (fewer risky tools).
 */
export function computeRiskExposure(
    tools: ToolInput[],
    risks: RiskInput[]
): number {
    const activeTools = tools.filter((t) => t.status === "active");
    if (activeTools.length === 0) return 100;

    const riskyToolIds = new Set(
        risks
            .filter((r) =>
                ["medium", "high", "critical"].includes(r.alertLevel)
            )
            .map((r) => r.toolId)
    );

    const safeCount = activeTools.filter(
        (t) => !riskyToolIds.has(t.id)
    ).length;
    return Math.round((safeCount / activeTools.length) * 100);
}

/**
 * Compute renewalHealth: % of upcoming renewals where renewalDate > 30 days from now.
 * Tools with no renewal date are excluded from the calculation.
 */
export function computeRenewalHealth(spendItems: SpendInput[]): number {
    const withRenewal = spendItems.filter(
        (s) => s.status === "active" && s.renewalDate !== null
    );
    if (withRenewal.length === 0) return 100; // no renewals = healthy

    const now = new Date();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    const healthy = withRenewal.filter((s) => {
        const renewal = new Date(s.renewalDate!);
        return renewal.getTime() - now.getTime() > thirtyDaysMs;
    });

    return Math.round((healthy.length / withRenewal.length) * 100);
}

/**
 * Compute teamUtilization: % of active tools that have had at least one note
 * or decision entry in the last 90 days.
 */
export function computeTeamUtilization(
    tools: ToolInput[],
    recentNotes: NoteInput[],
    recentDecisions: DecisionInput[]
): number {
    const activeTools = tools.filter((t) => t.status === "active");
    if (activeTools.length === 0) return 100;

    const touchedToolIds = new Set<string>();
    for (const n of recentNotes) touchedToolIds.add(n.toolId);
    for (const d of recentDecisions) {
        if (d.toolId) touchedToolIds.add(d.toolId);
    }

    const utilized = activeTools.filter((t) => touchedToolIds.has(t.id)).length;
    return Math.round((utilized / activeTools.length) * 100);
}

/**
 * Convenience: build the full breakdown from raw data arrays.
 */
export function buildBreakdown(input: {
    tools: ToolInput[];
    spendItems: SpendInput[];
    researchedToolNames: Set<string>;
    toolCategories: string[];
    spendCategories: string[];
    risks: RiskInput[];
    recentNotes: NoteInput[];
    recentDecisions: DecisionInput[];
}): HealthBreakdown {
    return {
        toolQuality: computeToolQuality(input.tools),
        spendEfficiency: computeSpendEfficiency(
            input.spendItems,
            input.researchedToolNames
        ),
        coverageGaps: computeCoverageGaps(
            input.toolCategories,
            input.spendCategories
        ),
        riskExposure: computeRiskExposure(input.tools, input.risks),
        renewalHealth: computeRenewalHealth(input.spendItems),
        teamUtilization: computeTeamUtilization(
            input.tools,
            input.recentNotes,
            input.recentDecisions
        ),
    };
}

/**
 * Generate simple text recommendations based on the breakdown.
 */
export function generateRecommendations(
    breakdown: HealthBreakdown
): string[] {
    const recs: string[] = [];

    if (breakdown.toolQuality < 50) {
        recs.push(
            "Several active tools score below average. Consider researching alternatives or re-evaluating low-scoring tools."
        );
    }
    if (breakdown.spendEfficiency < 60) {
        recs.push(
            "A significant portion of your spend goes to unresearched tools. Run research on your highest-cost tools to identify savings."
        );
    }
    if (breakdown.coverageGaps < 50) {
        recs.push(
            "Your stack has coverage gaps across critical categories. Review your needs in project management, security, and analytics."
        );
    }
    if (breakdown.riskExposure < 70) {
        recs.push(
            "Multiple tools have elevated risk alerts. Prioritize reviewing tools flagged as high or critical risk."
        );
    }
    if (breakdown.renewalHealth < 60) {
        recs.push(
            "Some renewals are approaching within 30 days. Set calendar reminders and review contract terms before auto-renewal."
        );
    }
    if (breakdown.teamUtilization < 40) {
        recs.push(
            "Most active tools have not been reviewed in the last 90 days. Encourage team members to log notes and decisions."
        );
    }

    if (recs.length === 0) {
        recs.push(
            "Your stack health is strong. Continue monitoring scores and reviewing tools on a regular cadence."
        );
    }

    return recs;
}
