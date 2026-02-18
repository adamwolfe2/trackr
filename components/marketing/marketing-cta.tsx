"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function MarketingCTA() {
    return (
        <section className="w-full py-24 mb-12 border-t border-black/10 text-center">
            <h2 className="text-4xl md:text-6xl font-serif font-normal mb-8">
                Your next tool evaluation<br /> takes 2 minutes.
            </h2>
            <p className="text-xl font-mono text-neutral-600 mb-10">
                Add Trackr to your team. Stop doing research by hand.
            </p>

            <div className="flex flex-col items-center gap-4">
                <Link href="/sign-up" className="bg-black text-white px-8 py-4 font-mono text-lg uppercase tracking-wide hover:bg-neutral-800 transition-colors border border-black shadow-[6px_6px_0px_0px_rgba(139,154,127,1)] whitespace-nowrap flex items-center gap-2">
                    Get Started Free <ArrowRight className="w-5 h-5" />
                </Link>
                <p className="font-mono text-xs text-neutral-500 uppercase tracking-wide mt-4">
                    No credit card required • Free plan available • Setup takes 3 minutes
                </p>
            </div>
        </section>
    );
}
