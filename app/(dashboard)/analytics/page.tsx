export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { tools, reports, researchJobs, softwareSpend, subscriptions } from "@/lib/db/schema";
import { eq, sql, desc, gte, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkspaceId } from "@/lib/actions/tools";
import { getPlanLimits } from "@/lib/config/subscriptions";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

function ScoreBar({ score }: { score: number }) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-neutral-100 border border-black/10">
                <div className="h-full bg-black" style={{ width: `${(score / 10) * 100}%` }} />
            </div>
            <span className="font-mono text-xs w-8 text-right">{score.toFixed(1)}</span>
        </div>
    );
}

export default async function AnalyticsPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) redirect("/onboarding");

    // Get subscription for plan limits
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, workspaceId),
    });
    const limits = getPlanLimits(subscription ?? undefined);

    // Tools by status
    const allTools = await db.query.tools.findMany({
        where: eq(tools.workspaceId, workspaceId),
        columns: {
            id: true,
            name: true,
            status: true,
            overallScore: true,
            websiteUrl: true,
            lastResearchedAt: true,
            submittedAt: true,
        },
        orderBy: [desc(tools.submittedAt)],
    });

    // Software spend
    const spendItems = await db.query.softwareSpend.findMany({
        where: eq(softwareSpend.workspaceId, workspaceId),
        columns: { monthlyCost: true, seatCount: true },
    });

    const totalMonthlySpend = spendItems.reduce((sum, s) => sum + Number(s.monthlyCost || 0), 0);

    // Research run counts this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const toolIds = allTools.map((t) => t.id);

    let runsThisMonth = 0;
    if (toolIds.length > 0) {
        const jobs = await db.query.researchJobs.findMany({
            where: gte(researchJobs.triggeredAt, startOfMonth),
            columns: { id: true, toolId: true },
        });
        runsThisMonth = jobs.filter((j) => toolIds.includes(j.toolId)).length;
    }

    // Top and bottom scored tools
    const scoredTools = allTools
        .filter((t) => t.overallScore !== null)
        .map((t) => ({ ...t, score: Number(t.overallScore) }))
        .sort((a, b) => b.score - a.score);

    const avgScore = scoredTools.length > 0
        ? scoredTools.reduce((sum, t) => sum + t.score, 0) / scoredTools.length
        : 0;

    const active = allTools.filter((t) => t.status === "active").length;
    const researching = allTools.filter((t) => t.status === "researching").length;
    const failed = allTools.filter((t) => t.status === "failed").length;
    const backlog = allTools.filter((t) => ["submitted", "queued"].includes(t.status)).length;

    const runLimit = limits.limits.research;
    const runPct = runLimit === Infinity ? 0 : Math.min(100, (runsThisMonth / runLimit) * 100);
    const hoursEstimated = Math.round(runsThisMonth * 2); // 2 hr manual research per run estimate

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-serif font-normal">Analytics</h1>
                <p className="font-mono text-sm text-neutral-500 mt-1">Overview of your workspace research activity.</p>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-black">
                {[
                    { label: "Total Tools", value: allTools.length },
                    { label: "Avg Score", value: avgScore > 0 ? avgScore.toFixed(1) : "—" },
                    { label: "Monthly Spend", value: totalMonthlySpend > 0 ? `$${totalMonthlySpend.toLocaleString()}` : "—" },
                    { label: "Hours Saved", value: `~${hoursEstimated}h` },
                ].map((stat, i) => (
                    <div key={stat.label} className={`p-5 ${i < 3 ? "border-r border-black" : ""}`}>
                        <div className="font-mono text-xs text-neutral-500 uppercase tracking-widest mb-1">{stat.label}</div>
                        <div className="text-3xl font-serif">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Tool status breakdown */}
                <div className="border border-black p-6">
                    <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">Tool Status</h2>
                    <div className="space-y-3">
                        {[
                            { label: "Active", count: active, pct: allTools.length > 0 ? (active / allTools.length) * 100 : 0 },
                            { label: "Backlog", count: backlog, pct: allTools.length > 0 ? (backlog / allTools.length) * 100 : 0 },
                            { label: "Researching", count: researching, pct: allTools.length > 0 ? (researching / allTools.length) * 100 : 0 },
                            { label: "Failed", count: failed, pct: allTools.length > 0 ? (failed / allTools.length) * 100 : 0 },
                        ].map((row) => (
                            <div key={row.label}>
                                <div className="flex justify-between font-mono text-xs mb-1">
                                    <span>{row.label}</span>
                                    <span className="text-neutral-500">{row.count}</span>
                                </div>
                                <div className="h-2 bg-neutral-100 border border-black/10">
                                    <div className="h-full bg-black" style={{ width: `${row.pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Research run usage */}
                <div className="border border-black p-6">
                    <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">Research Runs This Month</h2>
                    <div className="mb-4">
                        <div className="flex justify-between font-mono text-xs mb-2">
                            <span>{runsThisMonth} used</span>
                            <span className="text-neutral-500">{runLimit === Infinity ? "Unlimited" : `${runLimit} limit`}</span>
                        </div>
                        {runLimit !== Infinity ? (
                            <>
                                <div className="h-3 bg-neutral-100 border border-black/10 mb-1">
                                    <div
                                        className="h-full bg-black"
                                        style={{ width: `${runPct}%` }}
                                    />
                                </div>
                                <div className="font-mono text-xs text-neutral-500">
                                    {runLimit - runsThisMonth} runs remaining · resets next month
                                </div>
                            </>
                        ) : (
                            <div className="font-mono text-xs text-neutral-500">Unlimited runs on {limits.name} plan.</div>
                        )}
                    </div>
                    {runPct >= 80 && runLimit !== Infinity && (
                        <div className="border border-black p-3 bg-neutral-50">
                            <p className="font-mono text-xs text-neutral-700 mb-2">
                                You&apos;re at {Math.round(runPct)}% of your monthly limit.
                            </p>
                            <Link href="/settings/billing" className="font-mono text-xs underline hover:text-neutral-500 flex items-center gap-1">
                                Upgrade plan <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-black/10">
                        <div className="font-mono text-xs text-neutral-500 mb-1">Estimated hours saved</div>
                        <div className="text-2xl font-serif">~{hoursEstimated}h</div>
                        <div className="font-mono text-xs text-neutral-400 mt-1">Based on 2hr manual research per run</div>
                    </div>
                </div>
            </div>

            {/* Top scored tools */}
            {scoredTools.length > 0 && (
                <div className="border border-black">
                    <div className="px-6 py-4 border-b border-black">
                        <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500">Top Scored Tools</h2>
                    </div>
                    <div className="divide-y divide-black/10">
                        {scoredTools.slice(0, 8).map((tool) => (
                            <div key={tool.id} className="px-6 py-4 flex items-center gap-4 hover:bg-black/[0.02]">
                                <Link href={`/tools/${tool.id}`} className="w-40 font-mono text-sm font-medium hover:underline truncate">
                                    {tool.name}
                                </Link>
                                <div className="flex-1">
                                    <ScoreBar score={tool.score} />
                                </div>
                                <span className={`font-mono text-xs px-2 py-0.5 border ${
                                    tool.score >= 7 ? "border-black text-black" :
                                    tool.score >= 5 ? "border-neutral-400 text-neutral-500" :
                                    "border-neutral-400 text-neutral-500"
                                }`}>
                                    {tool.score >= 7 ? "Strong" : tool.score >= 5 ? "Average" : "Consider replacing"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {allTools.length === 0 && (
                <div className="border border-dashed border-black/30 py-16 text-center">
                    <p className="font-mono text-sm text-neutral-500">No tools yet.</p>
                    <Link href="/submit" className="font-mono text-xs underline mt-2 inline-block hover:text-black">
                        Submit your first tool →
                    </Link>
                </div>
            )}
        </div>
    );
}
