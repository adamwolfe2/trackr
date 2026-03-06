import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { INDUSTRY_PAGES } from "@/data/industries.seed";

export const revalidate = false;

export const metadata: Metadata = {
    title: "AI Tools by Industry | Trackr",
    description: "Trackr for fintech, healthcare, ecommerce, SaaS, legal, real estate, manufacturing, agencies, consulting, and 11 more industries. See how AI tool intelligence works for your sector.",
    openGraph: {
        title: "AI Tools by Industry | Trackr",
        description: "Industry-specific AI tool research, spend tracking, and governance for 20 verticals — from fintech and healthcare to professional services and nonprofits.",
        url: "https://trytrackr.com/industries",
        images: [{ url: "/og.png", width: 1456, height: 816, alt: "AI Tools by Industry — Trackr" }],
    },
    alternates: { canonical: "https://trytrackr.com/industries" },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "ItemList",
            name: "AI Tool Intelligence by Industry",
            description: "Industry-specific AI tool research and spend tracking for 20 verticals",
            numberOfItems: INDUSTRY_PAGES.length,
            itemListElement: INDUSTRY_PAGES.map((page, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: page.title,
                url: `https://trytrackr.com/industries/${page.slug}`,
            })),
        },
        {
            "@type": "BreadcrumbList",
            itemListElement: [
                { "@type": "ListItem", position: 1, name: "Trackr", item: "https://trytrackr.com" },
                { "@type": "ListItem", position: 2, name: "Industries", item: "https://trytrackr.com/industries" },
            ],
        },
    ],
};

export default function IndustriesHubPage() {
    return (
        <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 pb-24">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <MarketingNavigation />

            {/* ── Hero ── */}
            <section className="pt-20 pb-12 border-t border-black/10">
                <div className="flex items-center gap-3 mb-6">
                    <span className="font-mono text-[10px] uppercase tracking-widest border border-black px-3 py-1">
                        By Industry
                    </span>
                </div>
                <h1 className="font-serif text-4xl md:text-5xl font-normal mb-4 max-w-2xl">
                    AI Tool Intelligence for Every Industry
                </h1>
                <p className="font-mono text-sm text-neutral-600 max-w-xl leading-relaxed">
                    AI tool research isn&apos;t one-size-fits-all. Compliance requirements, cost structures,
                    and evaluation criteria vary dramatically by vertical. See how Trackr is built for
                    your industry&apos;s specific needs.
                </p>
            </section>

            {/* ── Industry Grid ── */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px border border-black bg-black">
                {INDUSTRY_PAGES.map((page) => (
                    <Link
                        key={page.slug}
                        href={`/industries/${page.slug}`}
                        className="group bg-white hover:bg-[#F3F3EF] transition-colors block p-6"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                                <h2 className="font-serif text-lg font-normal mb-1 leading-snug">
                                    {page.slug
                                        .split("-")
                                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                        .join(" ")}
                                </h2>
                                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                                    {page.stat.value}{" "}
                                    <span className="normal-case tracking-normal">
                                        {page.stat.label.length > 50
                                            ? page.stat.label.slice(0, 50) + "…"
                                            : page.stat.label}
                                    </span>
                                </p>
                            </div>
                            <ArrowRight className="w-4 h-4 mt-1 text-neutral-300 group-hover:text-black transition-colors flex-shrink-0 ml-3" />
                        </div>
                        <p className="font-mono text-xs text-neutral-500 leading-relaxed line-clamp-2">
                            {page.subheadline}
                        </p>
                    </Link>
                ))}
            </section>

            {/* ── CTA Block ── */}
            <section className="mt-16 border border-black bg-black text-white p-10">
                <p className="font-mono text-xs uppercase tracking-wider text-neutral-400 mb-3">
                    Don&apos;t see your industry?
                </p>
                <h2 className="font-serif text-3xl font-normal mb-4 text-white">
                    Trackr works for any team managing AI tools
                </h2>
                <p className="font-mono text-sm text-neutral-400 mb-8 max-w-lg leading-relaxed">
                    Every plan starts free — 3 research reports per month, no credit card required.
                    Most teams find their core use case in the first session.
                </p>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/sign-up"
                        className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-neutral-100 transition-colors"
                    >
                        Start free →
                    </Link>
                    <Link
                        href="/for"
                        className="inline-flex items-center gap-2 border border-neutral-700 px-6 py-3 font-mono text-xs uppercase tracking-widest hover:border-white transition-colors text-white"
                    >
                        Browse by role instead
                    </Link>
                </div>
                <p className="font-mono text-[10px] text-neutral-500 mt-4">
                    Free tier includes 3 tool reports per month. No credit card required.
                </p>
            </section>

            <MarketingFooter />
        </main>
    );
}
