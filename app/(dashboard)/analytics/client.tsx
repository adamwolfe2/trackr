"use client";

import { useMemo, useState, useEffect } from "react";
import { BarChart3, PlusCircle } from "lucide-react";
import Link from "next/link";
import { AnimatedBar } from "@/components/common/animated-bar";

interface WeeklyActivity {
    week: string;
    count: number;
}

interface TopResearched {
    name: string;
    researchCount: number;
    avgScore: number | null;
}

interface StatusCounts {
    submitted: number;
    researching: number;
    active: number;
    archived: number;
    failed: number;
}

interface MemberActivity {
    userId: string;
    name: string;
    role: string;
    toolCount: number;
}

interface SpendCategory {
    category: string;
    total: number;
}

interface HeatmapEntry {
    toolName: string;
    scores: Record<string, number>;
}

interface AnalyticsClientProps {
    totalTools: number;
    totalReports: number;
    avgScore: number;
    activePainPoints: number;
    weeklyActivity: WeeklyActivity[];
    topResearched: TopResearched[];
    statusCounts: StatusCounts;
    memberActivity: MemberActivity[];
    heatmapData: HeatmapEntry[];
    spendByCategory: SpendCategory[];
    totalMonthlySpend: number;
    aiNativeSpend: number;
    traditionalSpend: number;
    researchSuccessRate: number;
}

const DIMENSIONS = [
    { key: "features", label: "Features" },
    { key: "pricing_value", label: "Pricing" },
    { key: "ease_of_use", label: "Ease of Use" },
    { key: "integration_depth", label: "Integrations" },
    { key: "support_quality", label: "Support" },
    { key: "security", label: "Security" },
    { key: "ai_capabilities", label: "AI" },
] as const;

function formatWeekLabel(weekStr: string): string {
    try {
        const d = new Date(weekStr);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
        return weekStr;
    }
}

function scoreCellClass(score: number | undefined): string {
    if (score === undefined) return "bg-neutral-50 text-neutral-300";
    if (score < 4) return "bg-red-50 text-red-700 border border-red-100";
    if (score <= 6.5) return "bg-yellow-50 text-yellow-700 border border-yellow-100";
    return "bg-neutral-50 text-black border border-neutral-200";
}

function formatDollar(amount: number): string {
    if (amount >= 1000) return `$${Math.round(amount / 100) * 100 >= 1000 ? (amount / 1000).toFixed(1) + "k" : Math.round(amount)}`;
    return `$${Math.round(amount)}`;
}

