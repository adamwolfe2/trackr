import { db } from "@/lib/db";
import { tools, reports, communityVotes } from "@/lib/db/schema";
import { eq, desc, and, isNotNull, arrayContains, sql } from "drizzle-orm";
import Link from "next/link";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import type { Metadata } from "next";
import { Star } from "lucide-react";
import { CURATED_TOOLS, PRIMARY_CATEGORIES, HOT_TOOL_SLUGS } from "@/data/tools.seed";
import { TEMPLATES } from "@/data/templates.seed";
import { CuratedLibrary } from "@/components/research/curated-library";

export const metadata: Metadata = {
    title: "AI Tool Library — Trackr",
    description: "Browse scorecards for 150+ AI tools. Research reports, templates, and competitive intelligence for teams evaluating SaaS.",
    keywords: ["AI tool library", "SaaS tool database", "AI tool reviews", "AI tool scorecards", "software evaluation library", "best AI tools 2026", "AI tool comparison", "SaaS intelligence database"],
    openGraph: {
        title: "AI Tool Library — Trackr",
        description: "Scorecards for 150+ AI tools — features, pricing, pros, cons, and competitive analysis.",
        images: [{ url: "/og.png", width: 1456, height: 816, alt: "Trackr AI Tool Library" }],
    },
    alternates: {
        canonical: "https://trytrackr.com/research",
    },
};

// Revalidate every 60s — community votes + public tools update infrequently
export const revalidate = 60;

type ScorecardEntry = { score: number; justification: string };

