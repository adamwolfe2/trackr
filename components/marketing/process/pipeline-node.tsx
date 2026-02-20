"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface PipelineNodeProps {
    stepNumber: number;
    stepName: string;
    serviceName: string;
    serviceDomain: string;
    description: string;
    detail: string;
    children: React.ReactNode;
    fullWidth?: boolean;
}

export function PipelineNode({
    stepNumber,
    stepName,
    serviceName,
    serviceDomain,
    description,
    detail,
    children,
    fullWidth = false,
}: PipelineNodeProps) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    const isOdd = stepNumber % 2 !== 0;

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: isOdd ? -20 : 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
            className="w-full"
        >
            {/* Badge */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative z-10 w-14 h-14 bg-black text-white border border-black flex-shrink-0 flex items-center justify-center font-mono font-bold text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {stepNumber}
                </div>
                <div>
                    <h3 className="font-serif text-2xl font-normal">{stepName}</h3>
                    <div className="inline-flex items-center gap-1.5 mt-1">
                        <img
                            src={`https://www.google.com/s2/favicons?domain=${serviceDomain}&sz=16`}
                            alt=""
                            className="w-3 h-3"
                        />
                        <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">
                            {serviceName}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content: alternating layout or full-width */}
            {fullWidth ? (
                <div className="space-y-4">
                    <p className="font-mono text-sm text-neutral-600 leading-relaxed max-w-2xl">
                        {description}
                    </p>
                    <span className="inline-block font-mono text-[10px] text-neutral-400">
                        {detail}
                    </span>
                    <div className="mt-4">{children}</div>
                </div>
            ) : (
                <div
                    className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-start ${
                        !isOdd ? "md:[direction:rtl]" : ""
                    }`}
                >
                    <div className={!isOdd ? "md:[direction:ltr]" : ""}>
                        <p className="font-mono text-sm text-neutral-600 leading-relaxed mb-3">
                            {description}
                        </p>
                        <span className="font-mono text-[10px] text-neutral-400">
                            {detail}
                        </span>
                    </div>
                    <div className={!isOdd ? "md:[direction:ltr]" : ""}>
                        {children}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
