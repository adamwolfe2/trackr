import { db } from "@/lib/db";
import { reports, tools, workspaces, painPoints, notes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { ShareActions } from "./share-actions";
import { TrackrLogo } from "@/components/common/trackr-logo";
import nextDynamic from "next/dynamic";
const ShareRadarChart = nextDynamic(() => import("@/components/share/share-radar-chart").then(m => m.ShareRadarChart), { ssr: false });
import { MarkdownText, CompetitorAnalysisBlock } from "@/components/share/markdown-text";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type ScorecardEntry = { score: number; justification: string };
type ReviewSource = { title: string; url: string; score: number };
type RedditThread = { title: string; url: string; subreddit: string; snippet: string };
type ScorecardConfig = {
    systemContext?: string;
    businessUnits?: Array<{ key: string; name: string; description: string; priorities: string }>;
    evaluationCriteria?: string;
    dealBreakers?: string;
};

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
    const { token } = await params;
    const report = await db.query.reports.findFirst({
        where: eq(reports.shareToken, token),
    });
    if (!report) return { title: "Report Not Found — Trackr" };

    const tool = await db.query.tools.findFirst({
        where: eq(tools.id, report.toolId),
        columns: { name: true },
    });

    const toolName = tool?.name ?? "Tool";
    const desc = report.summary?.slice(0, 160) ?? "AI-powered software research report by Trackr.";
    return {
        title: `${toolName} Research Report — Trackr`,
        description: desc,
        openGraph: {
            title: `${toolName} — Research Report`,
            description: desc,
            type: "article",
            images: [{ url: "/og.png", width: 1456, height: 816, alt: `${toolName} Research Report` }],
        },
        twitter: {
            card: "summary_large_image",
            title: `${toolName} — Research Report`,
            description: desc,
            images: ["/og.png"],
        },
    };
}

