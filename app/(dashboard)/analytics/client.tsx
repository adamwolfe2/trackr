"use client";

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
    role: string;
    toolCount: number;
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
}

function formatWeekLabel(weekStr: string): string {
    try {
        const d = new Date(weekStr);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
        return weekStr;
    }
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
}: AnalyticsClientProps) {
    const maxWeeklyCount = Math.max(...weeklyActivity.map((w) => w.count), 1);
    const totalStatus =
        statusCounts.submitted +
        statusCounts.researching +
        statusCounts.active +
        statusCounts.archived +
        statusCounts.failed;

    const statusSegments = [
        { label: "Submitted", count: statusCounts.submitted, pct: totalStatus > 0 ? (statusCounts.submitted / totalStatus) * 100 : 0 },
        { label: "Researching", count: statusCounts.researching, pct: totalStatus > 0 ? (statusCounts.researching / totalStatus) * 100 : 0 },
        { label: "Active", count: statusCounts.active, pct: totalStatus > 0 ? (statusCounts.active / totalStatus) * 100 : 0 },
        { label: "Archived", count: statusCounts.archived, pct: totalStatus > 0 ? (statusCounts.archived / totalStatus) * 100 : 0 },
        { label: "Failed", count: statusCounts.failed, pct: totalStatus > 0 ? (statusCounts.failed / totalStatus) * 100 : 0 },
    ];

    // Sort members by tool count descending
    const sortedMembers = [...memberActivity].sort((a, b) => b.toolCount - a.toolCount);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-serif font-normal">Analytics</h1>
                <p className="font-mono text-sm text-neutral-500 mt-1">
                    Overview of your workspace research activity.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-black">
                {[
                    { label: "Total Tools", value: String(totalTools) },
                    { label: "Total Reports", value: String(totalReports) },
                    { label: "Avg Score", value: avgScore > 0 ? avgScore.toFixed(1) : "\u2014" },
                    { label: "Active Pain Points", value: String(activePainPoints) },
                ].map((stat, i) => (
                    <div
                        key={stat.label}
                        className={`p-5 ${i % 2 === 0 ? "border-r border-black" : ""} ${i < 3 ? "md:border-r" : ""} ${i < 2 ? "border-b md:border-b-0 border-black" : ""}`}
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
                                            className="w-full bg-black border border-black"
                                            style={{
                                                height: `${Math.max(heightPct, 4)}%`,
                                                minHeight: "4px",
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
                                                className={`${shades[i % shades.length]} h-full`}
                                                style={{ width: `${segment.pct}%` }}
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
                                            {member.userId.slice(0, 2)}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-mono text-sm">
                                            Member {member.userId.slice(-6)}
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
