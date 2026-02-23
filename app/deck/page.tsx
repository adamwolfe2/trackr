"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { TrackrLogo } from "@/components/common/trackr-logo";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const TOTAL = 10;
const BG = "#F3F3EF";

// Exact copy from offset-hero.tsx
const DEMO_TOOLS = [
    {
        url: "notion.so",
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
];

const STREAM_STEPS = [
    ["Mapping site structure...", "Crawling pricing page...", "Extracting feature list...", "Parsing changelog..."],
    ["Scanning G2 reviews...", "Fetching Capterra data...", "Analyzing Reddit posts...", "Checking Product Hunt..."],
    ["Comparing 6 competitors...", "Detecting integrations...", "Scoring 7 dimensions...", "Writing verdict..."],
];

const PROCESS_STEPS = [
    { n: "1", tool: "FIRECRAWL", title: "Map Site", desc: "Crawl the tool's website to discover all pages. Identify key pages: pricing, features, about, changelog. Build a full sitemap." },
    { n: "2", tool: "FIRECRAWL", title: "Scrape Pages", desc: "Scrape selected pages in parallel, converting HTML to clean markdown. Extract text content, pricing tables, and feature lists." },
    { n: "3", tool: "TAVILY",    title: "Review Sites", desc: "Query G2, Capterra, TrustRadius, and Product Hunt for ratings, pros/cons, and verified user sentiment." },
    { n: "4", tool: "TAVILY",    title: "Community Intel", desc: "Pull Reddit threads, HackerNews discussions, and LinkedIn posts for unfiltered real-world usage patterns." },
    { n: "5", tool: "AI",        title: "Synthesize", desc: "AI consolidates all gathered data, resolving conflicts and building a structured knowledge profile of the tool." },
    { n: "6", tool: "AI",        title: "Score 7 Dimensions", desc: "Each tool is scored: Features, Pricing Value, AI Capabilities, Integrations, Ease of Use, Support, and Momentum." },
    { n: "7", tool: "TRACKR",    title: "Deliver to Workspace", desc: "Report is saved to your shared workspace. Team is notified. Renewal alerts are set. Everything tracked going forward." },
];

const SPEND_DEPTS = [
    { id: "eng",   label: "Engineering", ai: 4800, legacy: 3200 },
    { id: "mkt",   label: "Marketing",   ai: 2400, legacy: 5800 },
    { id: "ops",   label: "Operations",  ai: 1800, legacy: 4200 },
    { id: "sales", label: "Sales",       ai: 3200, legacy: 6100 },
];

const SPEND_TOOLS = [
    { name: "Salesforce", type: "Legacy", cost: 2400 },
    { name: "AWS",        type: "Legacy", cost: 1800 },
    { name: "HubSpot",    type: "Legacy", cost: 1800 },
    { name: "Jira",       type: "Legacy", cost: 900  },
    { name: "ZoomInfo",   type: "Legacy", cost: 900  },
    { name: "Gong AI",    type: "AI",     cost: 800  },
    { name: "Datadog",    type: "Legacy", cost: 620  },
    { name: "Clay",       type: "AI",     cost: 349  },
    { name: "Cursor",     type: "AI",     cost: 280  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
    return (
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-black/40 mb-3">
            {children}
        </p>
    );
}

function Favicon({ domain, size = 16 }: { domain: string; size?: number }) {
    return (
        <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
            alt={domain}
            width={size}
            height={size}
            className="flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
    );
}

function ToolDot({ domain }: { domain: string }) {
    return (
        <div className="w-5 h-5 border border-black/15 bg-white flex items-center justify-center flex-shrink-0">
            <Favicon domain={domain} size={12} />
        </div>
    );
}

function Slide({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={`w-full h-screen flex items-center justify-center overflow-hidden ${className}`}
            style={{ padding: "72px 96px" }}
        >
            <div className="w-full max-w-[1100px]">{children}</div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESEARCH AGENT DEMO (auto-playing)
// ─────────────────────────────────────────────────────────────────────────────

type ResearchPhase = "idle" | "typing" | "researching" | "done";

function AnimatedScore({ score, run }: { score: number; run: boolean }) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (!run) { setVal(0); return; }
        let v = 0;
        const step = score / 22;
        const t = setInterval(() => {
            v += step;
            if (v >= score) { setVal(score); clearInterval(t); }
            else setVal(Math.round(v));
        }, 28);
        return () => clearInterval(t);
    }, [run, score]);
    return <>{val}</>;
}

function ResearchAgentDemo({ autoPlay = true }: { autoPlay?: boolean }) {
    const [toolIdx, setToolIdx] = useState(0);
    const [phase, setPhase] = useState<ResearchPhase>("idle");
    const [typedUrl, setTypedUrl] = useState("");
    const [tick, setTick] = useState(0);
    const [streamVisible, setStreamVisible] = useState([0, 0, 0]);
    const [streamActive, setStreamActive] = useState([0, 0, 0]);
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

    const tool = DEMO_TOOLS[toolIdx];

    const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };

    const runCycle = useCallback((idx: number) => {
        clearAll();
        const t = DEMO_TOOLS[idx];
        setPhase("idle");
        setTypedUrl("");
        setTick(0);
        setStreamVisible([0, 0, 0]);
        setStreamActive([0, 0, 0]);

        // Typing
        const add = (delay: number, fn: () => void) => {
            const id = setTimeout(fn, delay);
            timers.current.push(id);
        };

        add(400, () => setPhase("typing"));
        const url = t.url;
        url.split("").forEach((ch, i) => {
            add(400 + 60 + i * 55, () => setTypedUrl(url.slice(0, i + 1)));
        });

        const resStart = 400 + 60 + url.length * 55 + 300;
        add(resStart, () => { setPhase("researching"); });

        // Stream items
        [0, 1, 2].forEach(si => {
            [0, 1, 2, 3].forEach(step => {
                const delay = resStart + si * 200 + step * 520;
                add(delay, () => {
                    setStreamVisible(p => { const n = [...p]; n[si] = step + 1; return n; });
                    setStreamActive(p => { const n = [...p]; n[si] = step; return n; });
                });
            });
        });

        // Findings
        [1, 2, 3, 4, 5].forEach(ti => {
            add(resStart + ti * 700, () => setTick(ti));
        });

        const doneAt = resStart + 5 * 700 + 400;
        add(doneAt, () => { setPhase("done"); setTick(7); });

        // Cycle to next after pause
        if (autoPlay) {
            add(doneAt + 4500, () => {
                const next = (idx + 1) % DEMO_TOOLS.length;
                setToolIdx(next);
                runCycle(next);
            });
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        runCycle(0);
        return clearAll;
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="relative w-full">
            {/* Widget */}
            <div className="border border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
                style={{ height: 420 }}>
                {/* Title bar */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/10 bg-[#F3F3EF] flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <TrackrLogo size={14} />
                        <span className="font-mono text-[10px] uppercase tracking-widest text-black/60">Trackr — Research Agent</span>
                    </div>
                    {phase === "done" && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-black animate-pulse" />
                            <span className="font-mono text-[9px] uppercase tracking-widest text-black/50">Report Ready</span>
                        </div>
                    )}
                </div>

                {/* URL Bar */}
                <div className="flex items-center gap-3 px-4 py-2.5 border-b border-black/10 bg-white flex-shrink-0">
                    <div className="w-5 h-5 border border-black/10 flex items-center justify-center bg-[#F3F3EF]">
                        <Favicon domain={tool.url} size={12} />
                    </div>
                    <span className="font-mono text-xs text-black flex-1 min-w-0">
                        {typedUrl}
                        {(phase === "typing") && (
                            <span className="inline-block w-[1px] h-3 bg-black ml-0.5 animate-pulse align-middle" />
                        )}
                    </span>
                    {phase === "done" && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-black flex-shrink-0" />
                    )}
                </div>

                {/* Body */}
                <div className="relative overflow-hidden flex-1" style={{ height: "calc(420px - 80px)" }}>
                    {/* Researching */}
                    {phase === "researching" && (
                        <div className="absolute inset-0 flex flex-col">
                            {/* 3 stream columns */}
                            <div className="grid grid-cols-3 divide-x divide-black/10 p-3 gap-0 flex-shrink-0">
                                {["Crawler", "Reviews", "Analyst"].map((col, si) => (
                                    <div key={col} className="px-2 first:pl-0 last:pr-0">
                                        <div className="font-mono text-[8px] uppercase tracking-widest text-black/30 mb-2">{col}</div>
                                        {STREAM_STEPS[si].map((step, stepIdx) => (
                                            <div key={step}
                                                className="flex items-start gap-1 mb-1"
                                                style={{
                                                    opacity: stepIdx < streamVisible[si] ? 1 : 0.15,
                                                    transition: "opacity 0.3s",
                                                }}>
                                                <span className="font-mono text-[8px] text-black/25 mt-0.5 flex-shrink-0">›</span>
                                                <span className={`font-mono text-[9px] leading-snug ${
                                                    stepIdx === streamActive[si] && tick < 7 ? "text-black font-semibold" : "text-black/40"
                                                }`}>{step}</span>
                                            </div>
                                        ))}
                                        {streamVisible[si] > 0 && streamVisible[si] < 4 && (
                                            <div className="flex gap-0.5 pl-2.5 pt-0.5">
                                                {[0,1,2].map(d => <span key={d} className="w-1 h-1 bg-black/20 inline-block animate-pulse" />)}
                                            </div>
                                        )}
                                        {streamVisible[si] >= 4 && (
                                            <div className="flex items-center gap-1 pl-2.5 pt-0.5">
                                                <CheckCircle2 className="w-2.5 h-2.5 text-black" />
                                                <span className="font-mono text-[9px] text-black font-semibold">Done</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Live findings */}
                            <div className="border-t border-black/10 px-3 pt-2.5 pb-2.5 flex-1 bg-white/40 overflow-hidden">
                                <span className="font-mono text-[8px] text-black/30 uppercase tracking-widest block mb-2">Live findings</span>
                                {tool.findings.slice(0, Math.min(Math.max(tick - 1, 0), 5)).map((finding, i) => (
                                    <div key={`${toolIdx}-f-${i}`}
                                        className="flex items-start gap-2 mb-1.5"
                                        style={{ animation: "fadeSlideIn 0.22s ease forwards" }}>
                                        <span className="font-mono text-[9px] text-black/30 flex-shrink-0 mt-0.5">→</span>
                                        <span className="font-mono text-[10px] leading-snug text-black/60">{finding}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Done — score card */}
                    {phase === "done" && (
                        <div className="absolute inset-0 overflow-y-auto">
                            <div className="p-5 pb-4">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="font-serif text-lg font-medium">{tool.name}</div>
                                        <div className="font-mono text-[10px] text-black/50 mt-0.5">{tool.tagline}</div>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-3">
                                        <div className="font-mono text-3xl font-bold text-black leading-none">
                                            <AnimatedScore score={tool.score} run={phase === "done"} />
                                        </div>
                                        <div className="font-mono text-[9px] text-black/40 uppercase tracking-wider mt-0.5">/100 Score</div>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-4">
                                    {tool.dimensions.map((dim, i) => (
                                        <div key={`${toolIdx}-${dim.label}`}>
                                            <div className="flex justify-between items-center mb-0.5">
                                                <span className="font-mono text-[10px] text-black/50 uppercase tracking-wide">{dim.label}</span>
                                                <span className="font-mono text-[10px] font-bold">{dim.score}</span>
                                            </div>
                                            <div className="h-[3px] bg-black/08 border border-black/10">
                                                <div className="h-full bg-black transition-all duration-500"
                                                    style={{
                                                        width: `${dim.score}%`,
                                                        transitionDelay: `${0.12 + i * 0.055}s`,
                                                    }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-[#F3F3EF] border border-black px-3 py-2">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="w-3 h-3 text-black flex-shrink-0 mt-0.5" />
                                        <span className="font-mono text-[10px] text-black/70">{tool.verdict}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-black">
                                <div className="px-5 py-2 bg-black flex items-center justify-between">
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-white/70">Report ready — send it</span>
                                    <span className="w-1.5 h-1.5 bg-white/60 animate-pulse" />
                                </div>
                                <div className="divide-y divide-black/08">
                                    {tool.nextSteps.map((step, i) => (
                                        <div key={`${toolIdx}-ns-${i}`}
                                            className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#F3F3EF] transition-colors"
                                            style={{ animation: `fadeSlideIn 0.25s ease ${0.25 + i * 0.1}s both` }}>
                                            <ToolDot domain={step.domain} />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-mono text-[11px] text-black font-semibold truncate">{step.action}</div>
                                                <div className="font-mono text-[9px] text-black/40 truncate">{step.sub}</div>
                                            </div>
                                            <ArrowRight className="w-3 h-3 text-black/25 flex-shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Idle */}
                    {phase === "idle" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex gap-1.5">
                                {[0,1,2].map(d => (
                                    <span key={d} className="w-1.5 h-1.5 bg-black/15 animate-pulse"
                                        style={{ animationDelay: `${d * 0.2}s` }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tool cycle dots */}
            <div className="flex items-center justify-center gap-2 mt-3">
                {DEMO_TOOLS.map((t, i) => (
                    <div key={t.url}
                        className="h-1.5 transition-all duration-300 bg-black"
                        style={{ width: i === toolIdx ? 16 : 6, opacity: i === toolIdx ? 1 : 0.2 }} />
                ))}
            </div>

            <div className="absolute -bottom-3 -right-3 w-full h-full border border-black/20 -z-10" />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPEND TRACKER DEMO (auto-playing)
// ─────────────────────────────────────────────────────────────────────────────

function SpendTrackerDemo() {
    const [barsLoaded, setBarsLoaded] = useState(false);
    const [highlight, setHighlight] = useState<string | null>(null);
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
        const add = (d: number, fn: () => void) => { const id = setTimeout(fn, d); timers.current.push(id); };

        add(200, () => setBarsLoaded(true));
        // Cycle highlight through departments
        const depts = SPEND_DEPTS.map(d => d.id);
        depts.forEach((id, i) => {
            add(1200 + i * 1800, () => setHighlight(id));
        });
        add(1200 + depts.length * 1800, () => setHighlight(null));

        return () => timers.current.forEach(clearTimeout);
    }, []);

    const totalAi  = SPEND_DEPTS.reduce((s, d) => s + d.ai, 0);
    const totalLeg = SPEND_DEPTS.reduce((s, d) => s + d.legacy, 0);
    const maxVal   = Math.max(...SPEND_DEPTS.flatMap(d => [d.ai, d.legacy]));
    const maxTool  = Math.max(...SPEND_TOOLS.map(t => t.cost));

    return (
        <div className="grid grid-cols-2 gap-8 h-full">
            {/* Left: KPIs */}
            <div className="flex flex-col gap-4 justify-center">
                <div className="border border-black bg-white p-5 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                    <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-black/40 mb-2">Monthly Total Spend</div>
                    <div className="font-serif text-5xl font-black tracking-tight">
                        ${(totalAi + totalLeg).toLocaleString()}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="border border-black bg-white p-4">
                        <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-black/40 mb-2">AI Tools</div>
                        <div className="font-serif text-3xl font-black">${totalAi.toLocaleString()}</div>
                    </div>
                    <div className="border border-black bg-white p-4">
                        <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-black/40 mb-2">Legacy</div>
                        <div className="font-serif text-3xl font-black text-black/40">${totalLeg.toLocaleString()}</div>
                    </div>
                </div>
                <div className="border border-black bg-white p-4">
                    <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-black/40 mb-3">By Department</div>
                    {SPEND_DEPTS.map(d => (
                        <div key={d.id}
                            className="flex items-center gap-2 py-1.5 transition-colors"
                            style={{ opacity: !highlight || highlight === d.id ? 1 : 0.3 }}>
                            <div className="w-1.5 h-1.5 bg-black flex-shrink-0" />
                            <span className="font-mono text-xs text-black/60 flex-1">{d.label}</span>
                            <span className="font-mono text-xs font-bold">${(d.ai + d.legacy).toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Chart + breakdown */}
            <div className="flex flex-col gap-4">
                <div className="border border-black bg-white p-5 flex-shrink-0">
                    <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-black/40 mb-4">Monthly Spend by Department</div>
                    <div className="flex items-end gap-3 h-36 mb-3">
                        {SPEND_DEPTS.map(d => {
                            const aiH  = barsLoaded ? Math.round((d.ai   / maxVal) * 128) : 2;
                            const legH = barsLoaded ? Math.round((d.legacy / maxVal) * 128) : 2;
                            return (
                                <div key={d.id} className="flex-1 flex flex-col items-center gap-1"
                                    style={{ opacity: !highlight || highlight === d.id ? 1 : 0.3, transition: "opacity 0.5s" }}>
                                    <div className="flex gap-1 items-end w-full">
                                        <div className="flex-1 bg-black transition-all duration-700 rounded-t-[1px]"
                                            style={{ height: aiH }} />
                                        <div className="flex-1 bg-black/25 transition-all duration-700 rounded-t-[1px]"
                                            style={{ height: legH }} />
                                    </div>
                                    <div className="font-mono text-[8px] text-black/40">{d.label.slice(0,3)}</div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 font-mono text-[9px] text-black/50">
                            <div className="w-2 h-2 bg-black" /> AI Tools
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[9px] text-black/50">
                            <div className="w-2 h-2 bg-black/25" /> Legacy
                        </div>
                    </div>
                </div>
                <div className="border border-black bg-white p-4 flex-1 overflow-hidden">
                    <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-black/40 mb-3">Top Spend</div>
                    {SPEND_TOOLS.slice(0, 7).map(tool => (
                        <div key={tool.name} className="flex items-center gap-2 mb-2">
                            <div className="font-mono text-[10px] text-black/50 w-20 flex-shrink-0 text-right">{tool.name}</div>
                            <div className="flex-1 h-[3px] bg-black/08">
                                <div className="h-full transition-all duration-700 delay-300"
                                    style={{
                                        width: barsLoaded ? `${(tool.cost / maxTool) * 100}%` : "0%",
                                        background: tool.type === "AI" ? "black" : "rgba(0,0,0,0.25)",
                                    }} />
                            </div>
                            <div className="font-mono text-[10px] font-bold w-12 text-right">${tool.cost.toLocaleString()}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS ANIMATION (auto-playing)
// ─────────────────────────────────────────────────────────────────────────────

function ProcessAnimation() {
    const [activeStep, setActiveStep] = useState(-1);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
        setActiveStep(-1);
        setCompletedSteps([]);

        PROCESS_STEPS.forEach((_, i) => {
            const activate = setTimeout(() => setActiveStep(i), 300 + i * 900);
            const complete = setTimeout(() => setCompletedSteps(p => [...p, i]), 300 + i * 900 + 700);
            timers.current.push(activate, complete);
        });

        return () => timers.current.forEach(clearTimeout);
    }, []);

    return (
        <div className="grid grid-cols-7 gap-0 border border-black w-full">
            {PROCESS_STEPS.map((step, i) => {
                const isDone   = completedSteps.includes(i);
                const isActive = activeStep === i && !isDone;
                return (
                    <div key={step.n}
                        className={`p-4 transition-all duration-400 ${i < PROCESS_STEPS.length - 1 ? "border-r border-black" : ""}`}
                        style={{ background: isDone ? "black" : isActive ? "#000" : "white" }}>
                        <div className="font-mono text-[8px] uppercase tracking-[0.15em] mb-2"
                            style={{ color: isDone || isActive ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)" }}>
                            Step {step.n}
                        </div>
                        <div className="font-mono text-[8px] uppercase tracking-[0.12em] mb-2"
                            style={{ color: isDone || isActive ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.4)" }}>
                            {step.tool}
                        </div>
                        <div className={`font-serif text-sm font-bold mb-2 transition-colors`}
                            style={{ color: isDone || isActive ? "white" : "black" }}>
                            {step.title}
                        </div>
                        {(isDone || isActive) && (
                            <div className="font-mono text-[9px] leading-relaxed"
                                style={{ color: "rgba(255,255,255,0.55)" }}>
                                {step.desc.slice(0, 60)}...
                            </div>
                        )}
                        {isDone && (
                            <div className="mt-3 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" style={{ color: "rgba(255,255,255,0.6)" }} />
                                <span className="font-mono text-[8px]" style={{ color: "rgba(255,255,255,0.5)" }}>Done</span>
                            </div>
                        )}
                        {isActive && (
                            <div className="mt-3 flex gap-1">
                                {[0,1,2].map(d => (
                                    <span key={d} className="w-1 h-1 bg-white/40 animate-pulse"
                                        style={{ animationDelay: `${d * 0.2}s` }} />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function S1({ goTo }: { goTo: (n: number) => void }) {
    return (
        <Slide>
            <div className="flex items-start gap-16">
                {/* Left */}
                <div className="flex-1 min-w-0 pt-2">
                    <div className="flex items-center gap-2 mb-8">
                        <TrackrLogo size={20} />
                        <span className="font-serif text-lg font-medium tracking-tight">Trackr</span>
                    </div>
                    <Label>AI Tool Intelligence for Ops Teams</Label>
                    <h1 className="font-serif font-black leading-[1.05] tracking-tight mb-6"
                        style={{ fontSize: "clamp(42px,5vw,68px)" }}>
                        Your team&apos;s AI tool<br />intelligence layer.
                    </h1>
                    <p className="font-mono text-sm text-black/55 leading-relaxed mb-10 max-w-[440px]">
                        Research any AI tool in under 2 minutes. Track what you pay for. Stay current on launches. One shared workspace — no spreadsheets, no Slack threads, no wasted research.
                    </p>
                    <div className="flex flex-col gap-4 mb-10">
                        {["Reports in under 2 min", "7-dimension scorecard", "Auto-refreshes every 30 days"].map(f => (
                            <div key={f} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-black flex-shrink-0" />
                                <span className="font-mono text-xs text-black/50">{f}</span>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => goTo(2)}
                        className="flex items-center gap-2 bg-black text-white px-7 py-3.5 font-mono text-xs uppercase tracking-widest hover:bg-black/80 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                        See How It Works <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Right: Demo */}
                <div className="flex-shrink-0 w-[400px]">
                    <div className="flex items-center gap-2 mb-2.5">
                        <div className="w-1.5 h-1.5 bg-black animate-pulse" />
                        <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">
                            Live Demo — 3 Parallel Research Agents
                        </span>
                    </div>
                    <ResearchAgentDemo />
                </div>
            </div>
        </Slide>
    );
}

function S2() {
    return (
        <Slide>
            <Label>The Reality</Label>
            <h2 className="font-serif font-black leading-[1.03] tracking-tight mb-8"
                style={{ fontSize: "clamp(48px,6vw,88px)" }}>
                The AI race is<br />happening now.<br />
                <span className="text-black/25">Most operators<br />are losing it.</span>
            </h2>
            <p className="font-mono text-sm text-black/50 max-w-[560px] leading-relaxed">
                Former Fortune 500 CROs. Ex-Google, Meta, and Palantir operators. Even the most sophisticated technology leaders in the world admit they can&apos;t keep up with AI tools — and they&apos;re right.
            </p>
        </Slide>
    );
}

function S3() {
    // Audit page urgency stats
    const STATS = [
        { stat: "73%",   label: "of AI implementations fail to deliver ROI within 6 months", source: "McKinsey, 2025" },
        { stat: "8,000+",label: "AI tools launched in 2024 alone — and counting",             source: "CB Insights"   },
        { stat: "14 hrs",label: "per week ops leaders spend evaluating tools manually",        source: "Internal survey"},
        { stat: "$340B", label: "wasted annually on redundant and underutilized software",     source: "Gartner, 2025" },
    ];
    return (
        <Slide>
            <Label>Why This Matters Right Now</Label>
            <h2 className="font-serif font-black leading-[1.05] tracking-tight mb-10"
                style={{ fontSize: "clamp(36px,4.5vw,64px)" }}>
                The cost of standing still<br />is compounding daily.
            </h2>
            <div className="grid grid-cols-4 gap-0 border border-black">
                {STATS.map((s, i) => (
                    <div key={s.stat} className={`p-8 ${i < 3 ? "border-r border-black" : ""}`}>
                        <div className="font-serif font-black leading-none mb-3"
                            style={{ fontSize: "clamp(32px,3.5vw,52px)" }}>
                            {s.stat}
                        </div>
                        <p className="font-mono text-xs text-black/55 leading-relaxed mb-3">{s.label}</p>
                        <div className="font-mono text-[9px] text-black/30 uppercase tracking-widest">{s.source}</div>
                    </div>
                ))}
            </div>
        </Slide>
    );
}

function S4() {
    const CAPS = [
        {
            label: "Research Agent",
            body: "AI agents map, scrape, and score any tool in under 2 minutes. G2, Reddit, Capterra, competitor pages — all synthesized into a 7-dimension scorecard.",
            tools: ["notion.so","linear.app","figma.com","clay.com","cursor.sh"],
        },
        {
            label: "Spend Tracker",
            body: "Map every software dollar to a team and owner. AI vs. legacy breakdown. Identify redundancy. Export CFO-ready reports instantly.",
            tools: ["salesforce.com","hubspot.com","asana.com","slack.com","zoom.us"],
        },
        {
            label: "Stack Intelligence",
            body: "Your team&apos;s shared workspace. Compare tools side-by-side, track renewals, get AI recommendations, and stay current on every tool in your stack.",
            tools: ["notion.so","slack.com","github.com","figma.com","zapier.com"],
        },
    ];
    return (
        <Slide>
            <Label>What Trackr Does</Label>
            <h2 className="font-serif font-black leading-[1.05] tracking-tight mb-10"
                style={{ fontSize: "clamp(36px,4.5vw,64px)" }}>
                Research. Track. Decide.<br />One platform.
            </h2>
            <div className="grid grid-cols-3 gap-0 border border-black">
                {CAPS.map((c, i) => (
                    <div key={c.label} className={`p-8 ${i < 2 ? "border-r border-black" : ""}`}>
                        <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-black/30 mb-3">0{i+1}</div>
                        <h3 className="font-serif text-xl font-bold mb-4">{c.label}</h3>
                        <p className="font-mono text-xs text-black/55 leading-relaxed mb-6"
                            dangerouslySetInnerHTML={{ __html: c.body }} />
                        <div className="flex gap-1.5 flex-wrap">
                            {c.tools.map(d => (
                                <div key={d} className="w-6 h-6 border border-black/10 bg-[#F3F3EF] flex items-center justify-center">
                                    <Favicon domain={d} size={12} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Slide>
    );
}

function S5() {
    return (
        <Slide>
            <div className="flex items-start gap-14">
                <div className="flex-[0_0_320px] pt-2">
                    <Label>Research Agent</Label>
                    <h2 className="font-serif font-black leading-[1.05] tracking-tight mb-5"
                        style={{ fontSize: "clamp(32px,4vw,54px)" }}>
                        Any tool.<br />Under 2 minutes.<br />7 dimensions.
                    </h2>
                    <p className="font-mono text-xs text-black/55 leading-relaxed mb-6">
                        Paste a URL or name. Three parallel AI agents research the tool simultaneously — crawling the site, scanning reviews, benchmarking competitors. A complete scorecard is delivered to your workspace automatically.
                    </p>
                    <div className="border border-black bg-white p-5 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                        <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-black/30 mb-3">Sources Analyzed</div>
                        {["Product site + changelog","G2, Capterra, Trustpilot","Reddit + HackerNews threads","Competitor pages + pricing","3 parallel AI agents"].map(s => (
                            <div key={s} className="flex items-center gap-2 font-mono text-xs text-black/55 mb-2">
                                <span className="w-1 h-1 bg-black flex-shrink-0" /> {s}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex-1 pt-2">
                    <ResearchAgentDemo />
                </div>
            </div>
        </Slide>
    );
}

function S6() {
    return (
        <Slide>
            <Label>How It Works</Label>
            <h2 className="font-serif font-black leading-[1.05] tracking-tight mb-8"
                style={{ fontSize: "clamp(36px,4.5vw,64px)" }}>
                7 automated steps.<br />Zero manual work.
            </h2>
            <ProcessAnimation />
            <div className="mt-6 grid grid-cols-3 gap-0 border border-black">
                {[
                    { stat: "~$0.01",  label: "per page crawled" },
                    { stat: "< 2 min", label: "avg report time"  },
                    { stat: "30 days", label: "auto-refresh cycle"},
                ].map((x, i) => (
                    <div key={x.stat} className={`p-5 flex items-center gap-4 ${i < 2 ? "border-r border-black" : ""}`}>
                        <div className="font-serif text-2xl font-black">{x.stat}</div>
                        <div className="font-mono text-[10px] text-black/40">{x.label}</div>
                    </div>
                ))}
            </div>
        </Slide>
    );
}

function S7() {
    return (
        <Slide className="!items-start">
            <div className="pt-4 w-full">
                <Label>Spend Tracker</Label>
                <h2 className="font-serif font-black leading-[1.05] tracking-tight mb-6"
                    style={{ fontSize: "clamp(32px,4vw,54px)" }}>
                    Every dollar mapped.<br />Every tool accountable.
                </h2>
                <div style={{ height: 420 }}>
                    <SpendTrackerDemo />
                </div>
            </div>
        </Slide>
    );
}

function S8() {
    const FEATURES = [
        { title: "500+ Tools Indexed",    body: "Every major AI and SaaS tool scored with agent-generated data. Updated automatically as tools evolve.", tools: ["notion.so","figma.com","linear.app","slack.com"] },
        { title: "Side-by-Side Compare",  body: "Select any tools from your stack and compare them dimension-by-dimension. Share comparisons with your team.", tools: ["airtable.com","zapier.com","asana.com","hubspot.com"] },
        { title: "Renewal Alerts",        body: "Track contract end dates and renewal windows. Get Slack notifications before commitments auto-renew.", tools: ["slack.com","gmail.com","notion.so","calendar.google.com"] },
        { title: "Ask Trackr AI",         body: "Chat with your stack. Ask &quot;What should we replace Zapier with?&quot; or &quot;Which tools have overlapping features?&quot;", tools: ["cursor.sh","clay.com","linear.app","figma.com"] },
    ];
    return (
        <Slide>
            <Label>Stack Intelligence</Label>
            <h2 className="font-serif font-black leading-[1.05] tracking-tight mb-8"
                style={{ fontSize: "clamp(36px,4.5vw,64px)" }}>
                One workspace.<br />Every tool. Full clarity.
            </h2>
            <div className="grid grid-cols-2 gap-0 border border-black">
                {FEATURES.map((f, i) => (
                    <div key={f.title}
                        className={`p-7 ${i % 2 === 0 ? "border-r border-black" : ""} ${i < 2 ? "border-b border-black" : ""}`}>
                        <h3 className="font-serif text-xl font-bold mb-3">{f.title}</h3>
                        <p className="font-mono text-xs text-black/55 leading-relaxed mb-4"
                            dangerouslySetInnerHTML={{ __html: f.body }} />
                        <div className="flex gap-1.5">
                            {f.tools.map(d => (
                                <div key={d} className="w-6 h-6 border border-black/10 bg-[#F3F3EF] flex items-center justify-center">
                                    <Favicon domain={d} size={12} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Slide>
    );
}

function S9() {
    const DIFFS = [
        { title: "Custom to your org",        body: "Your stack is different from every other company. We build your implementation from scratch — not from a template." },
        { title: "Pre-market intelligence",   body: "We track 500+ emerging tools every month. You get recommendations before they hit mass market — before your competitors." },
        { title: "Reduces CAC, not just cost",body: "The goal isn't to cut spend blindly. It's to reallocate budget from tools that waste time to tools that directly accelerate revenue." },
        { title: "Shared workspace, live tracking", body: "Your Trackr workspace becomes your team's living knowledge base. Every tool researched, scored, and tracked going forward." },
    ];
    return (
        <Slide>
            <Label>Not Like Any Other AI Consultant</Label>
            <h2 className="font-serif font-black leading-[1.05] tracking-tight mb-10"
                style={{ fontSize: "clamp(36px,4.5vw,64px)" }}>
                We deploy tools inside<br />organizations every day.
            </h2>
            <div className="grid grid-cols-2 gap-0 border border-black">
                {DIFFS.map((d, i) => (
                    <div key={d.title}
                        className={`p-7 ${i % 2 === 0 ? "border-r border-black" : ""} ${i < 2 ? "border-b border-black" : ""}`}>
                        <h3 className="font-serif text-xl font-bold mb-3">{d.title}</h3>
                        <p className="font-mono text-xs text-black/55 leading-relaxed">{d.body}</p>
                    </div>
                ))}
            </div>
        </Slide>
    );
}

function S10() {
    return (
        <Slide>
            <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-10">
                    <TrackrLogo size={22} />
                    <span className="font-serif text-xl font-medium tracking-tight">Trackr</span>
                </div>
                <Label>Enterprise AI Audit</Label>
                <h1 className="font-serif font-black leading-[1.04] tracking-tight mb-6"
                    style={{ fontSize: "clamp(48px,6vw,88px)" }}>
                    The solution isn&apos;t<br />more research.
                </h1>
                <p className="font-mono text-base text-black/50 max-w-[560px] mx-auto leading-relaxed mb-12">
                    It&apos;s having AI architects who live inside this space — who know what&apos;s working before it hits mass market — build your custom stack and get you running in days, not months.
                </p>
                <div className="flex gap-4 justify-center mb-14">
                    <a href="https://cal.com/adamwolfe/trackr" target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-black text-white px-8 py-4 font-mono text-xs uppercase tracking-widest hover:bg-black/80 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                        Book an AI Stack Audit <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                    <a href="https://trytrackr.com/audit" target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 border border-black bg-transparent px-8 py-4 font-mono text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                        View Audit Details
                    </a>
                </div>
                <div className="grid grid-cols-3 border border-black max-w-lg mx-auto">
                    {[
                        { stat: "10 min", label: "to complete your intake" },
                        { stat: "24 hrs", label: "our team reviews + responds" },
                        { stat: "5 days", label: "prioritized action plan" },
                    ].map((x, i) => (
                        <div key={x.stat} className={`p-5 text-center ${i < 2 ? "border-r border-black" : ""}`}>
                            <div className="font-serif text-2xl font-black mb-1">{x.stat}</div>
                            <div className="font-mono text-[10px] text-black/40">{x.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </Slide>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const SLIDES: Record<number, (props: { goTo: (n: number) => void }) => React.ReactNode> = {
    1:  ({ goTo }) => <S1 goTo={goTo} />,
    2:  () => <S2 />,
    3:  () => <S3 />,
    4:  () => <S4 />,
    5:  () => <S5 />,
    6:  () => <S6 />,
    7:  () => <S7 />,
    8:  () => <S8 />,
    9:  () => <S9 />,
    10: () => <S10 />,
};

export default function DeckPage() {
    const [cur, setCur] = useState(1);
    const [visible, setVisible] = useState(true);
    const busy = useRef(false);

    const goTo = useCallback((n: number) => {
        if (n === cur || busy.current || n < 1 || n > TOTAL) return;
        busy.current = true;
        setVisible(false);
        setTimeout(() => {
            setCur(n);
            setVisible(true);
            busy.current = false;
        }, 240);
    }, [cur]);

    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (["ArrowRight", " "].includes(e.key)) { e.preventDefault(); goTo(cur + 1); }
            else if (e.key === "ArrowLeft")           { e.preventDefault(); goTo(cur - 1); }
        };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [cur, goTo]);

    return (
        <>
            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateX(-4px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
            `}</style>

            <div className="relative overflow-hidden select-none"
                style={{ background: BG, height: "100vh", width: "100vw" }}>

                {/* Progress */}
                <div className="fixed top-0 left-0 z-50 h-[2px] bg-black transition-all duration-500"
                    style={{ width: `${(cur / TOTAL) * 100}%` }} />

                {/* Counter */}
                <div className="fixed top-5 right-7 z-50 font-mono text-[11px] font-bold tracking-[0.1em] text-black/30">
                    {cur} / {TOTAL}
                </div>

                {/* Logo */}
                <div className="fixed top-5 left-7 z-50 flex items-center gap-1.5">
                    <TrackrLogo size={14} />
                    <span className="font-mono text-[10px] font-bold tracking-[0.12em] text-black/40">TRACKR</span>
                </div>

                {/* Prev */}
                <button onClick={() => goTo(cur - 1)} disabled={cur === 1}
                    className="fixed left-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-all disabled:opacity-15 disabled:cursor-not-allowed"
                    style={{ background: BG }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>

                {/* Next */}
                <button onClick={() => goTo(cur + 1)} disabled={cur === TOTAL}
                    className="fixed right-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-all disabled:opacity-15 disabled:cursor-not-allowed"
                    style={{ background: BG }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>

                {/* Dots */}
                <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex gap-2">
                    {Array.from({ length: TOTAL }, (_, i) => (
                        <button key={i} onClick={() => goTo(i + 1)}
                            className="h-1.5 rounded-full transition-all bg-black"
                            style={{ width: i + 1 === cur ? 16 : 6, opacity: i + 1 === cur ? 1 : 0.18 }} />
                    ))}
                </div>

                {/* Slide */}
                <div key={cur} style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(8px)",
                    transition: "opacity 0.24s ease, transform 0.24s ease",
                }}>
                    {SLIDES[cur]?.({ goTo })}
                </div>
            </div>
        </>
    );
}
