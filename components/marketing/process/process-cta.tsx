"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ProcessCta() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });

    return (
        <section ref={ref} className="py-20">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-black text-white p-12 md:p-20 border border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.12)] text-center"
            >
                <h2 className="text-3xl md:text-5xl font-serif font-normal mb-4 text-white leading-tight">
                    Ready to research your first tool?
                </h2>
                <p className="font-mono text-sm text-white/60 mb-8 max-w-lg mx-auto">
                    Submit any tool URL. Get a scored report in under 2 minutes.
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
                        className="text-white/80 px-8 py-4 font-mono text-sm uppercase tracking-wide hover:text-white transition-colors border border-white/20 hover:border-white/40 whitespace-nowrap"
                    >
                        View Pricing
                    </Link>
                </div>

                <p className="font-mono text-[10px] text-white/40 mt-6 uppercase tracking-wider">
                    No credit card required &middot; Free plan available
                </p>
            </motion.div>
        </section>
    );
}
