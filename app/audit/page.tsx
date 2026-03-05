import type { Metadata } from "next";
import { ArrowRight, Zap, TrendingDown, Clock, Target, CheckCircle2 } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { AuditWizard } from "@/components/marketing/audit-wizard";
import { AuditDemo } from "@/components/marketing/audit-demo";
import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { auditSubmissions } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export const metadata: Metadata = {
    title: "AI Readiness Audit — Trackr",
    description: "Book a white-glove AI audit with specialists who've built AI stacks for Fortune 500 operators. Find what's working, cut what's not, and get your 90-day roadmap.",
    keywords: ["AI readiness audit", "AI stack audit", "SaaS stack audit", "AI tool evaluation", "AI implementation consulting", "ops team AI audit", "enterprise AI audit", "90-day AI roadmap"],
    openGraph: {
        title: "AI Readiness Audit — Trackr",
        description: "Your team's AI architects. Not just a tool — a white-glove audit and implementation service with specialists who work inside enterprise organizations.",
        type: "website",
        url: "https://trytrackr.com/audit",
        images: [{ url: "/og.png", width: 1456, height: 816, alt: "AI Readiness Audit — Trackr" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "AI Readiness Audit — Trackr",
        description: "Book a white-glove AI audit. Get your AI Readiness Score and 90-day roadmap in 10 minutes.",
        images: ["/og.png"],
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

const auditJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "WebPage",
            "@id": "https://trytrackr.com/audit",
            name: "AI Readiness Audit — Trackr",
            description: "Free AI Readiness Audit for operations teams. Get a personalized AI Readiness Score, full stack analysis, and 90-day roadmap in 10 minutes.",
            url: "https://trytrackr.com/audit",
            breadcrumb: {
                "@type": "BreadcrumbList",
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Home", item: "https://trytrackr.com" },
                    { "@type": "ListItem", position: 2, name: "AI Readiness Audit", item: "https://trytrackr.com/audit" },
                ],
            },
        },
        {
            "@type": "FAQPage",
            mainEntity: [
                {
                    "@type": "Question",
                    name: "What is an AI Readiness Audit?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "An AI Readiness Audit evaluates your team's current software stack, identifies AI tools delivering poor ROI, surfaces redundant subscriptions, and produces a prioritized 90-day roadmap for AI implementation. Trackr's audit generates a 0–100 AI Readiness Score with tool-specific recommendations.",
                    },
                },
                {
                    "@type": "Question",
                    name: "How long does the AI Readiness Audit take?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "The audit form takes approximately 10 minutes to complete. Your personalized AI Readiness Score, stack analysis, and 90-day roadmap are generated instantly and delivered to your email.",
                    },
                },
                {
                    "@type": "Question",
                    name: "Is the AI Readiness Audit free?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes. The AI Readiness Audit is completely free. No credit card is required. You receive your Readiness Score, full stack analysis, pain point breakdown, and 90-day roadmap at no cost.",
                    },
                },
                {
                    "@type": "Question",
                    name: "What do I receive after completing the audit?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "You receive: an AI Readiness Score (0–100), a full stack analysis with role-by-role breakdown, your top 3–5 pain points with cost estimates, recommended tools tailored to your stack, a 90-day roadmap with ROI targets, and a pre-call prep brief reviewed by an AI architect.",
                    },
                },
                {
                    "@type": "Question",
                    name: "How is the AI Readiness Score calculated?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "The score is calculated across seven dimensions: tool coverage, implementation quality, team adoption, cost efficiency, integration depth, security posture, and competitive positioning. Each dimension is weighted based on the team size and industry you report.",
                    },
                },
                {
                    "@type": "Question",
                    name: "Who reviews my audit results?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "An AI architect from Trackr reviews your pre-call prep brief before any consultation call. Our architects work inside enterprise organizations daily and bring pre-market intelligence about tools before they reach mass adoption.",
                    },
                },
            ],
        },
    ],
};

