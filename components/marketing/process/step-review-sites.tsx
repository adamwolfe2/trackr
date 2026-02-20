"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { REVIEW_QUERY, REVIEW_DOMAINS, REVIEW_RESULTS } from "./mock-data";
import { DemoWindow } from "./step-map-site";

export function StepReviewSites() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    const [typedQuery, setTypedQuery] = useState("");
    const [visibleDomains, setVisibleDomains] = useState(0);
    const [visibleResults, setVisibleResults] = useState(0);
    const hasStarted = useRef(false);

    useEffect(() => {
        if (!inView || hasStarted.current) return;
        hasStarted.current = true;

        // Type query
        let charIdx = 0;
        const typeInterval = setInterval(() => {
            charIdx++;
            setTypedQuery(REVIEW_QUERY.slice(0, charIdx));
            if (charIdx >= REVIEW_QUERY.length) {
                clearInterval(typeInterval);
                // Show domain pills
                let domainIdx = 0;
                const domainInterval = setInterval(() => {
                    domainIdx++;
                    setVisibleDomains(domainIdx);
                    if (domainIdx >= REVIEW_DOMAINS.length) {
                        clearInterval(domainInterval);
                        // Show result cards
                        let resultIdx = 0;
                        const resultInterval = setInterval(() => {
                            resultIdx++;
                            setVisibleResults(resultIdx);
                            if (resultIdx >= REVIEW_RESULTS.length)
                                clearInterval(resultInterval);
                        }, 400);
                    }
                }, 150);
            }
        }, 16);

        return () => clearInterval(typeInterval);
    }, [inView]);

    return (
        <DemoWindow title="trackr — review scanner" ref={ref}>
            <div className="p-4 space-y-4">
                {/* Search bar */}
                <div className="border border-black/20 px-3 py-2 font-mono text-xs text-neutral-700 min-h-[32px]">
                    {typedQuery}
                    {typedQuery.length < REVIEW_QUERY.length && (
                        <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="inline-block w-px h-3 bg-black ml-0.5 -mb-0.5"
                        />
                    )}
                </div>

                {/* Domain pills */}
                {visibleDomains > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {REVIEW_DOMAINS.slice(0, visibleDomains).map((d) => (
                            <motion.div
                                key={d.domain}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.15 }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 border border-black/10 bg-neutral-50"
                            >
                                <img
                                    src={`https://www.google.com/s2/favicons?domain=${d.domain}&sz=16`}
                                    alt=""
                                    className="w-3 h-3"
                                />
                                <span className="font-mono text-[9px] text-neutral-500">
                                    {d.name}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Result cards */}
                <div className="space-y-2">
                    {REVIEW_RESULTS.slice(0, visibleResults).map((result) => (
                        <motion.div
                            key={result.source}
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border border-black/10 p-3"
                        >
                            <div className="flex items-center gap-2 mb-1.5">
                                <img
                                    src={`https://www.google.com/s2/favicons?domain=${result.domain}&sz=16`}
                                    alt=""
                                    className="w-3 h-3"
                                />
                                <span className="font-mono text-[10px] font-bold text-black">
                                    {result.title}
                                </span>
                            </div>
                            <div className="mb-1.5">
                                <div className="h-[3px] bg-neutral-100 border border-neutral-200">
                                    <motion.div
                                        className="h-full bg-black"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${result.score}%` }}
                                        transition={{
                                            duration: 0.45,
                                            delay: 0.1,
                                            ease: "easeOut",
                                        }}
                                    />
                                </div>
                            </div>
                            <p className="font-mono text-[9px] text-neutral-500 leading-relaxed line-clamp-2">
                                {result.snippet}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </DemoWindow>
    );
}
