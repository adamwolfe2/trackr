"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import {
    CONTEXT_SECTIONS,
    SYNTHESIS_SUMMARY,
    SCORECARD_DIMENSIONS,
} from "./mock-data";
import { DemoWindow } from "./step-map-site";
import { CheckCircle2 } from "lucide-react";

export function StepAiSynthesis() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    const [contextProgress, setContextProgress] = useState(0);
    const [typedSummary, setTypedSummary] = useState("");
    const [visibleScores, setVisibleScores] = useState(0);
    const [statusText, setStatusText] = useState("");
    const hasStarted = useRef(false);

    useEffect(() => {
        if (!inView || hasStarted.current) return;
        hasStarted.current = true;

        setStatusText("Loading context...");

        // Feed context sections
        let ctxIdx = 0;
        const ctxInterval = setInterval(() => {
            ctxIdx++;
            setContextProgress(ctxIdx);
            if (ctxIdx >= CONTEXT_SECTIONS.length) {
                clearInterval(ctxInterval);
                setStatusText("Generating...");

                // Type summary
                let charIdx = 0;
                const typeInterval = setInterval(() => {
                    charIdx += 3;
                    setTypedSummary(SYNTHESIS_SUMMARY.slice(0, charIdx));
                    if (charIdx >= SYNTHESIS_SUMMARY.length) {
                        clearInterval(typeInterval);
                        setStatusText("Validating schema...");

                        // Show scorecard dimensions
                        let scoreIdx = 0;
                        const scoreInterval = setInterval(() => {
                            scoreIdx++;
                            setVisibleScores(scoreIdx);
                            if (scoreIdx >= SCORECARD_DIMENSIONS.length) {
                                clearInterval(scoreInterval);
                                setStatusText("Complete.");
                            }
                        }, 120);
                    }
                }, 10);
            }
        }, 300);

        return () => clearInterval(ctxInterval);
    }, [inView]);

    const totalChars = CONTEXT_SECTIONS.slice(0, contextProgress).reduce(
        (sum, s) => sum + parseFloat(s.size) * 1000,
        0
    );

    return (
        <DemoWindow title="trackr — report synthesizer" ref={ref}>
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-black/10 min-h-[280px]">
                {/* Left: Context Feed */}
                <div className="p-4">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 block mb-3">
                        Context Feed
                    </span>
                    <div className="space-y-1.5">
                        {CONTEXT_SECTIONS.map((section, i) => (
                            <div
                                key={section.label}
                                className="flex items-center gap-2"
                            >
                                {i < contextProgress ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <CheckCircle2 className="w-3 h-3 text-black flex-shrink-0" />
                                    </motion.div>
                                ) : (
                                    <div className="w-3 h-3 border border-neutral-200 flex-shrink-0" />
                                )}
                                <span
                                    className={`font-mono text-[9px] ${
                                        i < contextProgress
                                            ? "text-black"
                                            : "text-neutral-300"
                                    }`}
                                >
                                    {section.label}
                                </span>
                                <span className="font-mono text-[8px] text-neutral-400 ml-auto">
                                    {section.size}
                                </span>
                            </div>
                        ))}
                    </div>
                    {contextProgress > 0 && (
                        <div className="mt-3 font-mono text-[9px] text-neutral-400">
                            ~{Math.round(totalChars).toLocaleString()} chars
                            loaded
                        </div>
                    )}
                </div>

                {/* Right: Structured Output */}
                <div className="p-4">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 block mb-3">
                        Structured Output
                    </span>
                    {typedSummary && (
                        <div className="mb-3">
                            <span className="font-mono text-[9px] text-neutral-400">
                                summary:
                            </span>
                            <p className="font-mono text-[9px] text-black leading-relaxed mt-0.5">
                                {typedSummary}
                                {typedSummary.length <
                                    SYNTHESIS_SUMMARY.length && (
                                    <motion.span
                                        animate={{ opacity: [1, 0] }}
                                        transition={{
                                            duration: 0.5,
                                            repeat: Infinity,
                                        }}
                                        className="inline-block w-px h-2 bg-black ml-0.5 -mb-0.5"
                                    />
                                )}
                            </p>
                        </div>
                    )}
                    {visibleScores > 0 && (
                        <div className="space-y-1">
                            <span className="font-mono text-[9px] text-neutral-400">
                                scorecardSnapshot:
                            </span>
                            {SCORECARD_DIMENSIONS.slice(
                                0,
                                visibleScores
                            ).map((dim) => (
                                <motion.div
                                    key={dim.label}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.1 }}
                                    className="flex items-center gap-2"
                                >
                                    <span className="font-mono text-[8px] text-neutral-500 w-24 truncate">
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
                                                ease: "easeOut",
                                            }}
                                        />
                                    </div>
                                    <span className="font-mono text-[8px] text-black font-bold w-6 text-right">
                                        {dim.score}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Progress bar */}
            {statusText && (
                <div className="border-t border-black/10 px-4 py-2 flex items-center gap-3">
                    <div className="flex-1 h-1 bg-neutral-100">
                        <motion.div
                            className="h-full bg-black"
                            animate={{
                                width:
                                    statusText === "Complete."
                                        ? "100%"
                                        : statusText === "Validating schema..."
                                          ? "90%"
                                          : statusText === "Generating..."
                                            ? "50%"
                                            : "20%",
                            }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    </div>
                    <span className="font-mono text-[9px] text-neutral-500">
                        {statusText}
                    </span>
                </div>
            )}
        </DemoWindow>
    );
}
