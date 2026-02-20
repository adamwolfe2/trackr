"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { TRUST_SOURCES, TRUST_SUMMARY } from "./mock-data";
import { DemoWindow } from "./step-map-site";

export function StepTrustReputation() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    const [visibleSources, setVisibleSources] = useState(0);
    const [showSummary, setShowSummary] = useState(false);
    const [typedSummary, setTypedSummary] = useState("");
    const hasStarted = useRef(false);

    useEffect(() => {
        if (!inView || hasStarted.current) return;
        hasStarted.current = true;

        let sourceIdx = 0;
        const sourceInterval = setInterval(() => {
            sourceIdx++;
            setVisibleSources(sourceIdx);
            if (sourceIdx >= TRUST_SOURCES.length) {
                clearInterval(sourceInterval);
                setTimeout(() => {
                    setShowSummary(true);
                    let charIdx = 0;
                    const typeInterval = setInterval(() => {
                        charIdx += 2;
                        setTypedSummary(TRUST_SUMMARY.slice(0, charIdx));
                        if (charIdx >= TRUST_SUMMARY.length)
                            clearInterval(typeInterval);
                    }, 12);
                }, 400);
            }
        }, 350);

        return () => clearInterval(sourceInterval);
    }, [inView]);

    // Composite trust score (average of visible sources)
    const compositeScore =
        visibleSources > 0
            ? Math.round(
                  TRUST_SOURCES.slice(0, visibleSources).reduce(
                      (sum, s) => sum + s.strength,
                      0
                  ) / visibleSources
              )
            : 0;

    return (
        <DemoWindow title="trackr — trust verifier" ref={ref}>
            <div className="p-4 space-y-3">
                {/* Trust source cards */}
                <div className="space-y-2">
                    {TRUST_SOURCES.slice(0, visibleSources).map((source) => (
                        <motion.div
                            key={source.source}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
                            className="flex items-center gap-3 border border-black/10 p-2.5"
                        >
                            <img
                                src={`https://www.google.com/s2/favicons?domain=${source.domain}&sz=16`}
                                alt=""
                                className="w-4 h-4 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="font-mono text-[10px] font-bold text-black">
                                    {source.source}
                                </div>
                                <div className="font-mono text-[9px] text-neutral-500 truncate">
                                    {source.signal}
                                </div>
                            </div>
                            <div className="flex-shrink-0 w-16">
                                <div className="h-[3px] bg-neutral-100 border border-neutral-200">
                                    <motion.div
                                        className="h-full bg-black"
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${source.strength}%`,
                                        }}
                                        transition={{
                                            duration: 0.45,
                                            delay: 0.1,
                                            ease: "easeOut",
                                        }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Composite trust signal bar */}
                {visibleSources > 0 && (
                    <div className="border border-black/10 p-3">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                                Trust Signal
                            </span>
                            <span className="font-mono text-xs font-bold text-black">
                                {compositeScore}/100
                            </span>
                        </div>
                        <div className="h-2 bg-neutral-100 border border-neutral-200">
                            <motion.div
                                className="h-full bg-black"
                                initial={{ width: 0 }}
                                animate={{ width: `${compositeScore}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                )}

                {/* AI summary */}
                {showSummary && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-mono text-[9px] text-neutral-500 italic leading-relaxed"
                    >
                        {typedSummary}
                        {typedSummary.length < TRUST_SUMMARY.length && (
                            <motion.span
                                animate={{ opacity: [1, 0] }}
                                transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                }}
                                className="inline-block w-px h-2 bg-neutral-400 ml-0.5 -mb-0.5"
                            />
                        )}
                    </motion.div>
                )}
            </div>
        </DemoWindow>
    );
}