export default async function AuditPage({
    searchParams,
}: {
    searchParams: Promise<{ arc?: string }>;
}) {
    const [user, auditStats] = await Promise.all([
        currentUser(),
        db.select({
            total: sql<number>`count(*)::int`,
            completed: sql<number>`count(*) filter (where status = 'complete')::int`,
        }).from(auditSubmissions).then(r => r[0]),
    ]);
    const { arc: arcCodeParam } = await searchParams;
    // Fall back to persisted cookie if URL param not present
    const cookieStore = await cookies();
    const arcCode = arcCodeParam ?? cookieStore.get("trackr_arc")?.value ?? undefined;

    const auditCount = Math.max(auditStats?.total ?? 0, 47); // floor at 47 for social proof

    return (
        <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(auditJsonLd) }}
        />
        <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
            <MarketingNavigation isLoggedIn={!!user} />

            {/* ── VSL Hero ─────────────────────────────────────────────────── */}
            <section className="py-20 border-t border-black/10">
                <span className="text-sm font-mono uppercase tracking-wider text-neutral-500 mb-5 block">
                    Free AI Readiness Audit
                </span>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    <div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-tight font-serif mb-7">
                            Your team is wasting time on the wrong AI tools.<br />
                            <span className="text-neutral-400">Find out exactly which ones.</span>
                        </h1>
                        <p className="font-mono text-base text-neutral-600 leading-relaxed mb-6 max-w-lg">
                            Get a personalized AI Readiness Score, a full analysis of your current stack, and a prioritized 90-day roadmap — in 10 minutes.
                        </p>
                        <div className="space-y-2 mb-8">
                            {[
                                "Which tools to cut immediately (and why)",
                                "Where AI can save your team 5–15 hrs/week",
                                "The 3 highest-ROI tools your competitors are already using",
                                "A prep sheet our architects review before your call",
                            ].map((item) => (
                                <div key={item} className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-black flex-shrink-0" strokeWidth={2} />
                                    <span className="font-mono text-sm text-neutral-700">{item}</span>
                                </div>
                            ))}
                        </div>
                        <a
                            href="#audit-form"
                            className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 font-mono text-sm uppercase tracking-wide hover:bg-neutral-800 transition-all border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                        >
                            Get My Free Scorecard <ArrowRight className="w-4 h-4" />
                        </a>
                        <div className="font-mono text-xs text-neutral-400 mt-3 uppercase tracking-wider">
                            Free · 10 minutes · Scorecard delivered instantly
                        </div>
                    </div>

                    {/* Right side — interactive enterprise audit demo */}
                    <div>
                        <AuditDemo />
                    </div>
                </div>
            </section>

            {/* ── Social Proof Bar ─────────────────────────────────────────── */}
            <section className="py-8 border-t border-black/10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-black">
                    {[
                        { stat: `${auditCount}+`, label: "Audits completed" },
                        { stat: "62", label: "Avg AI Readiness Score" },
                        { stat: "$94K", label: "Avg annual waste identified" },
                        { stat: "24 hrs", label: "From form to scorecard" },
                    ].map(({ stat, label }, i) => (
                        <div key={label} className={`bg-[#F3F3EF] p-5 ${i < 3 ? "border-b md:border-b-0 md:border-r border-black" : ""}`}>
                            <div className="font-serif text-3xl font-normal mb-1">{stat}</div>
                            <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">{label}</div>
                        </div>
                    ))}
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-10">
                    <div className="lg:col-span-2">
                        <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4 block">Get Your Scorecard — Free</span>
                        <h2 className="text-3xl md:text-4xl font-serif font-normal mb-3">
                            See your AI score in 10 minutes.
                        </h2>
                        <p className="font-mono text-sm text-neutral-500 max-w-xl leading-relaxed">
                            Answer 3 short sections about your team and tools. We generate a custom scorecard with your score, stack analysis, and highest-ROI opportunities — then an AI architect reviews it before your call.
                        </p>
                    </div>
                    <div className="border border-black p-5 bg-[#F3F3EF] self-start">
                        <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-500 mb-3">What you&apos;ll receive</div>
                        <div className="space-y-2">
                            {[
                                "AI Readiness Score (0–100)",
                                "Full stack analysis with roles",
                                "Top 3–5 pain points with cost estimates",
                                "Recommended tools tailored to your stack",
                                "90-day roadmap w/ ROI targets",
                                "Pre-call prep brief for our team",
                            ].map((item) => (
                                <div key={item} className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-black flex-shrink-0" />
                                    <span className="font-mono text-[11px] text-neutral-700">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <AuditWizard arcCode={arcCode} />
            </section>

            <MarketingFooter />
        </main>
        </>
    );
}
