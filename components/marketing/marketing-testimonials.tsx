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
    quote: "We used to spend 3–4 hours per tool just gathering info from G2, Reddit, and docs. Trackr does it in 90 seconds. Our ops team evaluates twice the tools with half the effort.",
    name: "Marcus T.",
    title: "VP Operations",
    company: "Series B SaaS",
    stat: "4 hrs → 90 sec",
    statLabel: "per tool evaluation",
  },
  {
    quote: "The scorecard is genuinely useful — it's not just 'here's a summary.' We get dimension scores with justifications, Reddit sentiment, competitor context. It changed how we buy software.",
    name: "Priya K.",
    title: "RevOps Lead",
    company: "150-person startup",
    stat: "7 dimensions",
    statLabel: "every research report",
  },
  {
    quote: "Shared workspace is the killer feature. Before Trackr, everyone had their own Notion doc or Confluence page with conflicting info. Now we have one source of truth for every tool evaluation.",
    name: "Daniel R.",
    title: "Head of Procurement",
    company: "Enterprise, 600 employees",
    stat: "1 source",
    statLabel: "of truth for the whole team",
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
          Early Teams
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
                <div className="font-mono text-[10px] text-neutral-400 mt-0.5">{t.company}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
