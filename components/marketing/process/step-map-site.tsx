"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { SITEMAP_URLS } from "./mock-data";

export function StepMapSite() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    const [visibleCount, setVisibleCount] = useState(0);
    const hasStarted = useRef(false);

    useEffect(() => {
        if (!inView || hasStarted.current) return;
        hasStarted.current = true;

        let count = 0;
        const interval = setInterval(() => {
            count++;
            setVisibleCount(count);
            if (count >= SITEMAP_URLS.length) clearInterval(interval);
        }, 200);

        return () => clearInterval(interval);
    }, [inView]);

    return (
        <DemoWindow title="trackr — site mapper" ref={ref}>
            <div className="p-4 font-mono text-xs space-y-0">
                {SITEMAP_URLS.slice(0, visibleCount).map((item, i) => (
                    <motion.div
                        key={item.url}
                        initial={{ opacity: 0, x: -3 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.22 }}
                        className="flex items-center gap-2 py-1"
                    >
                        {/* Tree indent */}
                        {item.depth > 0 && (
                            <span className="text-neutral-300 select-none pl-2">
                                {i === SITEMAP_URLS.length - 1 || i === visibleCount - 1
                                    ? "└─"
                                    : "├─"}
                            </span>
                        )}
                        <span
                            className={
                                item.tag
                                    ? "text-black font-bold"
                                    : "text-neutral-500"
                            }
                        >
                            {item.url}
                        </span>
                        {item.tag && (
                            <span className="bg-black text-white px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-bold">
                                {item.tag}
                            </span>
                        )}
                    </motion.div>
                ))}
            </div>
            {visibleCount > 0 && (
                <div className="border-t border-black/10 px-4 py-2 flex justify-between items-center">
                    <span className="font-mono text-[10px] text-neutral-400">
                        {visibleCount} URLs found
                    </span>
                    <span className="font-mono text-[10px] text-neutral-400">
                        {SITEMAP_URLS.filter((u) => u.tag).length > 0 &&
                            `${Math.min(visibleCount, SITEMAP_URLS.filter((u) => u.tag).length)} key pages detected`}
                    </span>
                </div>
            )}
        </DemoWindow>
    );
}

import { forwardRef } from "react";

const DemoWindow = forwardRef<
    HTMLDivElement,
    { title: string; children: React.ReactNode; large?: boolean }
>(function DemoWindow({ title, children, large = false }, ref) {
    return (
        <div ref={ref} className="relative w-full">
            <div
                className={`w-full border border-black bg-white overflow-hidden ${
                    large
                        ? "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                        : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                }`}
            >
                <div className="bg-black px-4 py-2.5 flex items-center gap-2">
                    <div className="w-2 h-2 bg-white/20" />
                    <div className="w-2 h-2 bg-white/20" />
                    <div className="w-2 h-2 bg-white/20" />
                    <span className="ml-2 font-mono text-[10px] text-white/60 uppercase tracking-wider">
                        {title}
                    </span>
                </div>
                {children}
            </div>
            <div className="absolute -bottom-3 -right-3 w-full h-full border border-black/20 -z-10" />
        </div>
    );
});

export { DemoWindow };
