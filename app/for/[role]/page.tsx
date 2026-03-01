import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle, Clock } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import type { Metadata } from "next";
import { ICP_PAGES, ICP_ROLES } from "@/data/icp-pages.seed";
import { VS_PAGES } from "@/data/vs-pages.seed";

// Fully static
export const revalidate = false;

export async function generateStaticParams() {
    return ICP_ROLES.map((role) => ({ role }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ role: string }>;
}): Promise<Metadata> {
    const { role } = await params;
    const page = ICP_PAGES.find((p) => p.role === role);
    if (!page) return { title: "Not Found — Trackr" };

    return {
        title: `${page.title} | Trackr`,
        description: page.description,
        openGraph: {
            title: page.title,
            description: page.description,
            url: `https://trytrackr.com/for/${role}`,
            images: [{ url: "/og.png", width: 1456, height: 816, alt: page.headline }],
        },
        alternates: { canonical: `https://trytrackr.com/for/${role}` },
    };
}

export default async function IcpPage({
    params,
}: {
    params: Promise<{ role: string }>;
}) {
    const { role } = await params;
    const page = ICP_PAGES.find((p) => p.role === role);
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
                    { "@type": "ListItem", position: 2, name: page.headline, item: `https://trytrackr.com/for/${role}` },
                ],
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
                <section className="py-20 border-t border-black/10">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-[10px] uppercase tracking-widest border border-black px-3 py-1">
                                Built for
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                                {page.role.replace(/-/g, " ")}
                            </span>
                        </div>
                        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal mb-6 leading-tight">
                            {page.headline}
                        </h1>
                        <p className="font-mono text-base text-neutral-600 mb-8 max-w-xl leading-relaxed">
                            {page.subheadline}
                        </p>

                        {/* Stat */}
                        <div className="inline-flex items-center gap-4 border border-black px-6 py-4 mb-8 bg-[#F3F3EF]">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <div>
                                <div className="font-mono text-2xl font-bold">{page.stat.value}</div>
                                <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">{page.stat.label}</div>
                            </div>
                        </div>

                        {/* CTAs */}
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
                                Browse Tool Library
                            </Link>
                        </div>
                        <p className="font-mono text-[10px] text-neutral-400 mt-3">{page.ctaSubtext}</p>
                    </div>
                </section>

                {/* ── Pain Points ── */}
                <section className="py-14 border-t border-black/10">
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">The problem</p>
                    <h2 className="font-serif text-2xl font-normal mb-8">Why tool decisions break down</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px border border-black bg-black">
                        {page.painPoints.map((pp, i) => (
                            <div key={i} className="bg-white p-6">
                                <div className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">
                                    {String(i + 1).padStart(2, "0")}
                                </div>
                                <h3 className="font-serif text-lg mb-3">{pp.title}</h3>
                                <p className="font-mono text-xs text-neutral-600 leading-relaxed">{pp.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Features ── */}
                <section className="py-14 border-t border-black/10">
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">How Trackr helps</p>
                    <h2 className="font-serif text-2xl font-normal mb-8">What Trackr does for your team</h2>
                    <div className="space-y-px border border-black">
                        {page.features.map((feat, i) => (
                            <div key={i} className="bg-white p-6 flex gap-5 items-start">
                                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-mono text-sm font-bold mb-2">{feat.title}</h3>
                                    <p className="font-mono text-xs text-neutral-600 leading-relaxed">{feat.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Testimonial ── */}
                <section className="py-14 border-t border-black/10">
                    <div className="border border-black p-8 bg-[#F3F3EF] max-w-2xl">
                        <blockquote className="font-serif text-xl font-normal mb-4 leading-relaxed">
                            &ldquo;{page.testimonialQuote}&rdquo;
                        </blockquote>
                        <p className="font-mono text-xs text-neutral-500">&mdash; {page.testimonialAttribution}</p>
                    </div>
                </section>

                {/* ── CTA Block ── */}
                <section className="py-14 border-t border-black/10">
                    <div className="border border-black bg-black text-white p-10 max-w-3xl">
                        <p className="font-mono text-xs uppercase tracking-wider text-neutral-400 mb-3">Get started</p>
                        <h2 className="font-serif text-3xl font-normal mb-4 text-white">{page.headline}</h2>
                        <p className="font-mono text-sm text-neutral-400 mb-8 max-w-lg">{page.subheadline}</p>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-neutral-100 transition-colors"
                            >
                                {page.ctaText} →
                            </Link>
                            <Link
                                href="/research"
                                className="inline-flex items-center gap-2 border border-neutral-700 px-6 py-3 font-mono text-xs uppercase tracking-widest hover:border-white transition-colors text-white"
                            >
                                Browse Library
                            </Link>
                        </div>
                        <p className="font-mono text-[10px] text-neutral-500 mt-4">{page.ctaSubtext}</p>
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

                {/* ── Compare Trackr vs alternatives ── */}
                <section className="py-8 border-t border-black/10">
                    <div className="flex items-center justify-between mb-5">
                        <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">How Trackr compares</p>
                        <Link href="/vs" className="font-mono text-xs text-neutral-500 hover:text-black hover:underline">
                            All comparisons →
                        </Link>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {VS_PAGES.slice(0, 6).map((p) => (
                            <Link
                                key={p.competitor}
                                href={`/vs/${p.competitor}`}
                                className="inline-flex items-center gap-2 border border-black px-3 py-1.5 font-mono text-xs hover:bg-neutral-100 transition-colors"
                            >
                                Trackr vs {p.competitorName} →
                            </Link>
                        ))}
                    </div>
                </section>

                {/* ── Other ICP pages ── */}
                <section className="py-8 border-t border-black/10 mb-16">
                    <div className="flex items-center justify-between mb-5">
                        <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">Also built for</p>
                        <Link href="/for" className="font-mono text-xs text-neutral-500 hover:text-black hover:underline">
                            See all teams →
                        </Link>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {ICP_PAGES.filter((p) => p.role !== role).map((p) => (
                            <Link
                                key={p.role}
                                href={`/for/${p.role}`}
                                className="inline-flex items-center gap-2 border border-black px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-[#F3F3EF] transition-colors"
                            >
                                {p.role.replace(/-/g, " ")} <ArrowRight className="w-3 h-3" />
                            </Link>
                        ))}
                    </div>
                </section>

                <MarketingFooter />
            </main>
        </>
    );
}
