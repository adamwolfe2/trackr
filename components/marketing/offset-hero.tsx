"use client";

import { ArrowRight, CheckCircle2, Loader2, Globe } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Simulated research agent demo
const DEMO_URL = "notion.so";
const AGENT_LOGS = [
    "Resolving tool: notion.so...",
    "Crawling pricing page...",
    "Analyzing feature documentation...",
    "Scanning G2 + Reddit sentiment...",
    "Comparing to 4 competitors...",
    "Scoring on 7 dimensions...",
    "Generating structured report...",
];

const DEMO_REPORT = {
    name: "Notion",
    score: 84,
    tagline: "Collaborative workspace for notes and docs",
    dimensions: [
        { label: "Features", score: 92 },
        { label: "Pricing Value", score: 78 },
        { label: "AI Capabilities", score: 85 },
        { label: "Integrations", score: 88 },
        { label: "Ease of Use", score: 80 },
    ],
    verdict: "Strong fit for knowledge management workflows.",
};

type DemoPhase = "idle" | "typing" | "researching" | "done";

function AnimatedScore({ score, animate }: { score: number; animate: boolean }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        if (!animate) { setDisplay(0); return; }
        let start = 0;
        const step = score / 30;
        const timer = setInterval(() => {
            start += step;
            if (start >= score) { setDisplay(score); clearInterval(timer); }
            else setDisplay(Math.round(start));
        }, 30);
        return () => clearInterval(timer);
    }, [animate, score]);
    return <span>{display}</span>;
}

