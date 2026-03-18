import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, Download } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const revalidate = false;

export const metadata: Metadata = {
    title: "AI Tool Scorecard Template — Free 7-Dimension Evaluation Framework | Trackr",
    description: "Free AI tool scorecard template based on our 7-dimension evaluation framework. Score any SaaS tool consistently in 15 minutes. Used by ops teams, RevOps, and founders.",
    keywords: ["AI tool scorecard", "SaaS evaluation template", "tool evaluation framework", "AI tool scoring", "software evaluation checklist", "7-dimension scorecard", "ops team tool evaluation"],
    openGraph: {
        title: "AI Tool Scorecard Template — Free 7-Dimension Framework",
        description: "Score any AI tool consistently in 15 minutes with this repeatable methodology.",
        url: "https://trytrackr.com/scorecard",
        images: [{ url: "/og.png", width: 1456, height: 816, alt: "AI Tool Scorecard Template" }],
    },
    alternates: { canonical: "https://trytrackr.com/scorecard" },
};

const DIMENSIONS = [
    {
        number: "01",
        name: "Core Capability",
        weight: "25%",
        description: "Does the tool do its one job exceptionally well? Score on feature depth, output quality, reliability, and roadmap momentum.",
        questions: ["Does it do the core job better than alternatives?", "Is the output quality consistent?", "How strong is the development roadmap?"],
    },
    {
        number: "02",
        name: "Ease of Use",
        weight: "15%",
        description: "How long until a new team member is productive without dedicated training?",
        questions: ["What's the time-to-first-value?", "How good is the documentation?", "How fast can you get support when stuck?"],
    },
    {
        number: "03",
        name: "Integration Depth",
        weight: "15%",
        description: "Does it talk to the tools you already use? Isolated tools create data silos.",
        questions: ["Does it connect natively to your current stack?", "How good is the API documentation?", "Is data sync bi-directional?"],
    },
    {
        number: "04",
        name: "Pricing Value",
        weight: "15%",
        description: "Is what you get worth what you pay? Do the math on cost vs. value delivered.",
        questions: ["What's the cost per seat vs. expected output?", "Is pricing transparent with no hidden fees?", "How does value scale with your team?"],
    },
    {
        number: "05",
        name: "AI Sophistication",
        weight: "15%",
        description: "How advanced are the AI capabilities vs. the competition? This separates tools that compound in value from ones that plateau.",
        questions: ["Which underlying models power it?", "Can you customize or fine-tune it?", "Does it learn and adapt over time?"],
    },
    {
        number: "06",
        name: "Community & Support",
        weight: "10%",
        description: "What happens when you're stuck? Strong communities mean faster problem-solving.",
        questions: ["What's the support response time?", "How active is the community?", "Are there third-party resources available?"],
    },
    {
        number: "07",
        name: "Scalability",
        weight: "5%",
        description: "Will this tool still work when you're 3× your current size?",
        questions: ["What does pricing look like at 2× scale?", "Are there enterprise security features?", "How healthy is the vendor?"],
    },
];

const SCORECARD_ROWS = [
    { dimension: "Core Capability (25%)", toolA: "", toolB: "", toolC: "" },
    { dimension: "Ease of Use (15%)", toolA: "", toolB: "", toolC: "" },
    { dimension: "Integration Depth (15%)", toolA: "", toolB: "", toolC: "" },
    { dimension: "Pricing Value (15%)", toolA: "", toolB: "", toolC: "" },
    { dimension: "AI Sophistication (15%)", toolA: "", toolB: "", toolC: "" },
    { dimension: "Community & Support (10%)", toolA: "", toolB: "", toolC: "" },
    { dimension: "Scalability (5%)", toolA: "", toolB: "", toolC: "" },
    { dimension: "WEIGHTED TOTAL", toolA: "", toolB: "", toolC: "" },
];

const FORMULA = "Score = (Core × 0.25) + (Ease × 0.15) + (Integrations × 0.15) + (Pricing × 0.15) + (AI × 0.15) + (Community × 0.10) + (Scale × 0.05)";

