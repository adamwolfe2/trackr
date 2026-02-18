"use client";

import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DEMO_TOOLS = [
    {
        url: "notion.so",
        favicon: "https://www.google.com/s2/favicons?domain=notion.so&sz=32",
        name: "Notion",
        tagline: "Collaborative workspace for docs & databases",
        score: 84,
        dimensions: [
            { label: "Features", score: 92 },
            { label: "Pricing Value", score: 78 },
            { label: "AI Capabilities", score: 85 },
            { label: "Integrations", score: 88 },
            { label: "Ease of Use", score: 80 },
        ],
        verdict: "Strong fit for knowledge management workflows.",
    },
    {
        url: "linear.app",
        favicon: "https://www.google.com/s2/favicons?domain=linear.app&sz=32",
        name: "Linear",
        tagline: "Issue tracking built for modern dev teams",
        score: 91,
        dimensions: [
            { label: "Features", score: 93 },
            { label: "Pricing Value", score: 87 },
            { label: "AI Capabilities", score: 89 },
            { label: "Integrations", score: 90 },
            { label: "Ease of Use", score: 94 },
        ],
        verdict: "Exceptional fit. Fastest issue tracker in the market.",
    },
    {
        url: "figma.com",
        favicon: "https://www.google.com/s2/favicons?domain=figma.com&sz=32",
        name: "Figma",
        tagline: "Collaborative interface design platform",
        score: 88,
        dimensions: [
            { label: "Features", score: 91 },
            { label: "Pricing Value", score: 80 },
            { label: "AI Capabilities", score: 78 },
            { label: "Integrations", score: 89 },
            { label: "Ease of Use", score: 92 },
        ],
        verdict: "Industry standard. Consider team pricing tier.",
    },
    {
        url: "slack.com",
        favicon: "https://www.google.com/s2/favicons?domain=slack.com&sz=32",
        name: "Slack",
        tagline: "Business messaging and collaboration hub",
        score: 82,
        dimensions: [
            { label: "Features", score: 88 },
            { label: "Pricing Value", score: 74 },
            { label: "AI Capabilities", score: 81 },
            { label: "Integrations", score: 95 },
            { label: "Ease of Use", score: 86 },
        ],
        verdict: "Good integration depth. Re-evaluate pricing at scale.",
    },
];

