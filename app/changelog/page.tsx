import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Tag, Clock } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const revalidate = false;

export const metadata: Metadata = {
    title: "Changelog — Trackr",
    description:
        "Every product update, new feature, and improvement to Trackr — the AI tool research and intelligence platform for operations teams.",
    keywords: [
        "trackr changelog",
        "trackr updates",
        "AI tool research updates",
        "trackr release notes",
        "trackr new features",
    ],
    openGraph: {
        title: "Changelog — Trackr",
        description:
            "Every product update, new feature, and improvement to Trackr. See what shipped and what's coming next.",
        url: "https://trytrackr.com/changelog",
        images: [{ url: "/og.png", width: 1456, height: 816, alt: "Trackr Changelog" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Changelog — Trackr",
        description:
            "Every product update, new feature, and improvement to Trackr. See what shipped and what's coming next.",
        images: ["/og.png"],
    },
    alternates: { canonical: "https://trytrackr.com/changelog" },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "WebPage",
            "@id": "https://trytrackr.com/changelog",
            url: "https://trytrackr.com/changelog",
            name: "Changelog — Trackr",
            description:
                "Every product update, new feature, and improvement to Trackr.",
            inLanguage: "en-US",
            isPartOf: { "@id": "https://trytrackr.com/#website" },
        },
        {
            "@type": "BreadcrumbList",
            itemListElement: [
                {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: "https://trytrackr.com",
                },
                {
                    "@type": "ListItem",
                    position: 2,
                    name: "Changelog",
                    item: "https://trytrackr.com/changelog",
                },
            ],
        },
    ],
};

const ENTRIES = [
    {
        date: "February 2026",
        version: "v2.8",
        title: "44 VS comparison pages and architect referral program launch",
        changes: [
            "Shipped 44 VS competitor displacement pages covering the most-evaluated tool categories — each page runs a live head-to-head research comparison on demand, targeting buyers actively comparing vendors.",
            "Launched the Architect Referral Program: operations consultants, RevOps advisors, and AI implementation specialists earn 20% recurring commission on every client they refer to Trackr.",
            "Added /partners hub with application flow, architect code management, and referral attribution dashboard.",
            "Improved public research library indexing — 44 new category comparison pages added to sitemap with 0.85 priority.",
            "Performance: VS comparison page load time reduced from 1.4 s to 380 ms via edge caching at Vercel's CDN layer.",
        ],
    },
    {
        date: "January 2026",
        version: "v2.6",
        title: "Slack integration, Chrome extension v2, and tiered research depth",
        changes: [
            "Slack integration shipped: trigger research with /trackr research [url] from any channel, receive scored report summaries, 60-day and 30-day renewal alerts, and an optional weekly stack digest.",
            "Chrome extension v2 rebuilt from scratch — new UI with an instant score overlay, stack-check badge, and one-click send-to-queue. Works on Brave and Edge (Chromium) in addition to Chrome.",
            "Tiered research depth: Starter, Standard, and Deep plans now run at different pipeline depth levels. Deep tier uses multi-pass Perplexity Sonar plus GPT-4o synthesis for higher-stakes evaluations.",
            "Research queue bulk actions: select multiple queued tools and trigger batch research in a single click from the queue dashboard.",
            "Bug fix: extension occasionally showed stale scores after a tool was re-researched in the web app. Now invalidates correctly on re-research completion.",
        ],
    },
    {
        date: "December 2025",
        version: "v2.4",
        title: "AI digest email, research cache, and Perplexity integration",
        changes: [
            "Weekly AI digest email: every Sunday, subscribers receive a curated summary of top AI tool news, notable new research reports in the public library, and tool recommendations matched to their team's ICP.",
            "Research cache: repeated queries for the same tool now return cached results with a 72-hour TTL instead of re-running the full pipeline, reducing average response time by 60% and cutting AI API costs.",
            "Perplexity integration added as a second research source alongside Tavily. Perplexity handles real-time web context and competitive intelligence; Tavily handles structured review-site data.",
            "Digest email unsubscribe flow built into user settings — one-click opt-out with no re-subscribe dark patterns.",
            "Improved vendor website scraping reliability: Firecrawl fallback routing now automatically retries failed site maps against a secondary scrape path.",
        ],
    },
    {
        date: "November 2025",
        version: "v2.2",
        title: "Scorecard page, spend report tool, and AI-Native Ops Playbook",
        changes: [
            "Scorecard page (/scorecard): generate a one-page PDF scorecard for any tool in your stack, including 7-dimension scores, the Trackr recommendation, and competitive context relative to top alternatives.",
            "Spend report tool (/spend-report): input your current SaaS tool inventory to receive a full AI tool spend breakdown benchmarked against 2026 category medians, with redundancy flags and consolidation recommendations.",
            "AI-Native Ops Playbook (/playbook): published a free 42-page guide to building an internal AI tool evaluation process — covers RFP templates, scoring rubrics, rollout governance, and change management.",
            "Workspace-level spend alerts: set monthly budget thresholds and receive email alerts when AI tool spend crosses defined limits.",
            "Research reports now include a related tools section with links to head-to-head comparisons in the same category.",
        ],
    },
    {
        date: "October 2025",
        version: "v2.0",
        title: "Public research library, 108 blog posts, and ICP landing pages",
        changes: [
            "Public research library (/research) opened to all visitors: 200-plus AI tools with scored reports, filterable by category, use case, team size, and pricing tier.",
            "Blog expanded to 108 original articles covering AI tool evaluation frameworks, SaaS stack management, RevOps tool guides, and category comparison deep-dives.",
            "ICP landing pages (/for): launched 12 role-specific pages targeting ops managers, RevOps leads, chiefs of staff, AI implementation specialists, founders, finance teams, IT leaders, and marketing teams.",
            "Research compare hub (/research/compare): side-by-side comparison pages for 60-plus tool pairs, each pulling live score data and surfacing category context.",
            "Public share tokens: any report can now be shared via a read-only link without requiring the recipient to hold a Trackr account.",
        ],
    },
    {
        date: "September 2025",
        version: "v1.8",
        title: "Team workspaces and multi-user collaboration",
        changes: [
            "Team workspaces launched: invite colleagues via email to a shared workspace where all research, scores, notes, and saved tools are visible to every member.",
            "Role-based access: workspace owners assign Admin or Member roles. Role checks are enforced server-side on every mutating action.",
            "Activity feed: workspace-level log showing who researched which tool and when, with a diff view when a tool is re-researched and scores change.",
            "Full research history per workspace, exportable as CSV for use in procurement workflows and quarterly reviews.",
            "Workspace settings page: manage members, billing, and notification preferences from a single screen.",
        ],
    },
    {
        date: "August 2025",
        version: "v1.5",
        title: "7-dimension scoring engine and report redesign",
        changes: [
            "Rebuilt the core scoring engine around 7 dimensions: Integration depth, Vendor reliability, Pricing transparency, Security posture, Support quality, Roadmap credibility, and Community strength.",
            "Report redesign: each report displays a radar chart, dimension-level score breakdowns, key findings extracted from reviews, and a single bottom-line recommendation with confidence level.",
            "Score confidence indicator added: reports show a confidence band based on data freshness, source count, and recency of vendor updates.",
            "PDF export: download any report as a formatted PDF for sharing with procurement teams, finance, or executive stakeholders.",
            "Added 40-plus tools to the public library across CRM, project management, data pipeline, and AI writing categories.",
        ],
    },
    {
        date: "September 2025",
        version: "v1.0",
        title: "Public launch",
        changes: [
            "Trackr publicly launched at trytrackr.com — AI-powered tool research and intelligence for operations and RevOps teams.",
            "Core research pipeline: enter any tool name or URL, receive a scored 7-dimension research report in under 2 minutes using Firecrawl, Tavily, Perplexity, and GPT-4o.",
            "Starter plan: 3 free research reports per month with no credit card required at signup.",
            "Pro and Team plans: unlimited reports, team workspace access, CSV export, and priority research queue.",
            "Chrome extension v1: one-click research from any SaaS vendor website.",
        ],
    },
];

