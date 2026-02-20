"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface PipelineConnectorProps {
    label: string;
}

export function PipelineConnector({ label }: PipelineConnectorProps) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-40px" });

    return (
        <div ref={ref} className="flex flex-col items-center py-6">
            {/* Dashed line with flowing dot */}
            <div className="relative h-16 w-px border-l border-dashed border-black/20">
                {inView && (
                    <motion.div
                        className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-black/30"
                        initial={{ top: 0, opacity: 0 }}
                        animate={{
                            top: ["0%", "100%"],
                            opacity: [0, 1, 1, 0],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                )}
            </div>

            {/* Data label */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-neutral-50 border border-black/10 px-3 py-1.5 font-mono text-[10px] text-neutral-500 text-center"
            >
                {label}
            </motion.div>

            {/* Bottom dashed line */}
            <div className="relative h-16 w-px border-l border-dashed border-black/20">
                {inView && (
                    <motion.div
                        className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-black/30"
                        initial={{ top: 0, opacity: 0 }}
                        animate={{
                            top: ["0%", "100%"],
                            opacity: [0, 1, 1, 0],
                        }}
                        transition={{
                            duration: 1.5,
                            delay: 0.75,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                )}
            </div>
        </div>
    );
}
