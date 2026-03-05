export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkspaceId } from "@/lib/db/queries";
import { checkFeatureAccess } from "@/lib/middleware/require-subscription";
import { PlanGate } from "@/components/billing/plan-gate";
import { getLatestHealthScore, computeAndSaveHealthScore, getHealthHistory } from "@/lib/actions/health-score";
import { HealthScoreCard } from "@/components/dashboard/health-score-card";
import type { HealthBreakdown } from "@/lib/utils/health-score-engine";
import Link from "next/link";
import { ArrowRight, Lock, TrendingDown, TrendingUp, Minus } from "lucide-react";

export const metadata: Metadata = {
    title: "Stack Health — Trackr",
    description: "Monitor the overall health of your software stack with a composite score and actionable recommendations.",
};

const DIMENSION_LABELS: Record<keyof HealthBreakdown, { label: string; description: string }> = {
    toolQuality: { label: "Tool Quality", description: "Average score of active researched tools" },
    spendEfficiency: { label: "Spend Efficiency", description: "% of spend on researched/active tools" },
    coverageGaps: { label: "Category Coverage", description: "Critical category coverage in your stack" },
    riskExposure: { label: "Risk Exposure", description: "% of tools with no elevated risk alerts" },
    renewalHealth: { label: "Renewal Health", description: "% of renewals with >30 days notice" },
    teamUtilization: { label: "Team Utilization", description: "% of tools reviewed in last 90 days" },
};

function ScoreRing({ score }: { score: number }) {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    const color = score >= 70 ? "black" : score >= 40 ? "#737373" : "#a3a3a3";

    return (
        <div className="relative w-48 h-48 mx-auto">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 160 160">
                <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke="#e5e5e5"
                    strokeWidth="6"
                />
                <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="6"
                    strokeLinecap="square"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-serif text-5xl font-normal">{score}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mt-1">
                    / 100
                </span>
            </div>
        </div>
    );
}

const DIMENSION_GUIDANCE: Record<keyof HealthBreakdown, string> = {
    toolQuality: "Research tools to build quality scores",
    spendEfficiency: "Add software spend entries to track efficiency",
    coverageGaps: "Add tools across categories to measure coverage",
    riskExposure: "Run risk assessments on your tools",
    renewalHealth: "Upload contracts with renewal dates",
    teamUtilization: "Invite team members and review tools regularly",
};

function BreakdownBar({
    dimensionKey,
    value,
}: {
    dimensionKey: keyof HealthBreakdown;
    value: number;
}) {
    const { label, description } = DIMENSION_LABELS[dimensionKey];
    const barColor = value >= 70 ? "bg-black" : value >= 40 ? "bg-neutral-500" : "bg-neutral-300";
    const hasData = value > 0;

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <div>
                    <span className="font-mono text-xs font-medium">{label}</span>
                    <span className="font-mono text-[10px] text-neutral-400 ml-2">{description}</span>
                </div>
                <span className="font-mono text-xs font-bold">{value}</span>
            </div>
            {hasData ? (
                <div className="h-2 bg-neutral-100 border border-neutral-200 w-full">
                    <div
                        className={`h-full ${barColor}`}
                        style={{ width: `${Math.min(100, Math.max(0, value))}%`, transition: "width 0.3s ease" }}
                    />
                </div>
            ) : (
                <div className="h-8 border border-dashed border-neutral-300 bg-neutral-50 flex items-center px-3">
                    <span className="font-mono text-[10px] text-neutral-400">
                        {DIMENSION_GUIDANCE[dimensionKey]}
                    </span>
                </div>
            )}
        </div>
    );
}

