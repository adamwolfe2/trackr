import { db } from "@/lib/db";
import { tools, reports } from "@/lib/db/schema";
import { eq, and, desc, isNotNull, ne, arrayOverlaps } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, ArrowLeft, Star } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import type { Metadata } from "next";

// Cache public tool pages for 5 minutes — fresh enough for community votes
export const revalidate = 300;
import { CURATED_TOOLS } from "@/data/tools.seed";
import { SCORECARD_DIMENSION_LABELS } from "@/lib/types";
import type { CuratedTool } from "@/lib/types";

type ScorecardEntry = { score: number; justification: string };
type PricingTier = { tier: string; price: string };

const DB_SCORECARD_LABELS: Record<string, string> = {
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

    // Check curated library first
    const curated = CURATED_TOOLS.find((t) => t.slug === slug);
    if (curated) {
        const desc = `AI scorecard for ${curated.name}. Score: ${curated.overallScore.toFixed(1)}/10. ${curated.tagline}`;
        return {
            title: `${curated.name} Scorecard — Trackr AI Tool Library`,
            description: desc,
            openGraph: {
                title: `${curated.name} — AI Scorecard`,
                description: desc,
                type: "article",
                url: `https://trytrackr.com/research/${slug}`,
                images: [{ url: `/api/og?name=${encodeURIComponent(curated.name)}&score=${curated.overallScore.toFixed(1)}&category=${encodeURIComponent(curated.category)}`, width: 1200, height: 630, alt: `${curated.name} Scorecard` }],
            },
            twitter: { card: "summary_large_image", title: `${curated.name} — Scorecard`, description: desc, images: [`/api/og?name=${encodeURIComponent(curated.name)}&score=${curated.overallScore.toFixed(1)}&category=${encodeURIComponent(curated.category)}`] },
            alternates: { canonical: `https://trytrackr.com/research/${slug}` },
        };
    }

    // DB-based tool
    const tool = await db.query.tools.findFirst({
        where: eq(tools.publicSlug, slug),
        columns: { name: true, websiteUrl: true },
    });
    if (!tool) return { title: "Not Found — Trackr" };

    const desc = `AI-powered research report for ${tool.name}. Scores, pros, cons, pricing, and competitive analysis.`;
    return {
        title: `${tool.name} Research Report — Trackr`,
        description: desc,
        openGraph: {
            title: `${tool.name} — Trackr Research Report`,
            description: desc,
            type: "article",
            url: `https://trytrackr.com/research/${slug}`,
            images: [{ url: `/api/og?name=${encodeURIComponent(tool.name)}`, width: 1200, height: 630, alt: `${tool.name} Research Report` }],
        },
        twitter: {
            card: "summary_large_image",
            title: `${tool.name} — Research Report`,
            description: desc,
            images: [`/api/og?name=${encodeURIComponent(tool.name)}`],
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

    // ── CURATED TOOL ────────────────────────────────────────────────────
    const curated = CURATED_TOOLS.find((t) => t.slug === slug);
    if (curated) {
        return <CuratedToolPage tool={curated} />;
    }

    // ── DB TOOL ─────────────────────────────────────────────────────────
    const tool = await db.query.tools.findFirst({
        where: eq(tools.publicSlug, slug),
    });
    if (!tool) notFound();

    const report = await db.query.reports.findFirst({
        where: and(eq(reports.toolId, tool.id), eq(reports.isPublic, true)),
        orderBy: [desc(reports.createdAt)],
    });
    if (!report) notFound();

    // Fetch related tools: same category OR listed as competitor, exclude current tool
    const relatedTools = tool.category && tool.category.length > 0
        ? await db
            .select({
                id: tools.id,
                name: tools.name,
                websiteUrl: tools.websiteUrl,
                logoUrl: tools.logoUrl,
                overallScore: tools.overallScore,
                publicSlug: tools.publicSlug,
                category: tools.category,
                summary: reports.summary,
            })
            .from(tools)
            .innerJoin(reports, and(eq(reports.toolId, tools.id), eq(reports.isPublic, true)))
            .where(and(
                isNotNull(tools.publicSlug),
                ne(tools.id, tool.id),
                arrayOverlaps(tools.category, tool.category),
            ))
            .orderBy(desc(tools.overallScore))
            .limit(4)
        : [];

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
        "@graph": [
            {
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
                    applicationCategory: tool.category?.[0] ?? "BusinessApplication",
                },
                datePublished: report.createdAt.toISOString(),
            },
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Home", item: "https://trytrackr.com" },
                    { "@type": "ListItem", position: 2, name: "AI Tool Library", item: "https://trytrackr.com/research" },
                    { "@type": "ListItem", position: 3, name: `${tool.name} Research Report`, item: `https://trytrackr.com/research/${slug}` },
                ],
            },
        ],
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
                <MarketingNavigation />

                <section className="py-16 border-t border-black/10">
                    <Link
                        href="/research"
                        className="inline-flex items-center gap-2 font-mono text-xs text-neutral-400 hover:text-black transition-colors mb-10"
                    >
                        <ArrowLeft className="w-3 h-3" /> AI Tool Library
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
                        <div className="lg:col-span-2 space-y-6">
                            {report.summary && (
                                <div className="border border-black p-5">
                                    <h2 className="font-mono text-xs uppercase tracking-widest mb-3">Summary</h2>
                                    <p className="font-mono text-sm text-neutral-600 leading-relaxed">{report.summary}</p>
                                </div>
                            )}

                            {scorecard && Object.keys(scorecard).length > 0 && (
                                <div className="border border-black p-5">
                                    <h2 className="font-mono text-xs uppercase tracking-widest mb-5">Scorecard</h2>
                                    <div className="space-y-4">
                                        {Object.entries(scorecard).map(([key, val]) => (
                                            <div key={key}>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="font-mono text-xs text-neutral-600">{DB_SCORECARD_LABELS[key] ?? key.replace(/_/g, " ")}</span>
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

                        <div className="space-y-5">
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

                            {competitors.length > 0 && (
                                <div className="border border-black p-5">
                                    <h2 className="font-mono text-xs uppercase tracking-widest mb-4">Alternatives</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {competitors.map((c) => (
                                            <span key={c} className="flex items-center gap-1.5 font-mono text-xs border border-neutral-300 px-2 py-1 text-neutral-600">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={`https://www.google.com/s2/favicons?domain=${c}&sz=16`} alt={c} className="w-3 h-3" loading="lazy" />
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {integrations.length > 0 && (
                                <div className="border border-black p-5">
                                    <h2 className="font-mono text-xs uppercase tracking-widest mb-4">Integrations</h2>
                                    <div className="flex flex-wrap gap-1.5">
                                        {integrations.slice(0, 12).map((i) => (
                                            <span key={i} className="font-mono text-[10px] border border-neutral-200 px-2 py-0.5 text-neutral-500">{i}</span>
                                        ))}
                                        {integrations.length > 12 && (
                                            <span className="font-mono text-[10px] text-neutral-400">+{integrations.length - 12} more</span>
                                        )}
                                    </div>
                                </div>
                            )}

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

                {relatedTools.length > 0 && (
                    <section className="mt-12 pt-8 border-t border-black/10">
                        <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-6">Similar Tools</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px border border-black bg-black">
                            {relatedTools.map((t) => {
                                const domain = t.websiteUrl
                                    ? (() => { try { return new URL(t.websiteUrl).hostname.replace("www.", ""); } catch { return null; } })()
                                    : null;
                                return (
                                    <Link
                                        key={t.id}
                                        href={`/research/${t.publicSlug}`}
                                        className="group bg-white hover:bg-[#F3F3EF] transition-colors p-5 flex flex-col gap-2"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                {(t.logoUrl || domain) && (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={t.logoUrl ?? `https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                                                        alt={t.name}
                                                        className="w-6 h-6 object-contain flex-shrink-0"
                                                    />
                                                )}
                                                <span className="font-serif text-base group-hover:underline underline-offset-2 truncate">{t.name}</span>
                                            </div>
                                            {t.overallScore && (
                                                <div className="flex items-center gap-0.5 flex-shrink-0">
                                                    <Star className="w-2.5 h-2.5 fill-black" />
                                                    <span className="font-mono text-xs font-bold">{Number(t.overallScore).toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>
                                        {t.summary && (
                                            <p className="font-mono text-[10px] text-neutral-500 line-clamp-2 leading-relaxed">{t.summary}</p>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                <MarketingFooter />
            </main>
        </>
    );
}

// ── CURATED TOOL DETAIL PAGE ──────────────────────────────────────────────
function CuratedToolPage({ tool }: { tool: CuratedTool }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Review",
                name: `${tool.name} AI Scorecard`,
                description: tool.description,
                reviewRating: {
                    "@type": "Rating",
                    ratingValue: tool.overallScore.toFixed(1),
                    bestRating: "10",
                    worstRating: "0",
                },
                author: { "@type": "Organization", name: "Trackr" },
                itemReviewed: {
                    "@type": "SoftwareApplication",
                    name: tool.name,
                    url: `https://${tool.domain}`,
                    applicationCategory: tool.category,
                },
            },
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Home", item: "https://trytrackr.com" },
                    { "@type": "ListItem", position: 2, name: "AI Tool Library", item: "https://trytrackr.com/research" },
                    { "@type": "ListItem", position: 3, name: tool.name, item: `https://trytrackr.com/research/${tool.slug}` },
                ],
            },
        ],
    };

    // Related curated tools in same category
    const relatedCurated = CURATED_TOOLS
        .filter((t) => t.id !== tool.id && (t.category === tool.category || t.competitors.includes(tool.domain)))
        .slice(0, 4);

    const TIER_LABELS: Record<string, string> = {
        essential: "Essential",
        power: "Power Tool",
        enterprise: "Enterprise",
        emerging: "Emerging",
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
                <MarketingNavigation />

                <section className="py-16 border-t border-black/10">
                    <Link
                        href="/research"
                        className="inline-flex items-center gap-2 font-mono text-xs text-neutral-400 hover:text-black transition-colors mb-10"
                    >
                        <ArrowLeft className="w-3 h-3" /> AI Tool Library
                    </Link>

                    {/* Header */}
                    <div className="flex items-start justify-between gap-6 mb-10 flex-wrap">
                        <div className="flex items-center gap-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={`https://www.google.com/s2/favicons?domain=${tool.domain}&sz=64`}
                                alt={tool.name}
                                className="w-12 h-12 object-contain"
                            />
                            <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="font-serif text-4xl md:text-5xl font-normal">{tool.name}</h1>
                                    <span className="font-mono text-xs border border-black px-2 py-0.5 uppercase tracking-widest">
                                        {TIER_LABELS[tool.tier]}
                                    </span>
                                </div>
                                <a
                                    href={`https://${tool.domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-sm text-neutral-400 hover:text-black flex items-center gap-1 mt-1"
                                >
                                    {tool.domain} <ExternalLink className="w-3 h-3" />
                                </a>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="font-mono text-[10px] uppercase tracking-widest border border-neutral-300 px-2 py-0.5 text-neutral-500">
                                        {tool.category}
                                    </span>
                                    <span className="font-mono text-[10px] uppercase tracking-widest border border-neutral-300 px-2 py-0.5 text-neutral-500 capitalize">
                                        {tool.type}
                                    </span>
                                    {tool.signals.slice(0, 3).map((sig) => (
                                        <span key={sig} className="font-mono text-[10px] border border-neutral-300 px-2 py-0.5 text-neutral-500">
                                            {sig}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="text-center border border-black p-4 flex-shrink-0">
                            <div className="font-mono text-5xl font-bold">{tool.overallScore.toFixed(1)}</div>
                            <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mt-1">Overall Score</div>
                            <div className="font-mono text-[10px] text-neutral-400 mt-1">7 dimensions</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: main content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Description */}
                            <div className="border border-black p-5">
                                <h2 className="font-mono text-xs uppercase tracking-widest mb-3">Overview</h2>
                                <p className="font-mono text-sm text-neutral-600 leading-relaxed">{tool.description}</p>
                            </div>

                            {/* Scorecard */}
                            <div className="border border-black p-5">
                                <h2 className="font-mono text-xs uppercase tracking-widest mb-5">Scorecard</h2>
                                <div className="space-y-4">
                                    {(Object.entries(tool.scorecard) as [keyof typeof tool.scorecard, { score: number; justification: string }][]).map(([key, val]) => (
                                        <div key={key}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="font-mono text-xs text-neutral-600">
                                                    {SCORECARD_DIMENSION_LABELS[key] ?? key}
                                                </span>
                                                <span className="font-mono text-xs font-bold">{val.score.toFixed(1)}</span>
                                            </div>
                                            <div className="h-1.5 bg-neutral-100 border border-neutral-200">
                                                <div
                                                    className="h-full bg-black"
                                                    style={{ width: `${(val.score / 10) * 100}%` }}
                                                />
                                            </div>
                                            <p className="font-mono text-[10px] text-neutral-400 mt-1 leading-relaxed">{val.justification}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pros / Cons */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px border border-black bg-black">
                                <div className="bg-white p-5">
                                    <h2 className="font-mono text-xs uppercase tracking-widest mb-4">Pros</h2>
                                    <ul className="space-y-2">
                                        {tool.pros.map((p, i) => (
                                            <li key={i} className="font-mono text-xs text-neutral-600 flex gap-2">
                                                <span className="text-black flex-shrink-0">+</span> {p}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-white p-5">
                                    <h2 className="font-mono text-xs uppercase tracking-widest mb-4">Cons</h2>
                                    <ul className="space-y-2">
                                        {tool.cons.map((c, i) => (
                                            <li key={i} className="font-mono text-xs text-neutral-600 flex gap-2">
                                                <span className="text-neutral-400 flex-shrink-0">−</span> {c}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Best For */}
                            {tool.bestFor.length > 0 && (
                                <div className="border border-black p-5">
                                    <h2 className="font-mono text-xs uppercase tracking-widest mb-4">Best For</h2>
                                    <div className="space-y-1.5">
                                        {tool.bestFor.map((item, i) => (
                                            <div key={i} className="font-mono text-xs text-neutral-600 flex gap-2">
                                                <span className="text-black flex-shrink-0">·</span> {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: sidebar */}
                        <div className="space-y-5">
                            {/* Pricing */}
                            {tool.pricing.length > 0 && (
                                <div className="border border-black p-5">
                                    <h2 className="font-mono text-xs uppercase tracking-widest mb-4">Pricing</h2>
                                    <div className="space-y-2">
                                        {tool.pricing.map((p, i) => (
                                            <div key={i} className="flex items-center justify-between border-b border-neutral-100 pb-2 last:border-0 last:pb-0">
                                                <span className="font-mono text-xs text-neutral-600">{p.tier}</span>
                                                <span className="font-mono text-xs font-bold">{p.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Integrations */}
                            {tool.integrations.length > 0 && (
                                <div className="border border-black p-5">
                                    <h2 className="font-mono text-xs uppercase tracking-widest mb-4">Key Integrations</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {tool.integrations.map((domain) => (
                                            <span key={domain} className="flex items-center gap-1.5 font-mono text-[10px] border border-neutral-200 px-2 py-1 text-neutral-600">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`} alt={domain} className="w-3 h-3" loading="lazy" />
                                                {domain.replace("www.", "")}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Alternatives */}
                            {tool.competitors.length > 0 && (
                                <div className="border border-black p-5">
                                    <h2 className="font-mono text-xs uppercase tracking-widest mb-4">Alternatives</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {tool.competitors.map((domain) => {
                                            const related = CURATED_TOOLS.find((t) => t.domain === domain);
                                            return related ? (
                                                <Link
                                                    key={domain}
                                                    href={`/research/${related.slug}`}
                                                    className="flex items-center gap-1.5 font-mono text-xs border border-neutral-300 px-2 py-1 text-neutral-600 hover:border-black hover:text-black transition-colors"
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`} alt={domain} className="w-3 h-3" loading="lazy" />
                                                    {related.name}
                                                </Link>
                                            ) : (
                                                <span key={domain} className="flex items-center gap-1.5 font-mono text-xs border border-neutral-300 px-2 py-1 text-neutral-600">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`} alt={domain} className="w-3 h-3" loading="lazy" />
                                                    {domain}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Company Info */}
                            {(tool.founded || tool.funding || tool.employees || tool.hq) && (
                                <div className="border border-black p-5">
                                    <h2 className="font-mono text-xs uppercase tracking-widest mb-4">Company Info</h2>
                                    <div className="space-y-2">
                                        {tool.founded && (
                                            <div className="flex justify-between">
                                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Founded</span>
                                                <span className="font-mono text-xs">{tool.founded}</span>
                                            </div>
                                        )}
                                        {tool.hq && (
                                            <div className="flex justify-between">
                                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">HQ</span>
                                                <span className="font-mono text-xs text-right max-w-[60%]">{tool.hq}</span>
                                            </div>
                                        )}
                                        {tool.employees && (
                                            <div className="flex justify-between">
                                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Team Size</span>
                                                <span className="font-mono text-xs">{tool.employees}</span>
                                            </div>
                                        )}
                                        {tool.funding && (
                                            <div className="flex justify-between">
                                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Funding</span>
                                                <span className="font-mono text-xs text-right max-w-[60%]">{tool.funding}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* CTA */}
                            <div className="border border-black bg-black text-white p-5">
                                <p className="font-mono text-xs uppercase tracking-wider text-neutral-400 mb-2">Research your tools</p>
                                <p className="font-serif text-base font-normal mb-4 text-white leading-snug">
                                    Get a custom report on {tool.name} for your specific use case.
                                </p>
                                <Link
                                    href={`/sign-up`}
                                    className="block text-center bg-white text-black px-4 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-neutral-100 transition-colors border border-white"
                                >
                                    Get Started Free →
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Related curated tools */}
                {relatedCurated.length > 0 && (
                    <section className="mt-12 pt-8 border-t border-black/10">
                        <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-6">Similar Tools</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px border border-black bg-black">
                            {relatedCurated.map((t) => (
                                <Link
                                    key={t.id}
                                    href={`/research/${t.slug}`}
                                    className="group bg-white hover:bg-[#F3F3EF] transition-colors p-5 flex flex-col gap-2"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={`https://www.google.com/s2/favicons?domain=${t.domain}&sz=32`}
                                                alt={t.name}
                                                className="w-6 h-6 object-contain flex-shrink-0"
                                            />
                                            <span className="font-serif text-base group-hover:underline underline-offset-2 truncate">{t.name}</span>
                                        </div>
                                        <div className="flex items-center gap-0.5 flex-shrink-0">
                                            <Star className="w-2.5 h-2.5 fill-black" />
                                            <span className="font-mono text-xs font-bold">{t.overallScore.toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <p className="font-mono text-[10px] text-neutral-500 line-clamp-2 leading-relaxed">{t.tagline}</p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <MarketingFooter />
            </main>
        </>
    );
}
