"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { HERO_STATS } from "./mock-data";

export function ProcessHero() {
    return (
        <section className="py-20 border-t border-black/10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-3xl"
            >
                <span className="font-mono text-sm uppercase tracking-wider text-neutral-500 mb-4 block">
                    The Research Pipeline
                </span>
                <h1 className="font-serif text-4xl md:text-6xl font-normal mb-6 leading-tight">
                    How Trackr Researches Your Tools
                </h1>
                <p className="font-mono text-base text-neutral-600 leading-relaxed max-w-2xl">
                    7 research agents. 25+ data sources. One structured report.
                    Watch the entire pipeline in real time.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
                className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-black mt-12 mb-16"
            >
                {HERO_STATS.map((item, i) => (
                    <div
                        key={item.label}
                        className={`p-6 md:p-8 ${
                            i < HERO_STATS.length - 1
                                ? "border-b md:border-b-0 md:border-r border-black"
                                : ""
                        } ${i === 1 ? "border-b md:border-b-0" : ""}`}
                    >
                        <div className="font-serif text-3xl md:text-4xl font-normal mb-2">
                            {item.value}
                        </div>
                        <p className="font-mono text-xs text-neutral-500 leading-relaxed">
                            {item.label}
                        </p>
                    </div>
                ))}
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col items-center gap-2"
            >
                <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest">
                    Scroll to explore
                </span>
                <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <ChevronDown className="w-5 h-5 text-neutral-400" />
                </motion.div>
            </motion.div>
        </section>
    );
}
