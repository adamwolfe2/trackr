import { db } from "@/lib/db";
import { tools, reports } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, ArrowLeft } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";

type ScorecardEntry = { score: number; justification: string };
type PricingTier = { tier: string; price: string };

const SCORECARD_LABELS: Record<string, string> = {
    features: "Features",
    pricing_value: "Pricing Value",
    ease_of_use: "Ease of Use",
    integration_depth: "Integrations",
    support_quality: "Support",
    security: "Security",
    ai_capabilities: "AI Capabilities",
};

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const tool = await db.query.tools.findFirst({
        where: eq(tools.publicSlug, slug),
        columns: { name: true, websiteUrl: true },
    });
    if (!tool) return { title: "Not Found — Trackr" };

    const domain = tool.websiteUrl
        ? (() => { try { return new URL(tool.websiteUrl).hostname.replace("www.", ""); } catch { return ""; } })()
        : "";

    const desc = `AI-powered research report for ${tool.name}. Scores, pros, cons, pricing, and competitive analysis.`;
    return {
        title: `${tool.name} Research Report — Trackr`,
        description: desc,
        openGraph: {
            title: `${tool.name} — Trackr Research Report`,
            description: desc,
            type: "article",
            url: `https://trytrackr.com/research/${slug}`,
            images: [{ url: "/og.png", width: 1456, height: 816, alt: `${tool.name} Research Report` }],
        },
        twitter: {
            card: "summary_large_image",
            title: `${tool.name} — Research Report`,
            description: desc,
            images: ["/og.png"],
        },
        alternates: { canonical: `https://trytrackr.com/research/${slug}` },
    };
}

