import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { currentUser } from "@clerk/nextjs/server";
import { VS_PAGES } from "@/data/vs-pages.seed";

export const revalidate = false;

export const metadata: Metadata = {
    title: "Trackr vs Alternatives — How We Compare | Trackr",
    description: "How does Trackr compare to G2, Capterra, Vendr, Gartner, TrustRadius, ChatGPT, and spreadsheets? Side-by-side comparisons for every major alternative.",
    openGraph: {
        title: "Trackr vs Alternatives",
        description: "Detailed comparisons of Trackr against every major SaaS research and procurement alternative.",
        url: "https://trytrackr.com/vs",
    },
    alternates: { canonical: "https://trytrackr.com/vs" },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trackr", item: "https://trytrackr.com" },
        { "@type": "ListItem", position: 2, name: "Comparisons", item: "https://trytrackr.com/vs" },
    ],
};

export default async function VsHubPage() {
    const user = await currentUser();

    return (
        <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 pb-24">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <MarketingNavigation isLoggedIn={!!user} />

            <section className="pt-20 pb-12 border-t border-black/10">
                <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">
                    Comparisons
                </p>
                <h1 className="font-serif text-4xl md:text-5xl font-normal mb-4 max-w-2xl">
                    Trackr vs Alternatives
                </h1>
                <p className="font-mono text-sm text-neutral-600 max-w-xl leading-relaxed">
                    How does Trackr compare to every major alternative in the SaaS research and procurement landscape?
                    Detailed, honest comparisons — features, pricing, and when to use each.
                </p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {VS_PAGES.map((page) => (
                    <Link
                        key={page.competitor}
                        href={`/vs/${page.competitor}`}
                        className="group border border-black p-6 bg-white hover:bg-[#F3F3EF] transition-colors block"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">
                                    vs {page.competitorName}
                                </p>
                                <h2 className="font-serif text-xl font-normal">
                                    Trackr vs {page.competitorName}
                                </h2>
                            </div>
                            <ArrowRight className="w-4 h-4 mt-1 text-neutral-400 group-hover:text-black transition-colors flex-shrink-0" />
                        </div>
                        <p className="font-mono text-xs text-neutral-500 leading-relaxed">
                            {page.competitorTagline}
                        </p>
                        <p className="font-mono text-xs text-neutral-700 mt-3 font-medium">
                            {page.headline}
                        </p>
                    </Link>
                ))}
            </section>

            <section className="mt-16 border border-black p-8 bg-white">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-3">
                    The short answer
                </p>
                <h2 className="font-serif text-2xl font-normal mb-4">
                    Why teams choose Trackr
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-sm text-neutral-600">
                    <div>
                        <p className="font-bold text-black mb-2">2-minute research</p>
                        <p className="leading-relaxed text-xs">
                            Submit any tool URL and get a scored 7-dimension report in under 2 minutes. No vendor demos, no incentivized reviews, no outdated data.
                        </p>
                    </div>
                    <div>
                        <p className="font-bold text-black mb-2">Consistent framework</p>
                        <p className="leading-relaxed text-xs">
                            Every tool scored on the same 7 dimensions: Core Capability, Ease of Use, Integration Depth, Pricing Value, AI Sophistication, Community &amp; Support, Scalability.
                        </p>
                    </div>
                    <div>
                        <p className="font-bold text-black mb-2">Stack intelligence</p>
                        <p className="leading-relaxed text-xs">
                            Track your entire stack, monitor renewals, flag overlap, and get spend analytics — not just point-in-time research, but ongoing stack intelligence.
                        </p>
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-black/10">
                    <Link
                        href="/sign-up"
                        className="font-mono text-sm bg-black text-white border border-black px-6 py-3 inline-block hover:bg-neutral-800 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                    >
                        Try Trackr free
                    </Link>
                </div>
            </section>

            <MarketingFooter />
        </main>
    );
}
