import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Users, DollarSign, BarChart2, Search, Layers, Lightbulb, CalendarCheck, TrendingUp } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { USE_CASE_PAGES } from "@/data/use-cases.seed";

export const revalidate = false;

export const metadata: Metadata = {
    title: "Use Cases — How Teams Use Trackr | Trackr",
    description: "See how operations teams, RevOps leaders, finance teams, and founders use Trackr to research AI tools, cut SaaS waste, and build smarter stacks.",
    openGraph: {
        title: "Use Cases — How Teams Use Trackr",
        description: "See how operations teams, RevOps leaders, finance teams, and founders use Trackr to research AI tools, cut SaaS waste, and build smarter stacks.",
        url: "https://trytrackr.com/use-cases",
        images: [{ url: "/og.png", width: 1456, height: 816, alt: "Trackr Use Cases" }],
    },
    alternates: { canonical: "https://trytrackr.com/use-cases" },
    twitter: {
        card: "summary_large_image",
        title: "Use Cases — How Teams Use Trackr | Trackr",
        description: "See how operations teams, RevOps leaders, finance teams, and founders use Trackr to research AI tools, cut SaaS waste, and build smarter stacks.",
        images: ["/og.png"],
    },
    keywords: ["AI tool evaluation use cases", "SaaS evaluation", "ops team AI tools", "how to evaluate AI software", "tool research platform"],
};

const USE_CASES = [
    {
        number: "01",
        icon: CalendarCheck,
        headline: "Vendor Evaluation Before Renewal",
        description: "Your ops team has 60 days before a $40K contract renewal. Research every credible competitor in hours, not weeks — without scheduling a single demo.",
        whoFor: "RevOps & Ops Teams",
        link: "/for/revops",
        linkLabel: "See Trackr for RevOps",
    },
    {
        number: "02",
        icon: Search,
        headline: "New AI Tool Discovery",
        description: "Your team gets 10 inbound vendor pitches per week. Pre-qualify every tool with a scored report before committing your calendar to a discovery call.",
        whoFor: "Chiefs of Staff",
        link: "/for/chiefs-of-staff",
        linkLabel: "See Trackr for Chiefs of Staff",
    },
    {
        number: "03",
        icon: Layers,
        headline: "SaaS Stack Audit",
        description: "Surface duplicate tools, underutilized subscriptions, and redundant spend across your entire stack. Build the case for consolidation with data.",
        whoFor: "Finance Teams",
        link: "/for/procurement",
        linkLabel: "See Trackr for Procurement",
    },
    {
        number: "04",
        icon: BarChart2,
        headline: "Competitive Intelligence for Sales",
        description: "Your sales team needs to understand how your stack compares to what prospects actually use. Research their likely tooling before you get on the call.",
        whoFor: "RevOps",
        link: "/for/revops",
        linkLabel: "See Trackr for RevOps",
    },
    {
        number: "05",
        icon: TrendingUp,
        headline: "Post-Merger Technology Integration",
        description: "Two companies, two overlapping stacks. Evaluate where tooling duplicates and where there are genuine gaps — before you make any consolidation decisions.",
        whoFor: "IT Managers",
        link: "/for/ops-teams",
        linkLabel: "See Trackr for Ops Teams",
    },
    {
        number: "06",
        icon: Lightbulb,
        headline: "AI Implementation Roadmap",
        description: "Decide which AI tools to add in the next 90 days without wasting budget on the wrong bets. Research candidates, score them, and prioritize with confidence.",
        whoFor: "Founders",
        link: "/for/founders",
        linkLabel: "See Trackr for Founders",
    },
    {
        number: "07",
        icon: Users,
        headline: "Tool Research Without Demos",
        description: "Stop scheduling 45-minute demos for tools you haven't pre-qualified. Get scored reports that let you filter vendors before you ever commit to a call.",
        whoFor: "All roles",
        link: "/research",
        linkLabel: "Try the Research Library",
    },
    {
        number: "08",
        icon: DollarSign,
        headline: "Annual Budget Planning",
        description: "Build your SaaS budget with real data. See verified pricing tiers, feature gaps, and renewal forecasts before you finalize the number you present to the board.",
        whoFor: "Finance Teams",
        link: "/for/procurement",
        linkLabel: "See Trackr for Procurement",
    },
];

