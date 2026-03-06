import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen } from "lucide-react";
import { GLOSSARY_TERMS, GLOSSARY_SLUGS } from "@/data/glossary.seed";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const revalidate = false;

export async function generateStaticParams() {
    return GLOSSARY_SLUGS.map((term) => ({ term }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ term: string }>;
}): Promise<Metadata> {
    const { term: slug } = await params;
    const entry = GLOSSARY_TERMS.find((t) => t.slug === slug);
    if (!entry) return { title: "Not Found — Trackr" };

    return {
        title: `What is ${entry.term}? | Glossary | Trackr`,
        description: entry.definition,
        openGraph: {
            title: `What is ${entry.term}? | Glossary | Trackr`,
            description: entry.definition,
            url: `https://trytrackr.com/glossary/${slug}`,
            images: [{ url: "/og.png", width: 1456, height: 816, alt: `${entry.term} — Trackr Glossary` }],
        },
        twitter: {
            card: "summary_large_image" as const,
            title: `What is ${entry.term}?`,
            description: entry.definition,
            images: ["/og.png"],
        },
        alternates: { canonical: `https://trytrackr.com/glossary/${slug}` },
    };
}

export default async function GlossaryTermPage({
    params,
}: {
    params: Promise<{ term: string }>;
}) {
    const { term: slug } = await params;
    const entry = GLOSSARY_TERMS.find((t) => t.slug === slug);
    if (!entry) notFound();

    const relatedEntries = GLOSSARY_TERMS.filter((t) =>
        entry.relatedTerms.includes(t.slug)
    );

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "DefinedTerm",
                name: entry.term,
                description: entry.definition,
                url: `https://trytrackr.com/glossary/${slug}`,
            },
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Home", item: "https://trytrackr.com" },
                    { "@type": "ListItem", position: 2, name: "Glossary", item: "https://trytrackr.com/glossary" },
                    { "@type": "ListItem", position: 3, name: entry.term, item: `https://trytrackr.com/glossary/${slug}` },
                ],
            },
            {
                "@type": "FAQPage",
                mainEntity: entry.faqs.map(({ q, a }) => ({
                    "@type": "Question",
                    name: q,
                    acceptedAnswer: { "@type": "Answer", text: a },
                })),
            },
        ],
    };

    const paragraphs = entry.longDefinition.split("\n\n");

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
                <MarketingNavigation />

                {/* Breadcrumb */}
                <nav className="py-4 border-b border-black/10">
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                        <Link href="/" className="hover:text-black">Home</Link>
                        <span>/</span>
                        <Link href="/glossary" className="hover:text-black">Glossary</Link>
                        <span>/</span>
                        <span className="text-black">{entry.term}</span>
                    </div>
                </nav>

                {/* Hero */}
                <section className="py-20 border-b border-black/10">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-[10px] uppercase tracking-widest border border-black px-3 py-1">
                                Glossary
                            </span>
                        </div>
                        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal mb-6 leading-tight">
                            {entry.term}
                        </h1>
                        <p className="font-mono text-base text-neutral-600 leading-relaxed max-w-xl">
                            {entry.definition}
                        </p>
                    </div>
                </section>

                {/* Long Definition */}
                <section className="py-14 border-b border-black/10">
                    <div className="max-w-3xl space-y-6">
                        {paragraphs.map((p, i) => (
                            <p key={i} className="font-mono text-sm text-neutral-700 leading-relaxed">
                                {p}
                            </p>
                        ))}
                    </div>
                </section>

                {/* FAQs */}
                <section className="py-14 border-b border-black/10">
                    <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-6">
                        Frequently Asked Questions
                    </h2>
                    <div className="border border-black divide-y divide-neutral-100 max-w-3xl">
                        {entry.faqs.map((faq, i) => (
                            <div key={i} className="p-5">
                                <h3 className="font-mono text-sm font-bold mb-2">{faq.q}</h3>
                                <p className="font-mono text-xs text-neutral-600 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Related Terms */}
                {relatedEntries.length > 0 && (
                    <section className="py-8 border-b border-black/10">
                        <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-5">
                            Related terms
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {relatedEntries.map((t) => (
                                <Link
                                    key={t.slug}
                                    href={`/glossary/${t.slug}`}
                                    className="inline-flex items-center gap-2 border border-black px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-[#F3F3EF] transition-colors"
                                >
                                    {t.term} <ArrowRight className="w-3 h-3" />
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* CTA Block */}
                <section className="py-14 border-b border-black/10">
                    <div className="border border-black bg-black text-white p-10 max-w-3xl">
                        <p className="font-mono text-xs uppercase tracking-wider text-neutral-400 mb-3">
                            Research any tool
                        </p>
                        <h2 className="font-serif text-3xl font-normal mb-4 text-white">
                            Evaluate AI tools with independent research
                        </h2>
                        <p className="font-mono text-sm text-neutral-400 mb-8 max-w-lg leading-relaxed">
                            Submit any tool and get a scored 7-dimension report in 2 minutes. Free to start.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-neutral-100 transition-colors"
                            >
                                Get started free →
                            </Link>
                            <Link
                                href="/glossary"
                                className="inline-flex items-center gap-2 border border-neutral-700 px-6 py-3 font-mono text-xs uppercase tracking-widest hover:border-white transition-colors text-white"
                            >
                                Back to Glossary
                            </Link>
                        </div>
                    </div>
                </section>

                <div className="mb-16" />
                <MarketingFooter />
            </main>
        </>
    );
}
