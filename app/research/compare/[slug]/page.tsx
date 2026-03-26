import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import type { Metadata } from "next";
import { COMPARISONS, COMPARISON_SLUGS } from "@/data/comparisons.seed";
import { CURATED_TOOLS } from "@/data/tools.seed";
import { SCORECARD_DIMENSION_LABELS } from "@/lib/types";
import type { Scorecard } from "@/lib/types";

// Fully static — no DB calls
export const revalidate = false;

export async function generateStaticParams() {
    return COMPARISON_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const comparison = COMPARISONS.find((c) => c.slug === slug);
    if (!comparison) return { title: "Not Found — Trackr" };

    return {
        title: `${comparison.title} | Trackr`,
        description: comparison.description,
        openGraph: {
            title: comparison.title,
            description: comparison.description,
            url: `https://trytrackr.com/research/compare/${slug}`,
            images: [{ url: "/og.png", width: 1456, height: 816, alt: comparison.title }],
        },
        alternates: { canonical: `https://trytrackr.com/research/compare/${slug}` },
    };
}

export default async function ComparisonSlugPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const comparison = COMPARISONS.find((c) => c.slug === slug);
    if (!comparison) notFound();

    const toolA = CURATED_TOOLS.find((t) => t.slug === comparison.toolASlug);
    const toolB = CURATED_TOOLS.find((t) => t.slug === comparison.toolBSlug);

    if (!toolA || !toolB) notFound();

    const dimensions = Object.keys(toolA.scorecard) as (keyof Scorecard)[];

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Home", item: "https://trytrackr.com" },
                    { "@type": "ListItem", position: 2, name: "AI Tool Library", item: "https://trytrackr.com/research" },
                    { "@type": "ListItem", position: 3, name: "Compare Tools", item: "https://trytrackr.com/research/compare" },
                    { "@type": "ListItem", position: 4, name: `${toolA.name} vs ${toolB.name}`, item: `https://trytrackr.com/research/compare/${slug}` },
                ],
            },
            {
                "@type": "FAQPage",
                mainEntity: comparison.faqs.map(({ q, a }) => ({
                    "@type": "Question",
                    name: q,
                    acceptedAnswer: { "@type": "Answer", text: a },
                })),
            },
        ],
    };

    // Related comparisons: same category or featuring the same tools
    const related = COMPARISONS.filter(
        (c) =>
            c.slug !== slug &&
            (c.category === comparison.category ||
                c.toolASlug === comparison.toolASlug ||
                c.toolBSlug === comparison.toolBSlug ||
                c.toolASlug === comparison.toolBSlug ||
                c.toolBSlug === comparison.toolASlug)
    ).slice(0, 3);

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

                    {/* Hero */}
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                            <span className="font-mono text-[10px] uppercase tracking-widest border border-neutral-300 px-2 py-0.5 text-neutral-500">
                                {comparison.category}
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-widest border border-neutral-300 px-2 py-0.5 text-neutral-500">
                                Comparison
                            </span>
                        </div>
                        <div className="flex items-center gap-6 mb-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <Image
                                    src={`https://www.google.com/s2/favicons?domain=${toolA.domain}&sz=64`}
                                    alt={toolA.name}
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 object-contain"
                                />
                                <span className="font-serif text-3xl md:text-4xl font-normal">{toolA.name}</span>
                            </div>
                            <span className="font-mono text-2xl text-neutral-300 font-bold">vs</span>
                            <div className="flex items-center gap-3">
                                <Image
                                    src={`https://www.google.com/s2/favicons?domain=${toolB.domain}&sz=64`}
                                    alt={toolB.name}
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 object-contain"
                                />
                                <span className="font-serif text-3xl md:text-4xl font-normal">{toolB.name}</span>
                            </div>
                        </div>
                        <p className="font-mono text-sm text-neutral-600 max-w-2xl leading-relaxed">
                            {comparison.intro}
                        </p>
                    </div>

                    {/* Score summary row */}
                    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-8">
                    <div className="grid grid-cols-3 gap-px border border-black bg-black min-w-[480px]">
                        <div className="bg-white p-5">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Metric</p>
                        </div>
                        <div className={`bg-white p-5 text-center ${comparison.verdictWinner === "toolA" ? "bg-[#F3F3EF]" : ""}`}>
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <Image
                                    src={`https://www.google.com/s2/favicons?domain=${toolA.domain}&sz=32`}
                                    alt={toolA.name}
                                    width={20}
                                    height={20}
                                    className="w-5 h-5 object-contain"
                                />
                                <span className="font-serif text-base">{toolA.name}</span>
                            </div>
                            <div className="font-mono text-3xl font-bold">{toolA.overallScore.toFixed(1)}</div>
                            <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">Overall Score</div>
                            {comparison.verdictWinner === "toolA" && (
                                <span className="inline-block font-mono text-[9px] uppercase tracking-widest border border-black px-2 py-0.5 mt-2">
                                    Editor&apos;s Pick
                                </span>
                            )}
                        </div>
                        <div className={`bg-white p-5 text-center ${comparison.verdictWinner === "toolB" ? "bg-[#F3F3EF]" : ""}`}>
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <Image
                                    src={`https://www.google.com/s2/favicons?domain=${toolB.domain}&sz=32`}
                                    alt={toolB.name}
                                    width={20}
                                    height={20}
                                    className="w-5 h-5 object-contain"
                                />
                                <span className="font-serif text-base">{toolB.name}</span>
                            </div>
                            <div className="font-mono text-3xl font-bold">{toolB.overallScore.toFixed(1)}</div>
                            <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">Overall Score</div>
                            {comparison.verdictWinner === "toolB" && (
                                <span className="inline-block font-mono text-[9px] uppercase tracking-widest border border-black px-2 py-0.5 mt-2">
                                    Editor&apos;s Pick
                                </span>
                            )}
                        </div>
                    </div>
                    </div>

                    {/* 7D Scorecard comparison table */}
                    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-8">
                    <div className="border border-black min-w-[480px]">
                        <div className="p-4 border-b border-neutral-200">
                            <h2 className="font-mono text-xs uppercase tracking-widest">7-Dimension Scorecard</h2>
                        </div>
                        <div className="divide-y divide-neutral-100">
                            {dimensions.map((dim) => {
                                const aScore = toolA.scorecard[dim].score;
                                const bScore = toolB.scorecard[dim].score;
                                const aWins = aScore > bScore;
                                const bWins = bScore > aScore;
                                return (
                                    <div key={dim} className="grid grid-cols-3">
                                        <div className="p-4 font-mono text-[10px] uppercase tracking-widest text-neutral-500 border-r border-neutral-100">
                                            {SCORECARD_DIMENSION_LABELS[dim]}
                                        </div>
                                        <div className={`p-4 border-r border-neutral-100 ${aWins ? "bg-[#F3F3EF]" : ""}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-mono text-sm font-bold">{aScore.toFixed(1)}</span>
                                                {aWins && (
                                                    <span className="font-mono text-[9px] uppercase tracking-widest border border-black px-1 py-0.5">
                                                        Better
                                                    </span>
                                                )}
                                            </div>
                                            <div className="h-1 bg-neutral-100 border border-neutral-200 mb-1.5">
                                                <div className="h-full bg-black" style={{ width: `${(aScore / 10) * 100}%` }} />
                                            </div>
                                            <p className="font-mono text-[10px] text-neutral-400 leading-relaxed">
                                                {toolA.scorecard[dim].justification}
                                            </p>
                                        </div>
                                        <div className={`p-4 ${bWins ? "bg-[#F3F3EF]" : ""}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-mono text-sm font-bold">{bScore.toFixed(1)}</span>
                                                {bWins && (
                                                    <span className="font-mono text-[9px] uppercase tracking-widest border border-black px-1 py-0.5">
                                                        Better
                                                    </span>
                                                )}
                                            </div>
                                            <div className="h-1 bg-neutral-100 border border-neutral-200 mb-1.5">
                                                <div className="h-full bg-black" style={{ width: `${(bScore / 10) * 100}%` }} />
                                            </div>
                                            <p className="font-mono text-[10px] text-neutral-400 leading-relaxed">
                                                {toolB.scorecard[dim].justification}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    </div>

                    {/* Verdict + When to use */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Verdict */}
                        <div className="lg:col-span-1 border border-black bg-black text-white p-5">
                            <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">Verdict</h2>
                            <p className="font-mono text-sm leading-relaxed text-white">{comparison.verdict}</p>
                        </div>

                        {/* When to use */}
                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-px border border-black bg-black">
                            <div className="bg-white p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Image
                                        src={`https://www.google.com/s2/favicons?domain=${toolA.domain}&sz=32`}
                                        alt={toolA.name}
                                        width={16}
                                        height={16}
                                        className="w-4 h-4 object-contain"
                                    />
                                    <h3 className="font-mono text-xs uppercase tracking-widest">Choose {toolA.name}</h3>
                                </div>
                                <p className="font-mono text-xs text-neutral-600 leading-relaxed">{comparison.whenUseA}</p>
                                <Link
                                    href={`/research/${toolA.slug}`}
                                    className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest border border-black px-2 py-1 mt-4 hover:bg-black hover:text-white transition-colors"
                                >
                                    Full Scorecard <ArrowRight className="w-2.5 h-2.5" />
                                </Link>
                            </div>
                            <div className="bg-white p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Image
                                        src={`https://www.google.com/s2/favicons?domain=${toolB.domain}&sz=32`}
                                        alt={toolB.name}
                                        width={16}
                                        height={16}
                                        className="w-4 h-4 object-contain"
                                    />
                                    <h3 className="font-mono text-xs uppercase tracking-widest">Choose {toolB.name}</h3>
                                </div>
                                <p className="font-mono text-xs text-neutral-600 leading-relaxed">{comparison.whenUseB}</p>
                                <Link
                                    href={`/research/${toolB.slug}`}
                                    className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest border border-black px-2 py-1 mt-4 hover:bg-black hover:text-white transition-colors"
                                >
                                    Full Scorecard <ArrowRight className="w-2.5 h-2.5" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Pricing comparison */}
                    {(toolA.pricing.length > 0 || toolB.pricing.length > 0) && (
                        <div className="border border-black mb-8">
                            <div className="p-4 border-b border-neutral-200">
                                <h2 className="font-mono text-xs uppercase tracking-widest">Pricing</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-black">
                                <div className="bg-white p-5">
                                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-3">{toolA.name}</p>
                                    <div className="space-y-2">
                                        {toolA.pricing.map((p, i) => (
                                            <div key={i} className="flex justify-between border-b border-neutral-50 pb-1.5 last:border-0 last:pb-0">
                                                <span className="font-mono text-xs text-neutral-500">{p.tier}</span>
                                                <span className="font-mono text-xs font-bold">{p.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white p-5">
                                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-3">{toolB.name}</p>
                                    <div className="space-y-2">
                                        {toolB.pricing.map((p, i) => (
                                            <div key={i} className="flex justify-between border-b border-neutral-50 pb-1.5 last:border-0 last:pb-0">
                                                <span className="font-mono text-xs text-neutral-500">{p.tier}</span>
                                                <span className="font-mono text-xs font-bold">{p.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FAQs */}
                    {comparison.faqs.length > 0 && (
                        <div className="border border-black mb-8">
                            <div className="p-4 border-b border-neutral-200">
                                <h2 className="font-mono text-xs uppercase tracking-widest">
                                    Frequently Asked Questions
                                </h2>
                            </div>
                            <div className="divide-y divide-neutral-100">
                                {comparison.faqs.map((faq, i) => (
                                    <div key={i} className="p-5">
                                        <h3 className="font-mono text-sm font-bold mb-2">{faq.q}</h3>
                                        <p className="font-mono text-xs text-neutral-600 leading-relaxed">{faq.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CTA */}
                    <div className="border border-black bg-black text-white p-8 mb-12">
                        <p className="font-mono text-xs uppercase tracking-wider text-neutral-400 mb-3">
                            Research your stack
                        </p>
                        <h3 className="font-serif text-2xl font-normal mb-3 text-white">
                            Get a custom report on {toolA.name} or {toolB.name} for your team
                        </h3>
                        <p className="font-mono text-sm text-neutral-400 mb-6 max-w-md">
                            Submit any tool URL. Research agents produce a scored 7-dimension report in under 2 minutes — tailored to your stack and use case.
                        </p>
                        <Link
                            href="/sign-up"
                            className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-neutral-100 transition-colors border border-white"
                        >
                            Get Started Free →
                        </Link>
                    </div>
                </section>

                {/* Related comparisons */}
                {related.length > 0 && (
                    <section className="pb-16 border-t border-black/10 pt-8">
                        <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-6">
                            Related Comparisons
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px border border-black bg-black">
                            {related.map((c) => {
                                const a = CURATED_TOOLS.find((t) => t.slug === c.toolASlug);
                                const b = CURATED_TOOLS.find((t) => t.slug === c.toolBSlug);
                                if (!a || !b) return null;
                                return (
                                    <Link
                                        key={c.slug}
                                        href={`/research/compare/${c.slug}`}
                                        className="group bg-white hover:bg-[#F3F3EF] transition-colors p-5 flex flex-col gap-2"
                                    >
                                        <span className="font-mono text-[9px] uppercase tracking-widest border border-neutral-300 px-1.5 py-0.5 text-neutral-500 w-fit">
                                            {c.category}
                                        </span>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Image
                                                src={`https://www.google.com/s2/favicons?domain=${a.domain}&sz=32`}
                                                alt={a.name}
                                                width={16}
                                                height={16}
                                                className="w-4 h-4 object-contain"
                                            />
                                            <h3 className="font-serif text-base group-hover:underline underline-offset-2">
                                                {a.name} vs {b.name}
                                            </h3>
                                            <Image
                                                src={`https://www.google.com/s2/favicons?domain=${b.domain}&sz=32`}
                                                alt={b.name}
                                                width={16}
                                                height={16}
                                                className="w-4 h-4 object-contain"
                                            />
                                        </div>
                                        <span className="flex items-center gap-1 font-mono text-[10px] text-neutral-400 mt-auto">
                                            <ArrowRight className="w-3 h-3" /> Compare
                                        </span>
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
