import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { VS_PAGES } from "@/data/vs-pages.seed";

export const revalidate = false;

export const metadata: Metadata = {
    title: "Software Alternatives — Compare & Research Tools | Trackr",
    description:
        "Browse alternatives to popular SaaS and AI tools. See how Trackr compares to G2, Capterra, ChatGPT, Gartner, and 40+ other tools used by ops teams.",
    keywords: [
        "software alternatives",
        "SaaS alternatives",
        "AI tool alternatives",
        "tool comparison",
        "G2 alternatives",
        "Capterra alternatives",
    ],
    openGraph: {
        title: "Software Alternatives — Compare & Research Tools | Trackr",
        description:
            "Browse alternatives to popular SaaS and AI tools. See how Trackr compares to G2, Capterra, ChatGPT, Gartner, and 40+ other tools used by ops teams.",
        url: "https://trytrackr.com/alternatives",
        images: [
            {
                url: "/og.png",
                width: 1456,
                height: 816,
                alt: "Software Alternatives — Trackr",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Software Alternatives — Compare & Research Tools | Trackr",
        description:
            "Browse alternatives to popular SaaS and AI tools. See how Trackr compares to G2, Capterra, ChatGPT, Gartner, and 40+ other tools used by ops teams.",
        images: ["/og.png"],
    },
    alternates: { canonical: "https://trytrackr.com/alternatives" },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "CollectionPage",
            name: "Software Alternatives",
            description:
                "Browse alternatives to popular SaaS and AI tools used by ops teams. Trackr provides AI-powered research to help teams find the best fit.",
            url: "https://trytrackr.com/alternatives",
        },
        {
            "@type": "BreadcrumbList",
            itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://trytrackr.com" },
                { "@type": "ListItem", position: 2, name: "Alternatives", item: "https://trytrackr.com/alternatives" },
            ],
        },
        {
            "@type": "ItemList",
            name: "Software Alternatives",
            itemListElement: VS_PAGES.map((page, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: `${page.competitorName} Alternatives`,
                url: `https://trytrackr.com/alternatives/${page.competitor}`,
            })),
        },
    ],
};

export default function AlternativesHubPage() {
    return (
        <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 pb-24">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <MarketingNavigation isLoggedIn={false} />

            <section className="pt-20 pb-12 border-t border-black/10">
                <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">
                    Alternatives
                </p>
                <h1 className="font-serif text-4xl md:text-5xl font-normal mb-4 max-w-2xl">
                    Software Alternatives
                </h1>
                <p className="font-mono text-sm text-neutral-600 max-w-xl leading-relaxed">
                    Browse alternatives to the tools ops teams are replacing in 2026.
                </p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                {VS_PAGES.map((page) => (
                    <Link
                        key={page.competitor}
                        href={`/alternatives/${page.competitor}`}
                        className="group border border-black p-6 bg-white hover:bg-[#F3F3EF] transition-colors block"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">
                                    alternatives to
                                </p>
                                <h2 className="font-serif text-xl font-normal">
                                    {page.competitorName} Alternatives
                                </h2>
                            </div>
                            <ArrowRight className="w-4 h-4 mt-1 text-neutral-400 group-hover:text-black transition-colors flex-shrink-0" />
                        </div>
                        <p className="font-mono text-xs text-neutral-500 leading-relaxed">
                            {page.competitorTagline}
                        </p>
                        <p className="font-mono text-xs text-neutral-700 mt-3">
                            Looking for {page.competitorName} alternatives? Most ops teams move to Trackr.
                        </p>
                    </Link>
                ))}
            </section>

            <section className="border border-black p-8 bg-white mb-16">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-3">
                    Why Trackr
                </p>
                <h2 className="font-serif text-2xl font-normal mb-4">
                    The alternative ops teams choose
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-sm text-neutral-600">
                    <div>
                        <p className="font-bold text-black mb-2">2-minute research</p>
                        <p className="leading-relaxed text-xs">
                            Submit any tool URL and get a scored 7-dimension report in under 2 minutes. No vendor
                            demos, no incentivized reviews, no outdated data.
                        </p>
                    </div>
                    <div>
                        <p className="font-bold text-black mb-2">Consistent scoring</p>
                        <p className="leading-relaxed text-xs">
                            Every tool scored on the same 7 dimensions: Core Capability, Ease of Use, Integration
                            Depth, Pricing Value, AI Sophistication, Community &amp; Support, Scalability.
                        </p>
                    </div>
                    <div>
                        <p className="font-bold text-black mb-2">Stack intelligence</p>
                        <p className="leading-relaxed text-xs">
                            Track your entire stack, monitor renewals, flag overlap, and get spend analytics — not
                            just point-in-time research, but ongoing intelligence.
                        </p>
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-black/10 flex flex-wrap gap-3">
                    <Link
                        href="/sign-up"
                        className="font-mono text-sm bg-black text-white border border-black px-6 py-3 inline-block hover:bg-neutral-800 transition-colors"
                    >
                        Try Trackr free
                    </Link>
                    <Link
                        href="/research"
                        className="font-mono text-sm border border-black px-6 py-3 inline-block hover:bg-[#F3F3EF] transition-colors"
                    >
                        Browse the tool library
                    </Link>
                    <Link
                        href="/audit"
                        className="font-mono text-sm border border-black px-6 py-3 inline-block hover:bg-[#F3F3EF] transition-colors"
                    >
                        Audit your stack
                    </Link>
                </div>
            </section>

            <MarketingFooter />
        </main>
    );
}
