import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const revalidate = false;

export const metadata: Metadata = {
    title: "2026 SaaS Spend Waste Report — How Much Are Teams Wasting? | Trackr",
    description: "Benchmark data on SaaS spending waste: average spend per employee, waste percentages by company size, AI vs traditional tool split, and cost reduction strategies.",
    openGraph: {
        title: "2026 SaaS Spend Waste Report",
        description: "How much is your team wasting on SaaS? Benchmarks by company size, category breakdowns, and waste reduction playbook.",
        url: "https://trytrackr.com/spend-report",
        images: [{ url: "/og.png", width: 1456, height: 816, alt: "2026 SaaS Spend Waste Report" }],
    },
    alternates: { canonical: "https://trytrackr.com/spend-report" },
};

const SPEND_BY_SIZE = [
    { size: "1–10 employees", perEmployee: "$1,200", totalRange: "$5K–$20K/yr", wastePct: "22%", topCategory: "Productivity & Comms" },
    { size: "11–50 employees", perEmployee: "$2,400", totalRange: "$50K–$150K/yr", wastePct: "28%", topCategory: "Sales & Marketing" },
    { size: "51–200 employees", perEmployee: "$3,100", totalRange: "$200K–$700K/yr", wastePct: "31%", topCategory: "Operations & Analytics" },
    { size: "201–500 employees", perEmployee: "$3,800", totalRange: "$700K–$2M/yr", wastePct: "34%", topCategory: "Security & Compliance" },
    { size: "500+ employees", perEmployee: "$4,600+", totalRange: "$2M+/yr", wastePct: "38%", topCategory: "Enterprise Platforms" },
];

const WASTE_CATEGORIES = [
    { category: "Zombie subscriptions", pct: "12%", description: "Tools nobody has logged into in 90+ days. The original champion left and the subscription runs on autopilot." },
    { category: "Over-licensed seats", pct: "9%", description: "30 seats licensed, 18 active. The classic procurement mistake nobody fixes at renewal." },
    { category: "Duplicate functionality", pct: "7%", description: "Three tools that all do enrichment. Two project management platforms. One for ops, one for engineering, never rationalized." },
    { category: "Unused tiers", pct: "4%", description: "Paying for Enterprise features the team has never used. Business tier would cover everything actually needed." },
    { category: "Expired trials never canceled", pct: "2%", description: "A trial that auto-converted to paid. Nobody remembers signing up." },
];

const AI_NATIVE_STATS = [
    { label: "AI-native tool spend as % of total (2026)", value: "34%" },
    { label: "AI-native share in 2024", value: "18%" },
    { label: "Expected AI-native share by 2027", value: "51%" },
    { label: "AI-native tools in average 50-person stack", value: "11 tools" },
    { label: "AI-native tools in average 50-person stack (2024)", value: "5 tools" },
    { label: "Cost per AI-native tool vs traditional", value: "2.1× higher" },
];

const REDUCTION_PLAYBOOK = [
    { step: "01", action: "Inventory audit", timeRequired: "4–8 hrs", savings: "Quick wins on zombie subscriptions — typically 10–15% of spend" },
    { step: "02", action: "Utilization check", timeRequired: "2–4 hrs", savings: "Right-size over-licensed tools — typically 5–10% additional savings" },
    { step: "03", action: "Overlap map", timeRequired: "3–5 hrs", savings: "Consolidate duplicates — high setup cost, 10–20% ongoing savings" },
    { step: "04", action: "Renewal negotiation", timeRequired: "1–2 hrs/tool", savings: "15–25% reduction on retained tools with competitive intelligence" },
    { step: "05", action: "Ongoing monitoring", timeRequired: "2 hrs/quarter", savings: "Prevents waste from regenerating; maintains 20–30% efficiency" },
];

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Report",
    name: "2026 SaaS Spend Waste Report",
    description: "Benchmark data on SaaS spending waste by company size, waste category breakdown, and AI vs traditional tool spend analysis.",
    author: { "@type": "Organization", name: "Trackr", url: "https://trytrackr.com" },
    datePublished: "2026-02-01",
    url: "https://trytrackr.com/spend-report",
};

