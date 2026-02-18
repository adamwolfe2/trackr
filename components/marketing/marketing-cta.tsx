"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function MarketingCTA() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <section ref={ref} className="w-full py-24 mb-12 border-t border-black/10">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-black text-white p-12 md:p-20 border border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.12)] text-center"
            >
                <span className="text-sm font-mono uppercase tracking-wider text-neutral-400 mb-6 block">
                    Ready to stop researching manually?
                </span>
                <h2 className="text-4xl md:text-6xl font-serif font-normal mb-8 text-white leading-tight">
                    Your next tool evaluation<br className="hidden sm:block" /> takes 2 minutes.
                </h2>
                <p className="text-lg font-mono text-neutral-400 mb-12 max-w-xl mx-auto">
                    Add Trackr to your team. Stop doing research by hand. Start making better tool decisions faster.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/sign-up"
                        className="bg-white text-black px-8 py-4 font-mono text-sm uppercase tracking-wide hover:bg-neutral-100 transition-all border border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none whitespace-nowrap flex items-center gap-2"
                    >
                        Get Started Free <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/pricing"
                        className="px-8 py-4 font-mono text-sm uppercase tracking-wide text-neutral-400 hover:text-white border border-neutral-700 hover:border-neutral-400 transition-colors whitespace-nowrap"
                    >
                        View Pricing
                    </Link>
                </div>

                <p className="font-mono text-xs text-neutral-600 uppercase tracking-wide mt-8">
                    No credit card required · Free plan available · Setup takes 3 minutes
                </p>
            </motion.div>
        </section>
    );
}
