"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function MarketingPricing() {
    // Placeholder logic for annual/monthly toggle if implemented later
    const isAnnual = false;

    return (
        <section className="w-full py-24 border-t border-black/10" id="pricing">
            <div className="mb-16 text-center max-w-2xl mx-auto">
                <span className="text-sm font-mono uppercase tracking-wider text-[#8B9A7F] mb-4 block">
                    Pricing
                </span>
                <h2 className="text-3xl md:text-5xl font-serif font-normal mb-6">
                    Start free. Upgrade when your team grows.
                </h2>
                <p className="font-mono text-neutral-500">
                    No credit card required to start. Cancel anytime.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Free */}
                <div className="bg-white border border-black p-8 flex flex-col h-full">
                    <div className="mb-8">
                        <h3 className="font-mono text-lg mb-2">Free</h3>
                        <div className="text-4xl font-serif mb-4">$0 <span className="text-sm font-mono text-neutral-500">/ month</span></div>
                        <p className="text-sm text-neutral-600">For individuals and small teams getting started.</p>
                    </div>
                    <ul className="space-y-4 mb-8 flex-grow">
                        {[
                            "Up to 25 tools in database",
                            "5 research agent runs per month",
                            "1 workspace member",
                            "Default scorecard (7 dimensions)",
                            "Full report access",
                            "Email notifications"
                        ].map((feature) => (
                            <li key={feature} className="flex gap-3 text-sm font-mono items-start">
                                <Check className="w-4 h-4 mt-0.5 text-neutral-400 flex-shrink-0" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                    <Link href="/sign-up" className="block w-full text-center bg-white border border-black py-3 font-mono text-sm uppercase hover:bg-neutral-50 transition-colors">
                        Start for free
                    </Link>
                </div>

                {/* Team */}
                <div className="bg-black text-white border border-black p-8 flex flex-col h-full relative transform md:-translate-y-4 shadow-[8px_8px_0px_0px_rgba(200,200,200,1)]">
                    <div className="absolute top-0 right-0 bg-[#8B9A7F] text-black text-[10px] font-mono uppercase px-2 py-1 tracking-wider">Most Popular</div>
                    <div className="mb-8">
                        <h3 className="font-mono text-lg mb-2">Team</h3>
                        <div className="text-4xl font-serif mb-4">$49 <span className="text-sm font-mono text-neutral-400">/ month</span></div>
                        <p className="text-sm text-neutral-400">For teams that evaluate tools regularly and need to stay in sync.</p>
                    </div>
                    <ul className="space-y-4 mb-8 flex-grow">
                        {[
                            "Unlimited tools in database",
                            "50 research agent runs per month",
                            "Up to 10 workspace members",
                            "Custom scorecard + templates",
                            "Pain points engine",
                            "Discovery feed",
                            "Semantic search",
                            "Auto-refresh (30-day cycle)",
                            "Priority email support"
                        ].map((feature) => (
                            <li key={feature} className="flex gap-3 text-sm font-mono items-start">
                                <Check className="w-4 h-4 mt-0.5 text-[#8B9A7F] flex-shrink-0" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                    <Link href="/sign-up" className="block w-full text-center bg-[#8B9A7F] text-black border border-transparent py-3 font-mono text-sm uppercase hover:bg-[#9BAB8F] transition-colors">
                        Start 14-day free trial
                    </Link>
                </div>

                {/* Agency */}
                <div className="bg-white border border-black p-8 flex flex-col h-full">
                    <div className="mb-8">
                        <h3 className="font-mono text-lg mb-2">Agency</h3>
                        <div className="text-4xl font-serif mb-4">$149 <span className="text-sm font-mono text-neutral-500">/ month</span></div>
                        <p className="text-sm text-neutral-600">For agencies and larger teams managing multiple workspaces.</p>
                    </div>
                    <ul className="space-y-4 mb-8 flex-grow">
                        {[
                            "Everything in Team",
                            "Unlimited research agent runs",
                            "Unlimited workspace members",
                            "Multiple workspaces",
                            "Shareable read-only report links",
                            "White-label options (coming soon)",
                            "Dedicated Slack support"
                        ].map((feature) => (
                            <li key={feature} className="flex gap-3 text-sm font-mono items-start">
                                <Check className="w-4 h-4 mt-0.5 text-neutral-400 flex-shrink-0" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                    <Link href="/contact" className="block w-full text-center bg-white border border-black py-3 font-mono text-sm uppercase hover:bg-neutral-50 transition-colors">
                        Talk to us
                    </Link>
                </div>
            </div>
        </section>
    );
}
