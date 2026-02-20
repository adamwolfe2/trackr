"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { NotesSection } from "@/components/tools/notes-section";

type ScorecardEntry = { score: number; justification: string };
type ReviewSource = { title: string; url: string; score: number };
type RedditThread = { title: string; url: string; subreddit: string; snippet: string };
type SentimentConsensus = {
    overall: "very_positive" | "positive" | "mixed" | "negative" | "very_negative";
    confidence: number;
    sourceAgreement: string;
};
type MarketIntel = {
    founded?: string;
    headquarters?: string;
    employeeCount?: string;
    funding?: string;
    recentNews?: string[];
};
type SentimentData = {
    reviewAnswer?: string;
    redditAnswer?: string;
    competitorAnalysis?: string;
    reviewSources?: ReviewSource[];
    trustSources?: ReviewSource[];
    trustAnswer?: string;
    redditThreads?: RedditThread[];
    sentimentConsensus?: SentimentConsensus;
    marketIntel?: MarketIntel;
    dataSources?: number;
    pagesScraped?: number;
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

type Note = {
    id: string;
    content: string;
    noteType: string;
    createdAt: string;
    workspaceMemberId: string;
};

interface Props {
    toolId: string;
    toolStatus: string;
    report: SerializedReport | null;
    historyItems: SerializedJob[];
    notes: Note[];
}

const TABS = [
    { id: "report", label: "Analysis" },
    { id: "features", label: "Features & Pricing" },
    { id: "sentiment", label: "Sentiment" },
    { id: "history", label: "History" },
    { id: "notes", label: "Team Notes" },
] as const;

type TabId = typeof TABS[number]["id"];

function SourceLinks({ sources }: { sources: ReviewSource[] }) {
    return (
        <div className="space-y-1">
            {sources.map((src, i) => {
                let hostname = src.url;
                try { hostname = new URL(src.url).hostname.replace("www.", ""); } catch { /* keep raw */ }
                return (
                    <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 border border-black hover:bg-neutral-100 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=16`} alt="" className="w-4 h-4 flex-shrink-0" />
                            <span className="font-mono text-xs truncate">{src.title}</span>
                        </div>
                        <span className="font-mono text-[10px] text-neutral-400 flex-shrink-0 ml-2">{hostname}</span>
                    </a>
                );
            })}
        </div>
    );
}

function EmptyTabState({ toolStatus, tabName }: { toolStatus: string; tabName: string }) {
    if (toolStatus === "researching") {
        return (
            <div className="py-10 text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                    <div className="h-3 w-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span className="font-mono text-sm text-neutral-600">Research in progress...</span>
                </div>
                <p className="font-mono text-xs text-neutral-400">
                    {tabName} data will appear here once research completes (1-2 minutes).
                </p>
            </div>
        );
    }
    if (toolStatus === "queued" || toolStatus === "submitted") {
        return (
            <div className="py-10 text-center space-y-2">
                <p className="font-mono text-sm text-neutral-500">Waiting for research to start...</p>
                <p className="font-mono text-xs text-neutral-400">
                    Click &ldquo;Run Research&rdquo; above to generate {tabName.toLowerCase()} data.
                </p>
            </div>
        );
    }
    if (toolStatus === "failed") {
        return (
            <div className="py-10 text-center space-y-2">
                <p className="font-mono text-sm text-neutral-500">Research failed</p>
                <p className="font-mono text-xs text-neutral-400">
                    Click &ldquo;Retry Research&rdquo; above to try again. {tabName} data will appear after a successful run.
                </p>
            </div>
        );
    }
    return (
        <div className="py-10 text-center font-mono text-sm text-neutral-400">
            No {tabName.toLowerCase()} data available. Run research to generate a report.
        </div>
    );
}

export function ToolDetailTabs({ toolId, toolStatus, report, historyItems, notes }: Props) {
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
                                : "bg-white text-neutral-500 hover:text-black hover:bg-neutral-100"
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
                        <EmptyTabState toolStatus={toolStatus} tabName="Analysis" />
                    )
                )}

                {/* Features & Pricing Tab */}
                {activeTab === "features" && (
                    report ? (
                        <div className="space-y-5">
                            <div>
                                <h3 className="font-mono text-xs uppercase tracking-widest mb-3">Extracted Features</h3>
                                {report.featuresList.length > 0 ? (
                                    <ul className="space-y-1.5">
                                        {report.featuresList.map((feature, i) => (
                                            <li key={i} className="font-mono text-xs flex gap-2">
                                                <span className="text-neutral-400">→</span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="font-mono text-xs text-neutral-400">No features extracted from the research data.</p>
                                )}
                            </div>
                            <div>
                                <h3 className="font-mono text-xs uppercase tracking-widest mb-3">Pricing Structure</h3>
                                {report.pricingTiers.length > 0 ? (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {report.pricingTiers.map((tier, i) => (
                                            <div key={i} className="border border-black p-4">
                                                <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">{tier.tier}</div>
                                                <div className="font-serif text-2xl mt-1">{tier.price}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="font-mono text-xs text-neutral-400">
                                        No public pricing found. This tool may require contacting sales for a quote.
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <EmptyTabState toolStatus={toolStatus} tabName="Features & Pricing" />
                    )
                )}

                {/* Sentiment Tab */}
                {activeTab === "sentiment" && (
                    report?.sentimentData ? (
                        <div className="space-y-5">
                            {/* Data Sources Badge */}
                            {(report.sentimentData.dataSources || report.sentimentData.pagesScraped) && (
                                <div className="flex items-center gap-3 flex-wrap">
                                    {report.sentimentData.dataSources && (
                                        <span className="font-mono text-[10px] uppercase tracking-widest border border-black px-2 py-1">
                                            {report.sentimentData.dataSources} sources analyzed
                                        </span>
                                    )}
                                    {report.sentimentData.pagesScraped && (
                                        <span className="font-mono text-[10px] uppercase tracking-widest border border-neutral-300 px-2 py-1 text-neutral-500">
                                            {report.sentimentData.pagesScraped} pages scraped
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Sentiment Consensus Panel */}
                            {report.sentimentData.sentimentConsensus && (
                                <div className="border border-black p-4">
                                    <h3 className="font-mono text-xs uppercase tracking-widest mb-3">Multi-Source Consensus</h3>
                                    <div className="flex items-center gap-4 mb-3">
                                        <span className={`font-mono text-sm font-bold uppercase px-2 py-1 border ${
                                            report.sentimentData.sentimentConsensus.overall === "very_positive" ? "border-black bg-black text-white" :
                                            report.sentimentData.sentimentConsensus.overall === "positive" ? "border-black text-black" :
                                            report.sentimentData.sentimentConsensus.overall === "mixed" ? "border-neutral-400 text-neutral-600" :
                                            "border-neutral-400 text-neutral-500"
                                        }`}>
                                            {report.sentimentData.sentimentConsensus.overall.replace("_", " ")}
                                        </span>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Confidence</span>
                                                <span className="font-mono text-xs font-bold">{report.sentimentData.sentimentConsensus.confidence}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-neutral-100 border border-neutral-200">
                                                <div className="h-full bg-black" style={{ width: `${report.sentimentData.sentimentConsensus.confidence}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="font-mono text-xs text-neutral-600 leading-relaxed">{report.sentimentData.sentimentConsensus.sourceAgreement}</p>
                                </div>
                            )}

                            {/* Market Intelligence */}
                            {report.sentimentData.marketIntel && (
                                <div className="border border-black p-4">
                                    <h3 className="font-mono text-xs uppercase tracking-widest mb-3">Market Intelligence</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                                        {report.sentimentData.marketIntel.founded && report.sentimentData.marketIntel.founded !== "Unknown" && (
                                            <div>
                                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">Founded</span>
                                                <span className="font-mono text-xs">{report.sentimentData.marketIntel.founded}</span>
                                            </div>
                                        )}
                                        {report.sentimentData.marketIntel.headquarters && report.sentimentData.marketIntel.headquarters !== "Unknown" && (
                                            <div>
                                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">HQ</span>
                                                <span className="font-mono text-xs">{report.sentimentData.marketIntel.headquarters}</span>
                                            </div>
                                        )}
                                        {report.sentimentData.marketIntel.employeeCount && report.sentimentData.marketIntel.employeeCount !== "Unknown" && (
                                            <div>
                                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">Employees</span>
                                                <span className="font-mono text-xs">{report.sentimentData.marketIntel.employeeCount}</span>
                                            </div>
                                        )}
                                        {report.sentimentData.marketIntel.funding && report.sentimentData.marketIntel.funding !== "Unknown" && (
                                            <div>
                                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">Funding</span>
                                                <span className="font-mono text-xs">{report.sentimentData.marketIntel.funding}</span>
                                            </div>
                                        )}
                                    </div>
                                    {report.sentimentData.marketIntel.recentNews && report.sentimentData.marketIntel.recentNews.length > 0 && (
                                        <div>
                                            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">Recent News</span>
                                            <ul className="space-y-1">
                                                {report.sentimentData.marketIntel.recentNews.map((news, i) => (
                                                    <li key={i} className="font-mono text-xs text-neutral-600 flex gap-2">
                                                        <span className="text-neutral-400">→</span>
                                                        {news}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Review Sites */}
                            {report.sentimentData.reviewAnswer && (
                                <div>
                                    <h3 className="font-mono text-xs uppercase tracking-widest mb-2">Review Sites (G2, Capterra, TrustRadius)</h3>
                                    <p className="font-mono text-xs text-neutral-600 leading-relaxed">{report.sentimentData.reviewAnswer}</p>
                                </div>
                            )}
                            {report.sentimentData.reviewSources && report.sentimentData.reviewSources.length > 0 && (
                                <div>
                                    <h3 className="font-mono text-xs uppercase tracking-widest mb-2">Review Sources</h3>
                                    <SourceLinks sources={report.sentimentData.reviewSources} />
                                </div>
                            )}

                            {/* Trust & Reputation */}
                            {report.sentimentData.trustAnswer && (
                                <div>
                                    <h3 className="font-mono text-xs uppercase tracking-widest mb-2">Trust & Reputation (Trustpilot, BBB, Glassdoor)</h3>
                                    <p className="font-mono text-xs text-neutral-600 leading-relaxed">{report.sentimentData.trustAnswer}</p>
                                </div>
                            )}
                            {report.sentimentData.trustSources && report.sentimentData.trustSources.length > 0 && (
                                <div>
                                    <h3 className="font-mono text-xs uppercase tracking-widest mb-2">Trust Sources</h3>
                                    <SourceLinks sources={report.sentimentData.trustSources} />
                                </div>
                            )}

                            {/* Reddit Threads */}
                            {report.sentimentData.redditAnswer && (
                                <div>
                                    <h3 className="font-mono text-xs uppercase tracking-widest mb-2">Reddit / Community</h3>
                                    <p className="font-mono text-xs text-neutral-600 leading-relaxed mb-3">{report.sentimentData.redditAnswer}</p>
                                </div>
                            )}
                            {report.sentimentData.redditThreads && report.sentimentData.redditThreads.length > 0 && (
                                <div>
                                    <h3 className="font-mono text-xs uppercase tracking-widest mb-2">Reddit Threads ({report.sentimentData.redditThreads.length})</h3>
                                    <div className="space-y-1">
                                        {report.sentimentData.redditThreads.map((thread, i) => (
                                            <a key={i} href={thread.url} target="_blank" rel="noopener noreferrer"
                                                className="block p-2 border border-black hover:bg-neutral-100 transition-colors">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-mono text-xs truncate flex-1">{thread.title}</span>
                                                    <span className="font-mono text-[10px] text-neutral-400 flex-shrink-0 ml-2">r/{thread.subreddit}</span>
                                                </div>
                                                {thread.snippet && (
                                                    <p className="font-mono text-[10px] text-neutral-500 line-clamp-2">{thread.snippet}</p>
                                                )}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Competitive Context */}
                            {report.sentimentData.competitorAnalysis && (
                                <div>
                                    <h3 className="font-mono text-xs uppercase tracking-widest mb-2">Competitive Context</h3>
                                    <p className="font-mono text-xs text-neutral-600 leading-relaxed whitespace-pre-line">{report.sentimentData.competitorAnalysis}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <EmptyTabState toolStatus={toolStatus} tabName="Sentiment" />
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
