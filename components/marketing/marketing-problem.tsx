"use client";

import { FolderX, GitCommit, Repeat } from "lucide-react";
import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";

const problems = [
    {
        icon: FolderX,
        title: "Research lives everywhere except where it should.",
        body: "Your team tracks tools in spreadsheets, Slack threads, and browser bookmarks. By the time someone needs the research, it's outdated, incomplete, or just gone.",
    },
    {
        icon: GitCommit,
        title: "Every evaluation is different. None are comparable.",
        body: "There's no standard scorecard. One person looks at pricing. Another looks at integrations. Nobody looks at the same things, so you can't compare tools side by side.",
    },
    {
        icon: Repeat,
        title: "Your team researches the same tools over and over.",
        body: "Without a shared database, two people spend 4 hours each evaluating a tool that was already reviewed 6 months ago. That time doesn't come back.",
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

export function MarketingProblem() {
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
                    Why Trackr Exists
                </span>
                <h2 className="text-3xl md:text-5xl font-serif font-normal mb-6">
                    Your tool research process is broken.
                </h2>
                <p className="text-lg md:text-xl font-mono text-neutral-600 max-w-3xl leading-relaxed">
                    You're spending hours on research that goes nowhere, gets repeated by someone else on your team, and lives in a Notion doc nobody opens again.
                </p>
            </motion.div>

            <motion.div
                ref={gridRef}
                variants={containerVariants}
                initial="hidden"
                animate={gridInView ? "show" : "hidden"}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                {problems.map((problem) => (
                    <motion.div
                        key={problem.title}
                        variants={cardVariants}
                        className="bg-white border border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                    >
                        <div className="w-12 h-12 bg-neutral-100 border border-black flex items-center justify-center mb-6">
                            <problem.icon className="w-6 h-6 text-black" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-serif font-medium mb-3">{problem.title}</h3>
                        <p className="font-mono text-sm text-neutral-600 leading-relaxed">{problem.body}</p>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
