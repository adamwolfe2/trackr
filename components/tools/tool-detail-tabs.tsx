"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { NotesSection } from "@/components/tools/notes-section";

type ScorecardEntry = { score: number; justification: string };
type ReviewSource = { title: string; url: string; score: number };
type SentimentData = {
    reviewAnswer?: string;
    redditAnswer?: string;
    competitorAnalysis?: string;
    reviewSources?: ReviewSource[];
};

type SerializedReport = {
    id: string;
    summary: string | null;
    scorecardSnapshot: Record<string, ScorecardEntry> | null;
    pros: string[] | null;
    cons: string[] | null;
    featuresList: string[];
    pricingTiers: Array<{ tier: string; price: string }>;
    sentimentData: SentimentData | null;
};

type SerializedJob = {
    id: string;
    status: string;
    triggeredAt: string;
    version?: number;
    type: "job" | "report";
};

type WorkspaceTool = {
    id: string;
    name: string;
    status: string;
};

type Note = {
    id: string;
    content: string;
    noteType: string;
    createdAt: string;
    workspaceMemberId: string;
};

interface Props {
    toolId: string;
    report: SerializedReport | null;
    historyItems: SerializedJob[];
    notes: Note[];
    workspaceTools: WorkspaceTool[];
    competitors: string[];
}

const TABS = [
    { id: "report", label: "Analysis" },
    { id: "features", label: "Features & Pricing" },
    { id: "sentiment", label: "Sentiment" },
    { id: "history", label: "History" },
    { id: "notes", label: "Team Notes" },
] as const;

type TabId = typeof TABS[number]["id"];

