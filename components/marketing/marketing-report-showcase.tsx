"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const SHOWCASE_REPORTS = [
    {
        name: "Linear",
        url: "linear.app",
        favicon: "https://www.google.com/s2/favicons?domain=linear.app&sz=32",
        tagline: "Issue tracking for modern teams",
        score: 9.1,
        categories: ["Project Mgmt", "Dev Tools"],
        dimensions: [
            { label: "Features", score: 9.3 },
            { label: "Pricing Value", score: 8.7 },
            { label: "AI Capabilities", score: 8.9 },
            { label: "Ease of Use", score: 9.4 },
            { label: "Integrations", score: 9.0 },
        ],
        pros: ["Fastest UI of any PM tool", "GitHub & GitLab sync is seamless", "Clean issue hierarchy (projects → cycles)"],
        cons: ["No native time tracking", "Enterprise pricing isn't public"],
        verdict: "Strong fit. Evaluate against Jira for larger orgs.",
    },
    {
        name: "Figma",
        url: "figma.com",
        favicon: "https://www.google.com/s2/favicons?domain=figma.com&sz=32",
        tagline: "Collaborative interface design platform",
        score: 8.8,
        categories: ["Design", "Collaboration"],
        dimensions: [
            { label: "Features", score: 9.1 },
            { label: "Pricing Value", score: 8.0 },
            { label: "AI Capabilities", score: 7.8 },
            { label: "Ease of Use", score: 9.2 },
            { label: "Integrations", score: 8.9 },
        ],
        pros: ["Industry standard — designers already know it", "Real-time multiplayer editing", "Plugin ecosystem is extensive"],
        cons: ["Pricing jumped 2x in 2024", "Performance degrades on large files"],
        verdict: "Approved for design team. Negotiate pricing at 5+ seats.",
    },
    {
        name: "Notion",
        url: "notion.so",
        favicon: "https://www.google.com/s2/favicons?domain=notion.so&sz=32",
        tagline: "Connected workspace for docs & databases",
        score: 8.4,
        categories: ["Wiki", "Productivity"],
        dimensions: [
            { label: "Features", score: 9.2 },
            { label: "Pricing Value", score: 8.5 },
            { label: "AI Capabilities", score: 8.1 },
            { label: "Ease of Use", score: 7.8 },
            { label: "Integrations", score: 8.4 },
        ],
        pros: ["Extremely flexible — docs + databases in one", "AI features maturing quickly", "Good for onboarding wikis"],
        cons: ["Steep learning curve for new hires", "Can be slow with large databases"],
        verdict: "Replace internal wiki. Pair with Linear for project tracking.",
    },
];

function ScoreBar({ score, animate, delay }: { score: number; animate: boolean; delay: number }) {
    return (
        <div className="h-1 bg-neutral-100 border border-neutral-200">
            <motion.div
                className="h-full bg-black"
                initial={{ width: 0 }}
                animate={animate ? { width: `${score * 10}%` } : { width: 0 }}
                transition={{ duration: 0.7, delay, ease: "easeOut" }}
            />
        </div>
    );
}

function ReportCard({ report, index }: { report: typeof SHOWCASE_REPORTS[0]; index: number }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: index * 0.1, ease: "easeOut" }}
            className="border border-black bg-white flex flex-col"
        >
            {/* Card Header */}
            <div className="border-b border-black px-5 py-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={report.favicon}
                        alt={report.name}
                        className="w-5 h-5 flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div className="min-w-0">
                        <div className="font-serif text-lg font-medium leading-tight">{report.name}</div>
                        <div className="font-mono text-[10px] text-neutral-400 truncate">{report.tagline}</div>
                    </div>
                </div>
                <div className="text-right flex-shrink-0">
                    <div className="font-mono text-3xl font-bold leading-none">{report.score}</div>
                    <div className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider">/10</div>
                </div>
            </div>

            {/* Score Dimensions */}
            <div className="px-5 py-4 border-b border-neutral-100 space-y-2.5">
                {report.dimensions.map((dim, i) => (
                    <div key={dim.label}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-mono text-[10px] uppercase tracking-wide text-neutral-500">{dim.label}</span>
                            <span className="font-mono text-[10px] font-bold">{dim.score}</span>
                        </div>
                        <ScoreBar score={dim.score} animate={inView} delay={0.2 + i * 0.06 + index * 0.1} />
                    </div>
                ))}
            </div>

            {/* Pros / Cons */}
            <div className="grid grid-cols-2 border-b border-neutral-100 flex-1">
                <div className="px-4 py-4 border-r border-neutral-100">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Pros</div>
                    <ul className="space-y-1.5">
                        {report.pros.map((pro, i) => (
                            <li key={i} className="font-mono text-[10px] text-neutral-700 flex gap-1.5">
                                <span className="text-neutral-300 flex-shrink-0">+</span>
                                {pro}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="px-4 py-4">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Cons</div>
                    <ul className="space-y-1.5">
                        {report.cons.map((con, i) => (
                            <li key={i} className="font-mono text-[10px] text-neutral-700 flex gap-1.5">
                                <span className="text-neutral-300 flex-shrink-0">−</span>
                                {con}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Verdict */}
            <div className="px-5 py-3 bg-[#F3F3EF] border-t border-black">
                <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Verdict</div>
                <p className="font-mono text-xs text-neutral-700">{report.verdict}</p>
            </div>

            {/* Categories */}
            <div className="px-5 py-3 flex items-center gap-2 border-t border-neutral-100">
                {report.categories.map(c => (
                    <span key={c} className="font-mono text-[9px] border border-neutral-300 px-1.5 py-0.5 text-neutral-500 uppercase tracking-wider">{c}</span>
                ))}
                <span className="font-mono text-[9px] text-neutral-300 ml-auto">{report.url}</span>
            </div>
        </motion.div>
    );
}

export function MarketingReportShowcase() {
    const headingRef = useRef(null);
    const inView = useInView(headingRef, { once: true, margin: "-60px" });

    return (
        <section className="w-full py-24 border-t border-black/10" id="reports">
            <motion.div
                ref={headingRef}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
                className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
            >
                <div>
                    <span className="text-sm font-mono uppercase tracking-wider text-neutral-500 mb-4 block">
                        Real Research Output
                    </span>
                    <h2 className="text-3xl md:text-5xl font-serif font-normal max-w-2xl">
                        This is what you get. Every time.
                    </h2>
                    <p className="font-mono text-sm text-neutral-500 mt-4 max-w-xl leading-relaxed">
                        Trackr generates these reports automatically — scored against your team&apos;s criteria, pulled from live web data. Below are three real-looking examples.
                    </p>
                </div>
                <Link
                    href="/sign-up"
                    className="flex-shrink-0 flex items-center gap-2 border border-black px-6 py-3.5 font-mono text-sm uppercase tracking-wide bg-black text-white hover:bg-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all whitespace-nowrap"
                >
                    Get your reports <ArrowRight className="w-4 h-4" />
                </Link>
            </motion.div>

            {/* Report Cards — horizontal scroll on mobile, 3-col on lg */}
            <div className="flex gap-5 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-3">
                {SHOWCASE_REPORTS.map((report, i) => (
                    <div key={report.name} className="flex-shrink-0 w-[300px] sm:w-[340px] md:w-auto">
                        <ReportCard report={report} index={i} />
                    </div>
                ))}
            </div>
        </section>
    );
}
