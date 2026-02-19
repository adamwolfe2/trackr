import { db } from "@/lib/db";
import { reports, tools } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { TrackrLogo } from "@/components/common/trackr-logo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type ScorecardEntry = { score: number; justification: string };
type ReviewSource = { title: string; url: string; score: number };

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

    return {
        title: `${tool?.name ?? "Tool"} Research Report — Trackr`,
        description: report.summary?.slice(0, 160) ?? "AI-powered software research report by Trackr.",
        openGraph: {
            title: `${tool?.name ?? "Tool"} — Research Report`,
            description: report.summary?.slice(0, 160) ?? "AI-powered software research report by Trackr.",
            type: "article",
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
    } | null;
    const competitors = (report.competitors as string[]) ?? [];

    const toolHostname = (() => {
        if (!tool.websiteUrl) return null;
        try { return new URL(tool.websiteUrl).hostname; } catch { return tool.websiteUrl; }
    })();

    const avgScore = scorecardSnapshot
        ? Object.values(scorecardSnapshot).reduce((s, v) => s + v.score, 0) / Object.keys(scorecardSnapshot).length
        : 0;

    return (
        <div className="min-h-screen bg-[#F3F3EF]">
            {/* Header */}
            <div className="border-b border-black bg-[#F3F3EF] px-6 py-4 flex items-center justify-between">
                <a href="https://trytrackr.com" className="flex items-center gap-2 font-serif text-xl font-medium hover:opacity-70">
                    <span className="w-7 h-7 bg-black flex items-center justify-center flex-shrink-0">
                        <TrackrLogo size={18} inverted />
                    </span>
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
                        <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
                            {toolHostname && (
                                <a href={tool.websiteUrl!} target="_blank" rel="noopener noreferrer" className="hover:text-black flex items-center gap-1">
                                    {toolHostname} <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                            )}
                            {tool.category?.length ? (
                                <>
                                    <span>·</span>
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
                {sentimentData && (sentimentData.reviewAnswer || sentimentData.redditAnswer) && (
                    <div className="border border-black p-5 space-y-4">
                        <h3 className="font-mono text-xs uppercase tracking-widest">Community Sentiment</h3>
                        {sentimentData.reviewAnswer && (
                            <div>
                                <h4 className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Review Sites</h4>
                                <p className="font-mono text-xs text-neutral-600 leading-relaxed">{sentimentData.reviewAnswer}</p>
                            </div>
                        )}
                        {sentimentData.reviewSources && sentimentData.reviewSources.length > 0 && (
                            <div className="space-y-1">
                                {sentimentData.reviewSources.map((src, i) => (
                                    <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center justify-between p-2 border border-black hover:bg-neutral-50 transition-colors">
                                        <span className="font-mono text-xs truncate">{src.title}</span>
                                        <span className="font-mono text-[10px] text-neutral-400 flex-shrink-0 ml-2">
                                            {(() => { try { return new URL(src.url).hostname.replace("www.", ""); } catch { return ""; } })()}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        )}
                        {sentimentData.redditAnswer && (
                            <div>
                                <h4 className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Reddit / Community</h4>
                                <p className="font-mono text-xs text-neutral-600 leading-relaxed">{sentimentData.redditAnswer}</p>
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

                {/* Footer CTA */}
                <div className="border border-black p-5 text-center">
                    <p className="font-mono text-xs text-neutral-500 mb-2">This report was generated by Trackr&apos;s AI research engine.</p>
                    <a
                        href="https://trytrackr.com"
                        className="inline-block bg-black text-white px-6 py-2.5 font-mono text-xs uppercase tracking-wide border border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                        Try Trackr Free
                    </a>
                </div>
            </div>
        </div>
    );
}
