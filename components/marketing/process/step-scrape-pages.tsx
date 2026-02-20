"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { SCRAPED_PAGES } from "./mock-data";
import { DemoWindow } from "./step-map-site";

export function StepScrapePages() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    const [columnChars, setColumnChars] = useState<number[]>([0, 0, 0, 0]);
    const [columnLines, setColumnLines] = useState<number[]>([0, 0, 0, 0]);
    const hasStarted = useRef(false);

    useEffect(() => {
        if (!inView || hasStarted.current) return;
        hasStarted.current = true;

        SCRAPED_PAGES.forEach((page, colIdx) => {
            const staggerDelay = colIdx * 200;

            setTimeout(() => {
                let lineCount = 0;
                const lineInterval = setInterval(() => {
                    lineCount++;
                    setColumnLines((prev) => {
                        const next = [...prev];
                        next[colIdx] = lineCount;
                        return next;
                    });
                    // Animate char count proportionally
                    setColumnChars((prev) => {
                        const next = [...prev];
                        next[colIdx] = Math.round(
                            (lineCount / page.lines.length) * page.chars
                        );
                        return next;
                    });
                    if (lineCount >= page.lines.length) clearInterval(lineInterval);
                }, 180);
            }, staggerDelay);
        });
    }, [inView]);

    return (
        <DemoWindow title="trackr — page scraper" ref={ref}>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-black/10">
                {SCRAPED_PAGES.map((page, colIdx) => (
                    <div key={page.label} className="p-3 min-h-[180px]">
                        <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 mb-2">
                            {page.label}
                        </div>
                        <div className="space-y-0.5">
                            {page.lines
                                .slice(0, columnLines[colIdx])
                                .map((line, lineIdx) => (
                                    <motion.div
                                        key={lineIdx}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.15 }}
                                        className={`font-mono text-[8px] leading-tight truncate ${
                                            line.startsWith("#")
                                                ? "text-black font-bold"
                                                : "text-neutral-500"
                                        }`}
                                    >
                                        {line}
                                    </motion.div>
                                ))}
                        </div>
                        {columnChars[colIdx] > 0 && (
                            <div className="mt-3 font-mono text-[9px] text-neutral-400">
                                {columnChars[colIdx].toLocaleString()} chars
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </DemoWindow>
    );
}
