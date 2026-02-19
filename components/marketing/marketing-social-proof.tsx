"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";

const containerVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const BENCHMARKS = [
    {
        stat: "271%",
        statLabel: "revenue per employee increase",
        context: "$369K → $1M per employee in two years",
        quote: "By embedding AI across the business, we've now hit a major milestone: $1 million in revenue per employee, up from $369,000 just two years ago. Real results, real impact.",
        attribution: "Sebastian Siemiatkowski",
        title: "CEO, Klarna",
        date: "August 2025",
    },
    {
        stat: "$3.48M",
        statLabel: "revenue per employee",
        context: "5.7× higher than leading SaaS firms",
        quote: "Lean AI startups are dramatically outperforming traditional SaaS. The top 10 AI startups average $3.48 million in revenue per employee — approximately 5.7× higher than the leading SaaS firms.",
        attribution: "Jeremiah Owyang",
        title: "Venture Partner & AI Analyst",
        date: "May 2025",
        footnote: "Cursor: $5M/employee · Midjourney: $12.5M/employee",
    },
    {
        stat: "12+ hrs",
        statLabel: "saved per week",
        context: "Top 20% of executives, every single week",
        quote: "33% of executives say AI saves them 4 to 8 hours per week, and nearly 20% claim more than 12 hours saved. The worst thing you can do as a founder is wait.",
        attribution: "Section AI Research",
        title: "Endorsed by Luis von Ahn, CEO of Duolingo",
        date: "2025",
        footnote: "Elite founders are reclaiming 1.5 full workdays per week",
    },
];

export function MarketingSocialProof() {
    const headingRef = useRef(null);
    const headingInView = useInView(headingRef, { once: true, margin: "-60px" });

    const cardsRef = useRef(null);
    const cardsInView = useInView(cardsRef, { once: true, margin: "-60px" });

    return (
        <section className="w-full py-24 border-t border-black/10">
            {/* Headline */}
            <motion.div
                ref={headingRef}
                initial={{ opacity: 0, y: 16 }}
                animate={headingInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
                className="mb-14"
            >
                <span className="text-sm font-mono uppercase tracking-wider text-neutral-500 mb-4 block">
                    AI-Native Performance Benchmarks
                </span>
                <h2 className="text-3xl md:text-4xl font-serif font-normal max-w-2xl">
                    The benchmark has changed. The question is whether your team has.
                </h2>
                <p className="font-mono text-sm text-neutral-500 mt-4 max-w-xl leading-relaxed">
                    These aren&apos;t projections. They&apos;re real metrics from real operators who moved fast on AI — reported in 2025.
                </p>
            </motion.div>

            {/* Outcome stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-black mb-10">
                {[
                    {
                        stat: "$1M+",
                        label: "Revenue per employee",
                        sub: "at Klarna, AI-native",
                        href: "https://observer.com/2025/08/klarna-ai-revenue-per-employee-growth/",
                    },
                    {
                        stat: "5.7×",
                        label: "Revenue efficiency",
                        sub: "AI-native vs. top SaaS",
                        href: "https://www.web-strategist.com/blog/2025/05/ai-startup-revenue-efficiency-benchmarks/",
                    },
                    {
                        stat: "10,000+",
                        label: "New AI companies",
                        sub: "launched in 2025",
                        href: "https://flowlyn.com/blog/ai-startup-growth-statistics-2025/",
                    },
                    {
                        stat: "12 hrs",
                        label: "Reclaimed weekly",
                        sub: "by top 20% of founders",
                        href: "https://section.school/ai-productivity-report-2025/",
                    },
                ].map((item, i) => (
                    <a
                        key={item.stat}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group flex flex-col p-5 bg-white hover:bg-[#F3F3EF] transition-colors ${i < 3 ? "border-b md:border-b-0 md:border-r border-black" : ""}`}
                    >
                        <div className="text-3xl font-mono font-bold leading-none mb-1.5">
                            {item.stat}
                        </div>
                        <div className="font-mono text-[11px] text-black font-semibold border-b border-dotted border-black/40 group-hover:border-black pb-0.5 inline-block w-fit mb-1">
                            {item.label}
                        </div>
                        <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider">
                            {item.sub}
                        </div>
                    </a>
                ))}
            </div>

            {/* Benchmark cards */}
            <motion.div
                ref={cardsRef}
                variants={containerVariants}
                initial="hidden"
                animate={cardsInView ? "show" : "hidden"}
                className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-black"
            >
                {BENCHMARKS.map((b, i) => (
                    <motion.div
                        key={b.attribution}
                        variants={cardVariants}
                        className={`flex flex-col bg-white ${i < BENCHMARKS.length - 1 ? "border-b md:border-b-0 md:border-r border-black" : ""}`}
                    >
                        {/* Stat hero */}
                        <div className="px-6 pt-6 pb-5 border-b border-black/10">
                            <div className="text-5xl md:text-6xl font-mono font-bold leading-none mb-1">
                                {b.stat}
                            </div>
                            <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mt-2">
                                {b.statLabel}
                            </div>
                            <div className="font-mono text-[10px] text-black mt-1 border border-black/20 px-2 py-0.5 inline-block bg-[#F3F3EF]">
                                {b.context}
                            </div>
                        </div>

                        {/* Quote */}
                        <div className="px-6 py-5 flex-1 flex flex-col justify-between">
                            <blockquote className="font-serif text-base italic leading-relaxed text-neutral-800 mb-5">
                                &ldquo;{b.quote}&rdquo;
                            </blockquote>

                            <div>
                                <div className="font-mono text-xs font-semibold text-black">{b.attribution}</div>
                                <div className="font-mono text-[10px] text-neutral-500 mt-0.5">{b.title}</div>
                                <div className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider mt-0.5">{b.date}</div>
                                {b.footnote && (
                                    <div className="font-mono text-[9px] text-neutral-400 mt-3 pt-3 border-t border-neutral-100 leading-relaxed">
                                        {b.footnote}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Source line */}
            <div className="mt-4 flex items-center gap-2">
                <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider">
                    Sources: Klarna Q3 2025 Report · CB Insights · Section AI Research · Observer.com
                </span>
            </div>
        </section>
    );
}
