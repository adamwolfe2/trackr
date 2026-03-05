import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const revalidate = false;

export const metadata: Metadata = {
    title: "The AI-Native Ops Playbook — How to Audit, Score & Optimize Your Stack | Trackr",
    description: "Step-by-step playbook for auditing your AI tool stack, scoring tools consistently, eliminating waste, and building an AI-native operations layer that scales.",
    keywords: ["AI ops playbook", "AI tool stack audit guide", "SaaS optimization playbook", "AI-native operations", "tool scoring methodology", "ops team AI guide", "RevOps playbook 2026"],
    openGraph: {
        title: "The AI-Native Ops Playbook",
        description: "How to audit, score, and optimize your AI stack. The complete guide for ops teams, RevOps managers, and founders.",
        url: "https://trytrackr.com/playbook",
        images: [{ url: "/og.png", width: 1456, height: 816, alt: "The AI-Native Ops Playbook" }],
    },
    alternates: { canonical: "https://trytrackr.com/playbook" },
};

const CHAPTERS = [
    { number: "01", title: "The AI-Native Stack Problem" },
    { number: "02", title: "The Audit: What You Actually Have" },
    { number: "03", title: "Scoring Tools with a Consistent Framework" },
    { number: "04", title: "Finding and Eliminating Waste" },
    { number: "05", title: "Building Your Evaluation Process" },
    { number: "06", title: "Managing Renewals with Competitive Intelligence" },
    { number: "07", title: "The AI Nativeness Score" },
    { number: "08", title: "Ongoing Stack Monitoring" },
];

const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "HowTo",
            name: "How to Audit, Score, and Optimize Your AI Stack",
            description: "A complete playbook for ops teams and founders to audit their SaaS stack, eliminate waste, and build an AI-native operations layer.",
            estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
            step: CHAPTERS.map((ch, i) => ({
                "@type": "HowToStep",
                position: i + 1,
                name: ch.title,
            })),
        },
        {
            "@type": "BreadcrumbList",
            itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://trytrackr.com" },
                { "@type": "ListItem", position: 2, name: "The AI-Native Ops Playbook", item: "https://trytrackr.com/playbook" },
            ],
        },
    ],
};

