import type { CuratedTool, Scorecard, ToolSignal } from "./types";

export function slugify(name: string): string {
    return "lib-" + name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function computeOverall(scorecard: Scorecard): number {
    const dims = Object.values(scorecard).map((d) => d.score);
    const avg = dims.reduce((a, b) => a + b, 0) / dims.length;
    return Math.round(avg * 10) / 10;
}

const POPULARITY_SIGNALS: ToolSignal[] = ["ProductHunt", "Viral", "Funded", "Fast-growing"];
const INSIDER_SIGNALS: ToolSignal[] = ["Agents", "RAG", "YC", "OpenSource"];

export function computePopularityScore(signals: ToolSignal[]): number {
    const matches = signals.filter((s) => POPULARITY_SIGNALS.includes(s)).length;
    return Math.min(10, 5 + matches * 1.5);
}

export function computeInsiderScore(signals: ToolSignal[]): number {
    const matches = signals.filter((s) => INSIDER_SIGNALS.includes(s)).length;
    return Math.min(10, 4 + matches * 2);
}

/** Sort tools by a given key */
export function sortTools(
    tools: CuratedTool[],
    sortBy: "score" | "popularity" | "insider" | "name" | "newest"
): CuratedTool[] {
    return [...tools].sort((a, b) => {
        switch (sortBy) {
            case "score":
                return b.overallScore - a.overallScore;
            case "popularity":
                return computePopularityScore(b.signals) - computePopularityScore(a.signals);
            case "insider":
                return computeInsiderScore(b.signals) - computeInsiderScore(a.signals);
            case "name":
                return a.name.localeCompare(b.name);
            default:
                return 0;
        }
    });
}
