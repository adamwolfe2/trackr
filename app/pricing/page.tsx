import { Check, Minus } from "lucide-react";
import Link from "next/link";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { PLANS } from "@/lib/config/subscriptions";

export const metadata: Metadata = {
    title: "Pricing — Trackr",
    description: `Free to start. Team at ${PLANS.TEAM.price}/mo. Startup at ${PLANS.STARTUP.price}/mo. Enterprise at ${PLANS.ENTERPRISE.price}/mo.`,
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
            "Slack integration",
            "Chrome extension",
            "Spend tracking + exports",
            "Full tool comparison",
            "Scheduled auto-research (weekly/monthly)",
            `Extra credits: $${PLANS.TEAM.extraCreditPrice}/each`,
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
            "Analytics dashboard",
            "Scorecard recipe",
            "Renewal alerts",
            `Extra credits: $${PLANS.STARTUP.extraCreditPrice}/each`,
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
            "API access",
            "Dedicated success manager",
            `Extra credits: $${PLANS.ENTERPRISE.extraCreditPrice}/each`,
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
];

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
    const user = await currentUser();

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

                <div className="grid md:grid-cols-4 gap-0 border border-black mb-24">
                    {planCards.map((card, i) => (
                        <div
                            key={card.plan.slug}
                            className={`p-8 flex flex-col ${i < planCards.length - 1 ? "border-r border-black" : ""} ${card.highlight ? "bg-black text-white" : "bg-white"}`}
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