export default function PlaybookPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
                <MarketingNavigation />

                {/* ── Hero ── */}
                <section className="py-20 border-t border-black/10">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 mb-6 flex-wrap">
                            <span className="font-mono text-[10px] uppercase tracking-widest border border-black px-3 py-1">
                                Complete Playbook
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                                8 Chapters · ~25 min read
                            </span>
                        </div>
                        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal mb-6 leading-tight">
                            The AI-Native Ops Playbook
                        </h1>
                        <p className="font-mono text-base text-neutral-600 mb-8 max-w-2xl leading-relaxed">
                            How to audit your current stack, score every tool with a consistent framework, eliminate the 20–35% you&apos;re wasting, and build an AI-native operations layer that actually scales. Written for ops teams, RevOps managers, founders, and chiefs of staff.
                        </p>
                        <div className="flex flex-wrap gap-3 mb-8">
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                            >
                                Run This on Your Stack →
                            </Link>
                            <Link
                                href="/scorecard"
                                className="inline-flex items-center gap-2 border border-black px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-[#F3F3EF] transition-colors"
                            >
                                Get the Free Scorecard
                            </Link>
                        </div>

                        {/* Chapter index */}
                        <div className="border border-black p-6 bg-[#F3F3EF]">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">Chapters</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {CHAPTERS.map((ch) => (
                                    <div key={ch.number} className="flex items-baseline gap-3">
                                        <span className="font-mono text-[10px] text-neutral-400 flex-shrink-0">{ch.number}</span>
                                        <span className="font-mono text-xs text-neutral-700">{ch.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Chapter 01 ── */}
                <section className="py-14 border-t border-black/10">
                    <div className="max-w-3xl">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Chapter 01</p>
                        <h2 className="font-serif text-3xl font-normal mb-6">The AI-Native Stack Problem</h2>
                        <div className="space-y-4 font-mono text-sm text-neutral-600 leading-relaxed">
                            <p>
                                In 2023, the average 50-person company ran 15–20 SaaS tools. Today that number is 34 — and growing at roughly 2 new tools per quarter. The driver is AI. Every existing category now has an AI-native challenger. Every workflow that used to require manual work has a new tool promising to automate it.
                            </p>
                            <p>
                                The result: a stack that nobody fully understands. Tools bought by one team, used by another, billed to a credit card nobody monitors. AI tools that promise 10× productivity but require 10× more configuration than the sales deck suggested. Enterprise platforms with 80% of their features untouched.
                            </p>
                            <p>
                                This creates three compounding problems:
                            </p>
                        </div>
                        <div className="mt-6 space-y-px border border-black">
                            {[
                                { title: "Spend opacity", description: "Nobody knows the real monthly number. Tools are spread across personal credit cards, team budgets, and corporate cards. The actual figure is almost always 20–30% higher than anyone thinks." },
                                { title: "Evaluation debt", description: "Tools get bought based on demos, Twitter hype, or 'my last company used this.' Without a scoring framework, you can't compare options or justify decisions at renewal." },
                                { title: "AI sprawl", description: "AI tools are adopted faster than any previous software category, cost 2× more on average, and depreciate faster. The average AI writing tool purchased in 2023 has been replaced once. The market moves too fast for ad-hoc evaluation." },
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-5">
                                    <h3 className="font-mono text-sm font-bold mb-2">{item.title}</h3>
                                    <p className="font-mono text-xs text-neutral-600 leading-relaxed">{item.description}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 font-mono text-sm text-neutral-600 leading-relaxed space-y-4">
                            <p>
                                This playbook is the systematic fix. It turns stack management from a reactive, gut-feel process into a repeatable operation with documented decisions, consistent scoring, and ongoing visibility.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── Chapter 02 ── */}
                <section className="py-14 border-t border-black/10">
                    <div className="max-w-3xl">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Chapter 02</p>
                        <h2 className="font-serif text-3xl font-normal mb-6">The Audit: What You Actually Have</h2>
                        <div className="space-y-4 font-mono text-sm text-neutral-600 leading-relaxed">
                            <p>
                                The first step is inventory. Most teams underestimate their stack by 25–40% because tools are spread across payment methods and departments. Before you can optimize, you need to see everything.
                            </p>
                            <p>
                                Start with four data sources:
                            </p>
                        </div>
                        <div className="mt-6 space-y-px border border-black">
                            {[
                                { step: "01", action: "Pull bank and card statements", detail: "Export 90 days of transactions from every card that touches software. Filter for recurring charges, subscription platforms (Stripe, Paddle, Chargebee are common processors), and any line item with 'software', 'SaaS', 'subscription', or a recognizable tool name." },
                                { step: "02", action: "Check your SSO provider", detail: "If you use Okta, Google Workspace, or Entra ID, pull the full list of connected applications. This catches anything routed through SSO — often the most-used tools." },
                                { step: "03", action: "Survey department heads", detail: "A single question: 'List every tool your team uses in a typical week, including free tools and personal accounts.' The answers will surprise you. Shadow IT is real — tools get adopted without procurement." },
                                { step: "04", action: "Check browser extensions and app stores", detail: "Especially for AI-native tools: ChatGPT plugins, browser extensions, Chrome extensions, mobile app subscriptions. These get missed in card statement reviews." },
                            ].map((item) => (
                                <div key={item.step} className="bg-white p-5 flex gap-4">
                                    <span className="font-mono text-[10px] text-neutral-400 flex-shrink-0 mt-0.5">{item.step}</span>
                                    <div>
                                        <h3 className="font-mono text-sm font-bold mb-2">{item.action}</h3>
                                        <p className="font-mono text-xs text-neutral-600 leading-relaxed">{item.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 space-y-4 font-mono text-sm text-neutral-600 leading-relaxed">
                            <p>
                                For each tool you find, record: tool name, monthly cost, number of licensed seats, primary owner, and last known active user. This becomes your stack inventory.
                            </p>
                            <p>
                                Typical finding: 15–20% of tools have no active users in the last 90 days. These are candidates for immediate cancellation — no analysis required.
                            </p>
                        </div>

                        {/* CTA */}
                        <div className="mt-8 border border-black p-6 bg-[#F3F3EF]">
                            <p className="font-mono text-xs text-neutral-600 mb-3">
                                Trackr tracks all your tools in one place — costs, scores, categories, and renewal dates.
                            </p>
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                            >
                                Build Your Inventory Free →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── Chapter 03 ── */}
                <section className="py-14 border-t border-black/10">
                    <div className="max-w-3xl">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Chapter 03</p>
                        <h2 className="font-serif text-3xl font-normal mb-6">Scoring Tools with a Consistent Framework</h2>
                        <div className="space-y-4 font-mono text-sm text-neutral-600 leading-relaxed">
                            <p>
                                Once you have inventory, the next problem is evaluation. Most tool decisions fail not because teams don&apos;t care — they fail because different people use different criteria, measured differently, producing results that can&apos;t be compared.
                            </p>
                            <p>
                                The fix is a weighted scoring framework applied consistently to every tool. Here&apos;s the one we use (and that Trackr automates for every report):
                            </p>
                        </div>

                        {/* Score dimensions */}
                        <div className="mt-6 border border-black overflow-x-auto">
                            <table className="w-full font-mono text-xs border-collapse">
                                <thead>
                                    <tr className="bg-black text-white">
                                        <th className="text-left p-3 font-normal uppercase tracking-widest text-[10px] border-r border-neutral-800">Dimension</th>
                                        <th className="text-center p-3 font-normal uppercase tracking-widest text-[10px] border-r border-neutral-800 w-16">Weight</th>
                                        <th className="text-left p-3 font-normal uppercase tracking-widest text-[10px]">What to evaluate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {[
                                        { dim: "Core Capability", weight: "25%", what: "Does it do its one job better than alternatives? Output quality, feature depth, reliability." },
                                        { dim: "Ease of Use", weight: "15%", what: "Time-to-first-value. Documentation quality. Support responsiveness." },
                                        { dim: "Integration Depth", weight: "15%", what: "Native connectors to your stack. API quality. Bi-directional sync." },
                                        { dim: "Pricing Value", weight: "15%", what: "Cost per seat vs. output delivered. Pricing transparency. Value scaling with team size." },
                                        { dim: "AI Sophistication", weight: "15%", what: "Underlying model quality. Customization. Does it learn and adapt over time?" },
                                        { dim: "Community & Support", weight: "10%", what: "Support SLA. Community size. Third-party resources." },
                                        { dim: "Scalability", weight: "5%", what: "Pricing at 2× scale. Enterprise security features. Vendor health." },
                                    ].map((row, i) => (
                                        <tr key={i} className="bg-white hover:bg-[#F3F3EF] transition-colors">
                                            <td className="p-3 border-r border-neutral-100 font-bold">{row.dim}</td>
                                            <td className="p-3 border-r border-neutral-100 text-center">{row.weight}</td>
                                            <td className="p-3 text-neutral-500">{row.what}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 space-y-4 font-mono text-sm text-neutral-600 leading-relaxed">
                            <p>
                                Score each dimension 1–10 with written justification. Apply weights. The formula:
                            </p>
                        </div>
                        <div className="mt-3 border border-black p-4 bg-[#F3F3EF] font-mono text-xs leading-relaxed">
                            Score = (Core × 0.25) + (Ease × 0.15) + (Integrations × 0.15) + (Pricing × 0.15) + (AI × 0.15) + (Community × 0.10) + (Scale × 0.05)
                        </div>
                        <div className="mt-6 space-y-4 font-mono text-sm text-neutral-600 leading-relaxed">
                            <p>
                                Interpreting scores: 8.0+ is best-in-class. 7.0–8.0 is strong with minor trade-offs. 5.0–7.0 is adequate. Below 5.0 warrants active replacement research.
                            </p>
                            <p>
                                The key discipline: write down the reasoning behind every score. The score itself matters less than having documentation you can review at renewal time. &ldquo;We scored this 6.5 on integrations because it doesn&apos;t have a native HubSpot connector&rdquo; is actionable. A naked number isn&apos;t.
                            </p>
                        </div>

                        {/* CTA */}
                        <div className="mt-8 border border-black p-6 bg-[#F3F3EF]">
                            <p className="font-mono text-xs text-neutral-600 mb-3">
                                Trackr runs this scorecard automatically on any tool — submit a URL and get a full 7-dimension report in 2 minutes.
                            </p>
                            <Link
                                href="/research"
                                className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                            >
                                Score a Tool Now →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── Chapter 04 ── */}
                <section className="py-14 border-t border-black/10">
                    <div className="max-w-3xl">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Chapter 04</p>
                        <h2 className="font-serif text-3xl font-normal mb-6">Finding and Eliminating Waste</h2>
                        <div className="space-y-4 font-mono text-sm text-neutral-600 leading-relaxed">
                            <p>
                                Once you have inventory and scores, the waste becomes visible. There are five categories of waste, each requiring a different response:
                            </p>
                        </div>
                        <div className="mt-6 space-y-px border border-black">
                            {[
                                {
                                    category: "Zombie subscriptions",
                                    pct: "~12%",
                                    response: "Cancel immediately. No analysis needed. Tools with zero logins in 90+ days have no constituency to manage. The original champion left; the subscription runs on autopilot. Set a calendar reminder to check the tools list quarterly for new zombies.",
                                },
                                {
                                    category: "Over-licensed seats",
                                    pct: "~9%",
                                    response: "Downgrade seats at renewal. Pull the active user list from the tool's admin console. If 30 seats are licensed and 18 are active, negotiate renewal at 20 seats (with a provision to add more). Most vendors will accept this rather than lose the account.",
                                },
                                {
                                    category: "Duplicate functionality",
                                    pct: "~7%",
                                    response: "This requires a decision. When two tools do the same job, score both using the 7-dimension framework and eliminate the lower scorer. The complication: different teams often have different needs from the same category. The solution is consolidation through a clear 'primary tool per category' policy, with exceptions requiring explicit approval.",
                                },
                                {
                                    category: "Unused tier features",
                                    pct: "~4%",
                                    response: "Downgrade to a tier that matches actual usage. Pull the feature audit from the tool's settings page — most enterprise platforms show which features your workspace has enabled vs. available. If you're on Enterprise for one SSO feature, there's usually a Business tier that covers it.",
                                },
                                {
                                    category: "Expired trials",
                                    pct: "~2%",
                                    response: "Cancel. These typically slip through because someone signed up with a personal card that also has personal charges on it. The discipline fix: require all software purchases to go through a dedicated software procurement card that's reviewed monthly.",
                                },
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-5 grid grid-cols-1 sm:grid-cols-4 gap-4">
                                    <div>
                                        <div className="font-mono text-2xl font-bold mb-1">{item.pct}</div>
                                        <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">of total spend</div>
                                    </div>
                                    <div className="sm:col-span-3">
                                        <h3 className="font-mono text-sm font-bold mb-2">{item.category}</h3>
                                        <p className="font-mono text-xs text-neutral-600 leading-relaxed">{item.response}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 space-y-4 font-mono text-sm text-neutral-600 leading-relaxed">
                            <p>
                                Running all five categories in a single quarter typically recovers 20–35% of total SaaS spend. The savings compound: money recovered in Q1 funds better tool evaluations in Q2.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── Chapter 05 ── */}
                <section className="py-14 border-t border-black/10">
                    <div className="max-w-3xl">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Chapter 05</p>
                        <h2 className="font-serif text-3xl font-normal mb-6">Building Your Evaluation Process</h2>
                        <div className="space-y-4 font-mono text-sm text-neutral-600 leading-relaxed">
                            <p>
                                The audit fixes existing waste. The evaluation process prevents future waste. Without a standard process, every tool purchase is ad hoc — and ad hoc decisions compound into the same sprawl you just cleaned up.
                            </p>
                            <p>
                                A lightweight evaluation process has five stages:
                            </p>
                        </div>
                        <div className="mt-6 space-y-px border border-black">
                            {[
                                {
                                    stage: "01 — Request",
                                    time: "Day 1",
                                    description: "Anyone can request a new tool. The request must include: problem being solved, estimated monthly cost, 2+ alternatives considered, expected number of users. This friction filters out impulse purchases without creating bureaucracy.",
                                },
                                {
                                    stage: "02 — Research",
                                    time: "Days 2–4",
                                    description: "Run the 7-dimension scorecard on the top 2–3 candidates. Include Reddit, G2, and Capterra reviews in addition to vendor documentation. Score all candidates to produce a comparable output. Document reasons for any score below 6.",
                                },
                                {
                                    stage: "03 — Trial",
                                    time: "Days 5–14",
                                    description: "Most tools offer a 14-day trial. Define success criteria before starting: what specific outcome would make this tool worth the cost? At day 14, score the tool against the trial criteria. If you can't define success criteria upfront, that's a signal the purchase isn't justified yet.",
                                },
                                {
                                    stage: "04 — Decision",
                                    time: "Day 15",
                                    description: "Document the decision: tool selected, score, specific rationale for key dimensions, renewal date, designated owner. The owner is responsible for monitoring utilization and renewing or canceling at renewal date.",
                                },
                                {
                                    stage: "05 — Review",
                                    time: "90-day and annual",
                                    description: "90-day check: is utilization meeting projections? Annual renewal: re-run the scorecard and compare scores to alternatives now available. The market moves fast — a tool that scored 8.5 in 2024 may be outclassed by a 9.2 that launched in 2025.",
                                },
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-5 flex gap-4">
                                    <div className="flex-shrink-0 w-20">
                                        <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-1">{item.time}</div>
                                        <div className="font-mono text-xs font-bold">{item.stage.split("—")[0].trim()}</div>
                                    </div>
                                    <div>
                                        <h3 className="font-mono text-sm font-bold mb-2">{item.stage.split("—")[1]?.trim()}</h3>
                                        <p className="font-mono text-xs text-neutral-600 leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 space-y-4 font-mono text-sm text-neutral-600 leading-relaxed">
                            <p>
                                This process adds 2–3 days to the average tool purchase. That friction is the point. Tools bought fast are often canceled fast. Tools bought with documentation get used — and renewed or canceled based on evidence.
                            </p>
                        </div>

                        {/* CTA */}
                        <div className="mt-8 border border-black p-6 bg-[#F3F3EF]">
                            <p className="font-mono text-xs text-neutral-600 mb-3">
                                Trackr&apos;s research agents run stage 02 (Research) in 2 minutes — 7-dimension report from vendor site, G2, Reddit, and Capterra.
                            </p>
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                            >
                                Run This on Your Stack →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── Chapter 06 ── */}
                <section className="py-14 border-t border-black/10">
                    <div className="max-w-3xl">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Chapter 06</p>
                        <h2 className="font-serif text-3xl font-normal mb-6">Managing Renewals with Competitive Intelligence</h2>
                        <div className="space-y-4 font-mono text-sm text-neutral-600 leading-relaxed">
                            <p>
                                Renewal conversations are the highest-leverage cost reduction opportunity most teams miss. Vendors know that switching costs are real — and they price accordingly, counting on inertia to push through 10–15% price increases.
                            </p>
                            <p>
                                The counter-strategy is competitive intelligence. 60–90 days before renewal, run a fresh research cycle:
                            </p>
                        </div>
                        <div className="mt-6 space-y-3">
                            {[
                                "Re-score the current tool using the 7-dimension framework. Has the score changed? What features have shipped or broken?",
                                "Research the top 2 competitors in the same category. Get their current pricing and scores.",
                                "Calculate your fully-loaded switching cost: migration time, productivity dip during transition, integration rebuild work.",
                                "Compare: (current vendor renewal price) vs. (competitor price − switching cost). If the gap is positive, you have a negotiating lever.",
                                "Enter the renewal call with competitor quotes and a willingness to switch. Most vendors will offer 10–20% to retain the account.",
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <p className="font-mono text-sm text-neutral-600">{item}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 space-y-4 font-mono text-sm text-neutral-600 leading-relaxed">
                            <p>
                                Teams that run this process consistently report 15–25% savings on retained tools at renewal. On a $200K annual SaaS spend, that&apos;s $30–50K per year from renewals alone.
                            </p>
                            <p>
                                The key enabler: having the competitive research ready before the negotiation starts. Vendors know when you haven&apos;t done your homework. Walking in with specific competitor pricing and documented scores communicates that you&apos;re a sophisticated buyer — and that inertia won&apos;t save them.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── Chapter 07 ── */}
                <section className="py-14 border-t border-black/10">
                    <div className="max-w-3xl">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Chapter 07</p>
                        <h2 className="font-serif text-3xl font-normal mb-6">The AI Nativeness Score</h2>
                        <div className="space-y-4 font-mono text-sm text-neutral-600 leading-relaxed">
                            <p>
                                Beyond individual tool scores, there&apos;s a portfolio-level question: how AI-native is your stack? This matters for three reasons.
                            </p>
                        </div>
                        <div className="mt-6 space-y-px border border-black">
                            {[
                                { title: "Productivity compounding", description: "AI-native tools tend to compound in value over time as they learn from usage patterns and improve their models. Traditional tools depreciate in relative value as AI-native challengers enter the category." },
                                { title: "Integration patterns", description: "AI-native stacks integrate differently. Where traditional tools exchange data via webhooks, AI-native tools increasingly exchange context — prompts, embeddings, and structured outputs that compound across tools. A stack optimized for this pattern has structural advantages over one that isn't." },
                                { title: "Talent signal", description: "The AI tools your team uses are a signal to candidates. Engineering teams that use Cursor, Linear, and Retool send a different message than teams still on Jira and generic text editors. Tool choices affect hiring." },
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-5">
                                    <h3 className="font-mono text-sm font-bold mb-2">{item.title}</h3>
                                    <p className="font-mono text-xs text-neutral-600 leading-relaxed">{item.description}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 space-y-4 font-mono text-sm text-neutral-600 leading-relaxed">
                            <p>
                                Measuring AI nativeness: classify each tool in your stack as AI-native (AI is the primary value delivery mechanism, not a feature add-on), AI-enhanced (traditional tool with meaningful AI features), or traditional (no meaningful AI layer).
                            </p>
                            <p>
                                Compute: AI-native tools / total tools × 100. In 2026, the median 50-person tech company sits around 32%. Best-in-class AI-native companies run at 55–65%. The target depends on your industry and team composition — engineering teams skew higher, established enterprise teams skew lower.
                            </p>
                            <p>
                                The more important question isn&apos;t the raw percentage — it&apos;s the trajectory. Is your AI Nativeness Score increasing? If you&apos;re still at the same level as 18 months ago, the market has moved and you haven&apos;t.
                            </p>
                        </div>
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-px border border-black bg-black">
                            {[
                                { range: "55–100", label: "AI-Native", desc: "Leading edge. Likely capturing compounding productivity gains. Review for over-adoption risk." },
                                { range: "30–54", label: "Transitioning", desc: "The current median for tech companies. Meaningful AI adoption underway." },
                                { range: "0–29", label: "Traditional", desc: "Exposure to AI-native competitive displacement in key categories. Prioritize high-ROI categories first." },
                            ].map((tier) => (
                                <div key={tier.range} className="bg-white p-5">
                                    <div className="font-mono text-base font-bold mb-1">{tier.range}</div>
                                    <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-2">{tier.label}</div>
                                    <p className="font-mono text-xs text-neutral-600">{tier.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Chapter 08 ── */}
                <section className="py-14 border-t border-black/10">
                    <div className="max-w-3xl">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Chapter 08</p>
                        <h2 className="font-serif text-3xl font-normal mb-6">Ongoing Stack Monitoring</h2>
                        <div className="space-y-4 font-mono text-sm text-neutral-600 leading-relaxed">
                            <p>
                                The audit and evaluation process are events. Ongoing monitoring is the operating system. Without it, the stack decays back to its previous state within 2–3 quarters.
                            </p>
                            <p>
                                The monitoring cadence:
                            </p>
                        </div>
                        <div className="mt-6 space-y-px border border-black">
                            {[
                                {
                                    freq: "Weekly",
                                    action: "AI tools news scan",
                                    detail: "15 minutes. What launched this week in your key categories? New tools from Product Hunt, AI-specific newsletters, your competitive set. The market moves fast enough that a monthly cadence misses meaningful category shifts.",
                                },
                                {
                                    freq: "Monthly",
                                    action: "Spend and utilization review",
                                    detail: "30 minutes. Current total spend vs. budget. Any tools added or canceled. Utilization check on the 5 most expensive tools. Any tools that crossed the 90-day inactivity threshold this month.",
                                },
                                {
                                    freq: "Quarterly",
                                    action: "Full inventory and waste audit",
                                    detail: "2–4 hours. Full repeat of the initial audit process. Re-score any tool whose context has changed significantly. Update the evaluation pipeline for upcoming renewals. Check AI Nativeness Score trend.",
                                },
                                {
                                    freq: "Annual",
                                    action: "Stack rationalization",
                                    detail: "Full-day exercise with stakeholders. Re-score every significant tool in the stack. Identify the 3–5 highest-impact category changes to make in the next 12 months. Set budget and AI Nativeness Score targets for next year.",
                                },
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-5 flex gap-4">
                                    <div className="flex-shrink-0 w-20">
                                        <div className="font-mono text-xs font-bold text-neutral-800">{item.freq}</div>
                                    </div>
                                    <div>
                                        <h3 className="font-mono text-sm font-bold mb-2">{item.action}</h3>
                                        <p className="font-mono text-xs text-neutral-600 leading-relaxed">{item.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 space-y-4 font-mono text-sm text-neutral-600 leading-relaxed">
                            <p>
                                The total time investment: roughly 2 hours per month plus one quarterly half-day. For a stack that runs $100K+ annually, that&apos;s an exceptionally high-ROI use of time — equivalent to recovering 10–15× the cost of the monitoring effort in waste reduction and better tool selection.
                            </p>
                            <p>
                                The key enabler for making monitoring sustainable is tooling. Manual spreadsheet-based monitoring degrades quickly because it relies on one person maintaining discipline across dozens of tools. Systems that automatically track costs, flag renewals, and surface utilization data reduce the per-tool overhead to near zero.
                            </p>
                        </div>

                        {/* CTA */}
                        <div className="mt-8 border border-black p-6 bg-[#F3F3EF]">
                            <p className="font-mono text-xs text-neutral-600 mb-3">
                                Trackr handles the weekly AI news scan automatically — your feed surfaces relevant tool launches and category news for your stack.
                            </p>
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                            >
                                Set Up Your Stack Monitor →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── TL;DR Summary ── */}
                <section className="py-14 border-t border-black/10">
                    <div className="max-w-3xl">
                        <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">TL;DR</p>
                        <h2 className="font-serif text-2xl font-normal mb-6">The 8-chapter summary</h2>
                        <div className="border border-black divide-y divide-neutral-100">
                            {[
                                { num: "01", point: "AI stack sprawl is the default state. Average 50-person company runs 34 tools. 20–35% is waste." },
                                { num: "02", point: "Start with an inventory audit across bank statements, SSO, department surveys, and browser extensions. Expect to find 15–20% zombie tools immediately." },
                                { num: "03", point: "Score every tool on 7 weighted dimensions. Write down the reasoning. The documentation matters as much as the score." },
                                { num: "04", point: "Five waste categories: zombie subscriptions (12%), over-licensed seats (9%), duplicates (7%), unused tiers (4%), expired trials (2%). Address each with a different response." },
                                { num: "05", point: "Implement a 5-stage evaluation process for new tools: Request → Research → Trial → Decision → Review." },
                                { num: "06", point: "Enter every renewal with competitor research and documented scores. 15–25% savings is the typical outcome for prepared buyers." },
                                { num: "07", point: "Measure your AI Nativeness Score quarterly. The trend matters more than the absolute number. 30–54% is the current median tech company range." },
                                { num: "08", point: "Sustain with a monitoring cadence: weekly news scan, monthly spend/utilization review, quarterly full audit, annual rationalization." },
                            ].map((item) => (
                                <div key={item.num} className="p-4 flex gap-4">
                                    <span className="font-mono text-[10px] text-neutral-400 flex-shrink-0 mt-0.5">{item.num}</span>
                                    <p className="font-mono text-xs text-neutral-600 leading-relaxed">{item.point}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Related Resources ── */}
                <section className="py-8 border-t border-black/10">
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-5">Related resources</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-px border border-black bg-black">
                        {[
                            { href: "/scorecard", label: "AI Tool Scorecard Template", desc: "The free 7-dimension evaluation template from Chapter 03." },
                            { href: "/spend-report", label: "2026 SaaS Spend Report", desc: "Benchmark data by company size on waste rates and AI-native adoption." },
                            { href: "/research", label: "Tool Library", desc: "Community research reports on 200+ AI tools." },
                        ].map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="group bg-white hover:bg-[#F3F3EF] transition-colors p-5 flex flex-col gap-2"
                            >
                                <h3 className="font-serif text-base group-hover:underline underline-offset-2">{link.label}</h3>
                                <p className="font-mono text-[10px] text-neutral-500">{link.desc}</p>
                                <ArrowRight className="w-3 h-3 mt-auto" />
                            </Link>
                        ))}
                    </div>
                </section>

                {/* ── Final CTA ── */}
                <section className="py-14 border-t border-black/10 mb-4">
                    <div className="border border-black bg-black text-white p-10 max-w-3xl">
                        <p className="font-mono text-xs uppercase tracking-wider text-neutral-400 mb-3">Apply the playbook</p>
                        <h2 className="font-serif text-3xl font-normal mb-4 text-white">
                            Run this on your actual stack
                        </h2>
                        <p className="font-mono text-sm text-neutral-400 mb-8 max-w-lg leading-relaxed">
                            Add your tools to Trackr. Get automated scores, spend tracking, AI Nativeness Score, and renewal alerts — so you can run the full playbook without the manual overhead.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-neutral-100 transition-colors"
                            >
                                Start Free →
                            </Link>
                            <Link
                                href="/research"
                                className="inline-flex items-center gap-2 border border-neutral-700 px-6 py-3 font-mono text-xs uppercase tracking-widest hover:border-white transition-colors text-white"
                            >
                                Browse Tool Reports
                            </Link>
                        </div>
                        <p className="font-mono text-[10px] text-neutral-500 mt-4">Free to start. No credit card. 2-minute setup.</p>
                    </div>
                </section>

                <MarketingFooter />
            </main>
        </>
    );
}