export default function SpendReportPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
                <MarketingNavigation />

                {/* ── Hero ── */}
                <section className="py-20 border-t border-black/10">
                    <div className="flex items-center gap-2 mb-6 flex-wrap">
                        <span className="font-mono text-[10px] uppercase tracking-widest border border-black px-3 py-1">
                            Research Report
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                            February 2026
                        </span>
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal mb-6 max-w-3xl leading-tight">
                        The 2026 SaaS Spend Waste Report
                    </h1>
                    <p className="font-mono text-base text-neutral-600 mb-10 max-w-2xl leading-relaxed">
                        Benchmark data on how much companies are wasting on software — broken down by company size, waste category, and AI vs traditional tool split. With a five-step playbook for recovering the waste.
                    </p>

                    {/* Top-line stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px border border-black bg-black max-w-2xl mb-10">
                        {[
                            { value: "~30%", label: "Average waste rate" },
                            { value: "$3,100", label: "Avg SaaS spend/employee" },
                            { value: "34%", label: "AI-native share of spend" },
                            { value: "8 hrs", label: "Avg evaluation time saved" },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white px-5 py-4">
                                <div className="font-mono text-2xl font-bold mb-1">{stat.value}</div>
                                <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Spend by Company Size ── */}
                <section className="py-14 border-t border-black/10">
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">Section 01</p>
                    <h2 className="font-serif text-2xl font-normal mb-6">SaaS spend by company size (2026)</h2>
                    <div className="border border-black overflow-x-auto">
                        <table className="w-full font-mono text-xs border-collapse">
                            <thead>
                                <tr className="bg-black text-white">
                                    {["Company Size", "Spend / Employee / Year", "Total Annual Range", "Estimated Waste %", "Top Spend Category"].map((h) => (
                                        <th key={h} className="text-left p-3 font-normal uppercase tracking-widest text-[10px] border-r border-neutral-800 last:border-0">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {SPEND_BY_SIZE.map((row, i) => (
                                    <tr key={i} className="bg-white hover:bg-[#F3F3EF] transition-colors">
                                        <td className="p-3 border-r border-neutral-100 font-bold">{row.size}</td>
                                        <td className="p-3 border-r border-neutral-100">{row.perEmployee}</td>
                                        <td className="p-3 border-r border-neutral-100 text-neutral-500">{row.totalRange}</td>
                                        <td className="p-3 border-r border-neutral-100 font-bold">{row.wastePct}</td>
                                        <td className="p-3 text-neutral-500">{row.topCategory}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="font-mono text-[10px] text-neutral-400 mt-3">
                        Based on anonymized spend data and industry benchmarks. Figures represent medians across company types. AI-heavy startups typically run 20–40% above these figures.
                    </p>
                </section>

                {/* ── Where Waste Comes From ── */}
                <section className="py-14 border-t border-black/10">
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">Section 02</p>
                    <h2 className="font-serif text-2xl font-normal mb-2">Where the waste comes from</h2>
                    <p className="font-mono text-sm text-neutral-600 mb-8 max-w-xl">
                        The average 30% waste rate is made up of five identifiable patterns. Most are invisible without an active audit process.
                    </p>
                    <div className="space-y-px border border-black">
                        {WASTE_CATEGORIES.map((item) => (
                            <div key={item.category} className="bg-white p-5 flex flex-col sm:flex-row gap-4">
                                <div className="flex-shrink-0 sm:w-1/6">
                                    <div className="font-mono text-3xl font-bold mb-1">{item.pct}</div>
                                    <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">of total spend</div>
                                </div>
                                <div className="sm:flex-1">
                                    <h3 className="font-mono text-sm font-bold mb-1">{item.category}</h3>
                                    <p className="font-mono text-xs text-neutral-600 leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── AI Native vs Traditional ── */}
                <section className="py-14 border-t border-black/10">
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">Section 03</p>
                    <h2 className="font-serif text-2xl font-normal mb-6">AI-native vs traditional tool spend</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px border border-black bg-black mb-6">
                        {AI_NATIVE_STATS.map((stat) => (
                            <div key={stat.label} className="bg-white p-5">
                                <div className="font-mono text-2xl font-bold mb-2">{stat.value}</div>
                                <p className="font-mono text-[10px] text-neutral-500 leading-relaxed">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                    <div className="border border-black p-6 bg-[#F3F3EF] max-w-2xl">
                        <h3 className="font-mono text-sm font-bold mb-3">The AI-native premium is real — and growing</h3>
                        <p className="font-mono text-xs text-neutral-600 leading-relaxed">
                            AI-native tools cost 2.1× more per user than their traditional counterparts on average, but teams that evaluate carefully are reporting proportionally higher output gains. The category that justifies the premium most consistently: AI coding tools, where productivity gains of 2–4× are documented across multiple teams. The category with the worst ROI: AI writing tools purchased without clear use cases.
                        </p>
                    </div>
                </section>

                {/* ── Cost Reduction Playbook ── */}
                <section className="py-14 border-t border-black/10">
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">Section 04</p>
                    <h2 className="font-serif text-2xl font-normal mb-2">The 5-step cost reduction playbook</h2>
                    <p className="font-mono text-sm text-neutral-600 mb-8 max-w-xl">
                        Most teams can recover 15–30% of SaaS spend within one quarter. Here&apos;s the process.
                    </p>
                    <div className="space-y-px border border-black">
                        {REDUCTION_PLAYBOOK.map((item) => (
                            <div key={item.step} className="bg-white p-5 grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div>
                                    <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Step {item.step}</div>
                                    <div className="font-serif text-base">{item.action}</div>
                                </div>
                                <div>
                                    <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Time Required</div>
                                    <div className="font-mono text-xs">{item.timeRequired}</div>
                                </div>
                                <div className="sm:col-span-2">
                                    <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Expected Savings</div>
                                    <p className="font-mono text-xs text-neutral-600 leading-relaxed">{item.savings}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Methodology ── */}
                <section className="py-10 border-t border-black/10">
                    <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-4">Methodology</h2>
                    <p className="font-mono text-xs text-neutral-600 leading-relaxed max-w-2xl">
                        Spend benchmarks are derived from publicly available data, industry surveys, and anonymized aggregate signals from Trackr users. Waste percentages are median estimates across company types — individual company results vary significantly based on procurement maturity and stack complexity. AI-native classification uses Trackr&apos;s internal tool taxonomy: tools where AI is the primary value delivery mechanism, not a feature add-on.
                    </p>
                </section>

                {/* ── CTA ── */}
                <section className="py-14 border-t border-black/10 mb-4">
                    <div className="border border-black bg-black text-white p-10 max-w-3xl">
                        <p className="font-mono text-xs uppercase tracking-wider text-neutral-400 mb-3">Find your waste</p>
                        <h2 className="font-serif text-3xl font-normal mb-4 text-white">
                            How much is your stack wasting?
                        </h2>
                        <p className="font-mono text-sm text-neutral-400 mb-8 max-w-lg">
                            Add your tools to Trackr to see your AI Nativeness Score, estimated monthly spend, and stack optimization opportunities.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-neutral-100 transition-colors"
                            >
                                Audit My Stack Free →
                            </Link>
                            <Link
                                href="/scorecard"
                                className="inline-flex items-center gap-2 border border-neutral-700 px-6 py-3 font-mono text-xs uppercase tracking-widest hover:border-white transition-colors text-white"
                            >
                                Get the Scorecard <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </section>

                <MarketingFooter />
            </main>
        </>
    );
}
