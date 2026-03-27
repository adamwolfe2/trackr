"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { THINKING_LINES, COMPETITORS, MARKET_INTEL } from "./mock-data";
import { DemoWindow } from "./step-map-site";

export function StepCompetitiveIntel() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    const [thinkingIdx, setThinkingIdx] = useState(0);
    const [visibleCompetitors, setVisibleCompetitors] = useState(0);
    const [visibleIntel, setVisibleIntel] = useState(0);
    const hasStarted = useRef(false);

    useEffect(() => {
        if (!inView || hasStarted.current) return;
        hasStarted.current = true;

        // Thinking lines
        let tIdx = 0;
        const thinkInterval = setInterval(() => {
            tIdx++;
            setThinkingIdx(tIdx);
            if (tIdx >= THINKING_LINES.length) {
                clearInterval(thinkInterval);
                // Show competitors
                let compIdx = 0;
                const compInterval = setInterval(() => {
                    compIdx++;
                    setVisibleCompetitors(compIdx);
                    if (compIdx >= COMPETITORS.length) {
                        clearInterval(compInterval);
                        // Show market intel
                        let intelIdx = 0;
                        const intelInterval = setInterval(() => {
                            intelIdx++;
                            setVisibleIntel(intelIdx);
                            if (intelIdx >= MARKET_INTEL.length)
                                clearInterval(intelInterval);
                        }, 200);
                    }
                }, 250);
            }
        }, 600);

        return () => clearInterval(thinkInterval);
    }, [inView]);

    return (
        <DemoWindow title="trackr — competitive analyst" ref={ref}>
            <div className="p-4 space-y-4">
                {/* Thinking animation */}
                <div className="space-y-1 min-h-[60px]">
                    {THINKING_LINES.slice(0, thinkingIdx).map((line, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: i < thinkingIdx - 1 ? 0.4 : 1,
                            }}
                            transition={{ duration: 0.2 }}
                            className="font-mono text-[10px] italic text-neutral-500"
                        >
                            {line}
                        </motion.div>
                    ))}
                    {thinkingIdx > 0 && thinkingIdx < THINKING_LINES.length && (
                        <div className="flex gap-1 pt-1">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{
                                        duration: 0.8,
                                        repeat: Infinity,
                                        delay: i * 0.22,
                                    }}
                                    className="w-1.5 h-1.5 bg-black/20"
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Competitor grid */}
                {visibleCompetitors > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {COMPETITORS.slice(0, visibleCompetitors).map((comp) => (
                            <motion.div
                                key={comp.name}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border border-black/10 p-2 flex flex-col items-center gap-1.5"
                            >
                                <img
                                    src={`https://www.google.com/s2/favicons?domain=${comp.domain}&sz=32`}
                                    alt=""
                                    className="w-5 h-5"
                                />
                                <span className="font-mono text-[9px] text-black text-center">
                                    {comp.name}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Market intel */}
                {visibleIntel > 0 && (
                    <div className="border border-black/10 p-3 space-y-1.5">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                            Market Intel
                        </span>
                        {MARKET_INTEL.slice(0, visibleIntel).map((item) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.15 }}
                                className="flex justify-between items-center"
                            >
                                <span className="font-mono text-[9px] text-neutral-500">
                                    {item.label}
                                </span>
                                <span className="font-mono text-[9px] text-black font-bold">
                                    {item.value}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </DemoWindow>
    );
}
