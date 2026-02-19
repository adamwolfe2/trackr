"use client";

import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Integration logos (marquee + next-steps) ─────────────────────────── */
const INTEGRATION_LOGOS = [
    { domain: "slack.com", label: "Slack" },
    { domain: "gmail.com", label: "Gmail" },
    { domain: "notion.so", label: "Notion" },
    { domain: "asana.com", label: "Asana" },
    { domain: "drive.google.com", label: "Drive" },
    { domain: "figma.com", label: "Figma" },
    { domain: "linear.app", label: "Linear" },
    { domain: "github.com", label: "GitHub" },
    { domain: "zapier.com", label: "Zapier" },
    { domain: "hubspot.com", label: "HubSpot" },
    { domain: "loom.com", label: "Loom" },
    { domain: "airtable.com", label: "Airtable" },
];

/* ─── Demo tools ────────────────────────────────────────────────────────── */
const DEMO_TOOLS = [
    {
        url: "notion.so",
        favicon: "https://www.google.com/s2/favicons?domain=notion.so&sz=32",
        name: "Notion",
        tagline: "Knowledge management workflows",
        score: 84,
        dimensions: [
            { label: "Features", score: 92 },
            { label: "Pricing Value", score: 78 },
            { label: "AI Capabilities", score: 85 },
            { label: "Integrations", score: 88 },
            { label: "Ease of Use", score: 80 },
        ],
        verdict: "Strong fit for knowledge management workflows.",
        findings: [
            "3,840+ reviews scraped — G2, Capterra, Trustpilot",
            "4 pricing plans found — Free, Plus, Business, Enterprise",
            "89 native integrations detected",
            "7 direct alternatives evaluated — Coda, Confluence, Slab...",
            "Score complete — 5 dimensions calculated",
        ],
        nextSteps: [
            { domain: "slack.com", action: "Send to Josh", sub: "#ops-tools channel" },
            { domain: "gmail.com", action: "Email the team", sub: "team@acme.com · 4 members" },
            { domain: "notion.so", action: "Save to workspace", sub: "Tool Reviews / Q1 2025" },
        ],
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
        findings: [
            "1,940+ reviews and community posts analyzed",
            "4 pricing plans — Free, Basic, Business, Enterprise",
            "31 integration endpoints found — GitHub, Slack, Figma...",
            "9 alternatives mapped — Jira, Asana, ClickUp, Height...",
            "Score complete — 5 dimensions calculated",
        ],
        nextSteps: [
            { domain: "slack.com", action: "Notify Sarah", sub: "#engineering channel" },
            { domain: "gmail.com", action: "Email dev leads", sub: "eng@acme.com · 6 members" },
            { domain: "asana.com", action: "Create eval task", sub: "Q1 Tool Review board" },
        ],
    },
    {
        url: "clay.com",
        favicon: "https://www.google.com/s2/favicons?domain=clay.com&sz=32",
        name: "Clay",
        tagline: "AI-powered data enrichment & outreach",
        score: 93,
        dimensions: [
            { label: "Features", score: 96 },
            { label: "Pricing Value", score: 82 },
            { label: "AI Capabilities", score: 97 },
            { label: "Integrations", score: 94 },
            { label: "Ease of Use", score: 78 },
        ],
        verdict: "Top-tier AI enrichment. Steep curve worth every bit.",
        findings: [
            "890+ use case reports and reviews analyzed",
            "3 pricing tiers — Explorer ($149), Pro ($349), Enterprise",
            "52 data source integrations detected",
            "6 enrichment tool alternatives evaluated",
            "Score complete — 5 dimensions calculated",
        ],
        nextSteps: [
            { domain: "slack.com", action: "Send to Rev Ops", sub: "#revenue-ops channel" },
            { domain: "gmail.com", action: "Email leadership", sub: "leadership@acme.com" },
            { domain: "hubspot.com", action: "Log in CRM stack", sub: "Sales Tools / AI Tier" },
        ],
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
        verdict: "Industry standard. Evaluate team-tier pricing.",
        findings: [
            "4,270+ design community reviews analyzed",
            "5 pricing plans — Starter, Professional, Organization, Enterprise",
            "41 plugin + integration endpoints found",
            "8 alternatives mapped — Sketch, Adobe XD, Penpot...",
            "Score complete — 5 dimensions calculated",
        ],
        nextSteps: [
            { domain: "slack.com", action: "Share with design", sub: "#design channel" },
            { domain: "gmail.com", action: "Email to Mike", sub: "mike@acme.com" },
            { domain: "notion.so", action: "Log to tracker", sub: "Design Stack / Apps" },
        ],
    },
];

