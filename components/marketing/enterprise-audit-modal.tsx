"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ArrowRight, CheckSquare, ExternalLink } from "lucide-react";

const CAL_LINK = "https://cal.com/adamwolfe/trackr";

const AUDIT_POINTS = [
    "AI tool coverage mapped across every department",
    "Software spend on AI vs legacy tools — where money is wasted",
    "Automation gap analysis — what should be automated but isn't",
    "Team readiness and AI adoption patterns by function",
    "Competitive AI posture benchmarked against your industry",
    "Prioritized action plan delivered within 5 business days",
];

function Modal({ onClose }: { onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Panel */}
            <div className="relative z-10 w-full max-w-xl bg-[#F3F3EF] border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between p-4 sm:p-6 pb-4 border-b border-black">
                    <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                            Custom Engagement
                        </span>
                        <h2 className="font-serif text-2xl leading-tight">Enterprise AI Audit</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="mt-1 p-1 hover:bg-black hover:text-white transition-colors border border-transparent hover:border-black"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-6">
                    <p className="font-mono text-sm text-neutral-600 leading-relaxed mb-6">
                        Is your organization actually AI-native — or just AI-adjacent? We&apos;ll audit your
                        team&apos;s full AI stack, surface the gaps, and deliver a prioritized action plan
                        for becoming a genuinely AI-native operation.
                    </p>

                    {/* Audit points */}
                    <div className="border border-black bg-white p-4 mb-6">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 block mb-3">
                            What&apos;s included
                        </span>
                        <ul className="space-y-2.5">
                            {AUDIT_POINTS.map((point) => (
                                <li key={point} className="flex items-start gap-2.5">
                                    <CheckSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" strokeWidth={2} />
                                    <span className="font-mono text-xs text-neutral-700 leading-snug">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <a
                            href={CAL_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 bg-black text-white px-5 py-3.5 font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors border border-black shadow-[3px_3px_0_0_rgba(0,0,0,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                        >
                            Book a Call <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                        <Link
                            href="/audit"
                            onClick={onClose}
                            className="flex-1 flex items-center justify-center gap-2 border border-black bg-transparent px-5 py-3.5 font-mono text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                        >
                            View Audit Page <ExternalLink className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function EnterpriseAuditBanner() {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Banner strip */}
            <div className="border border-black mb-24 grid md:grid-cols-[1fr_auto] gap-0">
                <div className="p-4 sm:p-8 border-b md:border-b-0 md:border-r border-black">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-2">
                        Custom Engagement
                    </span>
                    <h2 className="font-serif text-2xl md:text-3xl mb-2">
                        Is your org actually AI-native?
                    </h2>
                    <p className="font-mono text-xs text-neutral-500 leading-relaxed max-w-lg">
                        Get a full audit of your organization&apos;s AI stack — tools, spend, automation gaps,
                        and team readiness — with a prioritized action plan delivered in 5 business days.
                    </p>
                </div>
                <div className="p-4 sm:p-8 flex flex-col items-start md:items-center justify-center gap-3">
                    <button
                        onClick={() => setOpen(true)}
                        className="flex items-center gap-2 bg-black text-white px-6 py-3.5 font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors border border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none whitespace-nowrap"
                    >
                        Get your audit <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <Link
                        href="/audit"
                        className="font-mono text-[10px] text-neutral-400 hover:text-black underline underline-offset-2 transition-colors"
                    >
                        Learn what&apos;s included →
                    </Link>
                </div>
            </div>

            {open && <Modal onClose={() => setOpen(false)} />}
        </>
    );
}