const AGENT_LOGS = [
    "Mapping site structure...",
    "Crawling pricing page...",
    "Scanning G2 + Capterra reviews...",
    "Analyzing Reddit sentiment...",
    "Comparing 4 competitors...",
    "Scoring on 7 dimensions...",
    "Generating structured report...",
];

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
    const [toolIndex, setToolIndex] = useState(0);
    const [typedUrl, setTypedUrl] = useState("");
    const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const currentTool = DEMO_TOOLS[toolIndex];

    useEffect(() => {
        timerRef.current = setTimeout(() => startDemo(0), 1200);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startDemo = (idx: number) => {
        const tool = DEMO_TOOLS[idx];
        setToolIndex(idx);
        setPhase("typing");
        setTypedUrl("");
        setVisibleLogs([]);

        let i = 0;
        const typeChar = () => {
            if (i <= tool.url.length) {
                setTypedUrl(tool.url.slice(0, i));
                i++;
                timerRef.current = setTimeout(typeChar, 65);
            } else {
                timerRef.current = setTimeout(() => {
                    setPhase("researching");
                    runLogs(0, idx);
                }, 450);
            }
        };
        typeChar();
    };

    const runLogs = (logIdx: number, toolIdx: number) => {
        if (logIdx >= AGENT_LOGS.length) {
            timerRef.current = setTimeout(() => {
                setPhase("done");
                // After 4.5s, cycle to the next tool
                timerRef.current = setTimeout(() => {
                    const nextIdx = (toolIdx + 1) % DEMO_TOOLS.length;
                    startDemo(nextIdx);
                }, 4500);
            }, 350);
            return;
        }
        setVisibleLogs(prev => [...prev, AGENT_LOGS[logIdx]]);
        timerRef.current = setTimeout(() => runLogs(logIdx + 1, toolIdx), 480);
    };

    return (
        <div className="relative w-full max-w-md">
            <div className="border border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                {/* Window chrome */}
                <div className="bg-black px-4 py-2.5 flex items-center gap-2 border-b border-black">
                    <div className="w-2 h-2 bg-white/20" />
                    <div className="w-2 h-2 bg-white/20" />
                    <div className="w-2 h-2 bg-white/20" />
                    <span className="ml-3 font-mono text-[10px] text-white/60 uppercase tracking-wider">trackr — research agent</span>
                </div>

                {/* URL Input Area */}
                <div className="bg-white border-b border-black px-4 py-3 flex items-center gap-3">
                    {phase !== "idle" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={currentTool.favicon}
                            alt=""
                            width={16}
                            height={16}
                            className="flex-shrink-0 opacity-80 w-4 h-4"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span className="font-mono text-sm text-neutral-700 flex-1 min-h-[20px]">
                        {typedUrl}
                        {phase === "typing" && (
                            <span className="inline-block w-0.5 h-4 bg-black ml-0.5 animate-pulse align-middle" />
                        )}
                        {phase === "idle" && (
                            <span className="text-neutral-400">Paste a URL to research...</span>
                        )}
                    </span>
                    {phase === "researching" && <Loader2 className="w-4 h-4 text-black animate-spin flex-shrink-0" />}
                    {phase === "done" && <CheckCircle2 className="w-4 h-4 text-black flex-shrink-0" />}
                </div>

                {/* Agent Logs */}
                <AnimatePresence>
                    {(phase === "researching" || phase === "done") && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="bg-[#F3F3EF] px-4 py-3 border-b border-black"
                        >
                            <div className="space-y-1">
                                {visibleLogs.map((log, i) => (
                                    <motion.div
                                        key={`${toolIndex}-${i}`}
                                        initial={{ opacity: 0, x: -4 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-start gap-2"
                                    >
                                        <span className="text-black font-mono text-[10px] mt-0.5 flex-shrink-0">›</span>
                                        <span className={`font-mono text-[10px] ${i === visibleLogs.length - 1 && phase === "researching" ? "text-black font-semibold" : "text-neutral-500"}`}>
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
                                            <span key={i} className="w-1.5 h-1.5 bg-black inline-block" />
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Report Card */}
                <AnimatePresence mode="wait">
                    {phase === "done" && (
                        <motion.div
                            key={`report-${toolIndex}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            className="p-5"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="font-serif text-lg font-medium">{currentTool.name}</div>
                                    <div className="font-mono text-[10px] text-neutral-500 mt-0.5">{currentTool.tagline}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono text-3xl font-bold text-black leading-none">
                                        <AnimatedScore score={currentTool.score} animate={phase === "done"} />
                                    </div>
                                    <div className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider mt-0.5">/100 Score</div>
                                </div>
                            </div>

                            <div className="space-y-2.5 mb-4">
                                {currentTool.dimensions.map((dim, i) => (
                                    <motion.div
                                        key={`${toolIndex}-${dim.label}`}
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

                            <div className="bg-neutral-100 border border-black px-3 py-2">
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="w-3 h-3 text-black flex-shrink-0 mt-0.5" />
                                    <span className="font-mono text-[10px] text-neutral-700">{currentTool.verdict}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {phase === "idle" && (
                    <div className="px-5 py-8 text-center">
                        <div className="font-mono text-xs text-neutral-400">Initializing agent...</div>
                    </div>
                )}
            </div>

            {/* Tool cycle dots */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
                {DEMO_TOOLS.map((t, i) => (
                    <div
                        key={t.url}
                        className={`w-1.5 h-1.5 transition-all duration-300 ${i === toolIndex ? "bg-black w-4" : "bg-neutral-300"}`}
                    />
                ))}
            </div>

            <div className="absolute -bottom-3 -right-3 w-full h-full border border-black/20 -z-10" />
        </div>
    );
}

export function OffsetHero() {
    return (
        <section className="mb-24 md:mb-32 pt-8">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center lg:items-start">

                {/* Left: Copy */}
                <motion.div
                    className="flex-1 min-w-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <span className="text-sm font-mono uppercase tracking-wider text-neutral-500 mb-5 block">
                        AI Tool Intelligence for Ops Teams
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-tight max-w-2xl mb-7 font-serif">
                        Your team&apos;s AI tool<br className="hidden sm:block" /> intelligence layer.
                    </h1>

                    <p className="text-base md:text-lg leading-relaxed text-neutral-600 font-mono mb-10 max-w-lg">
                        Research any AI tool in under 2 minutes. Track what you pay for. Stay current on launches. One shared workspace — no spreadsheets, no Slack threads, no wasted research.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-start mb-10">
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

                    <div className="flex flex-wrap gap-5 text-xs font-mono text-neutral-500 pt-6 border-t border-black/10">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-black" />
                            <span>Reports in under 2 min</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-black" />
                            <span>7-dimension scorecard</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-black" />
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
                        <div className="w-2 h-2 bg-black animate-pulse" />
                        <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">Live Agent Demo — Cycling 4 Tools</span>
                    </div>
                    <HeroDemo />
                </motion.div>
            </div>
        </section>
    );
}
