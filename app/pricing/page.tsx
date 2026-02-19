import { Check } from "lucide-react";
import Link from "next/link";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pricing — Trackr",
    description: "Free for getting started. Team at $29/mo. Agency at $99/mo. No hidden fees.",
    openGraph: {
        title: "Pricing — Trackr",
        description: "Free for getting started. Team at $29/mo. Agency at $99/mo. No hidden fees.",
        type: "website",
        url: "https://trytrackr.com/pricing",
    },
};

const plans = [
    {
        name: "Free",
        price: "$0",
        period: "/mo",
        description: "Explore Trackr and evaluate your first tools.",
        features: [
            "25 tools",
            "5 research runs/month",
            "1 workspace member",
            "Kanban board",
            "AI News Digest",
            "Spend tracking",
        ],
        cta: "Get started free",
        href: "/sign-up",
        highlight: false,
    },
    {
        name: "Team",
        price: "$29",
        period: "/mo",
        description: "For ops teams that evaluate tools regularly and track software spend.",
        features: [
            "Unlimited tools",
            "50 research runs/month",
            "10 workspace members",
            "Ask Trackr AI",
            "Tool comparison",
            "Spend tracking + alerts",
            "Priority support",
        ],
        cta: "Start with Team",
        href: "/sign-up?plan=team",
        highlight: true,
    },
    {
        name: "Agency",
        price: "$99",
        period: "/mo",
        description: "For agencies researching tools across multiple client accounts.",
        features: [
            "Unlimited tools",
            "Unlimited research runs",
            "Unlimited workspace members",
            "Ask Trackr AI",
            "Tool comparison",
            "Advertise system access",
            "Priority support",
        ],
        cta: "Start with Agency",
        href: "/sign-up?plan=agency",
        highlight: false,
    },
];

const faqs = [
    {
        q: "Can I cancel anytime?",
        a: "Yes. Cancel from the billing portal at any time. You retain access until the end of your billing period — no questions asked.",
    },
    {
        q: "What counts as a research run?",
        a: "Each time Trackr's agents research a tool — scraping the site, pulling reviews, running competitive analysis, and generating a scored report — that counts as one run.",
    },
    {
        q: "What if I hit the free plan limit?",
        a: "You'll see an upgrade prompt when you try to add more than 25 tools or run more than 5 research jobs per month. Existing data stays intact.",
    },
    {
        q: "Do you offer annual billing?",
        a: "Annual billing with a 2-month discount is coming soon. Email us to get on the early list.",
    },
];

export default async function PricingPage() {
    const user = await currentUser();

    return (
        <main className="flex-grow w-full max-w-6xl mx-auto px-6">
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

                <div className="grid md:grid-cols-3 gap-0 border border-black mb-24">
                    {plans.map((plan, i) => (
                        <div
                            key={plan.name}
                            className={`p-8 flex flex-col ${i < plans.length - 1 ? "border-r border-black" : ""} ${plan.highlight ? "bg-black text-white" : "bg-white"}`}
                        >
                            {plan.highlight && (
                                <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3 block">Most Popular</span>
                            )}
                            <div className="mb-1">
                                <span className={`font-mono text-xs uppercase tracking-widest ${plan.highlight ? "text-neutral-400" : "text-neutral-500"}`}>{plan.name}</span>
                            </div>
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-5xl font-serif">{plan.price}</span>
                                <span className={`font-mono text-sm ${plan.highlight ? "text-neutral-400" : "text-neutral-500"}`}>{plan.period}</span>
                            </div>
                            <p className={`font-mono text-xs mb-8 leading-relaxed ${plan.highlight ? "text-neutral-300" : "text-neutral-500"}`}>
                                {plan.description}
                            </p>
                            <ul className="space-y-2.5 mb-10 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className={`flex items-center gap-2 font-mono text-xs ${plan.highlight ? "text-neutral-200" : "text-neutral-700"}`}>
                                        <Check className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href={plan.href}
                                className={`block text-center px-4 py-3 font-mono text-xs uppercase tracking-widest border transition-colors ${
                                    plan.highlight
                                        ? "border-white text-white hover:bg-white hover:text-black"
                                        : "border-black text-black hover:bg-black hover:text-white"
                                }`}
                            >
                                {plan.cta}
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