export default async function PublicResearchPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const user = await currentUser();

    const tool = await db.query.tools.findFirst({
        where: eq(tools.publicSlug, slug),
    });
    if (!tool) notFound();

    const report = await db.query.reports.findFirst({
        where: and(eq(reports.toolId, tool.id), eq(reports.isPublic, true)),
        orderBy: [desc(reports.createdAt)],
    });
    if (!report) notFound();

    const scorecard = report.scorecardSnapshot as Record<string, ScorecardEntry> | null;
    const pros = report.pros as string[] | null;
    const cons = report.cons as string[] | null;
    const featuresList =
        report.features && typeof report.features === "object" && "list" in report.features
            ? ((report.features as { list: string[] }).list as string[])
            : [];
    const pricingTiers = (report.pricing as PricingTier[]) ?? [];
    const competitors = (report.competitors as string[]) ?? [];
    const integrations = (report.integrations as string[]) ?? [];
    const sentimentData = report.sentimentData as {
        sentimentConsensus?: {
            overall: string;
            confidence: number;
            sourceAgreement: string;
        };
        dataSources?: number;
    } | null;
    const marketIntel = (report.sentimentData as { marketIntel?: Record<string, string | string[]> } | null)?.marketIntel;

    const overallScore = Number(tool.overallScore || 0);
    const toolHostname = tool.websiteUrl
        ? (() => { try { return new URL(tool.websiteUrl).hostname.replace("www.", ""); } catch { return tool.websiteUrl; } })()
        : null;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Review",
        name: `${tool.name} Research Report`,
        description: report.summary ?? undefined,
        reviewRating: {
            "@type": "Rating",
            ratingValue: overallScore.toFixed(1),
            bestRating: "10",
            worstRating: "0",
        },
        author: { "@type": "Organization", name: "Trackr" },
        itemReviewed: {
            "@type": "SoftwareApplication",
            name: tool.name,
            url: tool.websiteUrl ?? undefined,
        },
        datePublished: report.createdAt.toISOString(),
    };

    const sentimentColors: Record<string, string> = {
        very_positive: "bg-black text-white",
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

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
                <MarketingNavigation isLoggedIn={!!user} />

                <section className="py-16 border-t border-black/10">
                    <Link
                        href="/research"
                        className="inline-flex items-center gap-2 font-mono text-xs text-neutral-400 hover:text-black transition-colors mb-10"
                    >
                        <ArrowLeft className="w-3 h-3" /> Research Library
                    </Link>

                    {/* Header */}
                    <div className="flex items-start justify-between gap-6 mb-10 flex-wrap">
                        <div className="flex items-center gap-4">
                            {(tool.logoUrl || toolHostname) && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={tool.logoUrl ?? `https://www.google.com/s2/favicons?domain=${toolHostname}&sz=64`}
                                    alt={tool.name}
                                    className="w-12 h-12 object-contain"
                                />
                            )}
                            <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="font-serif text-4xl md:text-5xl font-normal">{tool.name}</h1>
                                    {sentimentData?.sentimentConsensus && (
                                        <span className={`font-mono text-xs border px-2 py-0.5 uppercase tracking-widest ${sentimentColors[sentimentData.sentimentConsensus.overall] ?? "border-neutral-300 text-neutral-500"}`}>
                                            {sentimentLabels[sentimentData.sentimentConsensus.overall] ?? sentimentData.sentimentConsensus.overall}
                                        </span>
                                    )}
                                </div>
                                {toolHostname && (
                                    <a
                                        href={tool.websiteUrl!}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-mono text-sm text-neutral-400 hover:text-black flex items-center gap-1 mt-1"
                                    >
                                        {toolHostname} <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                                {tool.category && tool.category.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {tool.category.slice(0, 3).map((c) => (
                                            <span key={c} className="font-mono text-[10px] uppercase tracking-widest border border-neutral-300 px-2 py-0.5 text-neutral-500">
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="text-center border border-black p-4 flex-shrink-0">
                            <div className="font-mono text-5xl font-bold">{overallScore.toFixed(1)}</div>
                            <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mt-1">Overall Score</div>
                            {sentimentData?.dataSources && (
                                <div className="font-mono text-[10px] text-neutral-400 mt-1">{sentimentData.dataSources} sources</div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: main content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Summary */}
                            {report.summary && (
                                <div className="border border-black p-5">
                                    <h2 className="font-mono text-xs uppercase tracking-widest mb-3">Summary</h2>
                                    <p className="font-mono text-sm text-neutral-600 leading-relaxed">{report.summary}</p>
                                </div>
                            )}

                            {/* Scorecard */}
                            {scorecard && Object.keys(scorecard).length > 0 && (
                                <div className="border border-black p-5">
                                    <h2 className="font-mono text-xs uppercase tracking-widest mb-5">Scorecard</h2>
                                    <div className="space-y-4">
                                        {Object.entries(scorecard).map(([key, val]) => (
                                            <div key={key}>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="font-mono text-xs text-neutral-600">{SCORECARD_LABELS[key] ?? key.replace(/_/g, " ")}</span>
                                                    <span className="font-mono text-xs font-bold">{val.score.toFixed(1)}</span>
                                                </div>
                                                <div className="h-1.5 bg-neutral-100 border border-neutral-200">
                                                    <div
                                                        className="h-full bg-black transition-all"
                                                        style={{ width: `${(val.score / 10) * 100}%` }}
                                                    />
                                                </div>
                                                <p className="font-mono text-[10px] text-neutral-400 mt-1 leading-relaxed">{val.justification}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pros / Cons */}
                            {(pros?.length || cons?.length) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-px border border-black bg-black">
                                    <div className="bg-white p-5">
                                        <h2 className="font-mono text-xs uppercase tracking-widest mb-4 text-black">Pros</h2>
                                        <ul className="space-y-2">
                                            {(pros ?? []).map((p, i) => (
                                                <li key={i} className="font-mono text-xs text-neutral-600 flex gap-2">
                                                    <span className="text-black flex-shrink-0">+</span> {p}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-white p-5">
                                        <h2 className="font-mono text-xs uppercase tracking-widest mb-4 text-black">Cons</h2>
                                        <ul className="space-y-2">
                                            {(cons ?? []).map((c, i) => (
                                                <li key={i} className="font-mono text-xs text-neutral-600 flex gap-2">
                                                    <span className="text-neutral-400 flex-shrink-0">−</span> {c}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Features */}
                            {featuresList.length > 0 && (
                                <div className="border border-black p-5">
                                    <h2 className="font-mono text-xs uppercase tracking-widest mb-4">Features</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                                        {featuresList.map((f, i) => (
                                            <div key={i} className="font-mono text-xs text-neutral-600 flex gap-2">
                                                <span className="text-black flex-shrink-0">·</span> {f}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: sidebar */}
                        <div className="space-y-5">
                            {/* Pricing */}
                            {pricingTiers.length > 0 && (
                                <div className="border border-black p-5">
                                    <h2 className="font-mono text-xs uppercase tracking-widest mb-4">Pricing</h2>
                                    {report.isPricingHidden && (
                                        <p className="font-mono text-xs text-neutral-500 mb-3">Contact sales for pricing.</p>
                                    )}
                                    <div className="space-y-2">
                                        {pricingTiers.map((t, i) => (
                                            <div key={i} className="flex items-center justify-between border-b border-neutral-100 pb-2 last:border-0 last:pb-0">
                                                <span className="font-mono text-xs text-neutral-600">{t.tier}</span>
                                                <span className="font-mono text-xs font-bold">{t.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Competitors */}
                            {competitors.length > 0 && (
                                <div className="border border-black p-5">
                                    <h2 className="font-mono text-xs uppercase tracking-widest mb-4">Alternatives</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {competitors.map((c) => (
                                            <span key={c} className="flex items-center gap-1.5 font-mono text-xs border border-neutral-300 px-2 py-1 text-neutral-600">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={`https://www.google.com/s2/favicons?domain=${c}&sz=16`}
                                                    alt={c}
                                                    className="w-3 h-3"
                                                />
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Integrations */}
                            {integrations.length > 0 && (
                                <div className="border border-black p-5">
                                    <h2 className="font-mono text-xs uppercase tracking-widest mb-4">Integrations</h2>
                                    <div className="flex flex-wrap gap-1.5">
                                        {integrations.slice(0, 12).map((i) => (
                                            <span key={i} className="font-mono text-[10px] border border-neutral-200 px-2 py-0.5 text-neutral-500">
                                                {i}
                                            </span>
                                        ))}
                                        {integrations.length > 12 && (
                                            <span className="font-mono text-[10px] text-neutral-400">
                                                +{integrations.length - 12} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Market intel */}
                            {marketIntel && (
                                <div className="border border-black p-5">
                                    <h2 className="font-mono text-xs uppercase tracking-widest mb-4">Company Info</h2>
                                    <div className="space-y-2">
                                        {marketIntel.founded && (
                                            <div className="flex justify-between">
                                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Founded</span>
                                                <span className="font-mono text-xs">{marketIntel.founded as string}</span>
                                            </div>
                                        )}
                                        {marketIntel.headquarters && (
                                            <div className="flex justify-between">
                                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">HQ</span>
                                                <span className="font-mono text-xs text-right max-w-[60%]">{marketIntel.headquarters as string}</span>
                                            </div>
                                        )}
                                        {marketIntel.employeeCount && (
                                            <div className="flex justify-between">
                                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Team Size</span>
                                                <span className="font-mono text-xs">{marketIntel.employeeCount as string}</span>
                                            </div>
                                        )}
                                        {marketIntel.funding && (
                                            <div className="flex justify-between">
                                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Funding</span>
                                                <span className="font-mono text-xs text-right max-w-[60%]">{marketIntel.funding as string}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* CTA */}
                            <div className="border border-black bg-black text-white p-5">
                                <p className="font-mono text-xs uppercase tracking-wider text-neutral-400 mb-2">Research your tools</p>
                                <p className="font-serif text-base font-normal mb-4 text-white leading-snug">
                                    Get a report like this for any tool in under 2 minutes.
                                </p>
                                <Link
                                    href="/sign-up"
                                    className="block text-center bg-white text-black px-4 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-neutral-100 transition-colors border border-white"
                                >
                                    Get Started Free →
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <MarketingFooter />
            </main>
        </>
    );
}
