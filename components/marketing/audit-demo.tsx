"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Loader2, ArrowRight } from "lucide-react";

/* ─── Phase config ──────────────────────────────────────────────────────── */
const PHASES = [
    { id: 0, label: "Discovery" },
    { id: 1, label: "Research" },
    { id: 2, label: "Findings" },
    { id: 3, label: "Roadmap" },
];
const PHASE_MS = [5200, 6800, 6200, 6400];

/* ─── Timer progress bar ─────────────────────────────────────────────────── */
function PhaseBar({ phase, duration, onComplete }: { phase: number; duration: number; onComplete: () => void }) {
    const [pct, setPct] = useState(0);
    const start = useRef(Date.now());
    const raf = useRef<number | null>(null);
    useEffect(() => {
        start.current = Date.now();
        setPct(0);
        const tick = () => {
            const p = Math.min((Date.now() - start.current) / duration, 1);
            setPct(p * 100);
            if (p >= 1) onComplete();
            else raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
        return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, duration]);
    return (
        <div className="h-[3px] bg-neutral-200 w-full">
            <div className="h-full bg-black" style={{ width: `${pct}%` }} />
        </div>
    );
}

/* ─── Phase 0: Discovery ─────────────────────────────────────────────────── */
const TOOL_DOMAINS: Record<string, string> = {
    Salesforce: "salesforce.com",
    HubSpot: "hubspot.com",
    Pipedrive: "pipedrive.com",
    Marketo: "marketo.com",
    ActiveCampaign: "activecampaign.com",
    Linear: "linear.app",
    GitHub: "github.com",
    Vercel: "vercel.com",
    Tableau: "tableau.com",
    Mixpanel: "mixpanel.com",
    Clay: "clay.com",
    Make: "make.com",
    Zapier: "zapier.com",
};

const TOOL_CATEGORIES = [
    { name: "CRM & Sales", tools: ["Salesforce", "HubSpot", "Pipedrive"], count: 3 },
    { name: "Marketing Automation", tools: ["Marketo", "ActiveCampaign"], count: 2 },
    { name: "Engineering", tools: ["Linear", "GitHub", "Vercel"], count: 3 },
    { name: "Analytics & BI", tools: ["Tableau", "Mixpanel"], count: 2 },
    { name: "AI & Automation", tools: ["Clay", "Make", "Zapier"], count: 3 },
];

function DiscoveryPhase() {
    const [revealed, setRevealed] = useState(0);
    useEffect(() => {
        const timers = TOOL_CATEGORIES.map((_, i) =>
            setTimeout(() => setRevealed(i + 1), (i + 1) * 780)
        );
        return () => timers.forEach(clearTimeout);
    }, []);
    const totalTools = TOOL_CATEGORIES.slice(0, revealed).reduce((s, c) => s + c.count, 0);
    return (
        <div className="h-full flex flex-col p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest mb-1">Step 01 · Discovery</div>
                    <div className="font-serif text-lg">Mapping your AI stack</div>
                </div>
                <div className="text-right flex-shrink-0">
                    <motion.div
                        key={totalTools}
                        initial={{ scale: 1.18 }}
                        animate={{ scale: 1 }}
                        className="font-mono text-3xl font-bold text-black leading-none"
                    >
                        {totalTools}
                    </motion.div>
                    <div className="font-mono text-[9px] text-neutral-400 uppercase tracking-wide">tools found</div>
                </div>
            </div>

            <div className="h-[3px] bg-neutral-200 mb-5">
                <motion.div
                    className="h-full bg-black"
                    animate={{ width: `${(revealed / TOOL_CATEGORIES.length) * 100}%` }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                />
            </div>

            <div className="space-y-2 flex-1">
                {TOOL_CATEGORIES.map((cat, i) => {
                    const done = i < revealed;
                    const active = i === revealed;
                    return (
                        <motion.div
                            key={cat.name}
                            animate={{ opacity: done ? 1 : active ? 0.5 : 0.2 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center justify-between px-3 py-2.5 border border-black/15 bg-white"
                        >
                            <div className="flex items-center gap-2">
                                {done ? (
                                    <CheckCircle2 className="w-3 h-3 text-black flex-shrink-0" />
                                ) : active ? (
                                    <Loader2 className="w-3 h-3 text-neutral-400 animate-spin flex-shrink-0" />
                                ) : (
                                    <div className="w-3 h-3 border border-neutral-300 flex-shrink-0" />
                                )}
                                <span className="font-mono text-[11px]">{cat.name}</span>
                            </div>
                            <AnimatePresence>
                                {done && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center gap-1"
                                    >
                                        {cat.tools.slice(0, 2).map(t => (
                                            <span key={t} className="inline-flex items-center gap-1 font-mono text-[9px] bg-neutral-100 border border-neutral-200 px-1.5 py-0.5">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={`https://www.google.com/s2/favicons?domain=${TOOL_DOMAINS[t] ?? t}&sz=16`}
                                                    alt=""
                                                    width={10}
                                                    height={10}
                                                    className="w-2.5 h-2.5 flex-shrink-0"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                                />
                                                {t}
                                            </span>
                                        ))}
                                        {cat.count > 2 && (
                                            <span className="font-mono text-[9px] text-neutral-400">+{cat.count - 2}</span>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            <AnimatePresence>
                {revealed >= TOOL_CATEGORIES.length && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="mt-4 flex items-center gap-2 px-3 py-2.5 bg-black text-white font-mono text-[10px]"
                    >
                        <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                        <span>{totalTools} tools found across {TOOL_CATEGORIES.length} categories — launching research agents</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─── Phase 1: Research ──────────────────────────────────────────────────── */
const RESEARCH_TOOLS = [
    {
        domain: "salesforce.com",
        name: "Salesforce",
        category: "CRM",
        score: 71,
        verdict: "Redundancy risk — consolidate",
        findings: [
            "3 overlapping CRM tools share same function",
            "Only 18 of 40 licenses active this quarter",
            "Pricing: $75/seat/mo — highest in category",
            "Verdict: replace with HubSpot at $45/seat",
        ],
    },
    {
        domain: "clay.com",
        name: "Clay",
        category: "AI Enrichment",
        score: 93,
        verdict: "Highest ROI — expand to full team",
        findings: [
            "52 native data source integrations found",
            "890+ reviews — 4.8 avg · top quartile",
            "No overlap detected with any stack tool",
            "Verdict: expand from 3 to 8 seats immediately",
        ],
    },
];
const QUEUED_TOOLS = ["HubSpot", "Pipedrive", "Tableau", "Mixpanel", "Linear", "GitHub", "Marketo", "Make", "Vercel", "Zapier"];

function ResearchPhase() {
    const [revealedPerTool, setRevealedPerTool] = useState([0, 0]);
    const [allDone, setAllDone] = useState(false);

    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = [];
        RESEARCH_TOOLS.forEach((tool, ti) => {
            tool.findings.forEach((_, fi) => {
                timers.push(setTimeout(() => {
                    setRevealedPerTool(prev => {
                        const next = [...prev];
                        next[ti] = fi + 1;
                        return next;
                    });
                }, ti * 1400 + fi * 550 + 300));
            });
        });
        const lastDelay = (RESEARCH_TOOLS.length - 1) * 1400 + (RESEARCH_TOOLS[0].findings.length - 1) * 550 + 1100;
        timers.push(setTimeout(() => setAllDone(true), lastDelay));
        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="h-full flex flex-col p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest mb-1">Step 02 · Research</div>
                    <div className="font-serif text-lg">Agents running on each tool</div>
                </div>
                {!allDone ? (
                    <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                className="w-1.5 h-1.5 bg-black"
                                animate={{ opacity: [0.2, 1, 0.2] }}
                                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.22 }}
                            />
                        ))}
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="font-mono text-[10px] uppercase tracking-wide">12 done</span>
                    </motion.div>
                )}
            </div>

            <div className="space-y-3 flex-1">
                {RESEARCH_TOOLS.map((tool, ti) => {
                    const revealed = revealedPerTool[ti];
                    const toolDone = revealed >= tool.findings.length;
                    const toolStarted = revealed > 0 || ti === 0;
                    return (
                        <motion.div
                            key={tool.name}
                            animate={{ opacity: ti === 0 || revealedPerTool[ti - 1] > 0 ? 1 : 0.3 }}
                            className="border border-black/20 bg-white"
                        >
                            <div className="flex items-center gap-2 px-3 py-2 border-b border-black/10">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={`https://www.google.com/s2/favicons?domain=${tool.domain}&sz=32`}
                                    alt="" width={12} height={12} className="w-3 h-3 flex-shrink-0"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                />
                                <span className="font-mono text-[10px] font-semibold">{tool.name}</span>
                                <span className="font-mono text-[9px] text-neutral-400">{tool.category}</span>
                                <div className="ml-auto flex items-center gap-2">
                                    {toolDone ? (
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.85 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="font-mono text-[11px] font-bold"
                                        >
                                            {tool.score}/100
                                        </motion.span>
                                    ) : toolStarted ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : null}
                                </div>
                            </div>

                            <div className="px-3 py-2 space-y-1 min-h-[52px]">
                                {revealed === 0 && (
                                    <div className="font-mono text-[9px] text-neutral-300 italic">Initializing agents...</div>
                                )}
                                {tool.findings.slice(0, revealed).map((f, fi) => (
                                    <motion.div
                                        key={f}
                                        initial={{ opacity: 0, x: -4 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-start gap-1.5"
                                    >
                                        <span className="font-mono text-[9px] text-black/25 mt-[1px] flex-shrink-0">→</span>
                                        <span className={`font-mono text-[9px] leading-snug ${fi === revealed - 1 && !toolDone ? "text-black font-semibold" : "text-neutral-500"}`}>
                                            {f}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>

                            <AnimatePresence>
                                {toolDone && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="px-3 py-1.5 border-t border-black/10 bg-neutral-50 flex items-center gap-1.5"
                                    >
                                        <CheckCircle2 className="w-2.5 h-2.5 text-black flex-shrink-0" />
                                        <span className="font-mono text-[9px] font-semibold">{tool.verdict}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}

                {/* Queued tools */}
                <div className="border border-black/10 px-3 py-2 bg-white/50">
                    <div className="font-mono text-[9px] text-neutral-400 mb-1.5">Queued — 10 more tools</div>
                    <div className="flex flex-wrap gap-1">
                        {QUEUED_TOOLS.map(t => (
                            <span key={t} className="font-mono text-[9px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5">{t}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Phase 2: Findings ──────────────────────────────────────────────────── */
const AUDIT_FINDINGS = [
    {
        type: "critical",
        title: "3 overlapping CRM tools",
        detail: "Salesforce + HubSpot + Pipedrive · same function",
        saving: "$4,200/mo",
        action: "Consolidate → HubSpot",
    },
    {
        type: "warning",
        title: "Tableau: 8 of 45 seats active",
        detail: "83% of licenses unused this quarter",
        saving: "$1,800/mo",
        action: "Right-size to 12-seat plan",
    },
    {
        type: "winner",
        title: "Clay — 93/100 · highest ROI",
        detail: "52 integrations · zero stack overlap",
        saving: null,
        action: "Expand from 3 → 8 seats",
    },
    {
        type: "winner",
        title: "Linear — 91/100 · fastest adoption",
        detail: "Highest team NPS in your stack",
        saving: null,
        action: "Enterprise rollout recommended",
    },
];

function FindingsPhase() {
    const [revealed, setRevealed] = useState(0);
    useEffect(() => {
        const timers = AUDIT_FINDINGS.map((_, i) =>
            setTimeout(() => setRevealed(i + 1), (i + 1) * 950)
        );
        return () => timers.forEach(clearTimeout);
    }, []);

    const savingsMap = [4200, 6000, 6000, 6000];
    const currentSavings = revealed > 0 ? savingsMap[revealed - 1] : 0;

    return (
        <div className="h-full flex flex-col p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest mb-1">Step 03 · Findings</div>
                    <div className="font-serif text-lg">Audit complete</div>
                </div>
                <div className="text-right flex-shrink-0">
                    <div className="font-mono text-[9px] text-neutral-400 uppercase tracking-wide mb-0.5">savings identified</div>
                    <motion.div
                        key={currentSavings}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className="font-mono text-2xl font-bold text-black leading-none"
                    >
                        ${currentSavings.toLocaleString()}<span className="text-sm font-normal">/mo</span>
                    </motion.div>
                </div>
            </div>

            <div className="space-y-2 flex-1">
                {AUDIT_FINDINGS.map((f, i) => {
                    if (i >= revealed) {
                        return (
                            <div key={f.title} className="h-[66px] border border-black/10 bg-white/60 animate-pulse" />
                        );
                    }
                    const isCritical = f.type === "critical";
                    const isWarning = f.type === "warning";
                    const isWinner = f.type === "winner";
                    return (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`border px-4 py-3 ${isCritical ? "border-black bg-black text-white" : isWarning ? "border-neutral-700 bg-neutral-800 text-white" : "border-black/20 bg-white text-black"}`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2 min-w-0">
                                    {isWinner ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-black flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <AlertTriangle className="w-3.5 h-3.5 text-white/70 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div>
                                        <div className={`font-mono text-[11px] font-bold ${isWinner ? "text-black" : "text-white"}`}>{f.title}</div>
                                        <div className={`font-mono text-[9px] mt-0.5 ${isWinner ? "text-neutral-500" : "text-white/55"}`}>{f.detail}</div>
                                        <div className={`font-mono text-[9px] mt-1 font-semibold ${isWinner ? "text-neutral-600" : "text-white/75"}`}>→ {f.action}</div>
                                    </div>
                                </div>
                                {f.saving && (
                                    <div className="flex-shrink-0 text-right">
                                        <div className="font-mono text-sm font-bold text-white">{f.saving}</div>
                                        <div className="font-mono text-[8px] text-white/45 uppercase">saved</div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <AnimatePresence>
                {revealed >= AUDIT_FINDINGS.length && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 px-4 py-3 bg-black text-white"
                    >
                        <div className="font-mono text-[9px] text-white/45 uppercase tracking-widest mb-1">Total annual optimization potential</div>
                        <div className="font-mono text-2xl font-bold">$72,000 / yr</div>
                        <div className="font-mono text-[9px] text-white/40 mt-0.5">+ 90-day implementation roadmap included</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─── Phase 3: Roadmap ───────────────────────────────────────────────────── */
const ROADMAP = [
    {
        period: "Days 1–30",
        label: "Consolidate & Cut",
        header: "bg-black text-white",
        tasks: [
            "Migrate Pipedrive → HubSpot (saves $1,400/mo)",
            "Cancel 3 redundant Salesforce seat tiers",
            "Right-size Tableau: 45 → 12 seat plan",
        ],
    },
    {
        period: "Days 31–60",
        label: "Expand Winners",
        header: "bg-neutral-700 text-white",
        tasks: [
            "Roll Clay out to full 8-seat sales team",
            "Linear enterprise rollout — all engineering",
            "Configure Trackr auto-refresh on 12 tools",
        ],
    },
    {
        period: "Days 61–90",
        label: "Measure & Optimize",
        header: "bg-neutral-300 text-black",
        tasks: [
            "Review Trackr scorecard vs. Q1 baseline",
            "Evaluate 4 new tools flagged by AI agents",
            "Present ROI report to leadership",
        ],
    },
];

function RoadmapPhase() {
    const [taskRevealed, setTaskRevealed] = useState(0);
    const total = ROADMAP.reduce((s, b) => s + b.tasks.length, 0);
    useEffect(() => {
        const timers = Array.from({ length: total }, (_, i) =>
            setTimeout(() => setTaskRevealed(i + 1), (i + 1) * 560)
        );
        return () => timers.forEach(clearTimeout);
    }, [total]);

    return (
        <div className="h-full flex flex-col p-6">
            <div className="mb-4">
                <div className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest mb-1">Step 04 · Roadmap</div>
                <div className="font-serif text-lg">Your 90-day implementation plan</div>
            </div>

            <div className="space-y-3 flex-1">
                {ROADMAP.map((block, bi) => {
                    const tasksBefore = ROADMAP.slice(0, bi).reduce((s, b) => s + b.tasks.length, 0);
                    const blockShown = Math.max(0, Math.min(taskRevealed - tasksBefore, block.tasks.length));
                    const blockActive = bi === 0 || taskRevealed > tasksBefore;
                    return (
                        <motion.div
                            key={block.period}
                            animate={{ opacity: blockActive ? 1 : 0.25 }}
                            className="border border-black/20 overflow-hidden"
                        >
                            <div className={`flex items-center gap-3 px-4 py-2 ${block.header}`}>
                                <span className="font-mono text-[9px] opacity-50 uppercase tracking-widest">{block.period}</span>
                                <span className="font-mono text-[11px] font-bold">{block.label}</span>
                                {blockShown >= block.tasks.length && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-auto">
                                        <CheckCircle2 className={`w-3 h-3 ${bi === 2 ? "text-black/50" : "text-white/50"}`} />
                                    </motion.div>
                                )}
                            </div>
                            <div className="px-4 py-2.5 bg-white space-y-1.5">
                                {block.tasks.map((task, ti) => {
                                    const shown = ti < blockShown;
                                    return (
                                        <motion.div
                                            key={task}
                                            animate={{ opacity: shown ? 1 : 0.15 }}
                                            className="flex items-start gap-2"
                                        >
                                            {shown ? (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 340, damping: 20 }}
                                                >
                                                    <CheckCircle2 className="w-3 h-3 text-black flex-shrink-0 mt-0.5" />
                                                </motion.div>
                                            ) : (
                                                <div className="w-3 h-3 border border-neutral-300 flex-shrink-0 mt-0.5" />
                                            )}
                                            <span className="font-mono text-[10px] text-neutral-700 leading-snug">{task}</span>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <AnimatePresence>
                {taskRevealed >= total && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 px-4 py-3 border border-black bg-[#F3F3EF] flex items-center justify-between"
                    >
                        <div>
                            <div className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider">Outcome at day 90</div>
                            <div className="font-serif text-base">$72K saved · AI competitive edge</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-black flex-shrink-0" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─── Main export ────────────────────────────────────────────────────────── */
export function AuditDemo() {
    const [phase, setPhase] = useState(0);
    const phaseRef = useRef(0);

    const advance = useCallback(() => {
        const next = (phaseRef.current + 1) % PHASES.length;
        phaseRef.current = next;
        setPhase(next);
    }, []);

    const jumpTo = (p: number) => {
        phaseRef.current = p;
        setPhase(p);
    };

    return (
        <div className="relative w-full">
            {/* Phase tabs */}
            <div className="flex border border-black border-b-0 overflow-hidden">
                {PHASES.map((p, i) => (
                    <button
                        key={p.id}
                        onClick={() => jumpTo(i)}
                        className={`flex-1 px-2 py-2.5 font-mono text-[10px] uppercase tracking-wide border-r border-black last:border-r-0 transition-colors ${
                            phase === i
                                ? "bg-black text-white"
                                : "bg-[#F3F3EF] text-neutral-500 hover:bg-neutral-100"
                        }`}
                    >
                        <span className="block font-mono text-[8px] opacity-40 mb-0.5 tracking-widest">0{i + 1}</span>
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Content area */}
            <div className="border border-black border-t-0 bg-[#F3F3EF] relative h-[480px] overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={phase}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="absolute inset-0"
                    >
                        {phase === 0 && <DiscoveryPhase />}
                        {phase === 1 && <ResearchPhase />}
                        {phase === 2 && <FindingsPhase />}
                        {phase === 3 && <RoadmapPhase />}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Progress bar */}
            <PhaseBar key={phase} phase={phase} duration={PHASE_MS[phase]} onComplete={advance} />

            {/* Live indicator */}
            <div className="mt-2 flex items-center gap-1.5">
                <motion.div
                    className="w-1.5 h-1.5 bg-black flex-shrink-0"
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                />
                <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider">
                    Live demo — auto-advances · click any tab to jump
                </span>
            </div>
        </div>
    );
}
