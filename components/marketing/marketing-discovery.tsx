"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";

const TRACKED_TOOLS = [
    {
        name: "Clay",
        domain: "clay.com",
        category: "GTM Data",
        score: 9.4,
        tag: "Pre-mass market",
        verdict: "Replaces 3–5 manual enrichment tools. Every GTM team needs this.",
    },
    {
        name: "Granola",
        domain: "granola.ai",
        category: "Meeting Intelligence",
        score: 9.1,
        tag: "Rapid growth",
        verdict: "Best AI meeting notes on the market. Captures context that others miss.",
    },
    {
        name: "ElevenLabs",
        domain: "elevenlabs.io",
        category: "Voice AI",
        score: 9.3,
        tag: "Category leader",
        verdict: "Voice synthesis that's indistinguishable from human. 100+ enterprise use cases.",
    },
    {
        name: "Cursor",
        domain: "cursor.com",
        category: "AI Dev Tools",
        score: 9.6,
        tag: "Breakout tool",
        verdict: "Engineering teams using this ship 40–60% faster. Not optional anymore.",
    },
    {
        name: "Gamma",
        domain: "gamma.app",
        category: "Presentations",
        score: 8.7,
        tag: "Hidden gem",
        verdict: "Kills slide decks. Generates polished presentations from a prompt in 60s.",
    },
    {
        name: "Glean",
        domain: "glean.com",
        category: "Enterprise Search",
        score: 9.0,
        tag: "Enterprise-ready",
        verdict: "Your entire company's knowledge, searchable with AI. Huge ops unlock.",
    },
    {
        name: "Descript",
        domain: "descript.com",
        category: "Video & Podcast",
        score: 8.9,
        tag: "Underrated",
        verdict: "Edit video like a doc. Studios and scrappy teams both run on this.",
    },
    {
        name: "Retool",
        domain: "retool.com",
        category: "Internal Tools",
        score: 9.2,
        tag: "Ops essential",
        verdict: "Internal dashboards and tools in hours, not sprints. Ops teams love it.",
    },
    {
        name: "Runway",
        domain: "runwayml.com",
        category: "AI Video",
        score: 8.8,
        tag: "Next wave",
        verdict: "AI video generation that actually works for commercial use cases.",
    },
];

function ToolCard({ tool, index }: { tool: typeof TRACKED_TOOLS[0]; index: number }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-40px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
            className="border border-black bg-white flex flex-col"
        >
            {/* Header */}
            <div className="px-4 py-3 border-b border-black flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={`https://www.google.com/s2/favicons?domain=${tool.domain}&sz=32`}
                        alt={tool.name}
                        className="w-4 h-4 flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <span className="font-serif text-base font-medium leading-none">{tool.name}</span>
                </div>
                <div className="text-right flex-shrink-0">
                    <span className="font-mono text-xl font-bold leading-none">{tool.score}</span>
                    <span className="font-mono text-[9px] text-neutral-400">/10</span>
                </div>
            </div>

            {/* Score bar */}
            <div className="px-4 pt-3">
                <div className="h-0.5 bg-neutral-100">
                    <motion.div
                        className="h-full bg-black"
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${tool.score * 10}%` } : { width: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 + index * 0.06, ease: "easeOut" }}
                    />
                </div>
            </div>

            {/* Body */}
            <div className="px-4 py-3 flex-1 space-y-2">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] border border-neutral-300 px-1.5 py-0.5 text-neutral-500 uppercase tracking-wider">{tool.category}</span>
                    <span className="font-mono text-[9px] border border-black px-1.5 py-0.5 text-black uppercase tracking-wider bg-[#F3F3EF]">{tool.tag}</span>
                </div>
                <p className="font-mono text-[10px] text-neutral-600 leading-relaxed">{tool.verdict}</p>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-neutral-100 flex items-center justify-between">
                <span className="font-mono text-[9px] text-neutral-400">{tool.domain}</span>
                <TrendingUp className="w-3 h-3 text-neutral-300" />
            </div>
        </motion.div>
    );
}

export function MarketingDiscovery() {
    const headingRef = useRef(null);
    const inView = useInView(headingRef, { once: true, margin: "-60px" });

    return (
        <section className="w-full py-24 border-t border-black/10" id="discovery">
            {/* Heading */}
            <motion.div
                ref={headingRef}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
                className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
            >
                <div>
                    <span className="text-sm font-mono uppercase tracking-wider text-neutral-500 mb-4 block">
                        Pre-Market Intelligence
                    </span>
                    <h2 className="text-3xl md:text-5xl font-serif font-normal max-w-2xl">
                        Tools your competitors haven&apos;t found yet.
                    </h2>
                    <p className="font-mono text-sm text-neutral-500 mt-4 max-w-xl leading-relaxed">
                        The best AI tools aren&apos;t the ones ChatGPT recommends — those are the ones everyone&apos;s already fighting over. Trackr surfaces what&apos;s working inside high-growth organizations before it hits mass market.
                    </p>
                </div>
                <Link
                    href="/sign-up"
                    className="flex-shrink-0 flex items-center gap-2 border border-black px-6 py-3.5 font-mono text-sm uppercase tracking-wide hover:bg-black hover:text-white transition-colors whitespace-nowrap"
                >
                    Start tracking <ArrowRight className="w-4 h-4" />
                </Link>
            </motion.div>

            {/* Tool cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                {TRACKED_TOOLS.map((tool, i) => (
                    <ToolCard key={tool.name} tool={tool} index={i} />
                ))}
            </div>

            {/* Bottom banner */}
            <div className="border border-black bg-black text-white p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                    <div className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-2">Trackr Discovery Engine</div>
                    <p className="font-serif text-xl text-white">
                        Your AI agents scan ProductHunt, YC batches, funding announcements, and Reddit daily — then score every tool against your team&apos;s specific criteria.
                    </p>
                </div>
                <Link
                    href="/sign-up"
                    className="flex-shrink-0 flex items-center gap-2 bg-white text-black px-6 py-3.5 font-mono text-sm uppercase tracking-wide hover:bg-neutral-200 transition-colors whitespace-nowrap border border-white"
                >
                    See what&apos;s out there <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </section>
    );
}