/* ─── 3 parallel agent streams ──────────────────────────────────────────── */
const STREAM_STEPS = [
    [
        "Mapping site structure...",
        "Crawling pricing page...",
        "Extracting feature list...",
        "Parsing changelog...",
    ],
    [
        "Scanning G2 reviews...",
        "Fetching Capterra data...",
        "Analyzing Reddit posts...",
        "Checking Product Hunt...",
    ],
    [
        "Comparing 6 competitors...",
        "Detecting integrations...",
        "Scoring 7 dimensions...",
        "Writing verdict...",
    ],
];

type Phase = "idle" | "typing" | "researching" | "done";

/* ─── Animated score counter ────────────────────────────────────────────── */
function AnimatedScore({ score, animate }: { score: number; animate: boolean }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        if (!animate) { setDisplay(0); return; } // eslint-disable-line react-hooks/set-state-in-effect -- reset on animation toggle
        let val = 0;
        const step = score / 22;
        const t = setInterval(() => {
            val += step;
            if (val >= score) { setDisplay(score); clearInterval(t); }
            else setDisplay(Math.round(val));
        }, 26);
        return () => clearInterval(t);
    }, [animate, score]);
    return <span>{display}</span>;
}

/* ─── Integration marquee ───────────────────────────────────────────────── */
function IntegrationMarquee() {
    const duped = [...INTEGRATION_LOGOS, ...INTEGRATION_LOGOS];
    // Each logo: w-9 (36px) + gap-2.5 (10px) = 46px per item
    // Half-width to translate = 12 * 46 = 552px
    return (
        <div className="overflow-hidden relative">
            <style>{`
                @keyframes marqueeScroll {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .marquee-track { animation: marqueeScroll 9s linear infinite; }
            `}</style>
            <div className="marquee-track flex gap-2.5" style={{ width: "max-content" }}>
                {duped.map((logo, i) => (
                    <div key={`${logo.domain}-${i}`} className="flex flex-col items-center gap-0.5 w-9 flex-shrink-0">
                        <div className="w-7 h-7 border border-black/10 bg-white flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={`https://www.google.com/s2/favicons?domain=${logo.domain}&sz=32`}
                                alt={logo.label}
                                width={16}
                                height={16}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                        </div>
                        <span className="font-mono text-[8px] text-neutral-400 whitespace-nowrap">{logo.label}</span>
                    </div>
                ))}
            </div>
            <div className="absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-[#F3F3EF] to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-5 bg-gradient-to-l from-[#F3F3EF] to-transparent pointer-events-none" />
        </div>
    );
}

