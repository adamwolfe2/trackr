"use client";

import { Bot, Sliders, Target, Search, Users, Newspaper, BarChart3, LayoutGrid } from "lucide-react";
import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";

const features = [
    {
        icon: Bot,
        title: "Research Agents",
        headline: "Send agents. Not interns.",
        body: "Trackr's research agents scrape pricing pages, product docs, Reddit threads, and G2 reviews on your behalf. They bring back structured data — not raw links — in under 2 minutes.",
        colSpan: "md:col-span-2"
    },
    {
        icon: Sliders,
        title: "Custom Scorecard",
        headline: "Score every tool the same way.",
        body: "Define what matters to your team: integration depth, pricing value, AI capabilities. Trackr scores every tool against your criteria automatically.",
        colSpan: "md:col-span-1"
    },
    {
        icon: LayoutGrid,
        title: "Portfolio Kanban",
        headline: "See every tool at a glance.",
        body: "Your tools live in a Kanban board: Backlog, Researching, Active, Archived. Stats bar shows total spend, avg score, and how many tools your team evaluated this month.",
        colSpan: "md:col-span-1"
    },
    {
        icon: BarChart3,
        title: "Spend Tracking",
        headline: "Know what you actually pay.",
        body: "Track every SaaS tool your team pays for. Trackr flags tools that score below 6 and cost real money — so you know exactly what to cut before the next renewal.",
        colSpan: "md:col-span-2"
    },
    {
        icon: Newspaper,
        title: "AI News Digest",
        headline: "Stay current without the noise.",
        body: "Trackr runs a daily search for AI tool launches and funding rounds. The digest surfaces what's relevant so you hear about the next great tool before your competitors do.",
        colSpan: "md:col-span-1"
    },
    {
        icon: Target,
        title: "Pain Points Engine",
        headline: "Context-aware research.",
        body: "Add your team's active pain points. Agents use them as context when scoring every tool — a tool for cold email gets evaluated differently than a tool for SEO.",
        colSpan: "md:col-span-1"
    },
    {
        icon: Search,
        title: "Semantic Search",
        headline: "Search in plain English.",
        body: "Ask 'what tools did we look at for outreach automation'. Trackr searches across tool names, report content, and team notes using semantic understanding.",
        colSpan: "md:col-span-1"
    },
    {
        icon: Users,
        title: "Team Workspace",
        headline: "One database. No duplication.",
        body: "Invite your team. Everyone can add tools, read reports, and leave notes. No more parallel research or spreadsheet chaos.",
        colSpan: "md:col-span-1"
    }
];

const containerVariants: Variants = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.07 },
    },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export function OffsetFeatures() {
    const headingRef = useRef(null);
    const headingInView = useInView(headingRef, { once: true, margin: "-60px" });

    const gridRef = useRef(null);
    const gridInView = useInView(gridRef, { once: true, margin: "-60px" });

    return (
        <section className="w-full py-24 border-t border-black/10" id="features">
            <motion.div
                ref={headingRef}
                initial={{ opacity: 0, y: 16 }}
                animate={headingInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
                className="mb-16"
            >
                <span className="text-sm font-mono uppercase tracking-wider text-neutral-500 mb-4 block">
                    What Trackr Does
                </span>
                <h2 className="text-3xl md:text-5xl font-serif font-normal mb-6">
                    Everything your team needs to evaluate tools well.
                </h2>
            </motion.div>

            <motion.div
                ref={gridRef}
                variants={containerVariants}
                initial="hidden"
                animate={gridInView ? "show" : "hidden"}
                className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-min"
            >
                {features.map((feature) => (
                    <motion.div
                        key={feature.title}
                        variants={cardVariants}
                        className={`bg-white border border-black p-8 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all duration-200 cursor-default ${feature.colSpan}`}
                    >
                        <div className="w-10 h-10 bg-neutral-100 border border-black flex items-center justify-center mb-6">
                            <feature.icon className="w-5 h-5 text-black" strokeWidth={1.5} />
                        </div>
                        <span className="font-mono text-xs uppercase tracking-wider text-neutral-400 mb-2 block">{feature.title}</span>
                        <h3 className="text-xl font-serif font-medium mb-3">{feature.headline}</h3>
                        <p className="font-mono text-sm text-neutral-600 leading-relaxed">
                            {feature.body}
                        </p>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
