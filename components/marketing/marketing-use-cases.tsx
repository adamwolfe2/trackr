"use client";

import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";

const cases = [
    {
        title: "AI & Ops Agencies",
        hook: "Know what's best in the market before your clients ask.",
        body: "Agency teams evaluate 10–30 tools per month across automation, outreach, CRM, and analytics. Trackr turns that research into a shared database your whole team can reference and build on.",
        tag: "Agencies",
    },
    {
        title: "Startup Ops & Growth",
        hook: "Build a tool stack that's actually based on research.",
        body: "Startups move fast and often adopt tools before they've been properly evaluated. Trackr gives ops and growth teams a systematic process for finding, scoring, and tracking tools.",
        tag: "Startups",
    },
    {
        title: "Founders & Solopreneurs",
        hook: "Stop reading 14 landing pages to make one decision.",
        body: "You don't have a team to delegate research to. Trackr's agents do it in 2 minutes. Add a tool, read the report, make the call. Build a personal tool database you can come back to.",
        tag: "Solo",
    },
];

const containerVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function MarketingUseCases() {
    const headingRef = useRef(null);
    const headingInView = useInView(headingRef, { once: true, margin: "-60px" });

    const gridRef = useRef(null);
    const gridInView = useInView(gridRef, { once: true, margin: "-60px" });

    return (
        <section className="w-full py-24 border-t border-black/10">
            <motion.div
                ref={headingRef}
                initial={{ opacity: 0, y: 16 }}
                animate={headingInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
                className="mb-16"
            >
                <span className="text-sm font-mono uppercase tracking-wider text-neutral-500 mb-4 block">
                    Who Uses Trackr
                </span>
                <h2 className="text-3xl md:text-5xl font-serif font-normal mb-8">
                    If your team evaluates tools, Trackr saves you time.
                </h2>
            </motion.div>

            <motion.div
                ref={gridRef}
                variants={containerVariants}
                initial="hidden"
                animate={gridInView ? "show" : "hidden"}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                {cases.map((c) => (
                    <motion.div
                        key={c.title}
                        variants={cardVariants}
                        className="bg-white border border-black p-8 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all duration-200"
                    >
                        <span className="inline-block font-mono text-[10px] uppercase tracking-wider text-black border border-black bg-neutral-100 px-2 py-0.5 mb-5">
                            {c.tag}
                        </span>
                        <h3 className="text-xl font-serif font-medium mb-3">{c.title}</h3>
                        <p className="font-mono text-sm text-black font-medium mb-3 leading-relaxed">{c.hook}</p>
                        <p className="font-mono text-sm text-neutral-600 leading-relaxed">{c.body}</p>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
