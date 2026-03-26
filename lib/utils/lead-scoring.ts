/**
 * Lead scoring utility — computes a 0-100 priority score for audit leads
 * based on company profile, AI readiness, and engagement signals.
 */

type AuditSubmissionRow = {
    revenue: string | null;
    employeeCount: string | null;
    monthlySpend: string | null;
    currentTools: string[] | null;
    dailyAdoptionPct: string | null;
    hasAIManager: string | null;
    scorecard: Record<string, unknown> | null;
    shareViewedAt: Date | null;
};

type LeadScoreResult = {
    score: number;
    tier: "hot" | "warm" | "cold";
    breakdown: {
        revenue: number;
        employees: number;
        spend: number;
        toolCount: number;
        adoption: number;
        governance: number;
        aiScore: number;
        engagement: number;
    };
};

function parseRevenue(rev: string | null): number {
    if (!rev) return 0;
    const r = rev.toLowerCase();
    if (r.includes("100m") || r.includes("100+")) return 15;
    if (r.includes("25m") || r.includes("50m")) return 13;
    if (r.includes("10m") || r.includes("5m")) return 10;
    if (r.includes("2m") || r.includes("1m")) return 7;
    return 3;
}

function parseEmployees(emp: string | null): number {
    if (!emp) return 0;
    // Use string matching for range values (e.g. "25-50", "201–1,000 people", "1,000+ people")
    const e = emp.toLowerCase();
    if (e.includes("1,000") || e.includes("1000")) return 10; // 1000+ = large enterprise
    if (e.includes("500") || e.includes("201")) return 15; // 201-1000 = sweet spot
    if (e.includes("100") || e.includes("51")) return 13;
    if (e.includes("50") || e.includes("25")) return 12;
    // Try parsing a clean single number (e.g. "35")
    const match = emp.match(/^(\d+)$/);
    if (match) {
        const n = parseInt(match[1], 10);
        if (n >= 50 && n <= 500) return 15;
        if (n > 500) return 10;
        if (n >= 25) return 12;
        if (n >= 10) return 8;
        return 5;
    }
    if (e.includes("10")) return 8;
    return 5;
}

function parseSpend(spend: string | null): number {
    if (!spend) return 0;
    const s = spend.toLowerCase();
    if (s.includes("50k") || s.includes("50+")) return 15;
    if (s.includes("25k") || s.includes("15k")) return 13;
    if (s.includes("10k") || s.includes("5k")) return 10;
    if (s.includes("1k") || s.includes("2k")) return 6;
    return 3;
}

function parseAdoption(adoption: string | null): number {
    if (!adoption) return 10;
    const a = adoption.toLowerCase();
    if (a.includes("less than 10") || a.includes("<10")) return 15;
    if (a.includes("10") && (a.includes("30") || a.includes("20"))) return 13;
    if (a.includes("30") || a.includes("40") || a.includes("50")) return 10;
    if (a.includes("60") || a.includes("70") || a.includes("80")) return 5;
    return 8;
}

export function computeLeadScore(submission: AuditSubmissionRow): LeadScoreResult {
    const tools = submission.currentTools ?? [];
    const scorecard = submission.scorecard as { aiNativeScore?: { score?: number } } | null;
    const aiNativeScore = scorecard?.aiNativeScore?.score ?? 50;

    const breakdown = {
        revenue: parseRevenue(submission.revenue),
        employees: parseEmployees(submission.employeeCount),
        spend: parseSpend(submission.monthlySpend),
        toolCount: tools.length >= 25 ? 10 : tools.length >= 10 ? 8 : tools.length >= 5 ? 5 : 2,
        adoption: parseAdoption(submission.dailyAdoptionPct),
        governance: (!submission.hasAIManager || submission.hasAIManager.toLowerCase().includes("no")) ? 10 : 3,
        aiScore: aiNativeScore < 30 ? 10 : aiNativeScore < 50 ? 7 : aiNativeScore < 70 ? 4 : 1,
        engagement: submission.shareViewedAt ? 5 : 0,
    };

    const score = Math.min(100, Object.values(breakdown).reduce((sum, v) => sum + v, 0));
    const tier = score >= 70 ? "hot" : score >= 45 ? "warm" : "cold";

    return { score, tier, breakdown };
}