export function ToolDetailTabs({ toolId, report, historyItems, notes, workspaceTools, competitors }: Props) {
    const [activeTab, setActiveTab] = useState<TabId>("report");

    return (
        <div className="border border-black">
            {/* Tab Navigation — scrollable on mobile */}
            <div className="flex border-b border-black overflow-x-auto scrollbar-none"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-3 font-mono text-xs uppercase tracking-widest whitespace-nowrap transition-colors ${
                            activeTab === tab.id
                                ? "bg-black text-white"
                                : "bg-white text-neutral-500 hover:text-black hover:bg-neutral-50"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-5">

                {/* Analysis Tab */}
                {activeTab === "report" && (
                    report ? (
                        <div className="space-y-5">
                            {/* Score Breakdown */}
                            <div>
                                <h3 className="font-mono text-xs uppercase tracking-widest mb-4">Score Breakdown</h3>
                                <div className="space-y-4">
                                    {report.scorecardSnapshot && Object.entries(report.scorecardSnapshot).map(([key, value]) => (
                                        <div key={key}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-mono text-xs capitalize">{key.replace(/_/g, " ")}</span>
                                                <span className="font-mono text-xs font-bold">{value.score}/10</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-neutral-100 border border-neutral-200">
                                                <div className="h-full bg-black" style={{ width: `${(value.score / 10) * 100}%` }} />
                                            </div>
                                            <p className="font-mono text-[10px] text-neutral-500 mt-1">{value.justification}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pros / Cons */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border border-black p-4">
                                    <h4 className="font-mono text-xs uppercase tracking-widest mb-3">Pros</h4>
                                    <ul className="space-y-1.5">
                                        {report.pros?.map((pro, i) => (
                                            <li key={i} className="font-mono text-xs flex gap-2">
                                                <span className="text-neutral-400">+</span>
                                                {pro}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="border border-black p-4">
                                    <h4 className="font-mono text-xs uppercase tracking-widest mb-3">Cons</h4>
                                    <ul className="space-y-1.5">
                                        {report.cons?.map((con, i) => (
                                            <li key={i} className="font-mono text-xs flex gap-2">
                                                <span className="text-neutral-400">−</span>
                                                {con}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-10 text-center font-mono text-sm text-neutral-400">
                            No report generated yet. Run deep research to generate a report.
                        </div>
                    )
                )}

                {/* Features & Pricing Tab */}
                {activeTab === "features" && (
                    report ? (
                        <div className="space-y-5">
                            <div>
                                <h3 className="font-mono text-xs uppercase tracking-widest mb-3">Extracted Features</h3>
                                <ul className="space-y-1.5">
                                    {report.featuresList.map((feature, i) => (
                                        <li key={i} className="font-mono text-xs flex gap-2">
                                            <span className="text-neutral-400">→</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-mono text-xs uppercase tracking-widest mb-3">Pricing Structure</h3>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {report.pricingTiers.map((tier, i) => (
                                        <div key={i} className="border border-black p-4">
                                            <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">{tier.tier}</div>
                                            <div className="font-serif text-2xl mt-1">{tier.price}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-10 text-center font-mono text-sm text-neutral-400">No data available.</div>
                    )
                )}

                {/* Sentiment Tab */}
                {activeTab === "sentiment" && (
                    report?.sentimentData ? (
                        <div className="space-y-5">
                            {report.sentimentData.reviewAnswer && (
                                <div>
                                    <h3 className="font-mono text-xs uppercase tracking-widest mb-2">Review Site Summary</h3>
                                    <p className="font-mono text-xs text-neutral-600 leading-relaxed">{report.sentimentData.reviewAnswer}</p>
                                </div>
                            )}
                            {report.sentimentData.reviewSources && report.sentimentData.reviewSources.length > 0 && (
                                <div>
                                    <h3 className="font-mono text-xs uppercase tracking-widest mb-2">Sources Reviewed</h3>
                                    <div className="space-y-1">
                                        {report.sentimentData.reviewSources.map((src, i) => (
                                            <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center justify-between p-2 border border-black hover:bg-neutral-50 transition-colors">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <img src={`https://www.google.com/s2/favicons?domain=${new URL(src.url).hostname}&sz=16`} alt="" className="w-4 h-4 flex-shrink-0" />
                                                    <span className="font-mono text-xs truncate">{src.title}</span>
                                                </div>
                                                <span className="font-mono text-[10px] text-neutral-400 flex-shrink-0 ml-2">
                                                    {new URL(src.url).hostname.replace("www.", "")}
                                                </span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {report.sentimentData.redditAnswer && (
                                <div>
                                    <h3 className="font-mono text-xs uppercase tracking-widest mb-2">Reddit / Community</h3>
                                    <p className="font-mono text-xs text-neutral-600 leading-relaxed">{report.sentimentData.redditAnswer}</p>
                                </div>
                            )}
                            {report.sentimentData.competitorAnalysis && (
                                <div>
                                    <h3 className="font-mono text-xs uppercase tracking-widest mb-2">Competitive Context</h3>
                                    <p className="font-mono text-xs text-neutral-600 leading-relaxed">{report.sentimentData.competitorAnalysis}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-10 text-center font-mono text-sm text-neutral-400">No sentiment data yet. Run deep research to collect community reviews.</div>
                    )
                )}

                {/* History Tab */}
                {activeTab === "history" && (
                    <div>
                        <h3 className="font-mono text-xs uppercase tracking-widest mb-4">Research & Update History</h3>
                        {historyItems.length > 0 ? (
                            <div className="space-y-3">
                                {historyItems.map((item) => (
                                    <div key={item.id} className="border border-black p-3 flex items-center justify-between">
                                        <div>
                                            <div className="font-mono text-xs font-bold">
                                                {item.type === "job" ? `Research Job — ${item.status}` : `Report Generated (v${item.version})`}
                                            </div>
                                            <div className="font-mono text-[10px] text-neutral-400 mt-0.5">
                                                {formatDistanceToNow(new Date(item.triggeredAt), { addSuffix: true })}
                                            </div>
                                        </div>
                                        <span className={`font-mono text-[10px] uppercase border px-2 py-0.5 ${
                                            item.status === "complete" ? "border-black bg-black text-white" :
                                            item.status === "failed" ? "border-red-600 text-red-600" :
                                            "border-neutral-300 text-neutral-500"
                                        }`}>
                                            {item.status ?? "saved"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 text-center font-mono text-sm text-neutral-400">No history recorded yet.</div>
                        )}
                    </div>
                )}

                {/* Team Notes Tab */}
                {activeTab === "notes" && (
                    <NotesSection toolId={toolId} notes={notes} />
                )}

            </div>
        </div>
    );
}
