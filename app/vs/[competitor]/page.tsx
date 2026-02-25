import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, X, Minus } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import type { Metadata } from "next";
import { VS_PAGES, VS_COMPETITORS } from "@/data/vs-pages.seed";

// Fully static
export const revalidate = false;

export async function generateStaticParams() {
    return VS_COMPETITORS.map((competitor) => ({ competitor }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ competitor: string }>;
}): Promise<Metadata> {
    const { competitor } = await params;
    const page = VS_PAGES.find((p) => p.competitor === competitor);
    if (!page) return { title: "Not Found — Trackr" };

    return {
        title: `${page.title} | Trackr`,
        description: page.description,
        openGraph: {
            title: page.title,
            description: page.description,
            url: `https://trytrackr.com/vs/${competitor}`,
            images: [{ url: "/og.png", width: 1456, height: 816, alt: `Trackr vs ${page.competitorName}` }],
        },
        alternates: { canonical: `https://trytrackr.com/vs/${competitor}` },
    };
}

export default async function VsPage({
    params,
}: {
    params: Promise<{ competitor: string }>;
}) {
    const { competitor } = await params;
    const page = VS_PAGES.find((p) => p.competitor === competitor);
    if (!page) notFound();

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "FAQPage",
                mainEntity: page.faqs.map(({ q, a }) => ({
                    "@type": "Question",
                    name: q,
                    acceptedAnswer: { "@type": "Answer", text: a },
                })),
            },
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Home", item: "https://trytrackr.com" },
                    { "@type": "ListItem", position: 2, name: `Trackr vs ${page.competitorName}`, item: `https://trytrackr.com/vs/${competitor}` },
                ],
            },
        ],
    };

    const relatedPages = VS_PAGES.filter((p) => p.competitor !== competitor).slice(0, 3);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
                <MarketingNavigation />

                {/* ── Hero ── */}
                <section className="py-20 border-t border-black/10">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="font-mono text-[10px] uppercase tracking-widest border border-black px-3 py-1">
                            Trackr vs {page.competitorName}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                            {page.competitorTagline}
                        </span>
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal mb-6 max-w-3xl leading-tight">
                        {page.headline}
                    </h1>
                    <p className="font-mono text-base text-neutral-600 mb-8 max-w-xl leading-relaxed">
                        {page.subheadline}
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/sign-up"
                            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                        >
                            {page.ctaText} →
                        </Link>
                        <Link
                            href="/research"
                            className="inline-flex items-center gap-2 border border-black px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-[#F3F3EF] transition-colors"
                        >
                            See the Tool Library
                        </Link>
                    </div>
                </section>

                {/* ── Switching narrative ── */}
                <section className="py-14 border-t border-black/10">
                    <div className="max-w-3xl">
                        <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-5">
                            Trackr vs {page.competitorName}
                        </p>
                        <div className="space-y-4 font-mono text-sm text-neutral-600 leading-relaxed">
                            {page.switchNarrative.split("\n\n").map((para, i) => (
                                <p key={i}>{para}</p>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Feature comparison table ── */}
                <section className="py-14 border-t border-black/10">
                    <h2 className="font-serif text-2xl font-normal mb-6">
                        Trackr vs {page.competitorName}: feature comparison
                    </h2>
                    <div className="border border-black overflow-x-auto">
                        <table className="w-full font-mono text-xs border-collapse">
                            <thead>
                                <tr className="bg-black text-white">
                                    <th className="text-left p-4 font-normal uppercase tracking-widest text-[10px] border-r border-neutral-800 w-1/2">Feature</th>
                                    <th className="text-center p-4 font-normal uppercase tracking-widest text-[10px] border-r border-neutral-800 w-1/4">Trackr</th>
                                    <th className="text-center p-4 font-normal uppercase tracking-widest text-[10px] w-1/4">{page.competitorName}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {page.featureTable.map((row, i) => (
                                    <tr key={i} className="bg-white hover:bg-[#F3F3EF] transition-colors">
                                        <td className="p-4 border-r border-neutral-100 text-neutral-700">{row.feature}</td>
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

                {/* ── Advantages ── */}
                <section className="py-14 border-t border-black/10">
                    <h2 className="font-serif text-2xl font-normal mb-8">
                        Why teams choose Trackr over {page.competitorName}
                    </h2>
                    <div className="space-y-px border border-black">
                        {page.advantages.map((adv, i) => (
                            <div key={i} className="bg-white p-6 flex gap-5 items-start">
                                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-mono text-sm font-bold mb-2">{adv.title}</h3>
                                    <p className="font-mono text-xs text-neutral-600 leading-relaxed">{adv.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="py-14 border-t border-black/10">
                    <div className="border border-black bg-black text-white p-10 max-w-3xl">
                        <p className="font-mono text-xs uppercase tracking-wider text-neutral-400 mb-3">
                            Try the alternative
                        </p>
                        <h2 className="font-serif text-3xl font-normal mb-4 text-white">
                            Research any tool in under 2 minutes
                        </h2>
                        <p className="font-mono text-sm text-neutral-400 mb-8 max-w-lg">
                            Submit any tool URL. AI research agents produce a scored 7-dimension report — features, pricing, pros/cons, and competitive analysis. Free to start.
                        </p>
                        <Link
                            href="/sign-up"
                            className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-neutral-100 transition-colors"
                        >
                            {page.ctaText} →
                        </Link>
                    </div>
                </section>

                {/* ── FAQs ── */}
                <section className="py-14 border-t border-black/10">
                    <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-6">
                        Frequently Asked Questions
                    </h2>
                    <div className="border border-black divide-y divide-neutral-100 max-w-3xl">
                        {page.faqs.map((faq, i) => (
                            <div key={i} className="p-5">
                                <h3 className="font-mono text-sm font-bold mb-2">{faq.q}</h3>
                                <p className="font-mono text-xs text-neutral-600 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Related comparisons ── */}
                {relatedPages.length > 0 && (
                    <section className="py-8 border-t border-black/10 mb-16">
                        <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-5">Also compare</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px border border-black bg-black">
                            {relatedPages.map((p) => (
                                <Link
                                    key={p.competitor}
                                    href={`/vs/${p.competitor}`}
                                    className="group bg-white hover:bg-[#F3F3EF] transition-colors p-5 flex flex-col gap-2"
                                >
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">vs</span>
                                    <h3 className="font-serif text-base group-hover:underline underline-offset-2">
                                        Trackr vs {p.competitorName}
                                    </h3>
                                    <p className="font-mono text-[10px] text-neutral-500">{p.competitorTagline}</p>
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