export default async function SharedReportPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;

    const report = await db.query.reports.findFirst({
        where: eq(reports.shareToken, token),
    });

    if (!report) return notFound();

    const tool = await db.query.tools.findFirst({
        where: eq(tools.id, report.toolId),
    });

    if (!tool) return notFound();

    // Fetch workspace context — custom scorecard, company profile, pain points, and team notes
    const [workspace, workspacePainPoints, toolNotes] = await Promise.all([
        db.query.workspaces.findFirst({
            where: eq(workspaces.id, tool.workspaceId),
            columns: { name: true, companyContext: true, scorecardConfig: true },
        }),
        db.query.painPoints.findMany({
            where: eq(painPoints.workspaceId, tool.workspaceId),
            columns: { id: true, title: true, description: true, category: true, active: true },
        }),
        db.query.notes.findMany({
            where: eq(notes.toolId, tool.id),
            orderBy: [desc(notes.createdAt)],
            columns: { id: true, content: true, noteType: true, createdAt: true },
        }),
    ]);

    const activePainPoints = workspacePainPoints.filter((p) => p.active);
    const scorecardConfig = workspace?.scorecardConfig as ScorecardConfig | null;

    const scorecardSnapshot = report.scorecardSnapshot as Record<string, ScorecardEntry> | null;
    const pros = report.pros as string[] | null;
    const cons = report.cons as string[] | null;
    const featuresList = report.features && typeof report.features === "object" && "list" in report.features
        ? ((report.features as { list: string[] }).list as string[])
        : [];
    const pricingTiers = (report.pricing as Array<{ tier: string; price: string }>) ?? [];
    const sentimentData = report.sentimentData as {
        reviewAnswer?: string;
        redditAnswer?: string;
        competitorAnalysis?: string;
        reviewSources?: ReviewSource[];
        trustSources?: ReviewSource[];
        trustAnswer?: string;
        redditThreads?: RedditThread[];
        sentimentConsensus?: {
            overall: "very_positive" | "positive" | "mixed" | "negative" | "very_negative";
            confidence: number;
            sourceAgreement: string;
        };
        marketIntel?: {
            founded?: string;
            headquarters?: string;
            employeeCount?: string;
            funding?: string;
            recentNews?: string[];
        };
        dataSources?: number;
        pagesScraped?: number;
    } | null;
    const competitors = (report.competitors as string[]) ?? [];

    const toolHostname = (() => {
        if (!tool.websiteUrl) return null;
        try { return new URL(tool.websiteUrl).hostname; } catch { return tool.websiteUrl; }
    })();

    const avgScore = scorecardSnapshot
        ? Object.values(scorecardSnapshot).reduce((s, v) => s + v.score, 0) / Object.keys(scorecardSnapshot).length
        : 0;

    const sentimentColors: Record<string, string> = {
        very_positive: "bg-black text-white border-black",
        positive: "border-black text-black",
        mixed: "border-neutral-400 text-neutral-500",
        negative: "border-red-400 text-red-600",
        very_negative: "bg-red-600 text-white border-red-600",
    };
    const sentimentLabels: Record<string, string> = {
        very_positive: "Very Positive",
        positive: "Positive",
        mixed: "Mixed",
        negative: "Negative",
        very_negative: "Very Negative",
    };

    const reviewJsonLd = {
        "@context": "https://schema.org",
        "@type": "Review",
        itemReviewed: {
            "@type": "SoftwareApplication",
            name: tool.name,
            ...(tool.websiteUrl ? { url: tool.websiteUrl } : {}),
            applicationCategory: tool.category?.join(", ") || "BusinessApplication",
        },
        reviewRating: {
            "@type": "Rating",
            ratingValue: avgScore.toFixed(1),
            bestRating: "10",
            worstRating: "0",
        },
        author: { "@type": "Organization", name: "Trackr", url: "https://trytrackr.com" },
        reviewBody: report.summary ?? undefined,
        publisher: { "@type": "Organization", name: "Trackr", url: "https://trytrackr.com" },
    };

    return (
        <div className="min-h-screen bg-[#F3F3EF]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewJsonLd) }}
            />
            {/* Header */}
            <div className="border-b border-black bg-[#F3F3EF] px-6 py-4 flex items-center justify-between">
                <a href="https://trytrackr.com" className="flex items-center gap-2 font-serif text-xl font-medium hover:opacity-70">
                    <TrackrLogo size={24} />
                    Trackr
                </a>
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 border border-neutral-300 px-2 py-1">
                    Shared Report
                </span>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
                {/* Tool Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1 min-w-0">
                        <h1 className="font-serif text-3xl font-normal flex items-center gap-3 flex-wrap">
                            {tool.logoUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={tool.logoUrl} alt={tool.name} className="w-8 h-8 object-contain flex-shrink-0" />
                            )}
                            {tool.name}
                        </h1>
                        <div className="flex items-center gap-2 font-mono text-xs text-neutral-400 flex-wrap">
                            {toolHostname && (
                                <a href={tool.websiteUrl!} target="_blank" rel="noopener noreferrer" className="hover:text-black flex items-center gap-1">
                                    {toolHostname} <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                            )}
                            {tool.category?.length ? (
                                <>
                                    {toolHostname && <span>·</span>}
                                    {tool.category.map((c: string) => (
                                        <span key={c} className="border border-neutral-300 px-1.5 py-0.5 text-[10px]">{c}</span>
                                    ))}
                                </>
                            ) : null}
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <div className="font-mono text-3xl font-bold">{avgScore.toFixed(1)}</div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Score</div>
                    </div>
                </div>

                {/* Company Context Banner */}
                {workspace && (
                    <div className="border border-black bg-white px-5 py-3 flex items-center gap-3">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Evaluated by</span>
                        <span className="font-mono text-xs font-medium">{workspace.name}</span>
                        {sentimentData?.dataSources && (
                            <>
                                <span className="text-neutral-300">·</span>
                                <span className="font-mono text-[10px] text-neutral-400">{sentimentData.dataSources} sources analyzed</span>
                            </>
                        )}
                        {sentimentData?.pagesScraped && (
                            <>
                                <span className="text-neutral-300">·</span>
                                <span className="font-mono text-[10px] text-neutral-400">{sentimentData.pagesScraped} pages scraped</span>
                            </>
                        )}
                    </div>
                )}

                {/* Executive Summary */}
                <div className="border border-black p-5">
                    <h2 className="font-mono text-xs uppercase tracking-widest mb-3">Executive Summary</h2>
                    <p className="font-mono text-sm text-neutral-600 leading-relaxed">
                        {report.summary ?? "No analysis available."}
                    </p>
                </div>

                {/* Score Breakdown */}
                {scorecardSnapshot && Object.keys(scorecardSnapshot).length > 0 && (
                    <div className="border border-black p-5">
                        <h3 className="font-mono text-xs uppercase tracking-widest mb-4">Score Breakdown</h3>
                        {Object.keys(scorecardSnapshot).length >= 3 && (
                            <ShareRadarChart snapshot={scorecardSnapshot} />
                        )}
                        <div className="space-y-4">
                            {Object.entries(scorecardSnapshot).map(([key, value]) => (
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
                )}

                {/* Pros / Cons */}
                {(pros?.length || cons?.length) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-black p-4">
                            <h4 className="font-mono text-xs uppercase tracking-widest mb-3">Pros</h4>
                            <ul className="space-y-1.5">
                                {pros?.map((pro, i) => (
                                    <li key={i} className="font-mono text-xs flex gap-2">
                                        <span className="text-neutral-400">+</span>{pro}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="border border-black p-4">
                            <h4 className="font-mono text-xs uppercase tracking-widest mb-3">Cons</h4>
                            <ul className="space-y-1.5">
                                {cons?.map((con, i) => (
                                    <li key={i} className="font-mono text-xs flex gap-2">
                                        <span className="text-neutral-400">&minus;</span>{con}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Pain Points — workspace-specific */}
                {activePainPoints.length > 0 && (
                    <div className="border border-black p-5">
                        <h3 className="font-mono text-xs uppercase tracking-widest mb-1">Pain Points Being Solved For</h3>
                        <p className="font-mono text-[10px] text-neutral-400 mb-4">
                            Active problems {workspace?.name ?? "this team"} is evaluating tools against
                        </p>
                        <div className="space-y-3">
                            {activePainPoints.map((pp) => (
                                <div key={pp.id} className="border border-neutral-200 p-3">
                                    <div className="flex items-start gap-2">
                                        <span className="font-mono text-xs font-medium">{pp.title}</span>
                                        {pp.category && (
                                            <span className="font-mono text-[10px] border border-neutral-300 px-1.5 py-0.5 text-neutral-400 flex-shrink-0">{pp.category}</span>
                                        )}
                                    </div>
                                    {pp.description && (
                                        <p className="font-mono text-[10px] text-neutral-500 mt-1 leading-relaxed">{pp.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Custom Scorecard Criteria */}
                {scorecardConfig && (scorecardConfig.evaluationCriteria || scorecardConfig.businessUnits?.length || scorecardConfig.dealBreakers) && (
                    <div className="border border-black p-5 space-y-4">
                        <div>
                            <h3 className="font-mono text-xs uppercase tracking-widest mb-1">Evaluation Criteria</h3>
                            <p className="font-mono text-[10px] text-neutral-400 mb-3">
                                How {workspace?.name ?? "this team"} evaluates AI tools
                            </p>
                        </div>

                        {scorecardConfig.systemContext && (
                            <div>
                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">Company Context</span>
                                <p className="font-mono text-xs text-neutral-600 leading-relaxed">{scorecardConfig.systemContext}</p>
                            </div>
                        )}

                        {scorecardConfig.businessUnits && scorecardConfig.businessUnits.length > 0 && (
                            <div>
                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-2">Business Units</span>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {scorecardConfig.businessUnits.map((unit) => (
                                        <div key={unit.key} className="border border-neutral-200 p-3">
                                            <div className="font-mono text-xs font-medium mb-0.5">{unit.name}</div>
                                            {unit.description && (
                                                <p className="font-mono text-[10px] text-neutral-500">{unit.description}</p>
                                            )}
                                            {unit.priorities && (
                                                <p className="font-mono text-[10px] text-neutral-400 mt-1 italic">{unit.priorities}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {scorecardConfig.evaluationCriteria && (
                            <div>
                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">Evaluation Criteria</span>
                                <p className="font-mono text-xs text-neutral-600 leading-relaxed whitespace-pre-line">{scorecardConfig.evaluationCriteria}</p>
                            </div>
                        )}

                        {scorecardConfig.dealBreakers && (
                            <div>
                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">Deal Breakers</span>
                                <p className="font-mono text-xs text-neutral-600 leading-relaxed whitespace-pre-line">{scorecardConfig.dealBreakers}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Features */}
                {featuresList.length > 0 && (
                    <div className="border border-black p-5">
                        <h3 className="font-mono text-xs uppercase tracking-widest mb-3">Features</h3>
                        <ul className="space-y-1.5">
                            {featuresList.map((feature, i) => (
                                <li key={i} className="font-mono text-xs flex gap-2">
                                    <span className="text-neutral-400">&rarr;</span>{feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Pricing */}
                {pricingTiers.length > 0 && (
                    <div className="border border-black p-5">
                        <h3 className="font-mono text-xs uppercase tracking-widest mb-3">Pricing</h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {pricingTiers.map((tier, i) => (
                                <div key={i} className="border border-black p-4">
                                    <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">{tier.tier}</div>
                                    <div className="font-serif text-2xl mt-1">{tier.price}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sentiment */}
                {sentimentData && (
                    <div className="border border-black p-5 space-y-5">
                        <h3 className="font-mono text-xs uppercase tracking-widest">Community Sentiment</h3>

                        {/* Multi-Source Consensus */}
                        {sentimentData.sentimentConsensus && (
                            <div className="border border-black p-4">
                                <h4 className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-3">Multi-Source Consensus</h4>
                                <div className="flex items-center gap-4 mb-3">
                                    <span className={`font-mono text-sm font-bold uppercase px-2 py-1 border ${sentimentColors[sentimentData.sentimentConsensus.overall] ?? "border-neutral-300 text-neutral-500"}`}>
                                        {sentimentLabels[sentimentData.sentimentConsensus.overall] ?? sentimentData.sentimentConsensus.overall}
                                    </span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Confidence</span>
                                            <span className="font-mono text-xs font-bold">{sentimentData.sentimentConsensus.confidence}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-neutral-100 border border-neutral-200">
                                            <div className="h-full bg-black" style={{ width: `${sentimentData.sentimentConsensus.confidence}%` }} />
                                        </div>
                                    </div>
                                </div>
                                <p className="font-mono text-xs text-neutral-600 leading-relaxed">{sentimentData.sentimentConsensus.sourceAgreement}</p>
                            </div>
                        )}

                        {/* Market Intelligence */}
                        {sentimentData.marketIntel && (
                            <div className="border border-black p-4">
                                <h4 className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-3">Market Intelligence</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                                    {sentimentData.marketIntel.founded && sentimentData.marketIntel.founded !== "Unknown" && (
                                        <div>
                                            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">Founded</span>
                                            <span className="font-mono text-xs">{sentimentData.marketIntel.founded}</span>
                                        </div>
                                    )}
                                    {sentimentData.marketIntel.headquarters && sentimentData.marketIntel.headquarters !== "Unknown" && (
                                        <div>
                                            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">HQ</span>
                                            <span className="font-mono text-xs">{sentimentData.marketIntel.headquarters}</span>
                                        </div>
                                    )}
                                    {sentimentData.marketIntel.employeeCount && sentimentData.marketIntel.employeeCount !== "Unknown" && (
                                        <div>
                                            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">Employees</span>
                                            <span className="font-mono text-xs">{sentimentData.marketIntel.employeeCount}</span>
                                        </div>
                                    )}
                                    {sentimentData.marketIntel.funding && sentimentData.marketIntel.funding !== "Unknown" && (
                                        <div>
                                            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">Funding</span>
                                            <span className="font-mono text-xs">{sentimentData.marketIntel.funding}</span>
                                        </div>
                                    )}
                                </div>
                                {sentimentData.marketIntel.recentNews && sentimentData.marketIntel.recentNews.length > 0 && (
                                    <div>
                                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">Recent News</span>
                                        <ul className="space-y-1">
                                            {sentimentData.marketIntel.recentNews.map((news, i) => (
                                                <li key={i} className="font-mono text-xs text-neutral-600 flex gap-2">
                                                    <span className="text-neutral-400">→</span>{news}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Review Sites */}
                        {sentimentData.reviewAnswer && (
                            <div>
                                <h4 className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Review Sites</h4>
                                <MarkdownText text={sentimentData.reviewAnswer} />
                            </div>
                        )}
                        {sentimentData.reviewSources && sentimentData.reviewSources.length > 0 && (
                            <div className="space-y-1">
                                {sentimentData.reviewSources.map((src, i) => (
                                    <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center justify-between p-2 border border-black hover:bg-neutral-100 transition-colors">
                                        <span className="font-mono text-xs truncate">{src.title}</span>
                                        <span className="font-mono text-[10px] text-neutral-400 flex-shrink-0 ml-2">
                                            {(() => { try { return new URL(src.url).hostname.replace("www.", ""); } catch { return ""; } })()}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        )}

                        {/* Trust & Reputation */}
                        {sentimentData.trustAnswer && (
                            <div>
                                <h4 className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Trust & Reputation</h4>
                                <MarkdownText text={sentimentData.trustAnswer} />
                            </div>
                        )}
                        {sentimentData.trustSources && sentimentData.trustSources.length > 0 && (
                            <div className="space-y-1">
                                {sentimentData.trustSources.map((src, i) => (
                                    <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center justify-between p-2 border border-black hover:bg-neutral-100 transition-colors">
                                        <span className="font-mono text-xs truncate">{src.title}</span>
                                        <span className="font-mono text-[10px] text-neutral-400 flex-shrink-0 ml-2">
                                            {(() => { try { return new URL(src.url).hostname.replace("www.", ""); } catch { return ""; } })()}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        )}

                        {/* Reddit / Community */}
                        {sentimentData.redditAnswer && (
                            <div>
                                <h4 className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Reddit / Community</h4>
                                <MarkdownText text={sentimentData.redditAnswer} />
                            </div>
                        )}
                        {sentimentData.redditThreads && sentimentData.redditThreads.length > 0 && (
                            <div>
                                <h4 className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
                                    Reddit Threads ({sentimentData.redditThreads.length})
                                </h4>
                                <div className="space-y-1">
                                    {sentimentData.redditThreads.map((thread, i) => (
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
                        {sentimentData.competitorAnalysis && (
                            <div>
                                <h4 className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-3">Competitive Context</h4>
                                <CompetitorAnalysisBlock text={sentimentData.competitorAnalysis} />
                            </div>
                        )}
                    </div>
                )}

                {/* Competitors */}
                {competitors.length > 0 && (
                    <div className="border border-black p-5">
                        <h3 className="font-mono text-xs uppercase tracking-widest mb-3">Competitors</h3>
                        <div className="flex flex-wrap gap-2">
                            {competitors.map((c, i) => (
                                <span key={i} className="font-mono text-xs border border-black px-2.5 py-1">{c}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Team Notes */}
                {toolNotes.length > 0 && (
                    <div className="border border-black p-5">
                        <h3 className="font-mono text-xs uppercase tracking-widest mb-1">Team Notes</h3>
                        <p className="font-mono text-[10px] text-neutral-400 mb-4">
                            Internal observations left by {workspace?.name ?? "the team"} during evaluation
                        </p>
                        <div className="space-y-3">
                            {toolNotes.map((note) => {
                                const noteTypeLabels: Record<string, string> = {
                                    general: "Note",
                                    test_result: "Test Result",
                                    pricing_update: "Pricing",
                                    decision: "Decision",
                                };
                                return (
                                    <div key={note.id} className="border border-neutral-200 p-3">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="font-mono text-[10px] uppercase tracking-widest border border-neutral-300 px-1.5 py-0.5 text-neutral-400">
                                                {noteTypeLabels[note.noteType] ?? note.noteType}
                                            </span>
                                            <span className="font-mono text-[10px] text-neutral-400">
                                                {new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </span>
                                        </div>
                                        <p className="font-mono text-xs text-neutral-700 leading-relaxed">{note.content}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Share with team */}
                <ShareActions toolName={tool.name} token={token} />

                {/* Footer CTA */}
                <div className="border border-black bg-black text-white p-8 text-center">
                    <p className="font-mono text-xs text-neutral-400 mb-2 uppercase tracking-widest">
                        Generated by Trackr&apos;s AI Research Engine
                    </p>
                    <h3 className="font-serif text-xl font-normal mb-4 text-white">
                        Research any tool in under 2 minutes.
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <a
                            href="https://trytrackr.com/sign-up"
                            className="inline-block bg-white text-black px-6 py-2.5 font-mono text-xs uppercase tracking-wide border border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.25)] transition-all"
                        >
                            Get Started Free
                        </a>
                        <a
                            href="https://trytrackr.com/pricing"
                            className="font-mono text-xs text-white/60 hover:text-white underline underline-offset-4"
                        >
                            View Pricing
                        </a>
                    </div>
                    <p className="font-mono text-[10px] text-white/30 mt-4">No credit card required</p>
                </div>
            </div>
        </div>
    );
}
