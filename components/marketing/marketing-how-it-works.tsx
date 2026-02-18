"use client";

import { ArrowRight } from "lucide-react";

export function MarketingHowItWorks() {
    const steps = [
        {
            id: "01",
            label: "Submit",
            headline: "Add any tool by name, URL, or pain point.",
            body: "Type a tool name, paste a URL, or describe what you're looking for. Trackr finds the tool and queues it for research automatically.",
            micro: "Takes 10 seconds. No forms to fill."
        },
        {
            id: "02",
            label: "Research",
            headline: "Agents go to work. You do something else.",
            body: "Trackr's research agents crawl the tool's website, pricing page, and docs. They pull community reviews, funding data, and competitive context. Then they score the tool against your scorecard.",
            micro: "Full report ready in under 2 minutes."
        },
        {
            id: "03",
            label: "Report",
            headline: "Get a clean, scored report. No noise.",
            body: "Every report includes: overall score, dimension-by-dimension breakdown, pricing tiers, key features, pros and cons, integrations, and top competitors. Everything your team needs to make a call.",
            micro: "Structured the same way, every time."
        },
        {
            id: "04",
            label: "Track",
            headline: "Add notes. Change status. Re-research anytime.",
            body: "The whole team can add notes, flag tools as 'Testing' or 'Active', and trigger fresh research whenever the tool updates. Your database grows with your team.",
            micro: "Tools auto-refresh every 30 days."
        }
    ];

    return (
        <section className="w-full py-24 border-t border-black/10" id="how-it-works">
            <div className="mb-16">
                <span className="text-sm font-mono uppercase tracking-wider text-[#8B9A7F] mb-4 block">
                    The Trackr Process
                </span>
                <h2 className="text-3xl md:text-5xl font-serif font-normal mb-6 max-w-3xl">
                    Submit a tool. Get a full report. Keep the whole team in sync.
                </h2>
            </div>

            <div className="grid grid-cols-1 gap-12 relative">
                {/* Connector Line (Desktop) */}
                <div className="hidden md:block absolute left-[23px] top-8 bottom-8 w-px bg-black border-l border-dashed border-black opacity-30"></div>

                {steps.map((step) => (
                    <div key={step.id} className="relative flex flex-col md:flex-row gap-8 md:gap-16 items-start">

                        {/* Step Number Bubble */}
                        <div className="relative z-10 w-12 h-12 bg-white border border-black flex-shrink-0 flex items-center justify-center font-mono font-bold text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            {step.id}
                        </div>

                        <div className="flex-1 pt-2">
                            <span className="font-mono text-xs uppercase tracking-wider text-neutral-500 mb-2 block">{step.label}</span>
                            <h3 className="text-2xl font-serif font-medium mb-3">{step.headline}</h3>
                            <p className="font-mono text-sm text-neutral-600 leading-relaxed mb-4 max-w-2xl">
                                {step.body}
                            </p>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 border border-neutral-200 text-xs font-mono text-neutral-600 rounded-full">
                                {step.micro}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