export default function ChangelogPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
                <MarketingNavigation isLoggedIn={false} />

                {/* Hero */}
                <section className="pt-16 pb-12 border-b border-black">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 border border-black px-3 py-1 mb-6">
                            <Clock className="w-3 h-3" />
                            <span className="font-mono text-[10px] uppercase tracking-widest">Release notes</span>
                        </div>
                        <h1 className="font-serif text-5xl sm:text-6xl font-normal leading-tight mb-6">
                            What&apos;s new in Trackr
                        </h1>
                        <p className="font-mono text-sm text-neutral-600 leading-relaxed max-w-2xl">
                            Every product update, shipped feature, and improvement — in order.
                            Trackr is updated continuously. This page reflects the most recent stable
                            releases across the web app, Chrome extension, integrations, and research engine.
                        </p>
                    </div>
                </section>

                {/* Changelog entries */}
                <section className="py-16 border-b border-black">
                    <div className="space-y-0">
                        {ENTRIES.map((entry, i) => (
                            <div
                                key={`${entry.version}-${i}`}
                                className={`grid sm:grid-cols-[200px_1fr] gap-0 ${i < ENTRIES.length - 1 ? "border-b border-black" : ""}`}
                            >
                                {/* Left: date + version */}
                                <div className="sm:border-r border-black p-6 sm:py-8 flex sm:flex-col gap-3 sm:gap-2 border-b sm:border-b-0 border-black">
                                    <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest pt-0.5">
                                        {entry.date}
                                    </span>
                                    <div className="inline-flex items-center gap-1.5 border border-black px-2 py-0.5 self-start">
                                        <Tag className="w-2.5 h-2.5" />
                                        <span className="font-mono text-[10px] tracking-widest">{entry.version}</span>
                                    </div>
                                </div>

                                {/* Right: title + bullets */}
                                <div className="p-6 sm:py-8">
                                    <h2 className="font-serif text-2xl font-normal mb-5">{entry.title}</h2>
                                    <ul className="space-y-3">
                                        {entry.changes.map((change, j) => (
                                            <li key={j} className="flex gap-3">
                                                <span className="font-mono text-[10px] text-neutral-400 mt-0.5 flex-shrink-0">
                                                    —
                                                </span>
                                                <p className="font-mono text-[11px] text-neutral-600 leading-relaxed">
                                                    {change}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16">
                    <div className="border border-black p-10">
                        <div className="max-w-xl">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">
                                Get started
                            </p>
                            <h2 className="font-serif text-3xl font-normal mb-4">
                                See what Trackr can do for your team.
                            </h2>
                            <p className="font-mono text-[11px] text-neutral-600 leading-relaxed mb-6">
                                3 free research reports per month. No credit card required.
                                Upgrade anytime for unlimited reports, team workspaces, and integrations.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                    href="/sign-up"
                                    className="inline-flex items-center gap-2 bg-black text-white font-mono text-sm px-6 py-3 hover:bg-neutral-800 transition-colors"
                                >
                                    Start free
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/pricing"
                                    className="inline-flex items-center gap-2 border border-black font-mono text-sm px-6 py-3 hover:bg-black hover:text-white transition-colors"
                                >
                                    View pricing
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <MarketingFooter />
        </>
    );
}
