"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";

const containerVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function MarketingPricing() {
    const headingRef = useRef(null);
    const headingInView = useInView(headingRef, { once: true, margin: "-60px" });

    const gridRef = useRef(null);
    const gridInView = useInView(gridRef, { once: true, margin: "-80px" });

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
                <p className="font-mono text-neutral-500">
                    No credit card required to start. Cancel anytime.
                </p>
            </motion.div>

            <motion.div
                ref={gridRef}
                variants={containerVariants}
                initial="hidden"
                animate={gridInView ? "show" : "hidden"}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start"
            >
                {/* Free */}
                <motion.div variants={cardVariants} className="bg-white border border-black p-8 flex flex-col h-full shadow-[3px_3px_0px_0px_rgba(0,0,0,0.08)]">
                    <div className="mb-8">
                        <h3 className="font-mono text-lg mb-2">Free</h3>
                        <div className="text-4xl font-serif mb-4">
                            $0 <span className="text-sm font-mono text-neutral-500">/ month</span>
                        </div>
                        <p className="text-sm text-neutral-600 font-mono">For individuals and small teams getting started.</p>
                    </div>
                    <ul className="space-y-3.5 mb-8 flex-grow">
                        {[
                            "Up to 25 tools in database",
                            "5 research agent runs per month",
                            "1 workspace member",
                            "Default scorecard (7 dimensions)",
                            "Full report access",
                            "Email notifications",
                        ].map((feature) => (
                            <li key={feature} className="flex gap-3 text-sm font-mono items-start">
                                <Check className="w-4 h-4 mt-0.5 text-neutral-400 flex-shrink-0" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                    <Link
                        href="/sign-up"
                        className="block w-full text-center bg-white border border-black py-3 font-mono text-sm uppercase hover:bg-neutral-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                    >
                        Start for free
                    </Link>
                </motion.div>

                {/* Team — featured */}
                <motion.div
                    variants={cardVariants}
                    className="bg-black text-white border border-black p-8 flex flex-col h-full relative md:-translate-y-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.15)]"
                >
                    <div className="absolute -top-px -right-px bg-white text-black text-[10px] font-mono uppercase px-3 py-1.5 tracking-wider border-l border-b border-black">
                        Most Popular
                    </div>
                    <div className="mb-8">
                        <h3 className="font-mono text-lg mb-2">Team</h3>
                        <div className="text-4xl font-serif mb-4">
                            $29 <span className="text-sm font-mono text-neutral-400">/ month</span>
                        </div>
                        <p className="text-sm text-neutral-400 font-mono">For teams that evaluate tools regularly and need to stay in sync.</p>
                    </div>
                    <ul className="space-y-3.5 mb-8 flex-grow">
                        {[
                            "Unlimited tools in database",
                            "50 research agent runs per month",
                            "Up to 10 workspace members",
                            "Custom scorecard + templates",
                            "Pain points engine",
                            "Discovery feed",
                            "Semantic search",
                            "Auto-refresh (30-day cycle)",
                            "Priority email support",
                        ].map((feature) => (
                            <li key={feature} className="flex gap-3 text-sm font-mono items-start">
                                <Check className="w-4 h-4 mt-0.5 text-white flex-shrink-0" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                    <Link
                        href="/sign-up"
                        className="block w-full text-center bg-white text-black border border-white py-3 font-mono text-sm uppercase hover:bg-neutral-200 transition-colors"
                    >
                        Start 14-day free trial
                    </Link>
                </motion.div>

                {/* Agency */}
                <motion.div variants={cardVariants} className="bg-white border border-black p-8 flex flex-col h-full shadow-[3px_3px_0px_0px_rgba(0,0,0,0.08)]">
                    <div className="mb-8">
                        <h3 className="font-mono text-lg mb-2">Agency</h3>
                        <div className="text-4xl font-serif mb-4">
                            $99 <span className="text-sm font-mono text-neutral-500">/ month</span>
                        </div>
                        <p className="text-sm text-neutral-600 font-mono">For agencies and larger teams managing multiple workspaces.</p>
                    </div>
                    <ul className="space-y-3.5 mb-8 flex-grow">
                        {[
                            "Everything in Team",
                            "Unlimited research agent runs",
                            "Unlimited workspace members",
                            "Multiple workspaces",
                            "Shareable read-only report links",
                            "White-label options (coming soon)",
                            "Dedicated Slack support",
                        ].map((feature) => (
                            <li key={feature} className="flex gap-3 text-sm font-mono items-start">
                                <Check className="w-4 h-4 mt-0.5 text-neutral-400 flex-shrink-0" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                    <Link
                        href="/contact"
                        className="block w-full text-center bg-white border border-black py-3 font-mono text-sm uppercase hover:bg-neutral-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                    >
                        Talk to us
                    </Link>
                </motion.div>
            </motion.div>
        </section>
    );
}
