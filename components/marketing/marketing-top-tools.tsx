"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { ArrowUpRight, BarChart3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const TOOLS = [
  {
    name: "Lemon",
    category: "Voice AI / Productivity",
    score: 10,
    summary: "AI voice assistant that captures meetings and turns them into structured notes, action items, and CRM updates.",
    shareToken: "showcase-lemon-2026w10",
    logoUrl: "/showcase-lemon.png",
  },
  {
    name: "Raycast",
    category: "Productivity / Developer Tools",
    score: 10,
    summary: "Blazing-fast macOS launcher with 1,000+ extensions, built-in AI chat, clipboard history, and window management.",
    shareToken: "showcase-raycast-2026w10",
    logoUrl: "/showcase-raycast.png",
  },
  {
    name: "Cursive",
    category: "Lead Intelligence / Sales Automation",
    score: 10,
    summary: "AI-powered lead intelligence that identifies anonymous visitors, enriches with intent data, and delivers qualified leads.",
    shareToken: "showcase-cursive-2026w10",
    logoUrl: "/showcase-cursive.png",
  },
];

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-neutral-200">
        <div className="h-full bg-black" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-sm font-bold tabular-nums text-black">
        {score.toFixed(1)}
      </span>
    </div>
  );
}

export function MarketingTopTools() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="w-full py-24 border-t border-black/10">
      <div className="text-center mb-12">
        <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4 block">
          Weekly Picks
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-normal mb-3">
          Top AI Tools This Week
        </h2>
        <p className="font-mono text-sm text-neutral-500 max-w-lg mx-auto">
          Scored by our research agents across 7 dimensions. Click any card to
          see the full scorecard.
        </p>
      </div>

      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-black"
      >
        {TOOLS.map((tool) => (
          <motion.div key={tool.name} variants={cardVariants}>
            <Link
              href={`/share/${tool.shareToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full p-6 border-r border-black last:border-r-0 transition-all group bg-[#F3F3EF] text-black hover:bg-neutral-100"
            >
              {/* Logo + name */}
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src={tool.logoUrl}
                  alt={`${tool.name} logo`}
                  width={32}
                  height={32}
                  className="object-contain"
                  unoptimized
                />
                <div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wide">
                    {tool.name}
                  </h3>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                    {tool.category}
                  </span>
                </div>
              </div>

              {/* Score bar */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <BarChart3 className="w-3 h-3 text-neutral-400" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                    Overall Score
                  </span>
                </div>
                <ScoreBar score={tool.score} />
              </div>

              {/* Summary */}
              <p className="font-mono text-xs leading-relaxed mb-6 text-neutral-600">
                {tool.summary}
              </p>

              {/* CTA */}
              <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-black border-b border-black/30 group-hover:border-black transition-colors">
                View Full Scorecard
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <div className="text-center mt-8">
        <Link
          href="/research"
          className="font-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-black transition-colors border-b border-neutral-300 hover:border-black pb-0.5"
        >
          See all evaluations
        </Link>
      </div>
    </section>
  );
}
