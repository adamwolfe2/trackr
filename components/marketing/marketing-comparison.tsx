"use client";

import { Check, X } from "lucide-react";

export function MarketingComparison() {
    return (
        <section className="w-full py-24 border-t border-black/10">
            <div className="mb-16">
                <span className="text-sm font-mono uppercase tracking-wider text-[#8B9A7F] mb-4 block">
                    Why Not Just Use...
                </span>
                <h2 className="text-3xl md:text-5xl font-serif font-normal mb-8">
                    Notion docs and spreadsheets don't do research.
                </h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse font-mono text-sm">
                    <thead>
                        <tr className="border-b border-black">
                            <th className="py-4 px-6 text-left w-1/3"></th>
                            <th className="py-4 px-6 text-left w-1/3 bg-black text-white border-l border-black text-base">Trackr</th>
                            <th className="py-4 px-6 text-left w-1/3 border-l border-black text-neutral-500">Notion / Sheets</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { feature: "Manual Research", trackr: "Automated research", notion: "No. You fill it in." },
                            { feature: "Consistent scoring", trackr: "Yes. Same scorecard every time.", notion: "Only if someone remembers." },
                            { feature: "Stays up to date", trackr: "Yes. Auto-refreshes every 30 days.", notion: "No. Goes stale immediately." },
                            { feature: "Semantic search", trackr: "Yes. Natural language queries.", notion: "No. Ctrl+F only." },
                            { feature: "Team collaboration", trackr: "Shared workspace with roles.", notion: "Yes, but unstructured." },
                            { feature: "Discovery", trackr: "Surfaces new tools.", notion: "No." },
                            { feature: "Report structure", trackr: "Standardized format.", notion: "Different every time." },
                        ].map((row, i) => (
                            <tr key={i} className="border-b border-neutral-200">
                                <td className="py-6 px-6 font-medium">{row.feature}</td>
                                <td className="py-6 px-6 bg-neutral-50 border-l border-black border-r font-medium">
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-600" />
                                        {row.trackr}
                                    </div>
                                </td>
                                <td className="py-6 px-6 border-r border-black text-neutral-500">
                                    <div className="flex items-center gap-2">
                                        <X className="w-4 h-4 text-neutral-400" />
                                        {row.notion}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
