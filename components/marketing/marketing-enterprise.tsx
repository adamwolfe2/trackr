"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, CheckCircle2, Users, Zap, BarChart3, Shield } from "lucide-react";
import Link from "next/link";

const AUDIT_STEPS = [
    {
        number: "01",
        title: "Complete the AI Readiness Form",
        body: "A 10-minute intake covering your org structure, current tool stack, and operational pain points. No fluff — every question feeds directly into your audit report.",
    },
    {
        number: "02",
        title: "AI Architects Review Your Stack",
        body: "Our specialists — who've optimized tooling for Fortune 500 and enterprise operators — analyze your answers and build a custom recommendation blueprint.",
    },
    {
        number: "03",
        title: "Live Strategy Call",
        body: "A 60-minute white-glove session with an AI architect. Walk out with a prioritized tool implementation roadmap, cost reduction targets, and a 90-day ROI plan.",
    },
    {
        number: "04",
        title: "Workspace Setup & Tracking",
        body: "We configure your Trackr workspace, import your existing stack, and set up ongoing discovery so your team always knows what's worth evaluating next.",
    },
];

const PROOF_POINTS = [
    { icon: Users, label: "Fortune 500 operators served" },
    { icon: BarChart3, label: "Avg 34% reduction in tool spend" },
    { icon: Zap, label: "Audits completed in under 72 hrs" },
    { icon: Shield, label: "Enterprise NDAs standard" },
];

export function MarketingEnterprise() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });

    const stepsRef = useRef(null);
    const stepsInView = useInView(stepsRef, { once: true, margin: "-40px" });

    return (
        <section className="w-full py-24 border-t border-black/10" id="audit">

            {/* Top label */}
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
            >
                <span className="text-sm font-mono uppercase tracking-wider text-neutral-500 mb-4 block">
                    White-Glove Enterprise Service
                </span>

                {/* Split headline section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-16">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-serif font-normal mb-6 leading-tight">
                            Not just a tool.<br /> Your team&apos;s AI architects.
                        </h2>
                        <p className="font-mono text-sm text-neutral-500 leading-relaxed mb-8">
                            The difference between organizations winning with AI and those falling behind isn&apos;t budget — it&apos;s implementation. We partner with your ops, sales, and marketing teams to identify exactly which tools will move the needle, cut what&apos;s wasting spend, and get you running in days.
                        </p>
                        <div className="space-y-3 mb-10">
                            {[
                                "Custom AI implementation roadmap for your specific org",
                                "Eliminate redundant tools before buying new ones",
                                "Your team trained on the stack — not just handed a list",
                                "Ongoing workspace management so nothing goes stale",
                            ].map((point) => (
                                <div key={point} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-4 h-4 text-black flex-shrink-0 mt-0.5" strokeWidth={2} />
                                    <span className="font-mono text-sm text-neutral-700">{point}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/audit"
                                className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3.5 font-mono text-sm uppercase tracking-wide hover:bg-neutral-800 transition-colors border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none whitespace-nowrap"
                            >
                                Book AI Audit Call <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/sign-up"
                                className="flex items-center justify-center gap-2 border border-black px-6 py-3.5 font-mono text-sm uppercase tracking-wide hover:bg-neutral-100 transition-colors whitespace-nowrap"
                            >
                                Start Self-Serve Free
                            </Link>
                        </div>
                    </div>

                    {/* Proof card */}
                    <div className="flex flex-col gap-4">
                        {/* Testimonial */}
                        <div className="border border-black bg-white p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <p className="font-serif text-xl italic leading-relaxed mb-6">
                                &ldquo;Even our Fortune 500 CRO admitted he couldn&apos;t keep up with the pace of AI launches. Nobody has a single source of truth for what&apos;s worth using — until now.&rdquo;
                            </p>
                            <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                                — VP of Revenue Operations, Series C SaaS
                            </div>
                        </div>

                        {/* Proof points */}
                        <div className="grid grid-cols-2 gap-0 border border-black">
                            {PROOF_POINTS.map((p, i) => (
                                <div
                                    key={p.label}
                                    className={`p-5 flex flex-col gap-2 ${i % 2 === 0 ? "border-r border-black" : ""} ${i < 2 ? "border-b border-black" : ""}`}
                                >
                                    <p.icon className="w-4 h-4 text-black" strokeWidth={1.5} />
                                    <span className="font-mono text-[10px] text-neutral-600 leading-snug">{p.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Process steps */}
            <div ref={stepsRef}>
                <div className="mb-8">
                    <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">How the audit works</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-black">
                    {AUDIT_STEPS.map((step, i) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 16 }}
                            animate={stepsInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
                            className={`p-6 ${i < AUDIT_STEPS.length - 1 ? "border-b md:border-b-0 md:border-r border-black" : ""}`}
                        >
                            <div className="font-mono text-4xl font-bold text-neutral-300 mb-4 leading-none">{step.number}</div>
                            <h3 className="font-serif text-base font-normal mb-3 leading-snug">{step.title}</h3>
                            <p className="font-mono text-[11px] text-neutral-500 leading-relaxed">{step.body}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Final CTA bar */}
                <div className="mt-6 border border-black bg-[#F3F3EF] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <div className="font-serif text-base">Ready to see what&apos;s possible for your organization?</div>
                        <div className="font-mono text-xs text-neutral-500 mt-1">Takes 10 minutes. Our team reviews within 24 hours.</div>
                    </div>
                    <Link
                        href="/audit"
                        className="flex-shrink-0 flex items-center gap-2 bg-black text-white px-6 py-3 font-mono text-xs uppercase tracking-wide hover:bg-neutral-800 transition-colors whitespace-nowrap border border-black"
                    >
                        Start AI Readiness Audit <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