const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "HowTo",
            name: "How to Evaluate AI Tools: The 7-Dimension Scorecard",
            description: "A repeatable framework for evaluating any AI or SaaS tool consistently in 15 minutes.",
            estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
            step: DIMENSIONS.map((d, i) => ({
                "@type": "HowToStep",
                position: i + 1,
                name: d.name,
                text: d.description,
            })),
        },
        {
            "@type": "BreadcrumbList",
            itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://trytrackr.com" },
                { "@type": "ListItem", position: 2, name: "AI Tool Scorecard Template", item: "https://trytrackr.com/scorecard" },
            ],
        },
    ],
};

export default function ScorecardPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
                <MarketingNavigation />

                {/* ── Hero ── */}
                <section className="py-20 border-t border-black/10">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="font-mono text-[10px] uppercase tracking-widest border border-black px-3 py-1">
                                Free Template
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                                7-Dimension Framework
                            </span>
                        </div>
                        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal mb-6 leading-tight">
                            The AI Tool Scorecard Template
                        </h1>
                        <p className="font-mono text-base text-neutral-600 mb-8 max-w-xl leading-relaxed">
                            Score any AI or SaaS tool consistently in 15 minutes. Used by ops teams, RevOps managers, and founders to make defensible, data-driven tool decisions.
                        </p>
                        <div className="flex flex-wrap gap-3 mb-4">
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" /> Get the Free Scorecard
                            </Link>
                            <Link
                                href="/research"
                                className="inline-flex items-center gap-2 border border-black px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-[#F3F3EF] transition-colors"
                            >
                                See Automated Scores →
                            </Link>
                        </div>
                        <p className="font-mono text-[10px] text-neutral-400">Free. No credit card. Instant access.</p>
                    </div>
                </section>

                {/* ── Why the framework exists ── */}
                <section className="py-14 border-t border-black/10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        <div>
                            <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">The problem</p>
                            <h2 className="font-serif text-2xl font-normal mb-5">Most tool evaluations are broken</h2>
                            <div className="space-y-4 font-mono text-sm text-neutral-600 leading-relaxed">
                                <p>The typical SaaS evaluation: one person Googles the tool, skims the pricing page, watches a YouTube demo, and shares a Slack message saying &ldquo;looks good.&rdquo;</p>
                                <p>Three months later, everyone has a different opinion of whether it was the right call — and nobody has a record of why you chose it.</p>
                                <p>The root problem isn&apos;t effort. It&apos;s inconsistency. Without a standard framework, every evaluation uses different criteria, measured differently by different people, producing results that can&apos;t be compared.</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-4">What this scorecard gives you</p>
                            {[
                                "Repeatable scores your whole team can verify",
                                "Clear reasoning documented behind every score",
                                "Comparable output across different evaluators",
                                "A record you can revisit at renewal time",
                                "A framework that works for any tool category",
                                "Results in 15 minutes, not 8 hours",
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span className="font-mono text-sm text-neutral-700">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── The 7 Dimensions ── */}
                <section className="py-14 border-t border-black/10">
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">The framework</p>
                    <h2 className="font-serif text-2xl font-normal mb-8">7 dimensions. One consistent score.</h2>
                    <div className="space-y-px border border-black">
                        {DIMENSIONS.map((dim) => (
                            <div key={dim.number} className="grid grid-cols-1 md:grid-cols-4 bg-white">
                                <div className="p-5 border-b md:border-b-0 md:border-r border-neutral-100">
                                    <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">{dim.number}</div>
                                    <div className="font-serif text-base mb-1">{dim.name}</div>
                                    <div className="font-mono text-[10px] uppercase tracking-widest border border-black px-1.5 py-0.5 w-fit">{dim.weight}</div>
                                </div>
                                <div className="md:col-span-2 p-5 border-b md:border-b-0 md:border-r border-neutral-100">
                                    <p className="font-mono text-xs text-neutral-600 leading-relaxed">{dim.description}</p>
                                </div>
                                <div className="p-5">
                                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Score by asking</p>
                                    <ul className="space-y-1">
                                        {dim.questions.map((q, i) => (
                                            <li key={i} className="font-mono text-[10px] text-neutral-500 flex gap-1.5">
                                                <span className="text-black flex-shrink-0">·</span> {q}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── The Formula ── */}
                <section className="py-14 border-t border-black/10">
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">The calculation</p>
                    <h2 className="font-serif text-2xl font-normal mb-6">Weighted overall score</h2>
                    <div className="border border-black p-6 bg-[#F3F3EF] font-mono text-sm mb-6 leading-relaxed">
                        {FORMULA}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-px border border-black bg-black">
                        {[
                            { range: "8.0 – 10.0", label: "Best-in-class", desc: "Strong buy signal. Best option in the category." },
                            { range: "7.0 – 8.0", label: "Strong", desc: "Good choice. Minor trade-offs worth accepting." },
                            { range: "5.0 – 7.0", label: "Adequate", desc: "Works but has meaningful limitations to track." },
                        ].map((tier) => (
                            <div key={tier.range} className="bg-white p-5">
                                <div className="font-mono text-base font-bold mb-1">{tier.range}</div>
                                <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-2">{tier.label}</div>
                                <p className="font-mono text-xs text-neutral-600">{tier.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Printable Scorecard Preview ── */}
                <section className="py-14 border-t border-black/10">
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">The scorecard</p>
                    <h2 className="font-serif text-2xl font-normal mb-6">Fill this out for any tool you&apos;re evaluating</h2>
                    <div className="border border-black overflow-x-auto">
                        <table className="w-full font-mono text-xs border-collapse">
                            <thead>
                                <tr className="bg-black text-white">
                                    <th className="text-left p-3 font-normal uppercase tracking-widest text-[10px] border-r border-neutral-800 w-1/3">Dimension</th>
                                    <th className="text-center p-3 font-normal uppercase tracking-widest text-[10px] border-r border-neutral-800">Tool A</th>
                                    <th className="text-center p-3 font-normal uppercase tracking-widest text-[10px] border-r border-neutral-800">Tool B</th>
                                    <th className="text-center p-3 font-normal uppercase tracking-widest text-[10px]">Tool C</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {SCORECARD_ROWS.map((row, i) => (
                                    <tr key={i} className={row.dimension === "WEIGHTED TOTAL" ? "bg-[#F3F3EF] font-bold" : "bg-white"}>
                                        <td className="p-3 border-r border-neutral-100 text-neutral-600">{row.dimension}</td>
                                        <td className="p-3 border-r border-neutral-100 text-center text-neutral-300">—</td>
                                        <td className="p-3 border-r border-neutral-100 text-center text-neutral-300">—</td>
                                        <td className="p-3 text-center text-neutral-300">—</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="font-mono text-[10px] text-neutral-400 mt-3">Score each dimension 1–10, then apply the weighted formula above.</p>
                </section>

                {/* ── Automate It ── */}
                <section className="py-14 border-t border-black/10">
                    <div className="border border-black bg-black text-white p-10 max-w-3xl">
                        <p className="font-mono text-xs uppercase tracking-wider text-neutral-400 mb-3">Skip the manual work</p>
                        <h2 className="font-serif text-3xl font-normal mb-4 text-white">
                            Trackr fills this scorecard automatically
                        </h2>
                        <p className="font-mono text-sm text-neutral-400 mb-2 leading-relaxed max-w-lg">
                            Submit any tool URL. Research agents pull data from the vendor site, G2, Reddit, and Capterra, then populate every dimension with a score and written justification.
                        </p>
                        <p className="font-mono text-sm text-neutral-400 mb-8 leading-relaxed max-w-lg">
                            What takes 15 minutes manually takes 2 minutes with Trackr — with more data sources and consistent methodology.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-neutral-100 transition-colors"
                            >
                                Try It Free →
                            </Link>
                            <Link
                                href="/research"
                                className="inline-flex items-center gap-2 border border-neutral-700 px-6 py-3 font-mono text-xs uppercase tracking-widest hover:border-white transition-colors text-white"
                            >
                                See Sample Scores
                            </Link>
                        </div>
                    </div>
                </section>

                <MarketingFooter />
            </main>
        </>
    );
}
