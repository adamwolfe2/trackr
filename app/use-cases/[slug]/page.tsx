import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle, ArrowRight, Target } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { USE_CASE_PAGES, USE_CASE_SLUGS } from "@/data/use-cases.seed";

// Fully static — all 16 pages pre-rendered at build time
export const revalidate = false;

export async function generateStaticParams() {
    return USE_CASE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const page = USE_CASE_PAGES.find((p) => p.slug === slug);
    if (!page) return { title: "Not Found — Trackr" };

    return {
        title: page.title,
        description: page.description,
        openGraph: {
            title: page.title,
            description: page.description,
            url: `https://trytrackr.com/use-cases/${slug}`,
            images: [{ url: "/og.png", width: 1456, height: 816, alt: page.headline }],
        },
        alternates: { canonical: `https://trytrackr.com/use-cases/${slug}` },
        twitter: {
            card: "summary_large_image",
            title: page.title,
            description: page.description,
            images: ["/og.png"],
        },
    };
}

export default async function UseCaseDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const page = USE_CASE_PAGES.find((p) => p.slug === slug);
    if (!page) notFound();

    const relatedPages = USE_CASE_PAGES.filter((p) =>
        page.relatedUseCases.includes(p.slug)
    );

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
                    { "@type": "ListItem", position: 2, name: "Use Cases", item: "https://trytrackr.com/use-cases" },
                    { "@type": "ListItem", position: 3, name: page.headline, item: `https://trytrackr.com/use-cases/${slug}` },
                ],
            },
            {
                "@type": "HowTo",
                name: page.headline,
                description: page.description,
                step: page.steps.map((step, i) => ({
                    "@type": "HowToStep",
                    position: i + 1,
                    name: step.title,
                    text: step.description,
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
                <section className="py-20 border-t border-black/10">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-[10px] uppercase tracking-widest border border-black px-3 py-1">
                                Use Case
                            </span>
                            <Link
                                href="/use-cases"
                                className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 hover:text-black hover:underline"
                            >
                                All Use Cases
                            </Link>
                        </div>
                        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal mb-6 leading-tight">
                            {page.headline}
                        </h1>
                        <p className="font-mono text-base text-neutral-600 mb-8 max-w-xl leading-relaxed">
                            {page.subheadline}
                        </p>

                        {/* Stat block */}
                        <div className="inline-flex items-center gap-4 border border-black px-6 py-4 mb-8 bg-[#F3F3EF]">
                            <Target className="w-4 h-4 flex-shrink-0" />
                            <div>
                                <div className="font-mono text-2xl font-bold">{page.stat.value}</div>
                                <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                                    {page.stat.label}
                                </div>
                            </div>
                        </div>

                        {/* CTA buttons */}
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                            >
                                {page.ctaText}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/research"
                                className="inline-flex items-center gap-2 border border-black px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-[#F3F3EF] transition-colors"
                            >
                                Explore Tool Library
                            </Link>
                        </div>
                        <p className="font-mono text-[10px] text-neutral-400 mt-3">{page.ctaSubtext}</p>
                    </div>
                </section>

                {/* ── Steps (HowTo) ── */}
                <section className="py-14 border-t border-black/10">
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">How it works</p>
                    <h2 className="font-serif text-2xl font-normal mb-8">
                        Four steps to{" "}
                        <span className="lowercase">{page.headline.split(" ").slice(0, 4).join(" ")}</span>
                    </h2>
                    <div className="space-y-px border border-black">
                        {page.steps.map((step, i) => (
                            <div key={i} className="bg-[#F3F3EF] p-7 flex gap-6 items-start">
                                <div className="flex-shrink-0">
                                    <span className="font-mono text-xs font-bold text-neutral-300 leading-none">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-serif text-lg mb-2">{step.title}</h3>
                                    <p className="font-mono text-xs text-neutral-600 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Benefits ── */}
                <section className="py-14 border-t border-black/10">
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">Why it works</p>
                    <h2 className="font-serif text-2xl font-normal mb-8">What you get</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px border border-black bg-black">
                        {page.benefits.map((benefit, i) => (
                            <div key={i} className="bg-[#F3F3EF] p-6 flex flex-col">
                                <div className="flex items-start gap-3 mb-3">
                                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <h3 className="font-serif text-base leading-snug">{benefit.title}</h3>
                                </div>
                                <p className="font-mono text-xs text-neutral-600 leading-relaxed">
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Who This Is For ── */}
                <section className="py-14 border-t border-black/10">
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">Who this is for</p>
                    <h2 className="font-serif text-2xl font-normal mb-8">Built for teams who need to move fast</h2>
                    <div className="border border-black divide-y divide-black/10">
                        {page.whoFor.map((person, i) => (
                            <div key={i} className="bg-[#F3F3EF] px-6 py-4 flex items-start gap-4">
                                <span className="font-mono text-[10px] text-neutral-300 uppercase tracking-widest flex-shrink-0 mt-0.5">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <p className="font-mono text-xs text-neutral-700 leading-relaxed">{person}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── FAQs ── */}
                <section className="py-14 border-t border-black/10">
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">
                        Frequently asked
                    </p>
                    <h2 className="font-serif text-2xl font-normal mb-8">Questions about this use case</h2>
                    <div className="border border-black divide-y divide-black/10 max-w-3xl">
                        {page.faqs.map((faq, i) => (
                            <div key={i} className="bg-[#F3F3EF] p-6">
                                <h3 className="font-mono text-sm font-bold mb-3">{faq.q}</h3>
                                <p className="font-mono text-xs text-neutral-600 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Related Use Cases ── */}
                {relatedPages.length > 0 && (
                    <section className="py-14 border-t border-black/10">
                        <div className="flex items-center justify-between mb-6">
                            <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                                Related use cases
                            </p>
                            <Link
                                href="/use-cases"
                                className="font-mono text-xs text-neutral-500 hover:text-black hover:underline"
                            >
                                All 16 use cases →
                            </Link>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {relatedPages.map((related) => (
                                <Link
                                    key={related.slug}
                                    href={`/use-cases/${related.slug}`}
                                    className="inline-flex items-center gap-2 border border-black px-4 py-2 font-mono text-xs hover:bg-[#F3F3EF] transition-colors"
                                >
                                    {related.headline.split(":")[0].trim()}
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── CTA Block ── */}
                <section className="py-14 border-t border-black/10">
                    <div className="border border-black bg-black text-white p-10 max-w-3xl">
                        <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">Get started</p>
                        <h2 className="font-serif text-3xl font-normal mb-4 text-white">{page.headline}</h2>
                        <p className="font-mono text-sm text-neutral-400 mb-8 max-w-lg">{page.subheadline}</p>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-neutral-100 transition-colors"
                            >
                                {page.ctaText}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/research"
                                className="inline-flex items-center gap-2 border border-neutral-700 px-6 py-3 font-mono text-xs uppercase tracking-widest hover:border-white transition-colors text-white"
                            >
                                Explore Tool Library
                            </Link>
                        </div>
                        <p className="font-mono text-[10px] text-neutral-500 mt-4">{page.ctaSubtext}</p>
                    </div>
                </section>

                <MarketingFooter />
            </main>
        </>
    );
}
