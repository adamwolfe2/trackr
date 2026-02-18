"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

export function OffsetHero() {
    return (
        <section className="mb-24 md:mb-32">
            <span className="text-sm font-mono uppercase tracking-wider text-[#8B9A7F] mb-4 block">
                AI-Powered Tool Research for Ops Teams
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-normal leading-[1.1] tracking-tight max-w-4xl mb-8 font-serif">
                Stop researching tools manually. <br className="hidden md:block" />
                Let agents do it for you.
            </h1>

            <div className="max-w-2xl">
                <p className="md:text-lg leading-relaxed text-base text-neutral-600 font-mono mb-10">
                    Trackr dispatches research agents to crawl, score, and report on any software tool — automatically. Add a tool, get a full report in under 2 minutes. Your team keeps a shared, searchable database that actually stays up to date.
                </p>

                <p className="text-sm font-mono text-neutral-500 mb-6">
                    No credit card required. Free to start. Works for any team.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <Link href="/sign-up" className="bg-black text-white px-6 py-3 font-mono text-sm uppercase tracking-wide hover:bg-neutral-800 transition-colors border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap w-full sm:w-auto flex items-center gap-2 justify-center">
                        Add Your First Tool Free <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link href="#sample-report" className="bg-white text-black px-6 py-3 font-mono text-sm uppercase tracking-wide hover:bg-neutral-50 transition-colors border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap w-full sm:w-auto flex items-center gap-2 justify-center">
                        See a sample report
                    </Link>
                </div>

                <div className="mt-12 pt-8 border-t border-black/10 flex flex-wrap gap-x-8 gap-y-4 text-xs font-mono text-neutral-500 uppercase tracking-wide">
                    <span>Trusted by ops teams evaluating 10-50+ tools per month</span>
                    <span>Reports generated in under 2 minutes</span>
                    <span>Free to start</span>
                </div>
            </div>
        </section>
    );
}