/* ─── Main demo widget ──────────────────────────────────────────────────── */
function HeroDemo() {
    const [phase, setPhase] = useState<Phase>("idle");
    const [toolIndex, setToolIndex] = useState(0);
    const [typedUrl, setTypedUrl] = useState("");
    const [tick, setTick] = useState(-1);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const toolIndexRef = useRef(0);

    const clearAll = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const startDemo = (idx: number) => {
        clearAll();
        toolIndexRef.current = idx;
        setToolIndex(idx);
        setPhase("typing");
        setTypedUrl("");
        setTick(-1);

        const tool = DEMO_TOOLS[idx];
        let i = 0;
        const typeChar = () => {
            if (i <= tool.url.length) {
                setTypedUrl(tool.url.slice(0, i));
                i++;
                timerRef.current = setTimeout(typeChar, 52);
            } else {
                timerRef.current = setTimeout(() => {
                    setPhase("researching");
                    setTick(0);
                    // Tick every 370ms — 7 ticks (0-6) = ~2.6s total research
                    intervalRef.current = setInterval(() => {
                        setTick(prev => {
                            const next = prev + 1;
                            if (next >= 7) {
                                clearInterval(intervalRef.current!);
                            }
                            return next;
                        });
                    }, 370);
                }, 300);
            }
        };
        typeChar();
    };

    useEffect(() => {
        timerRef.current = setTimeout(() => startDemo(0), 800);
        return clearAll;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Transition to "done" when all 3 streams finish
    useEffect(() => {
        if (tick >= 7) {
            timerRef.current = setTimeout(() => {
                setPhase("done");
                timerRef.current = setTimeout(() => {
                    startDemo((toolIndexRef.current + 1) % DEMO_TOOLS.length);
                }, 4200);
            }, 180);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tick]);

    const currentTool = DEMO_TOOLS[toolIndex];

    // Stream A starts at tick=0, B at tick=1, C at tick=2
    // Each stream shows 1 new step per tick, finishes at tick=3/4/5
    const streamVisible = [
        tick >= 0 ? Math.min(tick + 1, 4) : 0,
        tick >= 1 ? Math.min(tick, 4) : 0,
        tick >= 2 ? Math.min(tick - 1, 4) : 0,
    ];
    const streamActive = [
        Math.min(tick, 3),
        Math.min(tick - 1, 3),
        Math.min(tick - 2, 3),
    ];

    return (
        <div className="relative w-full">
            <div className="w-full border border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">

                {/* Window chrome */}
                <div className="bg-black px-4 py-2.5 flex items-center gap-2">
                    <div className="w-2 h-2 bg-white/20" />
                    <div className="w-2 h-2 bg-white/20" />
                    <div className="w-2 h-2 bg-white/20" />
                    <span className="ml-2 font-mono text-[10px] text-white/60 uppercase tracking-wider">
                        trackr — research agent
                    </span>
                    {phase === "researching" && (
                        <div className="ml-auto flex gap-1">
                            {[0, 1, 2].map(i => (
                                <motion.div
                                    key={i}
                                    className="w-1.5 h-1.5 bg-white/50"
                                    animate={{ opacity: [0.2, 1, 0.2] }}
                                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.22 }}
                                />
                            ))}
                        </div>
                    )}
                    {phase === "done" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="ml-auto flex items-center gap-1.5"
                        >
                            <CheckCircle2 className="w-3 h-3 text-white/70" />
                            <span className="font-mono text-[9px] text-white/50 uppercase tracking-wider">Report ready</span>
                        </motion.div>
                    )}
                </div>

                {/* URL input */}
                <div className="bg-white border-b border-black px-4 py-3 flex items-center gap-3">
                    {phase !== "idle" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={currentTool.favicon} alt="" width={16} height={16}
                            className="flex-shrink-0 opacity-80 w-4 h-4"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
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

                {/* ── Fixed-height content area — all phases crossfade in place ── */}
                <div className="relative h-[400px] sm:h-[460px] overflow-hidden">

                    {/* Idle / Typing: skeleton placeholder so the widget never looks empty */}
                    <AnimatePresence>
                        {(phase === "idle" || phase === "typing") && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                                className="absolute inset-0 bg-white p-5"
                            >
                                <div className="flex items-start justify-between mb-5">
                                    <div className="space-y-2">
                                        <div className="h-[18px] w-28 bg-neutral-100 animate-pulse" />
                                        <div className="h-[11px] w-44 bg-neutral-50 animate-pulse" />
                                    </div>
                                    <div className="h-9 w-10 bg-neutral-100 animate-pulse" />
                                </div>
                                <div className="space-y-3 mb-5">
                                    {[0, 1, 2, 3, 4].map(i => (
                                        <div key={i}>
                                            <div className="flex justify-between mb-1">
                                                <div className="h-2.5 w-24 bg-neutral-100 animate-pulse" />
                                                <div className="h-2.5 w-5 bg-neutral-100 animate-pulse" />
                                            </div>
                                            <div className="h-[3px] bg-neutral-100 border border-neutral-100" />
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-neutral-50 border border-neutral-200 px-3 py-2.5 mb-5">
                                    <div className="h-3 w-52 bg-neutral-100 animate-pulse" />
                                </div>
                                <div className="border-t border-black/10 pt-4 space-y-3">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-6 h-6 bg-neutral-100 animate-pulse flex-shrink-0" />
                                            <div className="space-y-1 flex-1">
                                                <div className="h-3 w-32 bg-neutral-100 animate-pulse" />
                                                <div className="h-2.5 w-24 bg-neutral-50 animate-pulse" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Parallel agent streams ──────────────────────────── */}
                    <AnimatePresence>
                        {phase === "researching" && (
                            <motion.div
                                key={`researching-${toolIndex}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { duration: 0.3 } }}
                                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                                className="absolute inset-0 bg-[#F3F3EF] overflow-hidden flex flex-col"
                            >
                                {/* Stream headers */}
                                <div className="grid grid-cols-3 border-b border-black/10">
                                    {["Crawler", "Reviews", "Analyst"].map((label, i) => (
                                        <div key={label} className={`px-2.5 py-1.5 ${i < 2 ? "border-r border-black/10" : ""}`}>
                                            <div className="flex items-center gap-1.5">
                                                <motion.div
                                                    className="w-1.5 h-1.5 bg-black"
                                                    animate={{ opacity: streamVisible[i] < 4 ? [0.3, 1, 0.3] : 1 }}
                                                    transition={{ duration: 0.7, repeat: streamVisible[i] < 4 ? Infinity : 0 }}
                                                />
                                                <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest">{label}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Stream bodies */}
                                <div className="grid grid-cols-3 py-2 flex-shrink-0">
                                    {[0, 1, 2].map(si => (
                                        <div key={si} className={`px-2.5 space-y-1 ${si < 2 ? "border-r border-black/10" : ""}`}>
                                            {STREAM_STEPS[si].slice(0, streamVisible[si]).map((step, stepIdx) => (
                                                <motion.div
                                                    key={`${toolIndex}-${si}-${stepIdx}`}
                                                    initial={{ opacity: 0, x: -3 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.18 }}
                                                    className="flex items-start gap-1"
                                                >
                                                    <span className="font-mono text-[9px] text-black/30 mt-[1px] flex-shrink-0">›</span>
                                                    <span className={`font-mono text-[9px] leading-snug ${
                                                        stepIdx === streamActive[si] && tick < 7
                                                            ? "text-black font-semibold"
                                                            : "text-neutral-400"
                                                    }`}>
                                                        {step}
                                                    </span>
                                                </motion.div>
                                            ))}

                                            {/* Pulsing dots while in progress */}
                                            {streamVisible[si] > 0 && streamVisible[si] < 4 && (
                                                <motion.div
                                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                                    transition={{ duration: 0.65, repeat: Infinity }}
                                                    className="flex gap-0.5 pl-3 pt-0.5"
                                                >
                                                    {[0, 1, 2].map(d => (
                                                        <span key={d} className="w-1 h-1 bg-black/25 inline-block" />
                                                    ))}
                                                </motion.div>
                                            )}

                                            {/* Done checkmark per stream */}
                                            {streamVisible[si] >= 4 && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="flex items-center gap-1 pl-3 pt-0.5"
                                                >
                                                    <CheckCircle2 className="w-2.5 h-2.5 text-black" />
                                                    <span className="font-mono text-[9px] text-black font-semibold">Done</span>
                                                </motion.div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Integration logos marquee */}
                                <div className="border-t border-black/10 px-3 pt-2 pb-2.5 flex-shrink-0">
                                    <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest block mb-1.5">
                                        Scanning integrations
                                    </span>
                                    <IntegrationMarquee />
                                </div>

                                {/* ── Live findings — fills remaining space ─── */}
                                <div className="border-t border-black/10 px-3 pt-3 pb-3 flex-1 bg-white/40 overflow-hidden">
                                    <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest block mb-2.5">
                                        Live findings
                                    </span>
                                    <div className="space-y-1.5">
                                        {currentTool.findings
                                            .slice(0, Math.min(Math.max(tick - 1, 0), 5))
                                            .map((finding, i) => (
                                                <motion.div
                                                    key={`${toolIndex}-finding-${i}`}
                                                    initial={{ opacity: 0, x: -4 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.22 }}
                                                    className="flex items-start gap-2"
                                                >
                                                    <motion.span
                                                        className="font-mono text-[9px] text-black/40 flex-shrink-0 mt-[1px]"
                                                        animate={{ opacity: [0.4, 1, 0.4] }}
                                                        transition={
                                                            i === Math.min(Math.max(tick - 1, 0), 5) - 1 && tick < 7
                                                                ? { duration: 0.8, repeat: Infinity }
                                                                : { duration: 0 }
                                                        }
                                                    >
                                                        →
                                                    </motion.span>
                                                    <span className={`font-mono text-[10px] leading-snug ${
                                                        i === Math.min(Math.max(tick - 1, 0), 5) - 1 && tick < 7
                                                            ? "text-black font-semibold"
                                                            : "text-neutral-500"
                                                    }`}>
                                                        {finding}
                                                    </span>
                                                </motion.div>
                                            ))
                                        }
                                        {/* Pulsing placeholder while no findings yet */}
                                        {tick < 2 && (
                                            <motion.div
                                                animate={{ opacity: [0.3, 0.7, 0.3] }}
                                                transition={{ duration: 1.2, repeat: Infinity }}
                                                className="flex gap-1 items-center"
                                            >
                                                {[0, 1, 2].map(d => (
                                                    <span key={d} className="w-1.5 h-1.5 bg-black/15 inline-block" />
                                                ))}
                                                <span className="font-mono text-[9px] text-neutral-300 ml-1">Collecting data...</span>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Report card ──────────────────────────────────────── */}
                    <AnimatePresence mode="wait">
                        {phase === "done" && (
                            <motion.div
                                key={`report-${toolIndex}`}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.28, ease: "easeOut" }}
                                className="absolute inset-0 overflow-y-auto"
                            >
                                {/* Score + dimensions */}
                                <div className="p-5 pb-4">
                                    <div className="flex items-start justify-between mb-3.5">
                                        <div>
                                            <div className="font-serif text-lg font-medium">{currentTool.name}</div>
                                            <div className="font-mono text-[10px] text-neutral-500 mt-0.5">{currentTool.tagline}</div>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-3">
                                            <div className="font-mono text-3xl font-bold text-black leading-none">
                                                <AnimatedScore score={currentTool.score} animate={phase === "done"} />
                                            </div>
                                            <div className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider mt-0.5">/100 Score</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        {currentTool.dimensions.map((dim, i) => (
                                            <motion.div
                                                key={`${toolIndex}-${dim.label}`}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: i * 0.055 }}
                                            >
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wide">{dim.label}</span>
                                                    <span className="font-mono text-[10px] font-bold">{dim.score}</span>
                                                </div>
                                                <div className="h-[3px] bg-neutral-100 border border-neutral-200">
                                                    <motion.div
                                                        className="h-full bg-black"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${dim.score}%` }}
                                                        transition={{ duration: 0.45, delay: 0.12 + i * 0.055, ease: "easeOut" }}
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
                                </div>

                                {/* ── What's next ──────────────────────────── */}
                                <div className="border-t border-black">
                                    <div className="px-5 py-2 bg-black flex items-center justify-between">
                                        <span className="font-mono text-[9px] uppercase tracking-widest text-white/70">
                                            Report ready — send it
                                        </span>
                                        <motion.div
                                            className="w-1.5 h-1.5 bg-white/60"
                                            animate={{ opacity: [1, 0.2, 1] }}
                                            transition={{ duration: 1.4, repeat: Infinity }}
                                        />
                                    </div>
                                    <div className="divide-y divide-black/8">
                                        {currentTool.nextSteps.map((step, i) => (
                                            <motion.div
                                                key={`${toolIndex}-next-${i}`}
                                                initial={{ opacity: 0, x: 5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.25 + i * 0.1 }}
                                                className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#F3F3EF] transition-colors cursor-pointer group"
                                            >
                                                <div className="w-6 h-6 border border-black/20 bg-white flex items-center justify-center flex-shrink-0">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={`https://www.google.com/s2/favicons?domain=${step.domain}&sz=32`}
                                                        alt=""
                                                        width={14}
                                                        height={14}
                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-mono text-[11px] text-black font-semibold truncate">{step.action}</div>
                                                    <div className="font-mono text-[9px] text-neutral-400 truncate">{step.sub}</div>
                                                </div>
                                                <ArrowRight className="w-3 h-3 text-neutral-300 group-hover:text-black transition-colors flex-shrink-0" />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Tool cycle dots */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
                {DEMO_TOOLS.map((t, i) => (
                    <div
                        key={t.url}
                        className={`h-1.5 transition-all duration-300 ${i === toolIndex ? "bg-black w-4" : "bg-neutral-300 w-1.5"}`}
                    />
                ))}
            </div>

            <div className="absolute -bottom-3 -right-3 w-full h-full border border-black/20 -z-10" />
        </div>
    );
}

/* ─── Hero section ──────────────────────────────────────────────────────── */
export function OffsetHero() {
    return (
        <section className="mb-24 md:mb-32 pt-8">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-12 xl:gap-20 items-center lg:items-start">

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
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-tight max-w-2xl mb-7 font-serif">
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
                            Get Started <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/audit"
                            className="px-6 py-3.5 font-mono text-sm uppercase tracking-wide hover:bg-neutral-100 transition-colors border border-black whitespace-nowrap flex items-center gap-2 justify-center"
                        >
                            Book an AI Stack Audit <ArrowRight className="w-4 h-4" />
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
                    className="flex-shrink-0 w-full lg:w-[400px] xl:w-[440px]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                >
                    <div className="mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-black animate-pulse" />
                        <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                            Live Demo — 3 Parallel Research Agents
                        </span>
                    </div>
                    <div className="pr-2 pb-2">
                        <HeroDemo />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
