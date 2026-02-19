"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
    {
        id: "01",
        label: "Submit",
        headline: "Add any tool by name, URL, or pain point.",
        body: "Type a tool name, paste a URL, or describe what you're looking for. Trackr finds the tool and queues it for research automatically.",
        micro: "Takes 10 seconds. No forms to fill.",
        color: "bg-black text-white",
    },
    {
        id: "02",
        label: "Research",
        headline: "Agents go to work. You do something else.",
        body: "Trackr's research agents crawl the tool's website, pricing page, and docs. They pull community reviews, funding data, and competitive context — then score the tool against your scorecard.",
        micro: "Full report ready in under 2 minutes.",
        color: "bg-neutral-600 text-white",
    },
    {
        id: "03",
        label: "Report",
        headline: "Get a clean, scored report. No noise.",
        body: "Every report includes: overall score, dimension-by-dimension breakdown, pricing tiers, key features, pros and cons, integrations, and top competitors. Everything your team needs to make a call.",
        micro: "Structured the same way, every time.",
        color: "bg-neutral-300 text-black",
    },
    {
        id: "04",
        label: "Track",
        headline: "Add notes. Change status. Re-research anytime.",
        body: "The whole team can add notes, flag tools as 'Testing' or 'Active', and trigger fresh research whenever the tool updates. Your database grows with your team.",
        micro: "Tools auto-refresh every 30 days.",
        color: "bg-white text-black",
    },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
            className="relative flex flex-col md:flex-row gap-8 md:gap-16 items-start group"
        >
            {/* Step Number */}
            <div className={`relative z-10 w-14 h-14 ${step.color} border border-black flex-shrink-0 flex items-center justify-center font-mono font-bold text-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200`}>
                {step.id}
            </div>

            <div className="flex-1 pt-2 pb-8 md:pb-0 border-b border-black/10 md:border-b-0">
                <span className="font-mono text-xs uppercase tracking-wider text-neutral-400 mb-2 block">{step.label}</span>
                <h3 className="text-2xl font-serif font-medium mb-3">{step.headline}</h3>
                <p className="font-mono text-sm text-neutral-600 leading-relaxed mb-4 max-w-2xl">
                    {step.body}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-black text-xs font-mono text-neutral-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <span className="w-1.5 h-1.5 bg-black" />
                    {step.micro}
                </div>
            </div>
        </motion.div>
    );
}

export function MarketingHowItWorks() {
    const headingRef = useRef(null);
    const headingInView = useInView(headingRef, { once: true, margin: "-60px" });

    return (
        <section className="w-full py-24 border-t border-black/10" id="how-it-works">
            <motion.div
                ref={headingRef}
                initial={{ opacity: 0, y: 16 }}
                animate={headingInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
                className="mb-16"
            >
                <span className="text-sm font-mono uppercase tracking-wider text-neutral-500 mb-4 block">
                    The Trackr Process
                </span>
                <h2 className="text-3xl md:text-5xl font-serif font-normal mb-6 max-w-3xl">
                    Submit a tool. Get a full report.<br className="hidden md:block" /> Keep the whole team in sync.
                </h2>
            </motion.div>

            <div className="grid grid-cols-1 gap-12 relative">
                {/* Connector Line */}
                <div className="hidden md:block absolute left-[27px] top-14 bottom-0 w-px border-l border-dashed border-black/20 z-0" />

                {steps.map((step, i) => (
                    <StepCard key={step.id} step={step} index={i} />
                ))}
            </div>
        </section>
    );
}
