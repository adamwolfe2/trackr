"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const TESTIMONIALS = [
  {
    quote: "We used to spend 3-4 hours per tool just gathering info from G2, Reddit, and vendor docs. Now we have structured research reports in under 2 minutes. Our evaluation velocity doubled.",
    name: "VP Operations",
    title: "Series B SaaS, 200 employees",
    company: "",
    stat: "4 hrs → 2 min",
    statLabel: "per tool evaluation",
  },
  {
    quote: "The scorecard changed how we buy software. Seven dimensions with source-backed justifications — not just a summary. We stopped debating opinions and started comparing data.",
    name: "RevOps Lead",
    title: "Growth-stage startup, 150 employees",
    company: "",
    stat: "7 dimensions",
    statLabel: "scored per report",
  },
  {
    quote: "Before Trackr, every team had their own spreadsheet with conflicting tool evaluations. Now there's one workspace with shared research, notes, and decisions. No more duplicate work.",
    name: "Head of Procurement",
    title: "Enterprise, 600 employees",
    company: "",
    stat: "1 workspace",
    statLabel: "for the whole team",
  },
];

export function MarketingTestimonials() {
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-60px" });

  const gridRef = useRef(null);
  const gridInView = useInView(gridRef, { once: true, margin: "-60px" });

  return (
    <section className="w-full py-20 border-t border-black/10">
      <motion.div
        ref={headingRef}
        initial={{ opacity: 0, y: 14 }}
        animate={headingInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.45 }}
        className="mb-12"
      >
        <span className="text-sm font-mono uppercase tracking-wider text-neutral-500 mb-4 block">
          From the field
        </span>
        <h2 className="text-3xl md:text-4xl font-serif font-normal max-w-xl">
          What ops teams say after their first report
        </h2>
      </motion.div>

      <motion.div
        ref={gridRef}
        variants={containerVariants}
        initial="hidden"
        animate={gridInView ? "show" : "hidden"}
        className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-black"
      >
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            variants={cardVariants}
            className={`flex flex-col bg-white ${
              i < TESTIMONIALS.length - 1 ? "border-b md:border-b-0 md:border-r border-black" : ""
            }`}
          >
            {/* Stat hero */}
            <div className="px-6 pt-6 pb-5 border-b border-black/10">
              <div className="text-3xl md:text-4xl font-mono font-bold leading-none mb-1">
                {t.stat}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mt-1.5">
                {t.statLabel}
              </div>
            </div>

            {/* Quote */}
            <div className="px-6 py-5 flex-1 flex flex-col justify-between">
              <blockquote className="font-serif text-base italic leading-relaxed text-neutral-800 mb-5">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div>
                <div className="font-mono text-xs font-semibold text-black">{t.name}</div>
                <div className="font-mono text-[10px] text-neutral-500 mt-0.5">{t.title}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