export default function AnalyticsClient({
    totalTools,
    totalReports,
    avgScore,
    activePainPoints,
    weeklyActivity,
    topResearched,
    statusCounts,
    memberActivity,
    heatmapData,
    spendByCategory,
    totalMonthlySpend,
    aiNativeSpend,
    traditionalSpend,
    researchSuccessRate,
}: AnalyticsClientProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const maxWeeklyCount = useMemo(
        () => Math.max(...weeklyActivity.map((w) => w.count), 1),
        [weeklyActivity]
    );

    const totalStatus = useMemo(
        () =>
            statusCounts.submitted +
            statusCounts.researching +
            statusCounts.active +
            statusCounts.archived +
            statusCounts.failed,
        [statusCounts]
    );

    const statusSegments = useMemo(() => [
        { label: "Submitted", count: statusCounts.submitted, pct: totalStatus > 0 ? (statusCounts.submitted / totalStatus) * 100 : 0 },
        { label: "Researching", count: statusCounts.researching, pct: totalStatus > 0 ? (statusCounts.researching / totalStatus) * 100 : 0 },
        { label: "Active", count: statusCounts.active, pct: totalStatus > 0 ? (statusCounts.active / totalStatus) * 100 : 0 },
        { label: "Archived", count: statusCounts.archived, pct: totalStatus > 0 ? (statusCounts.archived / totalStatus) * 100 : 0 },
        { label: "Failed", count: statusCounts.failed, pct: totalStatus > 0 ? (statusCounts.failed / totalStatus) * 100 : 0 },
    ], [statusCounts, totalStatus]);

    // Sort members by tool count descending
    const sortedMembers = useMemo(
        () => [...memberActivity].sort((a, b) => b.toolCount - a.toolCount),
        [memberActivity]
    );

    const maxSpend = useMemo(
        () => Math.max(...spendByCategory.map(c => c.total), 1),
        [spendByCategory]
    );
    const hasSpend = totalMonthlySpend > 0;

    if (totalTools === 0) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-serif font-normal">Analytics</h1>
                    <p className="font-mono text-sm text-neutral-500 mt-1">
                        Overview of your workspace research activity.
                    </p>
                </div>
                <div className="border border-black bg-white p-12 text-center">
                    <BarChart3 className="w-8 h-8 mx-auto mb-4 text-neutral-300" />
                    <h3 className="font-serif text-lg mb-2">No analytics data yet</h3>
                    <p className="font-mono text-xs text-neutral-500 mb-6 max-w-sm mx-auto">
                        Add tools to your workspace and run research to see activity charts, score heatmaps, and spend breakdowns here.
                    </p>
                    <Link href="/tools" className="inline-flex items-center gap-2 border border-black px-4 py-2 font-mono text-xs bg-black text-white hover:bg-neutral-800">
                        <PlusCircle className="w-3.5 h-3.5" /> Add Your First Tool
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-serif font-normal">Analytics</h1>
                <p className="font-mono text-sm text-neutral-500 mt-1">
                    Overview of your workspace research activity.
                </p>
            </div>

            {/* Stats Grid — 6 stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0 border border-black">
                {[
                    { label: "Total Tools", value: String(totalTools) },
                    { label: "Total Reports", value: String(totalReports) },
                    { label: "Avg Score", value: avgScore > 0 ? avgScore.toFixed(1) : "\u2014" },
                    { label: "Active Pain Points", value: String(activePainPoints) },
                    { label: "Research Success", value: totalReports > 0 ? `${researchSuccessRate}%` : "\u2014" },
                    { label: "Monthly Spend", value: hasSpend ? `$${Math.round(totalMonthlySpend)}` : "\u2014" },
                ].map((stat, i, arr) => (
                    <div
                        key={stat.label}
                        className={`p-5 ${i < arr.length - 1 ? "border-r border-black" : ""} ${i < 2 ? "border-b lg:border-b-0 border-black" : ""} ${i >= 2 && i < 4 ? "md:border-b lg:border-b-0 border-black" : ""}`}
                    >
                        <div className="font-mono text-xs text-neutral-500 uppercase tracking-widest mb-1">
                            {stat.label}
                        </div>
                        <div className="text-3xl font-serif">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Research Activity Bar Chart */}
                <div className="border border-black p-6">
                    <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">
                        Research Activity
                    </h2>
                    {weeklyActivity.length > 0 ? (
                        <div className="flex items-end gap-2 h-40">
                            {weeklyActivity.map((week) => {
                                const heightPct = (week.count / maxWeeklyCount) * 100;
                                return (
                                    <div
                                        key={week.week}
                                        className="flex-1 flex flex-col items-center justify-end gap-1"
                                    >
                                        <span className="font-mono text-xs text-neutral-500">
                                            {week.count}
                                        </span>
                                        <div
                                            className="w-full bg-black border border-black transition-[height] duration-700 ease-out"
                                            style={{
                                                height: mounted ? `${Math.max(heightPct, 4)}%` : "0%",
                                                minHeight: mounted ? "4px" : "0px",
                                            }}
                                        />
                                        <span className="font-mono text-[9px] text-neutral-400 whitespace-nowrap">
                                            {formatWeekLabel(week.week)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-40 flex items-center justify-center">
                            <p className="font-mono text-xs text-neutral-400">
                                No research activity in the last 8 weeks
                            </p>
                        </div>
                    )}
                </div>

                {/* Tool Status Distribution */}
                <div className="border border-black p-6">
                    <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">
                        Tool Status Distribution
                    </h2>
                    {totalStatus > 0 ? (
                        <>
                            {/* Stacked horizontal bar */}
                            <div className="h-6 border border-black flex overflow-hidden mb-4">
                                {statusSegments
                                    .filter((s) => s.count > 0)
                                    .map((segment, i) => {
                                        const shades = [
                                            "bg-black",
                                            "bg-neutral-700",
                                            "bg-neutral-500",
                                            "bg-neutral-300",
                                            "bg-neutral-200",
                                        ];
                                        return (
                                            <div
                                                key={segment.label}
                                                className={`${shades[i % shades.length]} h-full transition-[width] duration-700 ease-out`}
                                                style={{ width: mounted ? `${segment.pct}%` : "0%" }}
                                                title={`${segment.label}: ${segment.count}`}
                                            />
                                        );
                                    })}
                            </div>
                            {/* Legend */}
                            <div className="space-y-2">
                                {statusSegments.map((segment, i) => {
                                    const shades = [
                                        "bg-black",
                                        "bg-neutral-700",
                                        "bg-neutral-500",
                                        "bg-neutral-300",
                                        "bg-neutral-200",
                                    ];
                                    return (
                                        <div
                                            key={segment.label}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`w-3 h-3 border border-black ${shades[i % shades.length]}`}
                                                />
                                                <span className="font-mono text-xs">
                                                    {segment.label}
                                                </span>
                                            </div>
                                            <span className="font-mono text-xs text-neutral-500">
                                                {segment.count}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="h-32 flex items-center justify-center">
                            <p className="font-mono text-xs text-neutral-400">No tools yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Spend Analytics Section */}
            {hasSpend && (
                <div className="border border-black">
                    <div className="px-6 py-4 border-b border-black">
                        <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                            Spend Analytics
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        {/* 3 stat tiles */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border border-black">
                            {[
                                { label: "Total Monthly", value: formatDollar(totalMonthlySpend) },
                                { label: "AI-Native Spend", value: formatDollar(aiNativeSpend) },
                                { label: "Traditional Spend", value: formatDollar(traditionalSpend) },
                            ].map((tile, i) => (
                                <div key={tile.label} className={`p-4 ${i < 2 ? "border-r border-black" : ""}`}>
                                    <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">{tile.label}</div>
                                    <div className="font-serif text-2xl">{tile.value}</div>
                                </div>
                            ))}
                        </div>
                        {/* Category bars */}
                        {spendByCategory.length > 0 && (
                            <div className="space-y-2">
                                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Spend by Category</p>
                                {spendByCategory.map((cat, idx) => (
                                    <div key={cat.category} className="flex items-center gap-3">
                                        <span className="font-mono text-xs w-28 truncate text-neutral-600" title={cat.category}>{cat.category}</span>
                                        <div className="flex-1">
                                            <AnimatedBar
                                                value={(cat.total / maxSpend) * 100}
                                                height="h-4"
                                                delay={150 + idx * 50}
                                            />
                                        </div>
                                        <span className="font-mono text-xs text-neutral-500 w-16 text-right">{formatDollar(cat.total)}/mo</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!hasSpend && (
                <div className="border border-dashed border-black/20 p-4 font-mono text-xs text-neutral-400">
                    Add software spend data to see spend analytics →{" "}
                    <Link href="/stack" className="underline hover:text-black">Go to Stack</Link>
                </div>
            )}

            {/* Score Matrix Heatmap */}
            <div className="border border-black">
                <div className="px-6 py-4 border-b border-black">
                    <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                        Score Matrix — Dimension Breakdown
                    </h2>
                </div>
                {heatmapData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[500px]">
                            <thead>
                                <tr className="border-b border-black/20">
                                    <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-neutral-400 w-40">Tool</th>
                                    {DIMENSIONS.map(d => (
                                        <th key={d.key} className="text-center px-2 py-3 font-mono text-[10px] uppercase tracking-widest text-neutral-400">{d.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {heatmapData.map(row => (
                                    <tr key={row.toolName} className="border-b border-black/10 last:border-b-0">
                                        <td className="px-4 py-2">
                                            <span
                                                className="font-mono text-xs truncate block max-w-[80px] sm:max-w-[150px]"
                                                title={row.toolName}
                                            >
                                                {row.toolName.length > 16 ? row.toolName.slice(0, 16) + "…" : row.toolName}
                                            </span>
                                        </td>
                                        {DIMENSIONS.map(d => {
                                            const score = row.scores[d.key];
                                            return (
                                                <td key={d.key} className="px-2 py-2 text-center">
                                                    <span className={`font-mono text-[11px] px-1.5 py-0.5 inline-block ${scoreCellClass(score)}`}>
                                                        {score !== undefined ? score.toFixed(1) : "—"}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <p className="font-mono text-xs text-neutral-400">Research tools to see dimension scores</p>
                    </div>
                )}
            </div>

            {/* Top Researched Tools */}
            {topResearched.length > 0 && (
                <div className="border border-black">
                    <div className="px-6 py-4 border-b border-black">
                        <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                            Top Researched Tools
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-black/20">
                                    <th className="font-mono text-xs uppercase tracking-widest text-left px-6 py-3 text-neutral-500">
                                        Tool
                                    </th>
                                    <th className="font-mono text-xs uppercase tracking-widest text-right px-6 py-3 text-neutral-500">
                                        Research Count
                                    </th>
                                    <th className="font-mono text-xs uppercase tracking-widest text-right px-6 py-3 text-neutral-500">
                                        Avg Score
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {topResearched.map((tool) => (
                                    <tr
                                        key={tool.name}
                                        className="border-b border-black/10 last:border-b-0 hover:bg-black/[0.02]"
                                    >
                                        <td className="font-mono text-sm px-6 py-3 font-medium">
                                            {tool.name}
                                        </td>
                                        <td className="font-mono text-sm text-right px-6 py-3">
                                            {tool.researchCount}
                                        </td>
                                        <td className="font-mono text-sm text-right px-6 py-3">
                                            {tool.avgScore !== null
                                                ? tool.avgScore.toFixed(1)
                                                : "\u2014"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Team Activity */}
            {sortedMembers.length > 0 && (
                <div className="border border-black">
                    <div className="px-6 py-4 border-b border-black">
                        <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                            Team Activity
                        </h2>
                    </div>
                    <div className="divide-y divide-black/10">
                        {sortedMembers.map((member) => (
                            <div
                                key={member.userId}
                                className="px-6 py-4 flex items-center justify-between hover:bg-black/[0.02]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 border border-black bg-neutral-100 flex items-center justify-center">
                                        <span className="font-mono text-xs font-bold uppercase">
                                            {member.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-mono text-sm">
                                            {member.name}
                                        </div>
                                        <div className="font-mono text-xs text-neutral-400 uppercase">
                                            {member.role}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-serif text-lg">{member.toolCount}</div>
                                    <div className="font-mono text-xs text-neutral-400">
                                        tools submitted
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {totalTools === 0 && (
                <div className="border border-dashed border-black/30 py-16 text-center">
                    <p className="font-mono text-sm text-neutral-500">No tools yet.</p>
                    <a
                        href="/submit"
                        className="font-mono text-xs underline mt-2 inline-block hover:text-black"
                    >
                        Submit your first tool
                    </a>
                </div>
            )}
        </div>
    );
}