export default async function HealthPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) redirect("/onboarding");

    // Feature gate
    const plan = await checkFeatureAccess(workspaceId, "stackHealth");
    if (!plan) {
        return (
            <PlanGate
                featureName="Stack Health Score"
                description="Get a composite health score for your software stack with actionable recommendations to improve efficiency and reduce risk."
                requiredPlan="Free"
            />
        );
    }

    const isLimited = plan.features.stackHealth === "limited";

    // Get or compute score
    let latest = await getLatestHealthScore(workspaceId);

    // Re-compute if no score exists or last computed >24h ago
    if (
        !latest ||
        Date.now() - new Date(latest.computedAt).getTime() > 24 * 60 * 60 * 1000
    ) {
        const computed = await computeAndSaveHealthScore(workspaceId);
        latest = computed;
    }

    // Get trend data
    const history = await getHealthHistory(workspaceId, 90);
    const previousScore = history.length > 1 ? history[1].score : null;
    const scoreDelta = previousScore !== null ? latest.score - previousScore : null;

    const breakdown = latest.breakdown;
    const recommendations = latest.recommendations;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="font-serif text-3xl font-normal">Stack Health</h1>
                <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
                    Last computed: {new Date(latest.computedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
            </div>

            {/* Score Ring */}
            <div className="border border-black bg-white p-8">
                <ScoreRing score={latest.score} />
                <div className="text-center mt-4">
                    <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                        Stack Health Score
                    </span>
                    {scoreDelta !== null && (
                        <div className="flex items-center justify-center gap-1 mt-2">
                            {scoreDelta > 0 ? (
                                <TrendingUp className="h-3 w-3 text-black" />
                            ) : scoreDelta < 0 ? (
                                <TrendingDown className="h-3 w-3 text-neutral-400" />
                            ) : (
                                <Minus className="h-3 w-3 text-neutral-400" />
                            )}
                            <span className="font-mono text-[10px]">
                                {scoreDelta > 0 ? "+" : ""}
                                {scoreDelta} from previous
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* New Workspace Guidance */}
            {latest.score === 0 && (
                <div className="border border-dashed border-black/30 bg-white px-6 py-8 text-center">
                    <p className="font-serif text-lg text-neutral-600 mb-2">Your stack health will improve as you add data</p>
                    <p className="font-mono text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                        Research tools, add spend entries, upload contracts, and run risk assessments to build a comprehensive health score. Each dimension below shows what action to take.
                    </p>
                </div>
            )}

            {/* Breakdown Bars */}
            <div className="border border-black bg-white p-6 space-y-4">
                <h2 className="font-mono text-xs uppercase tracking-widest mb-4">Score Breakdown</h2>
                {(Object.keys(DIMENSION_LABELS) as (keyof HealthBreakdown)[]).map((key) => (
                    <BreakdownBar key={key} dimensionKey={key} value={breakdown[key]} />
                ))}
            </div>

            {/* Recommendations */}
            <div className={`border border-black bg-white relative ${isLimited ? "overflow-hidden" : ""}`}>
                <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                    <h2 className="font-mono text-xs uppercase tracking-widest">Recommendations</h2>
                    {isLimited && (
                        <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Startup Plan
                        </span>
                    )}
                </div>
                <div className={isLimited ? "blur-sm pointer-events-none select-none" : ""}>
                    <div className="divide-y divide-neutral-100">
                        {recommendations.map((rec, i) => (
                            <div key={i} className="flex items-start gap-3 px-5 py-4">
                                <ArrowRight className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" strokeWidth={1.5} />
                                <p className="font-mono text-sm text-neutral-700 leading-relaxed">{rec}</p>
                            </div>
                        ))}
                    </div>
                </div>
                {isLimited && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 mt-10">
                        <div className="text-center">
                            <div className="w-10 h-10 border border-black flex items-center justify-center mx-auto mb-3">
                                <Lock className="w-5 h-5 text-black" strokeWidth={1.5} />
                            </div>
                            <p className="font-mono text-sm mb-3">Upgrade to unlock recommendations</p>
                            <Link
                                href="/settings/billing"
                                className="inline-block border border-black bg-black text-white px-5 py-2 font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                            >
                                View Plans
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Trend History */}
            {history.length > 1 && !isLimited && (
                <div className="border border-black bg-white p-6">
                    <h2 className="font-mono text-xs uppercase tracking-widest mb-4">Score History (Last 90 Days)</h2>
                    <div className="flex items-end gap-1 h-32">
                        {history
                            .slice()
                            .reverse()
                            .slice(-30)
                            .map((entry, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-black min-w-[3px]"
                                    style={{ height: `${entry.score}%` }}
                                    title={`${entry.score} — ${new Date(entry.computedAt).toLocaleDateString()}`}
                                />
                            ))}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <span className="font-mono text-[10px] text-neutral-400">
                            {history.length > 0 && new Date(history[history.length - 1].computedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <span className="font-mono text-[10px] text-neutral-400">
                            {new Date(history[0].computedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                    </div>
                </div>
            )}

            {/* Dashboard Card Preview */}
            <div className="border border-black bg-white p-6">
                <h2 className="font-mono text-xs uppercase tracking-widest mb-4">Dashboard Widget Preview</h2>
                <div className="max-w-xs">
                    <HealthScoreCard score={latest.score} previousScore={previousScore} />
                </div>
            </div>
        </div>
    );
}