function HeroDemo() {
    const [phase, setPhase] = useState<DemoPhase>("idle");
    const [typedUrl, setTypedUrl] = useState("");
    const [logIndex, setLogIndex] = useState(0);
    const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Auto-start after mount
        timerRef.current = setTimeout(() => startDemo(), 1200);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startDemo = () => {
        setPhase("typing");
        setTypedUrl("");
        setVisibleLogs([]);
        setLogIndex(0);

        // Type URL character by character
        let i = 0;
        const typeChar = () => {
            if (i <= DEMO_URL.length) {
                setTypedUrl(DEMO_URL.slice(0, i));
                i++;
                timerRef.current = setTimeout(typeChar, 70);
            } else {
                timerRef.current = setTimeout(() => {
                    setPhase("researching");
                    runLogs(0);
                }, 500);
            }
        };
        typeChar();
    };

    const runLogs = (idx: number) => {
        if (idx >= AGENT_LOGS.length) {
            timerRef.current = setTimeout(() => {
                setPhase("done");
                // Loop after 5 seconds
                timerRef.current = setTimeout(() => startDemo(), 5000);
            }, 400);
            return;
        }
        setVisibleLogs(prev => [...prev, AGENT_LOGS[idx]]);
        setLogIndex(idx);
        timerRef.current = setTimeout(() => runLogs(idx + 1), 520);
    };

    return (
        <div className="relative w-full max-w-md">
            {/* Offset shadow container */}
            <div className="border border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">

                {/* Window chrome */}
                <div className="bg-neutral-900 px-4 py-2.5 flex items-center gap-2 border-b border-black">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-80" />
                    <span className="ml-3 font-mono text-[10px] text-neutral-400 uppercase tracking-wider">trackr — research agent</span>
                </div>

                {/* URL Input Area */}
                <div className="bg-neutral-50 border-b border-black/10 px-4 py-3 flex items-center gap-3">
                    <Globe className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <span className="font-mono text-sm text-neutral-700 flex-1 min-h-[20px]">
                        {typedUrl}
                        {(phase === "typing") && (
                            <span className="inline-block w-0.5 h-4 bg-black ml-0.5 animate-pulse align-middle" />
                        )}
                        {phase === "idle" && (
                            <span className="text-neutral-400">Paste a URL to research...</span>
                        )}
                    </span>
                    {phase === "researching" && (
                        <Loader2 className="w-4 h-4 text-[#8B9A7F] animate-spin flex-shrink-0" />
                    )}
                    {phase === "done" && (
                        <CheckCircle2 className="w-4 h-4 text-[#8B9A7F] flex-shrink-0" />
                    )}
                </div>

                {/* Agent Logs */}
                <AnimatePresence>
                    {(phase === "researching" || phase === "done") && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="bg-neutral-900 px-4 py-3 border-b border-black/20"
                        >
                            <div className="space-y-1">
                                {visibleLogs.map((log, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -4 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-start gap-2"
                                    >
                                        <span className="text-[#8B9A7F] font-mono text-[10px] mt-0.5 flex-shrink-0">›</span>
                                        <span className={`font-mono text-[10px] ${i === visibleLogs.length - 1 && phase === "researching" ? "text-green-400" : "text-neutral-500"}`}>
                                            {log}
                                        </span>
                                    </motion.div>
                                ))}
                                {phase === "researching" && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: [0.4, 1, 0.4] }}
                                        transition={{ duration: 1.2, repeat: Infinity }}
                                        className="flex gap-1 mt-1 pl-4"
                                    >
                                        {[0, 1, 2].map(i => (
                                            <span key={i} className="w-1 h-1 rounded-full bg-green-400 inline-block" style={{ animationDelay: `${i * 0.15}s` }} />
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Report Card */}
                <AnimatePresence>
                    {phase === "done" && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="p-5"
                        >
                            {/* Report Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="font-serif text-lg font-medium">{DEMO_REPORT.name}</div>
                                    <div className="font-mono text-[10px] text-neutral-500 mt-0.5">{DEMO_REPORT.tagline}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono text-3xl font-bold text-black leading-none">
                                        <AnimatedScore score={DEMO_REPORT.score} animate={phase === "done"} />
                                    </div>
                                    <div className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider mt-0.5">/100 Score</div>
                                </div>
                            </div>

                            {/* Dimension Bars */}
                            <div className="space-y-2.5 mb-4">
                                {DEMO_REPORT.dimensions.map((dim, i) => (
                                    <motion.div
                                        key={dim.label}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.08 }}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-wide">{dim.label}</span>
                                            <span className="font-mono text-[10px] font-bold">{dim.score}</span>
                                        </div>
                                        <div className="h-1 bg-neutral-100 border border-neutral-200">
                                            <motion.div
                                                className="h-full bg-black"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${dim.score}%` }}
                                                transition={{ duration: 0.6, delay: 0.2 + i * 0.08, ease: "easeOut" }}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Verdict */}
                            <div className="bg-[#8B9A7F]/10 border border-[#8B9A7F]/30 px-3 py-2">
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="w-3 h-3 text-[#8B9A7F] flex-shrink-0 mt-0.5" />
                                    <span className="font-mono text-[10px] text-neutral-700">{DEMO_REPORT.verdict}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Idle state */}
                {phase === "idle" && (
                    <div className="px-5 py-8 text-center">
                        <div className="font-mono text-xs text-neutral-400">Initializing agent...</div>
                    </div>
                )}
            </div>

            {/* Decorative offset square */}
            <div className="absolute -bottom-3 -right-3 w-full h-full border border-black/20 -z-10" />
        </div>
    );
}

export function OffsetHero() {
    return (
        <section className="mb-24 md:mb-32 pt-8">
            <div className="flex flex-col lg:flex-row gap-16 lg:gap-20 items-center lg:items-start">

                {/* Left: Copy */}
                <motion.div
                    className="flex-1 min-w-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <span className="text-sm font-mono uppercase tracking-wider text-[#8B9A7F] mb-5 block">
                        AI-Powered Tool Research for Ops Teams
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-tight max-w-2xl mb-7 font-serif">
                        Stop researching tools<br className="hidden sm:block" /> manually.
                    </h1>

                    <p className="text-base md:text-lg leading-relaxed text-neutral-600 font-mono mb-10 max-w-lg">
                        Submit any software tool. Research agents crawl, score, and report back in under 2 minutes. Your team gets a shared database that actually stays current.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 items-start mb-10">
                        <Link
                            href="/sign-up"
                            className="bg-black text-white px-6 py-3.5 font-mono text-sm uppercase tracking-wide hover:bg-neutral-800 transition-all border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none whitespace-nowrap flex items-center gap-2 justify-center"
                        >
                            Start Free — No Card Required <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="#how-it-works"
                            className="px-6 py-3.5 font-mono text-sm uppercase tracking-wide hover:bg-neutral-100 transition-colors border border-black whitespace-nowrap flex items-center gap-2 justify-center"
                        >
                            See how it works
                        </Link>
                    </div>

                    {/* Trust signals */}
                    <div className="flex flex-wrap gap-6 text-xs font-mono text-neutral-500 pt-6 border-t border-black/10">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8B9A7F]" />
                            <span>Reports in under 2 min</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8B9A7F]" />
                            <span>7-dimension scorecard</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8B9A7F]" />
                            <span>Auto-refreshes every 30 days</span>
                        </div>
                    </div>
                </motion.div>

                {/* Right: Live Demo */}
                <motion.div
                    className="flex-shrink-0 w-full lg:w-auto lg:max-w-[420px]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                >
                    <div className="mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">Live Agent Demo</span>
                    </div>
                    <HeroDemo />
                </motion.div>
            </div>
        </section>
    );
}
