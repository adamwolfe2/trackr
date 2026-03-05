import { Check, Minus } from "lucide-react";
import Link from "next/link";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { EnterpriseAuditBanner } from "@/components/marketing/enterprise-audit-modal";
import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { PLANS } from "@/lib/config/subscriptions";

export const metadata: Metadata = {
    title: "Pricing — Trackr",
    description: `Free to start. Team at ${PLANS.TEAM.price}/mo. Startup at ${PLANS.STARTUP.price}/mo. Enterprise at ${PLANS.ENTERPRISE.price}/mo.`,
    keywords: ["trackr pricing", "AI tool research pricing", "SaaS evaluation tool cost", "trackr plans", "free AI research tool", "ops team software pricing", "tool intelligence platform pricing"],
    alternates: {
        canonical: "https://trytrackr.com/pricing",
    },
    openGraph: {
        title: "Pricing — Trackr",
        description: `Free to start. Team at $${PLANS.TEAM.price}/mo. Startup at $${PLANS.STARTUP.price}/mo. Enterprise at $${PLANS.ENTERPRISE.price}/mo.`,
        type: "website",
        url: "https://trytrackr.com/pricing",
        images: [{ url: "/og.png", width: 1456, height: 816, alt: "Trackr Pricing" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Pricing — Trackr",
        description: `Free to start. Team at $${PLANS.TEAM.price}/mo. Startup at $${PLANS.STARTUP.price}/mo. Enterprise at $${PLANS.ENTERPRISE.price}/mo.`,
        images: ["/og.png"],
    },
};

function formatLimit(n: number): string {
    return n === Infinity ? "Unlimited" : n.toString();
}

const planCards = [
    {
        plan: PLANS.FREE,
        description: "Explore Trackr and evaluate your first tools.",
        features: [
            `${formatLimit(PLANS.FREE.limits.tools)} tools`,
            `${formatLimit(PLANS.FREE.limits.research)} research credits/mo`,
            `${formatLimit(PLANS.FREE.limits.members)} member`,
            "Basic reports",
            "Limited tool comparison",
            "Buy credit packs anytime",
        ],
        cta: "Get started free",
        href: "/sign-up",
        highlight: false,
    },
    {
        plan: PLANS.TEAM,
        description: "For ops teams that evaluate tools regularly and track software spend.",
        features: [
            `${formatLimit(PLANS.TEAM.limits.tools)} tools`,
            `${formatLimit(PLANS.TEAM.limits.research)} research credits/mo`,
            `${formatLimit(PLANS.TEAM.limits.members)} members`,
            "Slack + Chrome extension",
            "Spend tracking + exports",
            "Procurement workflows",
            "Renewal calendar",
            "Decision log",
            "Public stack profile",
            "Credit packs from $10",
        ],
        cta: "Start with Team",
        href: "/sign-up?plan=team",
        highlight: true,
    },
    {
        plan: PLANS.STARTUP,
        description: "For growing teams that want AI intelligence and custom scoring.",
        features: [
            "Everything in Team",
            `${formatLimit(PLANS.STARTUP.limits.research)} research credits/mo`,
            `${formatLimit(PLANS.STARTUP.limits.members)} members`,
            "Ask Trackr AI",
            "Analytics + scorecard recipe",
            "Stack Health (full)",
            "Board reports",
            "Competitor intel",
            "Risk monitor",
            "Contract vault",
            "Team literacy",
            "Credit packs from $8",
        ],
        cta: "Start with Startup",
        href: "/sign-up?plan=startup",
        highlight: false,
    },
    {
        plan: PLANS.ENTERPRISE,
        description: "For large teams with unlimited needs and API access.",
        features: [
            "Everything in Startup",
            `${formatLimit(PLANS.ENTERPRISE.limits.research)} research credits/mo`,
            `${formatLimit(PLANS.ENTERPRISE.limits.members)} members`,
            "Custom scoring weights",
            "API access",
            "Dedicated success manager",
            "Best credit pack pricing (from $6)",
        ],
        cta: "Start with Enterprise",
        href: "/sign-up?plan=enterprise",
        highlight: false,
    },
];

const faqs = [
    {
        q: "Can I cancel anytime?",
        a: "Yes. Cancel from the billing portal at any time. You retain access until the end of your billing period — no questions asked.",
    },
    {
        q: "What counts as a research credit?",
        a: "Each time Trackr's agents research a tool — scraping the site, pulling reviews from G2/Reddit/Trustpilot, running competitive analysis, and generating a scored report — that counts as one credit.",
    },
    {
        q: "What if I hit the free plan limit?",
        a: `You'll see an upgrade prompt when you try to add more than ${PLANS.FREE.limits.tools} tools or run more than ${PLANS.FREE.limits.research} research jobs per month. Existing data stays intact.`,
    },
    {
        q: "Do you offer annual billing?",
        a: "Yes — annual billing saves you roughly 20%. You can toggle between monthly and annual on the billing page.",
    },
    {
        q: "How accurate are the AI research reports?",
        a: "Reports are sourced from 25+ real data points per tool — the vendor's own site, pricing pages, G2, Capterra, TrustRadius, ProductHunt, Reddit, and competitive analysis. Every score is grounded in real data, not hallucinated. We also show the raw sources so your team can verify.",
    },
    {
        q: "Can I share reports with people outside my team?",
        a: "Yes. Every research report has a Share Report button that generates a public link. No login required for the recipient. Share individual tool evaluations with vendors, stakeholders, or executives.",
    },
    {
        q: "Is my data private?",
        a: "Yes. Your workspace data — tools, reports, stack, and spend — is isolated per workspace and never shared between accounts. Research reports are private unless you create a share link. We are SOC2 compliant.",
    },
    {
        q: "Can Trackr research any type of software tool?",
        a: "Yes. Submit any URL — B2B SaaS, AI tools, open-source software, developer tools, or niche vertical software. Our agents are not limited to a category. If a website exists, Trackr can research it.",
    },
];

type ComparisonRow = {
    feature: string;
    values: [string | boolean, string | boolean, string | boolean, string | boolean];
};

type ComparisonSection = {
    label: string;
    rows: ComparisonRow[];
};

const comparisonSections: ComparisonSection[] = [
    {
        label: "Research & Discovery",
        rows: [
            { feature: "Research credits/mo", values: ["5", "25", "75", "200"] },
            { feature: "Tools tracked", values: ["15", "Unlimited", "Unlimited", "Unlimited"] },
            { feature: "Members", values: ["1", "5", "15", "Unlimited"] },
            { feature: "Research depth", values: ["Quick", "Full", "Full", "Full"] },
            { feature: "Scheduled research", values: [false, true, true, true] },
            { feature: "Bulk credit packs", values: [true, true, true, true] },
        ],
    },
    {
        label: "Intelligence & AI",
        rows: [
            { feature: "Ask Trackr AI", values: [false, false, true, true] },
            { feature: "Tool comparison", values: ["2 max", "Unlimited", "Unlimited", "Unlimited"] },
            { feature: "Stack Health", values: ["Score only", "Score only", "Full", "Full"] },
            { feature: "Competitor intel", values: [false, false, true, true] },
            { feature: "Risk monitor", values: [false, false, true, true] },
            { feature: "Scorecard recipe", values: [false, false, true, true] },
            { feature: "Custom scoring weights", values: [false, false, "Weights only", "Full"] },
        ],
    },
    {
        label: "Workflow & Operations",
        rows: [
            { feature: "Procurement", values: [false, true, true, true] },
            { feature: "Renewal calendar", values: [false, true, true, true] },
            { feature: "Contracts vault", values: [false, false, true, true] },
            { feature: "Decision log", values: [false, true, true, true] },
            { feature: "Spend tracking", values: [false, true, true, true] },
            { feature: "Report export", values: [false, true, true, true] },
            { feature: "Renewal alerts", values: [false, false, true, true] },
        ],
    },
    {
        label: "Reports & Analytics",
        rows: [
            { feature: "Analytics dashboard", values: [false, false, true, true] },
            { feature: "Board reports", values: [false, false, true, true] },
            { feature: "Team literacy", values: [false, false, true, true] },
        ],
    },
    {
        label: "Integrations & Platform",
        rows: [
            { feature: "Slack integration", values: [false, true, true, true] },
            { feature: "Chrome extension", values: [false, true, true, true] },
            { feature: "3rd-party integrations", values: [false, false, true, true] },
            { feature: "Public stack profile", values: [false, true, true, true] },
            { feature: "Embed widget", values: [false, false, true, true] },
            { feature: "API access", values: [false, false, false, true] },
        ],
    },
    {
        label: "Credit Pack Pricing",
        rows: [
            { feature: "25 credits", values: ["$10", "$10", "$8", "$6"] },
            { feature: "50 credits", values: ["$15", "$15", "$12", "$9"] },
            { feature: "100 credits", values: ["$20", "$20", "$16", "$12"] },
        ],
    },
];

function ComparisonCell({ value }: { value: string | boolean }) {
    if (value === true) return <Check className="w-3.5 h-3.5 mx-auto" strokeWidth={2.5} />;
    if (value === false) return <Minus className="w-3.5 h-3.5 mx-auto text-neutral-300" strokeWidth={2} />;
    return <span className="font-mono text-xs">{value}</span>;
}

function PricingJsonLd() {
    const offers = planCards
        .filter((c) => c.plan.price > 0)
        .map((c) => ({
            "@type": "Offer",
            name: c.plan.name,
            price: c.plan.price,
            priceCurrency: "USD",
            description: c.description,
            url: `https://trytrackr.com${c.href}`,
        }));

    const softwareApp = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Trackr",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: "https://trytrackr.com",
        description: "AI-powered software intelligence platform for evaluating SaaS tools.",
        offers,
    };

    const faqPage = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.a,
            },
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApp) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
            />
        </>
    );
}

