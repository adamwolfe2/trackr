"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import {
    REDDIT_LANES,
    REDDIT_UNIQUE_COUNT,
    REDDIT_TOTAL_COUNT,
} from "./mock-data";
import { DemoWindow } from "./step-map-site";

export function StepRedditDeepDive() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    const [laneProgress, setLaneProgress] = useState<number[]>([0, 0, 0]);
    const [showMerge, setShowMerge] = useState(false);
    const hasStarted = useRef(false);

    useEffect(() => {
        if (!inView || hasStarted.current) return;
        hasStarted.current = true;

        // Stagger 3 lanes
        REDDIT_LANES.forEach((lane, laneIdx) => {
            const staggerDelay = laneIdx * 300;
            setTimeout(() => {
                let count = 0;
                const interval = setInterval(() => {
                    count++;
                    setLaneProgress((prev) => {
                        const next = [...prev];
                        next[laneIdx] = count;
                        return next;
                    });
                    if (count >= lane.threads.length) clearInterval(interval);
                }, 250);
            }, staggerDelay);
        });

        // Show merge after all lanes complete
        const totalTime =
            300 * 2 + 250 * Math.max(...REDDIT_LANES.map((l) => l.threads.length)) + 600;
        setTimeout(() => setShowMerge(true), totalTime);
    }, [inView]);

    return (
        <DemoWindow title="trackr — reddit deep dive" ref={ref}>
            <div className="p-4 space-y-4">
                {/* 3-column lane layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {REDDIT_LANES.map((lane, laneIdx) => (
                        <div key={lane.label} className="border border-black/10 p-3">
                            <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 mb-2">
                                {lane.label}
                            </div>
                            <div className="space-y-1.5">
                                {lane.threads
                                    .slice(0, laneProgress[laneIdx])
                                    .map((thread) => (
                                        <motion.div
                                            key={thread.title}
                                            initial={{ opacity: 0, x: -4 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.22 }}
                                            className="flex items-start gap-1.5"
                                        >
                                            <span className="font-mono text-[8px] text-neutral-300 flex-shrink-0 mt-0.5">
                                                &rarr;
                                            </span>
                                            <div>
                                                <div className="font-mono text-[9px] text-black leading-tight line-clamp-2">
                                                    {thread.title}
                                                </div>
                                                <span className="font-mono text-[8px] text-neutral-400">
                                                    {thread.sub}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                {/* Pulsing dots while loading */}
                                {laneProgress[laneIdx] < lane.threads.length && laneProgress[laneIdx] > 0 && (
                                    <div className="flex gap-1 pt-1">
                                        {[0, 1, 2].map((i) => (
                                            <motion.div
                                                key={i}
                                                animate={{
                                                    opacity: [0.3, 1, 0.3],
                                                }}
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
                        </div>
                    ))}
                </div>

                {/* Merge summary */}
                {showMerge && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border border-black/10 p-3 text-center"
                    >
                        <span className="font-mono text-[10px] text-neutral-500">
                            {REDDIT_UNIQUE_COUNT} unique threads from{" "}
                            {REDDIT_TOTAL_COUNT} results
                        </span>
                        <span className="font-mono text-[9px] text-neutral-400 block mt-0.5">
                            duplicates removed &middot; ranked by relevance
                        </span>
                    </motion.div>
                )}
            </div>
        </DemoWindow>
    );
}
