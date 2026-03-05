import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, X, Minus, ArrowRight } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import type { Metadata } from "next";
import { VS_PAGES } from "@/data/vs-pages.seed";

// Fully static
export const revalidate = false;

export async function generateStaticParams() {
    return VS_PAGES.map((p) => ({ competitor: p.competitor }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ competitor: string }>;
}): Promise<Metadata> {
    const { competitor } = await params;
    const page = VS_PAGES.find((p) => p.competitor === competitor);
    if (!page) return { title: "Not Found — Trackr" };

    const title = `${page.competitorName} Alternatives — Best Tools in 2026 | Trackr`;
    const description = `Looking for ${page.competitorName} alternatives? See how Trackr compares and which tools ops teams are using instead of ${page.competitorName} in 2026.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `https://trytrackr.com/alternatives/${competitor}`,
            images: [
                {
                    url: "/og.png",
                    width: 1456,
                    height: 816,
                    alt: `${page.competitorName} Alternatives`,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ["/og.png"],
        },
        alternates: { canonical: `https://trytrackr.com/alternatives/${competitor}` },
    };
}

export default async function AlternativesPage({
    params,
}: {
    params: Promise<{ competitor: string }>;
}) {
    const { competitor } = await params;
    const page = VS_PAGES.find((p) => p.competitor === competitor);
    if (!page) notFound();

    // Pull pain points from featureTable rows where competitor is false or a weak string
    const painPointRows = page.featureTable
        .filter((row) => row.competitor === false || (typeof row.competitor === "string" && row.competitor !== row.trackr))
        .slice(0, 3);

    // Feature table — first 6 rows
    const tableRows = page.featureTable.slice(0, 6);

    const faqs = [
        {
            q: `What is the best free alternative to ${page.competitorName}?`,
            a: `Trackr is the most commonly adopted free alternative to ${page.competitorName}. It offers AI-powered tool research, a 7-dimension scoring framework, and stack tracking — all free to start. Unlike ${page.competitorName}, which is a ${page.competitorTagline.toLowerCase()}, Trackr is purpose-built for ops teams that need fast, unbiased tool intelligence.`,
        },
        {
            q: `What do teams use instead of ${page.competitorName}?`,
            a: `Teams replacing ${page.competitorName} typically move to Trackr for AI-generated research reports, or combine Trackr with their existing procurement workflow. Trackr researches any tool in under 2 minutes — scoring it across 7 dimensions — and replaces the manual spreadsheet tracking that most teams fall back on when ${page.competitorName} falls short.`,
        },
        {
            q: `Is there a better option than ${page.competitorName} for ops teams?`,
            a: `For ops teams specifically, Trackr offers the tightest fit. ${page.competitorName} is built for a broader use case (${page.competitorTagline.toLowerCase()}), whereas Trackr is designed around the ops team workflow: evaluating new tools quickly, tracking the existing stack, monitoring renewals, and flagging spend overlap. Most ops teams see full value within a single tool evaluation cycle.`,
        },
    ];

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "FAQPage",
                mainEntity: faqs.map(({ q, a }) => ({
                    "@type": "Question",
                    name: q,
                    acceptedAnswer: { "@type": "Answer", text: a },
                })),
            },
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Home", item: "https://trytrackr.com" },
                    { "@type": "ListItem", position: 2, name: "Alternatives", item: "https://trytrackr.com/alternatives" },
                    {
                        "@type": "ListItem",
                        position: 3,
                        name: `${page.competitorName} Alternatives`,
                        item: `https://trytrackr.com/alternatives/${competitor}`,
                    },
                ],
            },
        ],
    };

    const relatedPages = VS_PAGES.filter((p) => p.competitor !== competitor).slice(0, 3);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
                <MarketingNavigation isLoggedIn={false} />

                {/* Hero */}
                <section className="py-20 border-t border-black/10">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="font-mono text-[10px] uppercase tracking-widest border border-black px-3 py-1">
                            AI Tool Alternatives
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                            {page.competitorTagline}
                        </span>
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal mb-6 max-w-3xl leading-tight">
                        Looking for {page.competitorName} alternatives?
                    </h1>
                    <p className="font-mono text-base text-neutral-600 mb-8 max-w-xl leading-relaxed">
                        Most teams searching for {page.competitorName} alternatives are looking for a{" "}
                        {page.competitorTagline.toLowerCase()} with better ROI tracking, faster evaluation, and
                        AI-powered research. Trackr is the most common alternative — researching any tool in under 2
                        minutes and replacing manual spreadsheets entirely.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/sign-up"
                            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                        >
                            Try Trackr free →
                        </Link>
                        <Link
                            href={`/vs/${competitor}`}
                            className="inline-flex items-center gap-2 border border-black px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-[#F3F3EF] transition-colors"
                        >
                            See Trackr vs {page.competitorName} directly
                        </Link>
                    </div>
                </section>

                {/* Why teams leave */}
                {painPointRows.length > 0 && (
                    <section className="py-14 border-t border-black/10">
                        <h2 className="font-serif text-2xl font-normal mb-8">
                            Why teams leave {page.competitorName}
                        </h2>
                        <div className="space-y-px border border-black">
                            {painPointRows.map((row, i) => (
                                <div key={i} className="bg-white p-6 flex gap-5 items-start">
                                    <X className="w-4 h-4 flex-shrink-0 mt-0.5 text-neutral-400" />
                                    <div>
                                        <h3 className="font-mono text-sm font-bold mb-2">{row.feature}</h3>
                                        <p className="font-mono text-xs text-neutral-600 leading-relaxed">
                                            {typeof row.competitor === "string"
                                                ? `${page.competitorName}: ${row.competitor}. Trackr: ${typeof row.trackr === "string" ? row.trackr : "included"}.`
                                                : `${page.competitorName} does not offer this. Trackr includes it by default.`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Feature comparison table */}
                <section className="py-14 border-t border-black/10">
                    <h2 className="font-serif text-2xl font-normal mb-6">
                        How {page.competitorName} alternatives compare
                    </h2>
                    <p className="font-mono text-xs text-neutral-500 mb-6 leading-relaxed max-w-2xl">
                        When evaluating alternatives to {page.competitorName}, these are the features ops teams
                        weight most heavily. Trackr is built around all of them.
                    </p>
                    <div className="border border-black overflow-x-auto">
                        <table className="w-full font-mono text-xs border-collapse">
                            <thead>
                                <tr className="bg-black text-white">
                                    <th className="text-left p-4 font-normal uppercase tracking-widest text-[10px] border-r border-neutral-800 w-1/2">
                                        Feature
                                    </th>
                                    <th className="text-center p-4 font-normal uppercase tracking-widest text-[10px] border-r border-neutral-800 w-1/4">
                                        Trackr
                                    </th>
                                    <th className="text-center p-4 font-normal uppercase tracking-widest text-[10px] w-1/4">
                                        {page.competitorName}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {tableRows.map((row, i) => (
                                    <tr key={i} className="bg-white hover:bg-[#F3F3EF] transition-colors">
                                        <td className="p-4 border-r border-neutral-100 text-neutral-700">
                                            {row.feature}
                                        </td>
                                        <td className="p-4 border-r border-neutral-100 text-center">
                                            {row.trackr === true ? (
                                                <CheckCircle className="w-4 h-4 inline" />
                                            ) : row.trackr === false ? (
                                                <Minus className="w-4 h-4 inline text-neutral-300" />
                                            ) : (
                                                <span className="text-neutral-600">{row.trackr}</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {row.competitor === true ? (
                                                <CheckCircle className="w-4 h-4 inline" />
                                            ) : row.competitor === false ? (
                                                <X className="w-4 h-4 inline text-neutral-300" />
                                            ) : (
                                                <span className="text-neutral-500">{row.competitor}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* What makes a good alternative */}
                <section className="py-14 border-t border-black/10">
                    <h2 className="font-serif text-2xl font-normal mb-8">
                        What makes a good {page.competitorTagline.toLowerCase()} alternative?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px border border-black bg-black">
                        <div className="bg-white p-6">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-3">
                                01
                            </p>
                            <h3 className="font-mono text-sm font-bold mb-3">Speed of evaluation</h3>
                            <p className="font-mono text-xs text-neutral-600 leading-relaxed">
                                A good alternative should cut evaluation time, not add to it. Trackr delivers a
                                scored 7-dimension report in under 2 minutes — no demo calls, no vendor outreach
                                required.
                            </p>
                        </div>
                        <div className="bg-white p-6">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-3">
                                02
                            </p>
                            <h3 className="font-mono text-sm font-bold mb-3">Unbiased data sources</h3>
                            <p className="font-mono text-xs text-neutral-600 leading-relaxed">
                                The best alternatives pull from multiple independent sources — not just vendor
                                marketing or incentivized reviews. Trackr's AI research synthesizes community
                                discussions, pricing pages, changelogs, and competitor positioning.
                            </p>
                        </div>
                        <div className="bg-white p-6">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-3">
                                03
                            </p>
                            <h3 className="font-mono text-sm font-bold mb-3">Ongoing stack intelligence</h3>
                            <p className="font-mono text-xs text-neutral-600 leading-relaxed">
                                The best alternatives are not point-in-time tools. They track your existing stack,
                                flag renewal dates, and surface spend overlap — turning one-time research into
                                continuous intelligence.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-14 border-t border-black/10">
                    <div className="border border-black bg-black text-white p-10 max-w-3xl">
                        <p className="font-mono text-xs uppercase tracking-wider text-neutral-400 mb-3">
                            The leading alternative
                        </p>
                        <h2 className="font-serif text-3xl font-normal mb-4 text-white">
                            Research any tool in under 2 minutes
                        </h2>
                        <p className="font-mono text-sm text-neutral-400 mb-8 max-w-lg">
                            Submit any tool URL. AI research agents produce a scored 7-dimension report — features,
                            pricing, pros/cons, and competitive analysis. Free to start.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-neutral-100 transition-colors"
                            >
                                Try Trackr free →
                            </Link>
                            <Link
                                href={`/vs/${competitor}`}
                                className="inline-flex items-center gap-2 border border-neutral-600 text-neutral-300 px-6 py-3 font-mono text-xs uppercase tracking-widest hover:border-white hover:text-white transition-colors"
                            >
                                See Trackr vs {page.competitorName} →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* FAQs */}
                <section className="py-14 border-t border-black/10">
                    <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-6">
                        Frequently Asked Questions
                    </h2>
                    <div className="border border-black divide-y divide-neutral-100 max-w-3xl">
                        {faqs.map((faq, i) => (
                            <div key={i} className="p-5">
                                <h3 className="font-mono text-sm font-bold mb-2">{faq.q}</h3>
                                <p className="font-mono text-xs text-neutral-600 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Related alternatives */}
                {relatedPages.length > 0 && (
                    <section className="py-8 border-t border-black/10 mb-16">
                        <div className="flex items-center justify-between mb-5">
                            <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                                More alternatives
                            </p>
                            <Link
                                href="/alternatives"
                                className="font-mono text-xs text-neutral-500 hover:text-black hover:underline"
                            >
                                See all alternatives →
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px border border-black bg-black">
                            {relatedPages.map((p) => (
                                <Link
                                    key={p.competitor}
                                    href={`/alternatives/${p.competitor}`}
                                    className="group bg-white hover:bg-[#F3F3EF] transition-colors p-5 flex flex-col gap-2"
                                >
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">
                                        alternatives
                                    </span>
                                    <h3 className="font-serif text-base group-hover:underline underline-offset-2">
                                        {p.competitorName} Alternatives
                                    </h3>
                                    <p className="font-mono text-[10px] text-neutral-500">
                                        {p.competitorTagline}
                                    </p>
                                    <span className="font-mono text-[10px] text-neutral-400 flex items-center gap-1 mt-auto">
                                        Browse options <ArrowRight className="w-3 h-3" />
                                    </span>
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
