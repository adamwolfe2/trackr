import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Plug, Code, Users } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const revalidate = false;

export const metadata: Metadata = {
    title: "Integrations & Partners — Trackr",
    description: "Trackr integrates with the tools your team already uses. Slack, Chrome, Notion, and more — bring AI tool research into your existing workflow.",
    openGraph: {
        title: "Trackr Integrations — Slack, Chrome, Notion, and More",
        description: "Trackr brings AI tool research into Slack, Chrome, and Notion. Research any SaaS tool in under 2 minutes without leaving your workflow.",
        url: "https://trytrackr.com/partners",
        images: [{ url: "/og.png", width: 1456, height: 816, alt: "Trackr Integrations" }],
    },
    alternates: { canonical: "https://trytrackr.com/partners" },
};

const INTEGRATIONS = [
    {
        name: "Slack",
        status: "Live",
        category: "Collaboration",
        description:
            "Research any tool with /trackr research [url] from any Slack channel. Get scored reports, renewal alerts, and weekly stack digests delivered to your workspace.",
        features: [
            "/trackr slash command in any channel",
            "Research completion notifications",
            "60 and 30-day renewal alerts",
            "Optional weekly stack digest",
        ],
        href: "/slack",
        cta: "Connect Slack →",
    },
    {
        name: "Chrome Extension",
        status: "Live",
        category: "Browser",
        description:
            "Research any SaaS tool while you browse. Click the icon on any vendor site to submit for research or instantly view scores from your team workspace.",
        features: [
            "One-click research from vendor sites",
            "Instant score lookup for researched tools",
            "Stack membership check at a glance",
            "Send to research queue without leaving the page",
        ],
        href: "/chrome",
        cta: "Install Extension →",
    },
    {
        name: "Notion",
        status: "In Development",
        category: "Documentation",
        description:
            "Sync Trackr research reports to your Notion databases. Keep tool inventories in Notion aligned with scored research from Trackr automatically.",
        features: [
            "Auto-create Notion pages from completed reports",
            "Live score sync — Notion updates when re-research runs",
            "Two-way sync with existing tool databases",
            "Trackr database block (embedded report view)",
        ],
        href: "/contact",
        cta: "Join Waitlist →",
    },
];

const PARTNER_TYPES = [
    {
        icon: Plug,
        title: "Technology Partners",
        description:
            "If your platform serves ops teams, RevOps, or IT buyers, integrating with Trackr puts AI tool intelligence directly in your users' workflow. We build APIs and native connectors for qualified partners.",
    },
    {
        icon: Code,
        title: "Agency & Consultant Partners",
        description:
            "Ops consultants and RevOps agencies use Trackr to deliver faster, more consistent tool evaluations for their clients. Ask about our partner program for volume discounts and co-marketing.",
    },
    {
        icon: Users,
        title: "Community Partners",
        description:
            "If you run an ops or RevOps community — Slack group, newsletter, or event series — we'd like to talk about co-created content and special offers for your audience.",
    },
];

export default function PartnersPage() {
    return (
        <>
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
                <MarketingNavigation isLoggedIn={false} />

                {/* Hero */}
                <section className="pt-16 pb-12 border-b border-black">
                    <div className="max-w-3xl">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-6">Integrations & Partners</p>
                        <h1 className="font-serif text-5xl sm:text-6xl font-normal leading-tight mb-6">
                            Bring tool research into your existing workflow.
                        </h1>
                        <p className="font-mono text-sm text-neutral-600 leading-relaxed max-w-2xl">
                            Trackr integrates with the tools your team already uses — so tool research, scored reports,
                            and renewal alerts don't require switching contexts or maintaining a separate app.
                        </p>
                    </div>
                </section>

                {/* Integration cards */}
                <section className="py-16 border-b border-black">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-8">Current integrations</p>
                    <div className="space-y-px border border-black bg-black">
                        {INTEGRATIONS.map((integration) => (
                            <div key={integration.name} className="bg-[#F3F3EF] p-8">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-serif text-2xl font-normal">{integration.name}</h3>
                                            <span
                                                className={`font-mono text-[9px] uppercase tracking-widest border px-2 py-0.5 ${
                                                    integration.status === "Live"
                                                        ? "border-black text-black"
                                                        : "border-neutral-400 text-neutral-400"
                                                }`}
                                            >
                                                {integration.status}
                                            </span>
                                        </div>
                                        <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">{integration.category}</p>
                                    </div>
                                    <Link
                                        href={integration.href}
                                        className="inline-flex items-center gap-2 border border-black font-mono text-xs px-4 py-2 hover:bg-black hover:text-white transition-colors flex-shrink-0"
                                    >
                                        {integration.cta}
                                    </Link>
                                </div>
                                <p className="font-mono text-[11px] text-neutral-600 leading-relaxed mb-4">{integration.description}</p>
                                <ul className="space-y-1">
                                    {integration.features.map((f) => (
                                        <li key={f} className="flex gap-2 font-mono text-[11px] text-neutral-500">
                                            <span className="text-neutral-400 flex-shrink-0">→</span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Partner types */}
                <section className="py-16 border-b border-black">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-8">Work with us</p>
                    <div className="grid sm:grid-cols-3 gap-px border border-black bg-black">
                        {PARTNER_TYPES.map((type) => {
                            const Icon = type.icon;
                            return (
                                <div key={type.title} className="bg-[#F3F3EF] p-6">
                                    <div className="w-8 h-8 border border-black flex items-center justify-center mb-4">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-serif text-lg font-normal mb-2">{type.title}</h3>
                                    <p className="font-mono text-[11px] text-neutral-600 leading-relaxed">{type.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Contact CTA */}
                <section className="py-16">
                    <div className="border border-black p-10">
                        <div className="max-w-xl">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">Interested in integrating?</p>
                            <h2 className="font-serif text-3xl font-normal mb-4">
                                Let's talk.
                            </h2>
                            <p className="font-mono text-[11px] text-neutral-600 leading-relaxed mb-6">
                                We build thoughtfully — integrations that genuinely improve the tool research experience for ops teams.
                                If you have an idea for how Trackr could fit into your platform or community, reach out directly.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center gap-2 bg-black text-white font-mono text-sm px-6 py-3 hover:bg-neutral-800 transition-colors"
                                >
                                    Contact Us
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/sign-up"
                                    className="inline-flex items-center gap-2 border border-black font-mono text-sm px-6 py-3 hover:bg-black hover:text-white transition-colors"
                                >
                                    Try Trackr Free
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