export default async function ResearchLibraryPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string }>;
}) {
    const { category } = await searchParams;
    const activeCategory = category?.trim() || null;

    // Fetch dynamic stats
    const [totalPublicReportsData] = await db
        .select({ count: sql<string>`count(*)` })
        .from(reports)
        .where(eq(reports.isPublic, true));
    const totalPublicReports = Number(totalPublicReportsData?.count ?? 0);

    // Trending community votes (top 6 by net votes)
    const trendingVotes = await db.query.communityVotes.findMany({
        orderBy: [desc(communityVotes.upVotes)],
        limit: 6,
    });
    const trendingVoteSlugs = trendingVotes.filter(v => v.upVotes > 0).map(v => v.toolSlug);

    // Fetch publicly published user-generated tools + their latest public report
    const publicTools = await db
        .select({
            id: tools.id,
            name: tools.name,
            websiteUrl: tools.websiteUrl,
            logoUrl: tools.logoUrl,
            overallScore: tools.overallScore,
            publicSlug: tools.publicSlug,
            category: tools.category,
            reportId: reports.id,
            summary: reports.summary,
            pros: reports.pros,
            cons: reports.cons,
            scorecardSnapshot: reports.scorecardSnapshot,
            competitors: reports.competitors,
            reportCreatedAt: reports.createdAt,
        })
        .from(tools)
        .innerJoin(reports, and(eq(reports.toolId, tools.id), eq(reports.isPublic, true)))
        .where(
            activeCategory
                ? and(isNotNull(tools.publicSlug), arrayContains(tools.category, [activeCategory]))
                : isNotNull(tools.publicSlug)
        )
        .orderBy(desc(reports.createdAt));

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                name: "Trackr AI Tool Library",
                description: "AI-powered SaaS tool scorecards and research reports",
                url: "https://trytrackr.com/research",
            },
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Home", item: "https://trytrackr.com" },
                    { "@type": "ListItem", position: 2, name: "AI Tool Library", item: "https://trytrackr.com/research" },
                ],
            },
            {
                "@type": "ItemList",
                name: "Curated AI Tools",
                numberOfItems: CURATED_TOOLS.length,
                itemListElement: CURATED_TOOLS.slice(0, 20).map((t, i) => ({
                    "@type": "ListItem",
                    position: i + 1,
                    name: t.name,
                    url: `https://trytrackr.com/research/${t.slug}`,
                })),
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
                <MarketingNavigation />

                {/* ── Hero ── */}
                <section className="py-16 border-t border-black/10">
                    <div className="mb-10">
                        <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-3">AI Tool Library</p>
                        <h1 className="font-serif text-4xl md:text-5xl font-normal mb-4">
                            The AI Stack Intelligence Library
                        </h1>
                        <p className="font-mono text-base text-neutral-600 max-w-xl mb-6">
                            Scorecards for 150+ AI tools. Research reports, stack templates, and competitive intelligence — all in one place.
                        </p>
                        {/* Stats row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px border border-black bg-black w-full max-w-lg">
                            {[
                                { label: "Curated Tools", value: CURATED_TOOLS.length.toString() },
                                { label: "Categories", value: PRIMARY_CATEGORIES.length.toString() },
                                { label: "Templates", value: TEMPLATES.length.toString() },
                                { label: "Reports Generated", value: totalPublicReports > 0 ? `${totalPublicReports}+` : `${CURATED_TOOLS.length}+` },
                            ].map((stat) => (
                                <div key={stat.label} className="bg-white px-4 py-3 text-center">
                                    <div className="font-mono text-xl font-bold">{stat.value}</div>
                                    <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Curated library client component */}
                    <CuratedLibrary
                        tools={CURATED_TOOLS}
                        templates={TEMPLATES}
                        primaryCategories={PRIMARY_CATEGORIES}
                        hotToolSlugs={HOT_TOOL_SLUGS}
                    />
                </section>

                {/* ── Trending in the Community ── */}
                {trendingVoteSlugs.length > 0 && (
                    <section className="py-10 border-t border-black/10">
                        <div className="mb-5">
                            <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">Community Picks</p>
                            <h2 className="font-serif text-2xl font-normal">Trending in the Community</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {trendingVoteSlugs.map(slug => {
                                const tool = CURATED_TOOLS.find(t => t.slug === slug);
                                if (!tool) return null;
                                const votes = trendingVotes.find(v => v.toolSlug === slug);
                                return (
                                    <Link
                                        key={slug}
                                        href={`/research/${slug}`}
                                        className="flex items-center gap-2 border border-black px-3 py-2 bg-white hover:bg-[#F3F3EF] transition-colors"
                                    >
                                        <span className="font-serif text-sm">{tool.name}</span>
                                        {votes && votes.upVotes > 0 && (
                                            <span className="font-mono text-[10px] text-neutral-400">↑{votes.upVotes}</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ── Community Reports ── */}
                {publicTools.length > 0 && (
                    <section className="py-12 border-t border-black/10">
                        <div className="mb-6">
                            <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">Community Reports</p>
                            <h2 className="font-serif text-2xl font-normal">
                                User-Researched Tools
                            </h2>
                            <p className="font-mono text-xs text-neutral-500 mt-1">
                                AI-powered research reports submitted by Trackr users.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px border border-black bg-black">
                            {publicTools.map((t) => {
                                const scorecard = t.scorecardSnapshot as Record<string, ScorecardEntry> | null;
                                const topDimension = scorecard
                                    ? Object.entries(scorecard).sort((a, b) => b[1].score - a[1].score)[0]
                                    : null;
                                const domain = t.websiteUrl
                                    ? (() => { try { return new URL(t.websiteUrl).hostname.replace("www.", ""); } catch { return null; } })()
                                    : null;

                                return (
                                    <Link
                                        key={t.id}
                                        href={`/research/${t.publicSlug}`}
                                        className="group bg-white hover:bg-[#F3F3EF] transition-colors p-6 flex flex-col gap-3"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                {(t.logoUrl || domain) && (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={t.logoUrl ?? `https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                                                        alt={t.name}
                                                        className="w-8 h-8 object-contain flex-shrink-0"
                                                    />
                                                )}
                                                <div className="min-w-0">
                                                    <h3 className="font-serif text-lg group-hover:underline underline-offset-2 leading-tight truncate">
                                                        {t.name}
                                                    </h3>
                                                    {domain && (
                                                        <p className="font-mono text-[10px] text-neutral-400 truncate">{domain}</p>
                                                    )}
                                                </div>
                                            </div>
                                            {t.overallScore && (
                                                <div className="flex-shrink-0 text-right">
                                                    <div className="font-mono text-xl font-bold">{Number(t.overallScore).toFixed(1)}</div>
                                                    <div className="flex items-center gap-0.5 justify-end">
                                                        <Star className="w-2.5 h-2.5 fill-black" />
                                                        <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest">Score</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {t.summary && (
                                            <p className="font-mono text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                                                {t.summary}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-2 flex-wrap mt-auto pt-2 border-t border-neutral-100">
                                            {t.category && t.category.slice(0, 2).map((cat) => (
                                                <span key={cat} className="font-mono text-[9px] uppercase tracking-widest border border-neutral-300 px-1.5 py-0.5 text-neutral-500">
                                                    {cat}
                                                </span>
                                            ))}
                                            {topDimension && (
                                                <span className="font-mono text-[9px] text-neutral-400 ml-auto">
                                                    {topDimension[0].replace(/_/g, " ")} {topDimension[1].score.toFixed(1)}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ── Start from a Template ── */}
                <section className="py-10 border-t border-black/10">
                    <div className="mb-5">
                        <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">Evaluation Templates</p>
                        <h2 className="font-serif text-2xl font-normal">Start from a Template</h2>
                        <p className="font-mono text-xs text-neutral-500 mt-1 max-w-xl">
                            Pre-built evaluation frameworks for common stack decisions. Import a template to get a structured scorecard instantly.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/research/templates"
                            className="inline-flex items-center gap-2 border border-black px-5 py-3 font-mono text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                        >
                            Browse All Templates →
                        </Link>
                        <Link
                            href="/sign-up"
                            className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors border border-black"
                        >
                            Import a Template Free →
                        </Link>
                    </div>
                </section>

                {/* ── Compare Tools Side-by-Side ── */}
                <section className="py-10 border-t border-black/10">
                    <div className="mb-5">
                        <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">Tool Comparison</p>
                        <h2 className="font-serif text-2xl font-normal">Compare Tools Side-by-Side</h2>
                        <p className="font-mono text-xs text-neutral-500 mt-1 max-w-xl">
                            Shortlisted two or more tools? Compare them head-to-head across all 7 scorecard dimensions in a single view.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/research/compare"
                            className="inline-flex items-center gap-2 border border-black px-5 py-3 font-mono text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                        >
                            Open Compare Tool →
                        </Link>
                    </div>
                </section>

                {/* ── CTA ── */}
                <div className="my-16 border border-black bg-black text-white p-8">
                    <p className="font-mono text-xs uppercase tracking-wider text-neutral-400 mb-3">Research any tool</p>
                    <h3 className="font-serif text-2xl font-normal mb-3 text-white">
                        Don&apos;t see the tool you&apos;re evaluating?
                    </h3>
                    <p className="font-mono text-sm text-neutral-400 mb-6 max-w-md">
                        Submit any tool URL. Research agents produce a scored report in under 2 minutes.
                    </p>
                    <Link
                        href="/sign-up"
                        className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-neutral-100 transition-colors border border-white"
                    >
                        Get Started Free →
                    </Link>
                </div>

                <MarketingFooter />
            </main>
        </>
    );
}
