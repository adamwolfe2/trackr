"use client";

import { Compass, ArrowRight } from "lucide-react";
import Link from "next/link";

export function MarketingDiscovery() {
    return (
        <section className="w-full py-12 md:py-24 border-t border-black/10">
            <div className="bg-black text-white p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 shadow-[8px_8px_0px_0px_rgba(139,154,127,1)] border border-black">
                <div className="max-w-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Compass className="w-5 h-5 text-[#8B9A7F]" />
                        <span className="text-sm font-mono uppercase tracking-wider text-[#8B9A7F]">Trackr Discovery</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-serif font-normal mb-6">
                        Find tools you didn't know existed.
                    </h2>
                    <p className="text-lg font-mono text-neutral-400 leading-relaxed">
                        Tell Trackr what problems your team is trying to solve. Discovery agents scan ProductHunt, YC batches, funding announcements, and Reddit to surface tools that match your pain points. Add them to your research queue with one click.
                    </p>
                </div>

                <div className="flex-shrink-0">
                    <Link href="/sign-up" className="inline-flex items-center gap-2 bg-[#8B9A7F] text-black px-8 py-4 font-mono text-sm uppercase tracking-wide hover:bg-[#9BAB8F] transition-colors whitespace-nowrap">
                        See what's out there <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