const QUOTES = [
    {
        quote: "We used to spend three weeks on a vendor evaluation — a Google Doc, a few demos, a lot of Slack debate. Trackr cut that to two days. Every dimension scored, sources cited, ready to present.",
        name: "Director of Operations",
        company: "Series B SaaS company, 140 employees",
    },
    {
        quote: "Our RevOps team was drowning in renewal deadlines. We had no system for knowing what we had, what was underused, or what the alternatives were. Trackr became the system.",
        name: "VP of Revenue Operations",
        company: "B2B services firm, 300 employees",
    },
    {
        quote: "I'm the one who has to defend every software line item to the CFO. Trackr gives me the report I need to justify a renewal or kill a contract. That used to take a week to build manually.",
        name: "Finance Manager",
        company: "Private equity portfolio company",
    },
];

const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "ItemList",
            name: "How Teams Use Trackr — 8 Use Cases",
            itemListElement: [
                { "@type": "ListItem", position: 1, name: "Vendor Evaluation Before Renewal", url: "https://trytrackr.com/for/revops" },
                { "@type": "ListItem", position: 2, name: "New AI Tool Discovery", url: "https://trytrackr.com/for/chiefs-of-staff" },
                { "@type": "ListItem", position: 3, name: "SaaS Stack Audit", url: "https://trytrackr.com/for/procurement" },
                { "@type": "ListItem", position: 4, name: "Competitive Intelligence for Sales", url: "https://trytrackr.com/for/revops" },
                { "@type": "ListItem", position: 5, name: "Post-Merger Technology Integration", url: "https://trytrackr.com/for/ops-teams" },
                { "@type": "ListItem", position: 6, name: "AI Implementation Roadmap", url: "https://trytrackr.com/for/founders" },
                { "@type": "ListItem", position: 7, name: "Tool Research Without Demos", url: "https://trytrackr.com/research" },
                { "@type": "ListItem", position: 8, name: "Annual Budget Planning", url: "https://trytrackr.com/for/procurement" },
            ],
        },
        {
            "@type": "BreadcrumbList",
            itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://trytrackr.com" },
                { "@type": "ListItem", position: 2, name: "Use Cases", item: "https://trytrackr.com/use-cases" },
            ],
        },
        {
            "@type": "FAQPage",
            mainEntity: [
                {
                    "@type": "Question",
                    name: "What is Trackr used for?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Trackr is used for AI tool research, SaaS stack auditing, vendor evaluation before renewals, and annual budget planning. Operations teams, RevOps leaders, finance teams, and founders use it to make faster, more defensible software decisions.",
                    },
                },
                {
                    "@type": "Question",
                    name: "How do operations teams use Trackr?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Operations teams use Trackr to evaluate vendor alternatives before contract renewals, audit their stack for duplicate or underutilized tools, and research inbound vendor pitches without scheduling demos. Reports cover 7 scored dimensions and are ready in under 2 minutes.",
                    },
                },
                {
                    "@type": "Question",
                    name: "How do finance teams use Trackr?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Finance teams use Trackr for SaaS stack audits, annual budget planning, and building the data needed to justify or cancel software renewals. Trackr surfaces verified pricing, license utilization signals, and consolidation opportunities.",
                    },
                },
                {
                    "@type": "Question",
                    name: "Can Trackr replace the vendor demo process?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Trackr replaces early-stage vendor demos by pre-qualifying tools with a scored 7-dimension report before you commit your calendar. Teams use Trackr to narrow a field of 10 vendors to 2 finalists, then schedule demos only for the tools that pass the threshold.",
                    },
                },
            ],
        },
    ],
};

