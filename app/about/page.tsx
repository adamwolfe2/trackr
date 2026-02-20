import type { Metadata } from "next";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
    title: "About — Trackr",
    description: "Trackr helps operations teams research, evaluate, and track AI tools with intelligence — not spreadsheets.",
    openGraph: {
        title: "About — Trackr",
        description: "Trackr helps operations teams research, evaluate, and track AI tools with intelligence — not spreadsheets.",
        type: "website",
        url: "https://trytrackr.com/about",
    },
};

export default async function AboutPage() {
    const user = await currentUser();

    return (
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

                <div className="max-w-3xl space-y-8 mb-16">
                    <div>
                        <h2 className="font-serif text-2xl font-normal mb-3">What we believe</h2>
                        <p className="font-mono text-sm text-neutral-600 leading-relaxed">
                            The best tool decisions are made with consistent data, not vibes. When every evaluation uses the same scorecard — weighted to your team&apos;s actual priorities — you stop making decisions based on whoever gave the most recent demo.
                        </p>
                    </div>
                    <div>
                        <h2 className="font-serif text-2xl font-normal mb-3">Who uses Trackr</h2>
                        <p className="font-mono text-sm text-neutral-600 leading-relaxed">
                            Operations teams, procurement leads, and RevOps functions at companies from seed-stage startups to mid-market organizations. Teams that evaluate 5–50 tools per year and need a repeatable process that doesn&apos;t require a dedicated analyst.
                        </p>
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
    );
}
