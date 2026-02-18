"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";

function AnimatedStat({ value, label, suffix = "" }: { value: string; label: string; suffix?: string }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center"
        >
            <div className="text-4xl md:text-5xl font-mono font-medium mb-2 text-black">{value}</div>
            <div className="text-xs font-mono text-neutral-500 uppercase tracking-widest">{label}</div>
        </motion.div>
    );
}

const containerVariants: Variants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.12,
        },
    },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function MarketingSocialProof() {
    const statsRef = useRef(null);
    const statsInView = useInView(statsRef, { once: true, margin: "-60px" });

    const testimonialsRef = useRef(null);
    const testimonialsInView = useInView(testimonialsRef, { once: true, margin: "-60px" });

    return (
        <section className="w-full py-24 border-t border-black/10">
            <div className="mb-20">
                {/* Headline */}
                <motion.h2
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl md:text-4xl font-serif font-normal text-center mb-16"
                >
                    Built for teams who evaluate tools seriously.
                </motion.h2>

                {/* Stat Bar */}
                <motion.div
                    ref={statsRef}
                    initial={{ opacity: 0 }}
                    animate={statsInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 mb-20"
                >
                    <div className="md:border-r border-black/10">
                        <AnimatedStat value="&lt; 2 min" label="Average time to report" />
                    </div>
                    <div className="md:border-r border-black/10">
                        <AnimatedStat value="7 dims" label="Scored on every tool" />
                    </div>
                    <div>
                        <AnimatedStat value="30-day" label="Auto-refresh cycle" />
                    </div>
                </motion.div>

                {/* Testimonials */}
                <motion.div
                    ref={testimonialsRef}
                    variants={containerVariants}
                    initial="hidden"
                    animate={testimonialsInView ? "show" : "hidden"}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <motion.blockquote variants={cardVariants} className="bg-white p-8 border border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-300">
                        <p className="font-serif text-lg italic mb-6 leading-relaxed">
                            &ldquo;We used to spend half a Friday afternoon looking at tools. Now we submit Monday morning and have reports by lunch.&rdquo;
                        </p>
                        <footer className="font-mono text-xs uppercase tracking-wider text-neutral-500">
                            — Head of Operations, AI Services Agency
                        </footer>
                    </motion.blockquote>

                    <motion.blockquote variants={cardVariants} className="bg-white p-8 border border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-300">
                        <p className="font-serif text-lg italic mb-6 leading-relaxed">
                            &ldquo;The scorecard is the thing. Everyone was evaluating tools on different criteria. Trackr forced us to agree on what actually matters.&rdquo;
                        </p>
                        <footer className="font-mono text-xs uppercase tracking-wider text-neutral-500">
                            — Founder, Growth Agency
                        </footer>
                    </motion.blockquote>

                    <motion.blockquote variants={cardVariants} className="bg-white p-8 border border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-300">
                        <p className="font-serif text-lg italic mb-6 leading-relaxed">
                            &ldquo;The discovery feed alone is worth it. We found 3 tools that directly addressed pain points we&apos;d been stuck on for months.&rdquo;
                        </p>
                        <footer className="font-mono text-xs uppercase tracking-wider text-neutral-500">
                            — Technical Project Lead, Modern Amenities Group
                        </footer>
                    </motion.blockquote>
                </motion.div>
            </div>
        </section>
    );
}
