"use client";

import { Check, X } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const rows = [
    { feature: "Tool research", trackr: "Automated by AI agents", notion: "You do it manually" },
    { feature: "Consistent scoring", trackr: "Same scorecard every time", notion: "Only if someone remembers" },
    { feature: "Stays up to date", trackr: "Auto-refreshes every 30 days", notion: "Goes stale immediately" },
    { feature: "Semantic search", trackr: "Natural language queries", notion: "Ctrl+F only" },
    { feature: "Team collaboration", trackr: "Shared workspace with roles", notion: "Unstructured, ad hoc" },
    { feature: "Discovery", trackr: "Surfaces new tools automatically", notion: "Not applicable" },
    { feature: "Report structure", trackr: "Standardized format, always", notion: "Different every time" },
];

export function MarketingComparison() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });

    return (
        <section className="w-full py-24 border-t border-black/10">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5 }}
                className="mb-16"
            >
                <span className="text-sm font-mono uppercase tracking-wider text-[#8B9A7F] mb-4 block">
                    Why Not Just Use...
                </span>
                <h2 className="text-3xl md:text-5xl font-serif font-normal mb-8">
                    Notion docs and spreadsheets don&apos;t do research.
                </h2>
            </motion.div>

            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
                className="overflow-x-auto"
            >
                <table className="w-full border-collapse font-mono text-sm">
                    <thead>
                        <tr className="border-b border-black">
                            <th className="py-4 px-6 text-left w-1/3 font-normal text-neutral-500 uppercase tracking-wide text-xs" />
                            <th className="py-4 px-6 text-left w-1/3 bg-black text-white border-l border-black text-sm font-mono uppercase tracking-wider">Trackr</th>
                            <th className="py-4 px-6 text-left w-1/3 border-l border-black text-neutral-400 font-mono uppercase tracking-wider text-xs font-normal">Notion / Sheets</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <motion.tr
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={inView ? { opacity: 1 } : {}}
                                transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
                                className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
                            >
                                <td className="py-5 px-6 font-medium text-neutral-700">{row.feature}</td>
                                <td className="py-5 px-6 bg-neutral-50 border-l border-black font-medium">
                                    <div className="flex items-center gap-2.5">
                                        <Check className="w-4 h-4 text-[#8B9A7F] flex-shrink-0" />
                                        {row.trackr}
                                    </div>
                                </td>
                                <td className="py-5 px-6 border-l border-neutral-200 text-neutral-500">
                                    <div className="flex items-center gap-2.5">
                                        <X className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                                        {row.notion}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </section>
    );
}