export default async function PricingPage() {
    let user = null;
    try {
        user = await currentUser();
    } catch {
        // Render page without auth context (logged-out view)
    }

    return (
        <main className="flex-grow w-full max-w-6xl mx-auto px-6">
            <PricingJsonLd />
            <MarketingNavigation isLoggedIn={!!user} />

            <section className="py-24 border-t border-black/10">
                <div className="mb-16">
                    <span className="text-sm font-mono uppercase tracking-wider text-neutral-500 mb-4 block">Pricing</span>
                    <h1 className="text-3xl md:text-5xl font-serif font-normal mb-4">
                        Simple, transparent pricing.
                    </h1>
                    <p className="font-mono text-sm text-neutral-500 max-w-lg">
                        Start free. Upgrade when your team is ready. No contracts, no setup fees.
                    </p>
                </div>

                <div className="grid md:grid-cols-4 gap-0 border border-black mb-24 divide-y divide-black md:divide-y-0 md:divide-x md:divide-black">
                    {planCards.map((card) => (
                        <div
                            key={card.plan.slug}
                            className={`p-8 flex flex-col ${card.highlight ? "bg-black text-white" : "bg-white"}`}
                        >
                            {card.highlight && (
                                <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3 block">Most Popular</span>
                            )}
                            <div className="mb-1">
                                <span className={`font-mono text-xs uppercase tracking-widest ${card.highlight ? "text-neutral-400" : "text-neutral-500"}`}>{card.plan.name}</span>
                            </div>
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-4xl font-serif">
                                    {card.plan.price === 0 ? "$0" : `$${card.plan.price}`}
                                </span>
                                <span className={`font-mono text-sm ${card.highlight ? "text-neutral-400" : "text-neutral-500"}`}>/mo</span>
                            </div>
                            {card.plan.annualPrice > 0 && (
                                <span className={`font-mono text-xs mb-2 ${card.highlight ? "text-neutral-400" : "text-neutral-500"}`}>
                                    or ${Math.round(card.plan.annualPrice / 12)}/mo billed annually
                                </span>
                            )}
                            <p className={`font-mono text-xs mb-8 leading-relaxed ${card.highlight ? "text-neutral-300" : "text-neutral-500"}`}>
                                {card.description}
                            </p>
                            <ul className="space-y-2.5 mb-10 flex-1">
                                {card.features.map((feature) => (
                                    <li key={feature} className={`flex items-center gap-2 font-mono text-xs ${card.highlight ? "text-neutral-200" : "text-neutral-700"}`}>
                                        <Check className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href={user ? "/settings/billing" : card.href}
                                className={`block text-center px-4 py-3 font-mono text-xs uppercase tracking-widest border transition-colors ${
                                    card.highlight
                                        ? "border-white text-white hover:bg-white hover:text-black"
                                        : "border-black text-black hover:bg-black hover:text-white"
                                }`}
                            >
                                {user ? (card.plan.price === 0 ? "Current Plan" : "Upgrade") : card.cta}
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Full Feature Comparison Table */}
                <div className="border border-black mb-24 overflow-x-auto">
                    <div className="border-b border-black px-6 py-4">
                        <h2 className="text-2xl font-serif font-normal">Full feature comparison</h2>
                        <p className="font-mono text-xs text-neutral-500 mt-1">Every feature across all plans, side by side.</p>
                    </div>
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr className="sticky top-0 bg-white border-b border-black">
                                <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest font-normal">Feature</th>
                                <th className="text-center px-4 py-3 font-mono text-[10px] uppercase tracking-widest font-normal">Free</th>
                                <th className="text-center px-4 py-3 font-mono text-[10px] uppercase tracking-widest font-normal">Team ($50)</th>
                                <th className="text-center px-4 py-3 font-mono text-[10px] uppercase tracking-widest font-normal">Startup ($149)</th>
                                <th className="text-center px-4 py-3 font-mono text-[10px] uppercase tracking-widest font-normal">Enterprise ($349)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparisonSections.map((section) => (
                                <>
                                    <tr key={`section-${section.label}`}>
                                        <td colSpan={5} className="bg-neutral-50 border-y border-black font-mono text-[10px] uppercase tracking-widest px-4 py-2">
                                            {section.label}
                                        </td>
                                    </tr>
                                    {section.rows.map((row, rowIdx) => (
                                        <tr key={`${section.label}-${row.feature}`} className={`border-b border-neutral-200 ${rowIdx === section.rows.length - 1 ? "last:border-b-0" : ""}`}>
                                            <td className="px-4 py-2.5 font-mono text-xs text-neutral-700">{row.feature}</td>
                                            <td className="px-4 py-2.5 text-center"><ComparisonCell value={row.values[0]} /></td>
                                            <td className="px-4 py-2.5 text-center"><ComparisonCell value={row.values[1]} /></td>
                                            <td className="px-4 py-2.5 text-center"><ComparisonCell value={row.values[2]} /></td>
                                            <td className="px-4 py-2.5 text-center"><ComparisonCell value={row.values[3]} /></td>
                                        </tr>
                                    ))}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* What Trackr Replaces */}
                <div className="mb-24 border border-black">
                    <div className="border-b border-black px-8 py-5">
                        <h2 className="text-2xl font-serif font-normal">What Trackr replaces</h2>
                        <p className="font-mono text-xs text-neutral-500 mt-1">One subscription eliminates 4 hours of manual research per tool evaluation.</p>
                    </div>
                    <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black">
                        {[
                            {
                                label: "Manual G2 / Capterra browsing",
                                value: "2–3 hrs per tool",
                                trackr: "2 min automated",
                                detail: "Agents scrape G2, Capterra, TrustRadius, Reddit, and ProductHunt simultaneously."
                            },
                            {
                                label: "Spreadsheet-based tool tracking",
                                value: "Never up to date",
                                trackr: "Auto-refreshes every 30 days",
                                detail: "Scheduled research keeps every tool in your stack current without any manual effort."
                            },
                            {
                                label: "Vendor sales calls for pricing",
                                value: "3–5 calls per tool",
                                trackr: "Pricing scraped at generation",
                                detail: "Current pricing tiers and positioning scraped directly from vendor sites on every research run."
                            },
                        ].map((item) => (
                            <div key={item.label} className="p-6">
                                <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-3">{item.label}</div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="font-mono text-xs text-neutral-500 line-through">{item.value}</div>
                                    <Minus className="w-3 h-3 text-neutral-300 flex-shrink-0" />
                                    <div className="font-mono text-xs font-semibold text-black">{item.trackr}</div>
                                </div>
                                <p className="font-mono text-[10px] text-neutral-500 leading-relaxed">{item.detail}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Enterprise Audit */}
                <EnterpriseAuditBanner />

                {/* FAQ */}
                <div className="mb-24">
                    <h2 className="text-2xl font-serif font-normal mb-10">Frequently asked questions</h2>
                    <div className="grid md:grid-cols-2 gap-0 border border-black">
                        {faqs.map((faq, i) => (
                            <div
                                key={faq.q}
                                className={`p-6 ${i % 2 === 0 ? "border-r border-black" : ""} ${i < faqs.length - 2 ? "border-b border-black" : ""}`}
                            >
                                <h3 className="font-serif text-base mb-2">{faq.q}</h3>
                                <p className="font-mono text-xs text-neutral-500 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <MarketingFooter />
        </main>
    );
}
