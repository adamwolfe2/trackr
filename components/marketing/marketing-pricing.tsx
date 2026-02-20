"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { motion, useInView, type Variants } from "framer-motion";
import { useRef, useState } from "react";
import type { BillingInterval } from "@/lib/config/subscriptions";
import { PAYMENT_LINKS } from "@/lib/config/subscriptions";

const containerVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

type PlanCard = {
    name: string;
    slug: "free" | "team" | "startup" | "enterprise";
    monthlyPrice: number;
    annualPrice: number;
    subtitle: string;
    credits: string;
    extraCredits: string | null;
    features: Array<{ text: string; included: boolean }>;
    featured?: boolean;
    badge?: string;
};

const plans: PlanCard[] = [
    {
        name: "Free",
        slug: "free",
        monthlyPrice: 0,
        annualPrice: 0,
        subtitle: "Evaluate on your own",
        credits: "3 research credits/month",
        extraCredits: null,
        features: [
            { text: "15 tools in database", included: true },
            { text: "1 workspace member", included: true },
            { text: "Full 7-step research reports", included: true },
            { text: "Compare tools (2 max)", included: true },
            { text: "Slack integration", included: false },
            { text: "Chrome extension", included: false },
            { text: "Ask Trackr AI", included: false },
            { text: "Analytics dashboard", included: false },
        ],
    },
    {
        name: "Team",
        slug: "team",
        monthlyPrice: 50,
        annualPrice: 480,
        subtitle: "Share with your team",
        credits: "25 research credits/month",
        extraCredits: "$1.50 per extra credit",
        badge: "Most Popular",
        featured: true,
        features: [
            { text: "Unlimited tools", included: true },
            { text: "5 workspace members", included: true },
            { text: "Full 7-step research reports", included: true },
            { text: "Compare tools (unlimited)", included: true },
            { text: "Slack integration", included: true },
            { text: "Chrome extension", included: true },
            { text: "Software spend tracking", included: true },
            { text: "Report export (PDF)", included: true },
        ],
    },
    {
        name: "Startup",
        slug: "startup",
        monthlyPrice: 149,
        annualPrice: 1430.40,
        subtitle: "Run your stack on autopilot",
        credits: "75 research credits/month",
        extraCredits: "$1.00 per extra credit",
        features: [
            { text: "Everything in Team", included: true },
            { text: "15 workspace members", included: true },
            { text: "Ask Trackr AI (unlimited)", included: true },
            { text: "Analytics dashboard", included: true },
            { text: "Custom scorecard recipe", included: true },
            { text: "Renewal alerts + digest emails", included: true },
            { text: "Company context scoring", included: true },
            { text: "Priority email support", included: true },
        ],
    },
    {
        name: "Enterprise",
        slug: "enterprise",
        monthlyPrice: 349,
        annualPrice: 3350.40,
        subtitle: "Enterprise-grade intelligence",
        credits: "200 research credits/month",
        extraCredits: "$0.75 per extra credit",
        features: [
            { text: "Everything in Startup", included: true },
            { text: "Unlimited workspace members", included: true },
            { text: "API access (read + write)", included: true },
            { text: "Dedicated success manager", included: true },
            { text: "Custom integrations", included: true },
            { text: "SSO / SAML", included: true },
            { text: "SLA guarantee", included: true },
            { text: "Onboarding call", included: true },
        ],
    },
];

function getCtaForPlan(plan: PlanCard, interval: BillingInterval): { label: string; href: string } {
    if (plan.slug === "free") {
        return { label: "Start for free", href: "/sign-up" };
    }
    const link = PAYMENT_LINKS[plan.slug][interval];
    return { label: "Start 14-day free trial", href: link };
}

