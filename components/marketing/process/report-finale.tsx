"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import {
    DEMO_TOOL,
    SCORECARD_DIMENSIONS,
    PROS,
    CONS,
    COMPETITORS,
    DATA_SOURCES_SUMMARY,
} from "./mock-data";
import { DemoWindow } from "./step-map-site";

function AnimatedScore({
    score,
    animate,
}: {
    score: number;
    animate: boolean;
}) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        if (!animate) {
            setDisplay(0);
            return;
        }
        let val = 0;
        const step = score / 22;
        const t = setInterval(() => {
            val += step;
            if (val >= score) {
                setDisplay(score);
                clearInterval(t);
            } else setDisplay(Math.round(val));
        }, 26);
        return () => clearInterval(t);
    }, [animate, score]);
    return <span>{display}</span>;
}

export function ReportFinale() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    const [phase, setPhase] = useState(0);
    const hasStarted = useRef(false);

    useEffect(() => {
        if (!inView || hasStarted.current) return;
        hasStarted.current = true;

        // Stagger phases: 0=header, 1=score, 2=scorecard, 3=pros/cons, 4=competitors, 5=sentiment, 6=sources
        const delays = [0, 400, 800, 1600, 2200, 2800, 3200];
        delays.forEach((delay, i) => {
            setTimeout(() => setPhase(i + 1), delay);
        });
    }, [inView]);

    return (
        <div ref={ref} className="py-8">
            <div className="flex flex-col items-center mb-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.4 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-black text-xs font-mono text-neutral-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4"
                >
                    <span className="w-1.5 h-1.5 bg-black" />
                    Final Output
                </motion.div>
            </div>

            <DemoWindow title="trackr — research report" large>
                <div className="p-6 md:p-8 space-y-6">
                    {/* Header: Tool name + score */}
                    {phase >= 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <img
                                    src={`https://www.google.com/s2/favicons?domain=${DEMO_TOOL.domain}&sz=32`}
                                    alt=""
                                    className="w-8 h-8"
                                />
                                <div>
                                    <h4 className="font-serif text-2xl font-normal">
                                        {DEMO_TOOL.name}
                                    </h4>
                                    <span className="font-mono text-[10px] text-neutral-500">
                                        {DEMO_TOOL.url}
                                    </span>
                                </div>
                            </div>
                            {phase >= 2 && (
                                <div className="text-right">
                                    <div className="font-serif text-5xl font-normal">
                                        <AnimatedScore
                                            score={DEMO_TOOL.score}
                                            animate={phase >= 2}
                                        />
                                    </div>
                                    <span className="font-mono text-[10px] text-neutral-400">
                                        /100
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Scorecard dimensions */}
                    {phase >= 3 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-2"
                        >
                            {SCORECARD_DIMENSIONS.map((dim, i) => (
                                <div
                                    key={dim.label}
                                    className="flex items-center gap-3"
                                >
                                    <span className="font-mono text-[10px] text-neutral-500 w-32">
                                        {dim.label}
                                    </span>
                                    <div className="flex-1 h-[3px] bg-neutral-100 border border-neutral-200">
                                        <motion.div
                                            className="h-full bg-black"
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${dim.score}%`,
                                            }}
                                            transition={{
                                                duration: 0.45,
                                                delay: i * 0.055,
                                                ease: "easeOut",
                                            }}
                                        />
                                    </div>
                                    <span className="font-mono text-[10px] text-black font-bold w-8 text-right">
                                        {dim.score}
                                    </span>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* Pros / Cons */}
                    {phase >= 4 && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            <div className="border border-black/10 p-4">
                                <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 block mb-2">
                                    Pros
                                </span>
                                <ul className="space-y-1.5">
                                    {PROS.map((pro) => (
                                        <li
                                            key={pro}
                                            className="font-mono text-[10px] text-black flex items-start gap-1.5"
                                        >
                                            <span className="text-black mt-0.5">
                                                +
                                            </span>
                                            {pro}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="border border-black/10 p-4">
                                <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 block mb-2">
                                    Cons
                                </span>
                                <ul className="space-y-1.5">
                                    {CONS.map((con) => (
                                        <li
                                            key={con}
                                            className="font-mono text-[10px] text-black flex items-start gap-1.5"
                                        >
                                            <span className="text-neutral-400 mt-0.5">
                                                &minus;
                                            </span>
                                            {con}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    )}

                    {/* Competitors */}
                    {phase >= 5 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 block mb-2">
                                Top Competitors
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {COMPETITORS.map((comp) => (
                                    <div
                                        key={comp.name}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-black/10"
                                    >
                                        <img
                                            src={`https://www.google.com/s2/favicons?domain=${comp.domain}&sz=16`}
                                            alt=""
                                            className="w-3 h-3"
                                        />
                                        <span className="font-mono text-[10px]">
                                            {comp.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Sentiment + Sources */}
                    {phase >= 6 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-t border-black/10 pt-4"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-black bg-black text-white">
                                <span className="font-mono text-[10px] uppercase tracking-wider">
                                    {DEMO_TOOL.sentiment} (
                                    {DEMO_TOOL.sentimentConfidence}% confidence)
                                </span>
                            </div>
                            <span className="font-mono text-[10px] text-neutral-400">
                                {DATA_SOURCES_SUMMARY.totalSources} sources |{" "}
                                {DATA_SOURCES_SUMMARY.pagesScraped} pages |{" "}
                                {DATA_SOURCES_SUMMARY.redditThreads} Reddit
                                threads
                            </span>
                        </motion.div>
                    )}
                </div>
            </DemoWindow>
        </div>
    );
}
