import type { Metadata } from "next";
import { ArrowRight, Zap, TrendingDown, Clock, Target } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { AuditWizard } from "@/components/marketing/audit-wizard";
import { AuditDemo } from "@/components/marketing/audit-demo";
import { currentUser } from "@clerk/nextjs/server";

export const metadata: Metadata = {
    title: "AI Readiness Audit — Trackr",
    description: "Book a white-glove AI audit with specialists who've built AI stacks for Fortune 500 operators. Find what's working, cut what's not, and get your 90-day roadmap.",
    openGraph: {
        title: "AI Readiness Audit — Trackr",
        description: "Your team's AI architects. Not just a tool — a white-glove audit and implementation service with specialists who work inside enterprise organizations.",
        type: "website",
        url: "https://trytrackr.com/audit",
    },
    alternates: {
        canonical: "https://trytrackr.com/audit",
    },
};

const URGENCY_STATS = [
    {
        icon: TrendingDown,
        stat: "73%",
        label: "of AI implementations fail to deliver ROI within 6 months",
        source: "McKinsey, 2025",
    },
    {
        icon: Zap,
        stat: "8,000+",
        label: "AI tools launched in 2024 alone — and counting",
        source: "CB Insights",
    },
    {
        icon: Clock,
        stat: "14 hrs",
        label: "per week that ops leaders spend evaluating and managing tools manually",
        source: "Internal survey",
    },
    {
        icon: Target,
        stat: "$340B",
        label: "wasted annually on redundant and underutilized software",
        source: "Gartner, 2025",
    },
];

export default async function AuditPage() {
    const user = await currentUser();

    return (
        <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
            <MarketingNavigation isLoggedIn={!!user} />

            {/* ── VSL Hero ─────────────────────────────────────────────────── */}
            <section className="py-20 border-t border-black/10">
                <span className="text-sm font-mono uppercase tracking-wider text-neutral-500 mb-5 block">
                    White-Glove AI Audit
                </span>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    <div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-tight font-serif mb-7">
                            The AI race is happening now.<br />
                            <span className="text-neutral-400">Most operators are losing it.</span>
                        </h1>
                        <p className="font-mono text-base text-neutral-600 leading-relaxed mb-8 max-w-lg">
                            Former Fortune 500 CROs. Ex-Google, Meta, and Palantir operators. Even the most sophisticated technology leaders in the world admit they can&apos;t keep up with AI tools — and they&apos;re right.
                        </p>
                        <p className="font-mono text-base text-neutral-600 leading-relaxed mb-10 max-w-lg">
                            The solution isn&apos;t more research. It&apos;s having AI architects who live inside this space — who know what&apos;s working before it hits mass market — build your custom stack and get you running in days, not months.
                        </p>
                        <a
                            href="#audit-form"
                            className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 font-mono text-sm uppercase tracking-wide hover:bg-neutral-800 transition-all border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                        >
                            Start My AI Audit <ArrowRight className="w-4 h-4" />
                        </a>
                        <div className="font-mono text-xs text-neutral-400 mt-3 uppercase tracking-wider">
                            Takes 10 minutes · Our team reviews within 24 hours
                        </div>
                    </div>

                    {/* Right side — interactive enterprise audit demo */}
                    <div>
                        <AuditDemo />
                    </div>
                </div>
            </section>

            {/* ── Urgency Stats ─────────────────────────────────────────────── */}
            <section className="py-16 border-t border-black/10">
                <div className="mb-8">
                    <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">Why this matters right now</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-black">
                    {URGENCY_STATS.map((item, i) => (
                        <div key={item.stat} className={`p-6 ${i < URGENCY_STATS.length - 1 ? "border-b sm:border-b-0 sm:border-r border-black" : ""}`}>
                            <item.icon className="w-4 h-4 text-black mb-3" strokeWidth={1.5} />
                            <div className="text-4xl font-serif font-normal mb-2">{item.stat}</div>
                            <p className="font-mono text-[11px] text-neutral-600 leading-relaxed mb-2">{item.label}</p>
                            <div className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider">{item.source}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── What's different ──────────────────────────────────────────── */}
            <section className="py-16 border-t border-black/10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div>
                        <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4 block">Not like any other AI consultant</span>
                        <h2 className="text-3xl md:text-4xl font-serif font-normal mb-6">
                            We deploy tools inside organizations every day.
                        </h2>
                        <p className="font-mono text-sm text-neutral-500 leading-relaxed mb-6">
                            98% of AI demos fail in production. It&apos;s not the tool — it&apos;s the implementation. Our architects don&apos;t just recommend tools. They integrate them, train your team, and measure outcomes.
                        </p>
                        <p className="font-mono text-sm text-neutral-500 leading-relaxed">
                            We work with startups scaling from $1M to $50M ARR, and enterprise organizations optimizing $50M+ tech stacks. One playbook: find the highest-leverage tools for your specific team, eliminate redundancy, and track everything going forward.
                        </p>
                    </div>
                    <div className="space-y-0 border border-black">
                        {[
                            { label: "Custom to your org", body: "Your stack is different from every other company. We build your implementation from scratch — not from a template." },
                            { label: "Pre-market intelligence", body: "We track 500+ emerging tools every month. You get recommendations before they hit mass market — before your competitors find them." },
                            { label: "Reduces CAC, not just cost", body: "The goal isn't to cut spend blindly. It's to reallocate budget from tools that waste time to tools that directly accelerate revenue." },
                            { label: "Shared workspace, live tracking", body: "Your Trackr workspace becomes your team's living knowledge base. Every tool researched, scored, and tracked going forward." },
                        ].map((item, i) => (
                            <div key={item.label} className={`p-6 ${i < 3 ? "border-b border-black" : ""}`}>
                                <div className="font-serif text-base mb-2">{item.label}</div>
                                <p className="font-mono text-xs text-neutral-500 leading-relaxed">{item.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── The Audit Form ────────────────────────────────────────────── */}
            <section className="py-16 border-t border-black/10" id="audit-form">
                <div className="mb-10">
                    <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4 block">Start Here</span>
                    <h2 className="text-3xl md:text-4xl font-serif font-normal mb-3">
                        Complete your AI Readiness Audit.
                    </h2>
                    <p className="font-mono text-sm text-neutral-500 max-w-xl leading-relaxed">
                        10 minutes. Our AI architects review your answers before your call so every minute is spent on strategy, not discovery.
                    </p>
                </div>
                <AuditWizard />
            </section>

            <MarketingFooter />
        </main>
    );
}