export function MarketingPricing() {
    const headingRef = useRef(null);
    const headingInView = useInView(headingRef, { once: true, margin: "-60px" });

    const gridRef = useRef(null);
    const gridInView = useInView(gridRef, { once: true, margin: "-80px" });

    const [interval, setInterval] = useState<BillingInterval>("monthly");

    return (
        <section className="w-full py-24 border-t border-black/10" id="pricing">
            <motion.div
                ref={headingRef}
                initial={{ opacity: 0, y: 16 }}
                animate={headingInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
                className="mb-16 text-center max-w-2xl mx-auto"
            >
                <span className="text-sm font-mono uppercase tracking-wider text-neutral-500 mb-4 block">
                    Pricing
                </span>
                <h2 className="text-3xl md:text-5xl font-serif font-normal mb-6">
                    Start free. Upgrade when your team grows.
                </h2>
                <p className="font-mono text-neutral-500 mb-6">
                    Per workspace, not per user. 14-day free trial on all paid plans. Cancel anytime.
                </p>

                {/* Monthly/Annual toggle */}
                <div className="flex items-center justify-center gap-0 border border-black w-fit mx-auto">
                    <button
                        onClick={() => setInterval("monthly")}
                        className={`px-5 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
                            interval === "monthly"
                                ? "bg-black text-white"
                                : "bg-white text-black hover:bg-neutral-100"
                        }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setInterval("annual")}
                        className={`px-5 py-2 font-mono text-xs uppercase tracking-widest transition-colors border-l border-black ${
                            interval === "annual"
                                ? "bg-black text-white"
                                : "bg-white text-black hover:bg-neutral-100"
                        }`}
                    >
                        Annual — Save 20%
                    </button>
                </div>
            </motion.div>

            <motion.div
                ref={gridRef}
                variants={containerVariants}
                initial="hidden"
                animate={gridInView ? "show" : "hidden"}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start"
            >
                {plans.map((plan) => {
                    const cta = getCtaForPlan(plan, interval);
                    const displayPrice = plan.slug === "free"
                        ? 0
                        : interval === "annual"
                            ? plan.annualPrice
                            : plan.monthlyPrice;
                    const periodLabel = plan.slug === "free"
                        ? "/month"
                        : interval === "annual"
                            ? "/year"
                            : "/month";

                    return (
                        <motion.div
                            key={plan.name}
                            variants={cardVariants}
                            className={`flex flex-col h-full relative ${
                                plan.featured
                                    ? "bg-black text-white border border-black p-7 md:-translate-y-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.15)]"
                                    : "bg-white border border-black p-7 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)]"
                            }`}
                        >
                            {plan.badge && (
                                <div className="absolute -top-px -right-px bg-white text-black text-[10px] font-mono uppercase px-3 py-1.5 tracking-wider border-l border-b border-black">
                                    {plan.badge}
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="font-mono text-base mb-2">{plan.name}</h3>
                                <div className="text-4xl font-serif mb-1">
                                    ${interval === "annual" && plan.slug !== "free"
                                        ? displayPrice.toLocaleString("en-US", { minimumFractionDigits: displayPrice % 1 !== 0 ? 2 : 0 })
                                        : displayPrice}{" "}
                                    <span className={`text-sm font-mono ${plan.featured ? "text-neutral-400" : "text-neutral-500"}`}>
                                        {periodLabel}
                                    </span>
                                </div>
                                {interval === "annual" && plan.slug !== "free" && (
                                    <p className={`text-xs font-mono ${plan.featured ? "text-neutral-400" : "text-neutral-500"}`}>
                                        ${Math.round(displayPrice / 12)}/mo equivalent
                                    </p>
                                )}
                                <p className={`text-xs font-mono mt-2 ${plan.featured ? "text-neutral-400" : "text-neutral-500"}`}>
                                    {plan.subtitle}
                                </p>
                            </div>

                            {/* Credits highlight */}
                            <div className={`border px-3 py-2 mb-5 ${plan.featured ? "border-neutral-600" : "border-black"}`}>
                                <span className={`font-mono text-xs font-bold block ${plan.featured ? "text-white" : "text-black"}`}>
                                    {plan.credits}
                                </span>
                                {plan.extraCredits && (
                                    <span className={`font-mono text-[10px] ${plan.featured ? "text-neutral-400" : "text-neutral-500"}`}>
                                        {plan.extraCredits}
                                    </span>
                                )}
                            </div>

                            <ul className="space-y-2.5 mb-7 flex-grow">
                                {plan.features.map((feature) => (
                                    <li key={feature.text} className={`flex gap-2.5 text-xs font-mono items-start ${
                                        !feature.included ? (plan.featured ? "text-neutral-600" : "text-neutral-400") : ""
                                    }`}>
                                        {feature.included ? (
                                            <Check className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${plan.featured ? "text-white" : "text-black"}`} strokeWidth={2.5} />
                                        ) : (
                                            <X className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" strokeWidth={2} />
                                        )}
                                        {feature.text}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={cta.href}
                                className={`block w-full text-center py-3 font-mono text-xs uppercase tracking-widest transition-colors ${
                                    plan.featured
                                        ? "bg-white text-black border border-white hover:bg-neutral-200"
                                        : "bg-white border border-black hover:bg-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                                }`}
                            >
                                {cta.label}
                            </Link>
                            {plan.slug !== "free" && (
                                <p className={`text-center font-mono text-[10px] mt-2 ${plan.featured ? "text-neutral-500" : "text-neutral-400"}`}>
                                    No charge for 14 days
                                </p>
                            )}
                        </motion.div>
                    );
                })}
            </motion.div>

            <p className="text-center font-mono text-xs text-neutral-400 mt-8">
                All plans include a 14-day free trial. Per workspace, not per member. Need custom volume pricing?{" "}
                <Link href="/contact" className="underline hover:text-black">Contact us</Link>.
            </p>
        </section>
    );
}