export default function UseCasesPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
                <MarketingNavigation />

                {/* Hero */}
                <section className="py-20 border-t border-black/10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 border border-black px-3 py-1 mb-6">
                            <span className="font-mono text-[10px] uppercase tracking-widest">8 Use Cases</span>
                        </div>
                        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal leading-tight mb-6">
                            How teams use Trackr
                        </h1>
                        <p className="font-mono text-base text-neutral-600 mb-8 max-w-xl leading-relaxed">
                            From vendor evaluation to SaaS cost reduction — eight workflows where Trackr replaces manual research.
                        </p>
                    </div>
                </section>

                {/* Use cases grid */}
                <section className="pb-20 border-b border-black">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px border border-black bg-black">
                        {USE_CASES.map((uc) => {
                            const Icon = uc.icon;
                            return (
                                <div key={uc.number} className="bg-[#F3F3EF] p-8 flex flex-col">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-8 h-8 border border-black flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">{uc.number}</span>
                                            <h2 className="font-serif text-xl font-normal leading-snug">{uc.headline}</h2>
                                        </div>
                                    </div>
                                    <p className="font-mono text-[11px] text-neutral-600 leading-relaxed mb-4 flex-grow">
                                        {uc.description}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/10">
                                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                                            For: {uc.whoFor}
                                        </span>
                                        <Link
                                            href={uc.link}
                                            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest hover:underline"
                                        >
                                            {uc.linkLabel}
                                            <ArrowRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Quotes */}
                <section className="py-20 border-b border-black">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-10">From the field</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px border border-black bg-black">
                        {QUOTES.map((q, i) => (
                            <div key={i} className="bg-[#F3F3EF] p-8 flex flex-col">
                                <p className="font-serif text-base font-normal leading-relaxed text-neutral-800 mb-6 flex-grow">
                                    &ldquo;{q.quote}&rdquo;
                                </p>
                                <div className="border-t border-black/10 pt-4">
                                    <p className="font-mono text-[11px] font-bold text-neutral-700">{q.name}</p>
                                    <p className="font-mono text-[10px] text-neutral-400">{q.company}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Related pages */}
                <section className="py-20 border-b border-black">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-8">Explore by role or goal</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px border border-black bg-black">
                        {[
                            { label: "By role", description: "Landing pages tailored to RevOps, Finance, Founders, and IT.", href: "/for", cta: "Browse roles" },
                            { label: "Tool comparisons", description: "Side-by-side comparisons against specific competitors.", href: "/vs", cta: "See comparisons" },
                            { label: "Scorecard template", description: "The 7-dimension framework you can use manually or automate.", href: "/audit", cta: "Get the template" },
                            { label: "Stack audit", description: "Start with a free audit of your current SaaS stack.", href: "/audit", cta: "Start audit" },
                        ].map((item) => (
                            <div key={item.label} className="bg-[#F3F3EF] p-6 flex flex-col">
                                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">{item.label}</p>
                                <p className="font-mono text-[11px] text-neutral-600 leading-relaxed mb-4 flex-grow">{item.description}</p>
                                <Link
                                    href={item.href}
                                    className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest hover:underline"
                                >
                                    {item.cta}
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Deep Dive — detail pages */}
                <section className="py-20 border-b border-black">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Deep dive</p>
                            <h2 className="font-serif text-2xl font-normal">16 detailed use case guides</h2>
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 hidden sm:block">
                            Step-by-step walkthroughs
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px border border-black bg-black">
                        {USE_CASE_PAGES.map((uc) => (
                            <Link
                                key={uc.slug}
                                href={`/use-cases/${uc.slug}`}
                                className="group bg-[#F3F3EF] p-6 flex flex-col hover:bg-white transition-colors"
                            >
                                <h3 className="font-serif text-base font-normal leading-snug mb-2 group-hover:underline">
                                    {uc.headline}
                                </h3>
                                <p className="font-mono text-[11px] text-neutral-600 leading-relaxed mb-4 flex-grow">
                                    {uc.description}
                                </p>
                                <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400 group-hover:text-black transition-colors mt-auto">
                                    Read guide
                                    <ArrowRight className="w-3 h-3" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20">
                    <div className="border border-black p-10">
                        <div className="max-w-xl">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">Start for free</p>
                            <h2 className="font-serif text-3xl font-normal mb-4">
                                Ready to audit your stack?
                            </h2>
                            <p className="font-mono text-[11px] text-neutral-600 leading-relaxed mb-6">
                                Start with a free stack audit. No credit card required. See exactly where you&apos;re overpaying, where tools overlap, and which categories you&apos;re missing.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                    href="/audit"
                                    className="inline-flex items-center gap-2 bg-black text-white font-mono text-sm px-6 py-3 hover:bg-neutral-800 transition-colors"
                                >
                                    Start Free Audit
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/pricing"
                                    className="inline-flex items-center gap-2 border border-black font-mono text-sm px-6 py-3 hover:bg-black hover:text-white transition-colors"
                                >
                                    View Pricing
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <MarketingFooter />
            </main>
        </>
    );
}
