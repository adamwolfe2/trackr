import type { Metadata } from "next";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
    title: "About — Trackr",
    description: "Trackr helps operations teams research, evaluate, and track AI tools with intelligence — not spreadsheets.",
    alternates: {
        canonical: "https://trytrackr.com/about",
    },
    openGraph: {
        title: "About — Trackr",
        description: "Trackr helps operations teams research, evaluate, and track AI tools with intelligence — not spreadsheets.",
        type: "website",
        url: "https://trytrackr.com/about",
        images: [{ url: "/og.png", width: 1456, height: 816, alt: "About Trackr" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "About — Trackr",
        description: "Trackr helps operations teams research, evaluate, and track AI tools with intelligence — not spreadsheets.",
        images: ["/og.png"],
    },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Trackr",
    url: "https://trytrackr.com",
    logo: "https://trytrackr.com/logo.png",
    description: "AI tool research and intelligence platform for operations teams.",
    foundingDate: "2024",
    sameAs: [
        "https://twitter.com/trytrackr",
        "https://linkedin.com/company/trytrackr",
    ],
    contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: "https://trytrackr.com/audit",
    },
};

export default async function AboutPage() {
    const user = await currentUser();

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main className="flex-grow w-full max-w-6xl mx-auto px-6">
                <MarketingNavigation isLoggedIn={!!user} />

                <section className="py-20 border-t border-black/10">
                    <div className="max-w-3xl">
                        <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-4 block">About</span>
                        <h1 className="font-serif text-4xl md:text-5xl font-normal mb-6 leading-tight">
                            Built for ops teams who are tired of evaluating tools the slow way.
                        </h1>
                        <p className="font-mono text-sm text-neutral-600 leading-relaxed mb-4 max-w-2xl">
                            The average ops team spends 8–12 hours evaluating a single software tool. G2 reviews, vendor demos, internal Slack threads, spreadsheets — by the time a decision gets made, half the context is lost and no one remembers why.
                        </p>
                        <p className="font-mono text-sm text-neutral-600 leading-relaxed mb-12 max-w-2xl">
                            Trackr automates the research layer. Submit a tool URL, and our agents scrape the product site, pull community reviews, analyze competitor positioning, and return a structured report — scored against your team&apos;s specific criteria — in under 2 minutes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-black mb-16">
                        {[
                            { stat: "2 min", label: "Average research time per tool" },
                            { stat: "25+", label: "Data sources aggregated per report" },
                            { stat: "$2,000+", label: "Avg. annual research time saved per team" },
                        ].map((item, i) => (
                            <div key={item.stat} className={`p-8 ${i < 2 ? "border-b md:border-b-0 md:border-r border-black" : ""}`}>
                                <div className="font-serif text-4xl font-normal mb-2">{item.stat}</div>
                                <p className="font-mono text-xs text-neutral-500 leading-relaxed">{item.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* How Trackr works */}
                    <div className="mb-16">
                        <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4 block">How it works</span>
                        <h2 className="font-serif text-2xl font-normal mb-8">Three steps to a better tool decision</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-px border border-black bg-black">
                            {[
                                {
                                    step: "01",
                                    title: "Submit any tool URL",
                                    description: "Paste a vendor URL — product site, G2 page, or any public URL. Trackr's research agents take it from there.",
                                },
                                {
                                    step: "02",
                                    title: "Get a scored report in 2 minutes",
                                    description: "Agents scrape the site, pull 25+ review sources, analyze competitors, and synthesize a 7-dimension scorecard weighted to your criteria.",
                                },
                                {
                                    step: "03",
                                    title: "Decide together as a team",
                                    description: "Reports live in a shared workspace. Add notes, compare alternatives, track spend, and share findings — no more siloed Notion docs.",
                                },
                            ].map((s) => (
                                <div key={s.step} className="bg-[#F3F3EF] p-8">
                                    <div className="font-mono text-xs text-neutral-400 uppercase tracking-widest mb-3">{s.step}</div>
                                    <h3 className="font-serif text-xl font-normal mb-3">{s.title}</h3>
                                    <p className="font-mono text-xs text-neutral-600 leading-relaxed">{s.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="max-w-3xl space-y-8 mb-16">
                        <div>
                            <h2 className="font-serif text-2xl font-normal mb-3">What we believe</h2>
                            <p className="font-mono text-sm text-neutral-600 leading-relaxed">
                                The best tool decisions are made with consistent data, not vibes. When every evaluation uses the same scorecard — weighted to your team&apos;s actual priorities — you stop making decisions based on whoever gave the most recent demo.
                            </p>
                        </div>

                        {/* Who we serve */}
                        <div>
                            <h2 className="font-serif text-2xl font-normal mb-4">Who we serve</h2>
                            <p className="font-mono text-sm text-neutral-600 leading-relaxed mb-5">
                                Trackr is built for the people accountable for SaaS evaluation, spend management, and AI adoption decisions. See how we serve each role:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px border border-black bg-black">
                                {[
                                    { label: "Operations Leaders", href: "/for/ops-leaders" },
                                    { label: "IT & Procurement", href: "/for/procurement" },
                                    { label: "RevOps Teams", href: "/for/revops" },
                                    { label: "VPs of Strategy", href: "/for/vp-strategy" },
                                    { label: "Security Leaders", href: "/for/security-leaders" },
                                    { label: "All Use Cases", href: "/for" },
                                ].map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="bg-[#F3F3EF] px-6 py-4 font-mono text-sm hover:bg-white transition-colors flex items-center justify-between group"
                                    >
                                        <span>{item.label}</span>
                                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* VS comparisons */}
                        <div>
                            <h2 className="font-serif text-2xl font-normal mb-4">How Trackr compares</h2>
                            <p className="font-mono text-sm text-neutral-600 leading-relaxed mb-5">
                                Evaluating alternatives? We&apos;ve put together honest comparisons against the tools teams consider alongside Trackr.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: "vs. Notion", href: "/vs/notion" },
                                    { label: "vs. G2", href: "/vs/g2" },
                                    { label: "vs. Gartner Peer Insights", href: "/vs/gartner" },
                                    { label: "vs. ChatGPT", href: "/vs/chatgpt" },
                                    { label: "vs. Microsoft Copilot", href: "/vs/microsoft-copilot" },
                                ].map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="font-mono text-xs border border-black px-3 py-2 hover:bg-black hover:text-white transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/sign-up"
                            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 font-mono text-sm uppercase tracking-wide border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                        >
                            Get started free <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/audit"
                            className="inline-flex items-center gap-2 border border-black px-6 py-3 font-mono text-sm uppercase tracking-wide hover:bg-neutral-100 transition-colors"
                        >
                            Book an AI audit
                        </Link>
                    </div>
                </section>

                <MarketingFooter />
            </main>
        </>
    );
}
