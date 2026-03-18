export const dynamic = "force-dynamic";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { workspaceMembers, workspaces, tools, reports, softwareSpend, painPoints } from "@/lib/db/schema";
import { eq, desc, inArray, and } from "drizzle-orm";
import { computeStackInsights } from "@/lib/utils/stack-insights";
import type { Metadata } from "next";
import { PrintButton } from "./print-button";

export const metadata: Metadata = {
    title: "AI Stack Intelligence Report — Trackr",
    description: "Printable AI stack intelligence report for your workspace.",
};

export default async function StackReportPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });
    if (!member) redirect("/onboarding");

    const wsId = member.workspaceId;

    const [workspace, allTools, spendEntries, activePainPoints] = await Promise.all([
        db.query.workspaces.findFirst({ where: eq(workspaces.id, wsId) }),
        db.query.tools.findMany({
            where: eq(tools.workspaceId, wsId),
            orderBy: [desc(tools.overallScore)],
            columns: { id: true, name: true, overallScore: true, category: true, websiteUrl: true, status: true },
        }),
        db.query.softwareSpend.findMany({ where: eq(softwareSpend.workspaceId, wsId) }),
        db.query.painPoints.findMany({
            where: and(eq(painPoints.workspaceId, wsId), eq(painPoints.active, true)),
        }),
    ]);

    const toolIds = allTools.map(t => t.id);
    // Latest report per tool (for summaries)
    let latestReportsMap = new Map<string, { summary: string | null; pros: string[] | null; cons: string[] | null }>();
    if (toolIds.length > 0) {
        const allReportsList = await db
            .select({
                toolId: reports.toolId,
                summary: reports.summary,
                pros: reports.pros,
                cons: reports.cons,
            })
            .from(reports)
            .where(inArray(reports.toolId, toolIds))
            .orderBy(desc(reports.createdAt));
        for (const r of allReportsList) {
            if (!latestReportsMap.has(r.toolId)) {
                latestReportsMap.set(r.toolId, {
                    summary: r.summary,
                    pros: r.pros,
                    cons: r.cons,
                });
            }
        }
    }

    const insights = computeStackInsights(spendEntries);
    const activeTools = allTools.filter(t => t.status === "active");
    const scoredTools = activeTools.filter(t => t.overallScore !== null);
    const top5 = scoredTools.slice(0, 5);
    const needsAttention = scoredTools.filter(t => Number(t.overallScore) < 5);

    const totalMonthly = insights.totalActiveSpend;
    const totalAnnual = totalMonthly * 12;
    const aiNativeSpend = insights.enrichedTools.filter(t => t.classification === "ai-native").reduce((s, t) => s + t.monthlyCost, 0);
    const traditionalSpend = insights.enrichedTools.filter(t => t.classification === "traditional").reduce((s, t) => s + t.monthlyCost, 0);
    const generatedDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const scoreColor = (score: number) => {
        if (score >= 7) return "bg-black text-white";
        if (score >= 5) return "border border-black text-black";
        return "border border-neutral-400 text-neutral-500";
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `@media print { nav, aside, .no-print { display: none !important } }` }} />
            <div className="space-y-8 max-w-4xl mx-auto">

                {/* Report Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Trackr Intelligence</p>
                        <h1 className="font-serif text-3xl font-normal">AI Stack Intelligence Report</h1>
                        <div className="flex items-center gap-3 mt-2 font-mono text-xs text-neutral-500 flex-wrap">
                            {workspace?.name && <span>{workspace.name}</span>}
                            <span>·</span>
                            <span>Generated: {generatedDate}</span>
                        </div>
                    </div>
                    <div className="no-print flex items-center gap-3">
                        <a
                            href="/stack"
                            className="border border-black px-4 py-2 font-mono text-xs hover:bg-neutral-100 transition-colors"
                        >
                            ← Back to Stack
                        </a>
                        <PrintButton />
                    </div>
                </div>

                {/* AI Nativeness Score */}
                <div className="border border-black p-6">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">AI Nativeness Score</p>
                    <div className="flex flex-wrap items-end gap-4 sm:gap-6">
                        <div>
                            <div className="font-serif text-4xl sm:text-6xl leading-none">{insights.score}</div>
                            <div className="font-mono text-sm text-neutral-400">/100</div>
                        </div>
                        <div className="space-y-1">
                            <div className="font-mono text-lg font-semibold uppercase tracking-wide">{insights.label}</div>
                            <div className="font-mono text-xs text-neutral-500">{insights.benchmarkText}</div>
                            <div className="font-mono text-xs text-neutral-400 flex gap-4 mt-2">
                                <span>{insights.aiNativeCount} AI-native</span>
                                <span>{insights.aiEnabledCount} AI-enabled</span>
                                <span>{insights.traditionalCount} traditional</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Spend Summary */}
                {totalMonthly > 0 && (
                    <div className="border border-black p-6">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">Spend Summary</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                            <div>
                                <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Monthly Total</div>
                                <div className="font-serif text-2xl">${Math.round(totalMonthly)}</div>
                            </div>
                            <div>
                                <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Annual Total</div>
                                <div className="font-serif text-2xl">${(totalAnnual / 1000).toFixed(1)}k</div>
                            </div>
                            <div>
                                <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">AI-Native</div>
                                <div className="font-serif text-2xl">${Math.round(aiNativeSpend)}/mo</div>
                            </div>
                            <div>
                                <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Est. Value Saved</div>
                                <div className="font-serif text-2xl">${insights.dollarValueSaved >= 1000 ? `${Math.round(insights.dollarValueSaved / 1000)}k` : Math.round(insights.dollarValueSaved)}/yr</div>
                            </div>
                        </div>
                        {insights.timeSavedPerMonth > 0 && (
                            <p className="font-mono text-xs text-neutral-500 mt-4">
                                ~{Math.round(insights.timeSavedPerMonth)} hrs/mo saved · ~{Math.round(insights.timeSavedPerYear)} hrs/yr · Traditional spend: ${Math.round(traditionalSpend)}/mo
                            </p>
                        )}
                    </div>
                )}

                {/* Top 5 Tools by Score */}
                {top5.length > 0 && (
                    <div className="border border-black">
                        <div className="px-6 py-4 border-b border-black">
                            <h2 className="font-mono text-xs uppercase tracking-widest">Top 5 Tools by Score</h2>
                        </div>
                        <div className="divide-y divide-black/10">
                            {top5.map(tool => {
                                const report = latestReportsMap.get(tool.id);
                                const score = Number(tool.overallScore ?? 0);
                                return (
                                    <div key={tool.id} className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start gap-2 sm:gap-4">
                                        <span className={`font-mono text-sm px-2 py-0.5 shrink-0 ${scoreColor(score)}`}>
                                            {score.toFixed(1)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-serif text-base">{tool.name}</div>
                                            {tool.category && tool.category.length > 0 && (
                                                <div className="flex gap-1 flex-wrap mt-1">
                                                    {tool.category.map(c => (
                                                        <span key={c} className="font-mono text-[10px] border border-neutral-200 px-1.5 py-0.5">{c}</span>
                                                    ))}
                                                </div>
                                            )}
                                            {report?.summary && (
                                                <p className="font-mono text-xs text-neutral-500 mt-1 leading-relaxed line-clamp-2">
                                                    {report.summary.slice(0, 200)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Needs Attention */}
                {needsAttention.length > 0 && (
                    <div className="border border-black">
                        <div className="px-6 py-4 border-b border-black">
                            <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500">Needs Attention (Score &lt; 5)</h2>
                        </div>
                        <div className="divide-y divide-black/10">
                            {needsAttention.map(tool => {
                                const report = latestReportsMap.get(tool.id);
                                const topCon = report?.cons?.[0];
                                return (
                                    <div key={tool.id} className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start gap-2 sm:gap-4">
                                        <span className="font-mono text-sm border border-neutral-400 text-neutral-500 px-2 py-0.5 shrink-0">
                                            {Number(tool.overallScore ?? 0).toFixed(1)}
                                        </span>
                                        <div>
                                            <div className="font-serif text-base">{tool.name}</div>
                                            {topCon && (
                                                <p className="font-mono text-xs text-neutral-500 mt-1">
                                                    <span className="text-neutral-300">−</span> {topCon}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Active Pain Points */}
                {activePainPoints.length > 0 && (
                    <div className="border border-black">
                        <div className="px-6 py-4 border-b border-black">
                            <h2 className="font-mono text-xs uppercase tracking-widest">Active Pain Points ({activePainPoints.length})</h2>
                        </div>
                        <div className="divide-y divide-black/10">
                            {activePainPoints.map(pp => (
                                <div key={pp.id} className="px-6 py-4 flex items-start gap-4">
                                    {pp.category && (
                                        <span className="font-mono text-[10px] border border-black px-1.5 py-0.5 shrink-0 mt-0.5">{pp.category}</span>
                                    )}
                                    <div>
                                        <div className="font-serif text-base">{pp.title}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommendations */}
                {insights.opportunities.length > 0 && (
                    <div className="border border-black">
                        <div className="px-6 py-4 border-b border-black">
                            <h2 className="font-mono text-xs uppercase tracking-widest">Top Recommendations</h2>
                        </div>
                        <div className="divide-y divide-black/10">
                            {insights.opportunities.slice(0, 3).map((opp, i) => (
                                <div key={i} className="px-6 py-4">
                                    <div className="flex items-start gap-3">
                                        <span className={`font-mono text-[10px] uppercase border px-1.5 py-0.5 shrink-0 mt-0.5 ${
                                            opp.priority === "high" ? "border-black bg-black text-white" :
                                            opp.priority === "medium" ? "border-black text-black" :
                                            "border-neutral-300 text-neutral-400"
                                        }`}>{opp.priority}</span>
                                        <div>
                                            <div className="font-serif text-base">{opp.title}</div>
                                            <p className="font-mono text-xs text-neutral-500 mt-1">{opp.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="border-t border-black/20 pt-4 pb-8 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-neutral-400">Generated by Trackr — trytrackr.com</span>
                    <span className="font-mono text-[10px] text-neutral-300">{generatedDate}</span>
                </div>
            </div>
        </>
    );
}
