"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { TrackrLogo } from "@/components/common/trackr-logo";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const TOTAL = 9;
const BG = "#F3F3EF";

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
    { n: "1", tool: "FIRECRAWL", title: "Map Site",          desc: "Crawl the tool's website, identify key pages: pricing, features, changelog." },
    { n: "2", tool: "FIRECRAWL", title: "Scrape Pages",      desc: "Scrape pages in parallel, converting HTML to clean markdown." },
    { n: "3", tool: "TAVILY",    title: "Review Sites",       desc: "Query G2, Capterra, TrustRadius, and Product Hunt for verified sentiment." },
    { n: "4", tool: "TAVILY",    title: "Community Intel",    desc: "Pull Reddit threads, HackerNews, LinkedIn for unfiltered usage patterns." },
    { n: "5", tool: "AI",        title: "Synthesize",         desc: "AI consolidates all gathered data into a structured knowledge profile." },
    { n: "6", tool: "AI",        title: "Score 7 Dimensions", desc: "Features, Pricing, AI Capabilities, Integrations, Ease of Use, Support, Momentum." },
    { n: "7", tool: "TRACKR",    title: "Deliver",            desc: "Report saved to your workspace. Team notified. Renewal alerts set." },
];

const SPEND_TOOLS_DETAILED = [
    { domain: "salesforce.com", name: "Salesforce", dept: "Sales",     seats: 45, cost: 2400, type: "Legacy" as const },
    { domain: "hubspot.com",    name: "HubSpot",    dept: "Marketing", seats: 12, cost: 1800, type: "Legacy" as const },
    { domain: "aws.amazon.com", name: "AWS",        dept: "Eng",       seats: 8,  cost: 1800, type: "Legacy" as const },
    { domain: "gong.io",        name: "Gong AI",    dept: "Sales",     seats: 18, cost: 800,  type: "AI"     as const },
    { domain: "atlassian.com",  name: "Jira",       dept: "Eng",       seats: 24, cost: 900,  type: "Legacy" as const },
    { domain: "zoominfo.com",   name: "ZoomInfo",   dept: "Marketing", seats: 6,  cost: 900,  type: "Legacy" as const },
    { domain: "clay.com",       name: "Clay",       dept: "Sales",     seats: 3,  cost: 349,  type: "AI"     as const },
    { domain: "cursor.sh",      name: "Cursor",     dept: "Eng",       seats: 14, cost: 280,  type: "AI"     as const },
    { domain: "notion.so",      name: "Notion",     dept: "Ops",       seats: 32, cost: 320,  type: "AI"     as const },
    { domain: "datadog.com",    name: "Datadog",    dept: "Eng",       seats: 5,  cost: 620,  type: "Legacy" as const },
];

const SPEND_DEPTS = [
    { id: "eng",   label: "Engineering", color: "#000" },
    { id: "mkt",   label: "Marketing",   color: "#000" },
    { id: "ops",   label: "Operations",  color: "#000" },
    { id: "sales", label: "Sales",       color: "#000" },
];

// ─────────────────────────────────────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
    return (
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/40 mb-3">
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
            className={`w-full min-h-screen flex items-center justify-center ${className}`}
            style={{ padding: "clamp(52px,5vh,72px) clamp(20px,5vw,96px)" }}
        >
            <div className="w-full max-w-[1100px] py-4">{children}</div>
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

function scoreBarColor(score: number): string {
    if (score >= 80) return "#171717";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
}

function scoreDotClass(score: number): string {
    if (score >= 80) return "bg-black";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
}

function ResearchAgentDemo({ autoPlay = true, widgetHeight = 480 }: { autoPlay?: boolean; widgetHeight?: number }) {
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

        [0, 1, 2].forEach(si => {
            [0, 1, 2, 3].forEach(step => {
                const delay = resStart + si * 200 + step * 520;
                add(delay, () => {
                    setStreamVisible(p => { const n = [...p]; n[si] = step + 1; return n; });
                    setStreamActive(p => { const n = [...p]; n[si] = step; return n; });
                });
            });
        });

        [1, 2, 3, 4, 5].forEach(ti => {
            add(resStart + ti * 700, () => setTick(ti));
        });

        const doneAt = resStart + 5 * 700 + 400;
        add(doneAt, () => { setPhase("done"); setTick(7); });

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

    const headerH = 84;
    const bodyH = widgetHeight - headerH;

    return (
        <div className="relative w-full">
            <div className="border border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
                style={{ height: widgetHeight }}>
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
                <div className="relative overflow-hidden flex-1" style={{ height: bodyH }}>
                    {/* Researching */}
                    {phase === "researching" && (
                        <div className="absolute inset-0 flex flex-col">
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
                                                    stepIdx === streamActive[si] && tick < 7 ? "text-black font-medium" : "text-black/40"
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
                                                <span className="font-mono text-[9px] text-black font-medium">Done</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-black/10 px-3 pt-2 pb-2 flex-1 bg-white/40 overflow-hidden">
                                <span className="font-mono text-[8px] text-black/30 uppercase tracking-widest block mb-1.5">Live findings</span>
                                {tool.findings.slice(0, Math.min(Math.max(tick - 1, 0), 5)).map((finding, i) => (
                                    <div key={`${toolIdx}-f-${i}`}
                                        className="flex items-start gap-2 mb-1"
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
                        <div className="absolute inset-0 overflow-hidden flex flex-col">
                            <div className="p-4 pb-3 flex-shrink-0">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="font-serif text-base font-medium">{tool.name}</div>
                                        <div className="font-mono text-[9px] text-black/50 mt-0.5">{tool.tagline}</div>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-3">
                                        <div className="font-mono text-2xl font-bold text-black leading-none">
                                            <AnimatedScore score={tool.score} run={phase === "done"} />
                                        </div>
                                        <div className="font-mono text-[9px] text-black/40 uppercase tracking-wider mt-0.5">/100</div>
                                    </div>
                                </div>
                                <div className="space-y-1.5 mb-3">
                                    {tool.dimensions.map((dim, i) => (
                                        <div key={`${toolIdx}-${dim.label}`}>
                                            <div className="flex justify-between items-center mb-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${scoreDotClass(dim.score)}`} />
                                                    <span className="font-mono text-[9px] text-black/50 uppercase tracking-wide">{dim.label}</span>
                                                </div>
                                                <span className="font-mono text-[9px] font-medium">{dim.score}</span>
                                            </div>
                                            <div className="h-[2px] bg-black/08 border border-black/10">
                                                <div className="h-full transition-all duration-500"
                                                    style={{
                                                        width: `${dim.score}%`,
                                                        transitionDelay: `${0.12 + i * 0.055}s`,
                                                        background: scoreBarColor(dim.score),
                                                    }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-[#F3F3EF] border border-black px-2.5 py-1.5">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="w-3 h-3 text-black flex-shrink-0 mt-0.5" />
                                        <span className="font-mono text-[9px] text-black/70">{tool.verdict}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-black flex-1 flex flex-col">
                                <div className="px-4 py-1.5 bg-black flex items-center justify-between flex-shrink-0">
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-white/70">Report ready — send it</span>
                                    <span className="w-1.5 h-1.5 bg-white/60 animate-pulse" />
                                </div>
                                <div className="divide-y divide-black/08 flex-1">
                                    {tool.nextSteps.map((step, i) => (
                                        <div key={`${toolIdx}-ns-${i}`}
                                            className="flex items-center gap-3 px-4 py-2 hover:bg-[#F3F3EF] transition-colors"
                                            style={{ animation: `fadeSlideIn 0.25s ease ${0.25 + i * 0.1}s both` }}>
                                            <ToolDot domain={step.domain} />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-mono text-[10px] text-black font-medium truncate">{step.action}</div>
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
// SPEND TRACKER DEMO
// ─────────────────────────────────────────────────────────────────────────────

function SpendTrackerDemo() {
    const [rowsVisible, setRowsVisible] = useState(0);
    const [highlight, setHighlight] = useState<string | null>(null);
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
        const add = (d: number, fn: () => void) => { const id = setTimeout(fn, d); timers.current.push(id); };

        SPEND_TOOLS_DETAILED.forEach((_, i) => {
            add(200 + i * 160, () => setRowsVisible(i + 1));
        });

        const allLoaded = 200 + SPEND_TOOLS_DETAILED.length * 160 + 600;
        SPEND_DEPTS.forEach((dept, i) => {
            add(allLoaded + i * 1800, () => setHighlight(dept.id));
        });
        add(allLoaded + SPEND_DEPTS.length * 1800 + 600, () => setHighlight(null));

        return () => timers.current.forEach(clearTimeout);
    }, []);

    const totalAi  = SPEND_TOOLS_DETAILED.filter(t => t.type === "AI").reduce((s, t) => s + t.cost, 0);
    const totalLeg = SPEND_TOOLS_DETAILED.filter(t => t.type === "Legacy").reduce((s, t) => s + t.cost, 0);
    const total    = totalAi + totalLeg;

    return (
        <div className="grid grid-cols-[1fr_1.6fr] gap-6 h-full">
            {/* Left: KPI cards */}
            <div className="flex flex-col gap-3">
                <div className="border border-black bg-white p-5 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                    <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-black/40 mb-1.5">Monthly Total Spend</div>
                    <div className="font-serif text-4xl font-normal tracking-tight">${total.toLocaleString()}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="border border-black bg-white p-4">
                        <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-black/40 mb-1">AI Tools</div>
                        <div className="font-serif text-2xl font-normal text-black">${totalAi.toLocaleString()}</div>
                    </div>
                    <div className="border border-black bg-white p-4">
                        <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-black/40 mb-1">Legacy</div>
                        <div className="font-serif text-2xl font-normal" style={{ color: "#B45309" }}>${totalLeg.toLocaleString()}</div>
                    </div>
                </div>
                <div className="border border-black bg-white p-4 flex-1">
                    <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-black/40 mb-3">By Department</div>
                    {SPEND_DEPTS.map(dept => {
                        const deptTotal = SPEND_TOOLS_DETAILED
                            .filter(t =>
                                (dept.id === "mkt"  && t.dept === "Marketing") ||
                                (dept.id === "sales" && t.dept === "Sales") ||
                                (dept.id === "eng"  && t.dept === "Eng") ||
                                (dept.id === "ops"  && t.dept === "Ops"))
                            .reduce((s, t) => s + t.cost, 0);
                        const isOps = dept.id === "ops";
                        return (
                            <div key={dept.id}
                                className="flex items-center gap-2 py-1.5 transition-all duration-500"
                                style={{ opacity: !highlight || highlight === dept.id ? 1 : 0.3 }}>
                                <div className="w-1.5 h-1.5 bg-black flex-shrink-0" />
                                <span className="font-mono text-xs text-black/60 flex-1">{dept.label}</span>
                                <span className={`font-mono text-xs font-medium ${isOps ? "text-amber-600" : ""}`}>${deptTotal.toLocaleString()}</span>
                                {isOps && <span className="font-mono text-[9px] text-amber-600">⚠ underinvested</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right: Tool table */}
            <div className="border border-black bg-white overflow-hidden flex flex-col shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                <div className="grid grid-cols-[1.8fr_0.8fr_0.6fr_0.7fr_0.6fr] px-4 py-2 border-b border-black/10 bg-[#F3F3EF] flex-shrink-0">
                    {["Tool", "Dept", "Seats", "Monthly", "Type"].map(h => (
                        <div key={h} className="font-mono text-[8px] uppercase tracking-[0.15em] text-black/35">{h}</div>
                    ))}
                </div>
                <div className="flex-1 overflow-hidden divide-y divide-black/06">
                    {SPEND_TOOLS_DETAILED.map((tool, i) => {
                        const deptId = tool.dept === "Marketing" ? "mkt" : tool.dept.toLowerCase();
                        const isHighlighted = highlight === deptId;
                        const isVisible = i < rowsVisible;
                        return (
                            <div key={tool.name}
                                className="grid grid-cols-[1.8fr_0.8fr_0.6fr_0.7fr_0.6fr] px-4 py-2.5 items-center transition-all duration-500"
                                style={{
                                    opacity: isVisible ? (!highlight || isHighlighted ? 1 : 0.35) : 0,
                                    transform: isVisible ? "translateX(0)" : "translateX(-8px)",
                                    background: isHighlighted ? "rgba(0,0,0,0.03)" : "white",
                                    borderLeft: isHighlighted ? "2px solid black" : "2px solid transparent",
                                }}>
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-5 h-5 border border-black/10 bg-[#F3F3EF] flex items-center justify-center flex-shrink-0">
                                        <Favicon domain={tool.domain} size={12} />
                                    </div>
                                    <span className="font-mono text-[11px] font-medium text-black truncate">{tool.name}</span>
                                </div>
                                <div className="font-mono text-[10px] text-black/45">{tool.dept}</div>
                                <div className="font-mono text-[10px] text-black/45">{tool.seats}</div>
                                <div className="font-mono text-[11px] font-medium text-black">${tool.cost.toLocaleString()}</div>
                                <div>
                                    <span className={`font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.5 border ${
                                        tool.type === "AI"
                                            ? "bg-neutral-50 border-neutral-200 text-black"
                                            : "bg-amber-50 border-amber-200 text-amber-700"
                                    }`}>
                                        {tool.type}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="border-t border-black/10 px-4 py-2 bg-[#F3F3EF] flex items-center justify-between flex-shrink-0">
                    <span className="font-mono text-[9px] text-black/35">{SPEND_TOOLS_DETAILED.length} tools tracked · auto-synced</span>
                    <span className="font-mono text-[9px] text-black/35">Last updated: today</span>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS ANIMATION
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
        <div className="flex border border-black w-full overflow-hidden">
            {PROCESS_STEPS.map((step, i) => {
                const isDone   = completedSteps.includes(i);
                const isActive = activeStep === i && !isDone;
                return (
                    <div key={step.n} className="flex flex-row items-stretch flex-1">
                        <div
                            className="flex-1 p-3.5 transition-all duration-400 relative"
                            style={{ background: isActive ? "rgba(0,0,0,0.03)" : "white" }}>
                            <div className="font-mono text-[7px] uppercase tracking-[0.15em] text-black/25 mb-1.5">
                                Step {step.n}
                            </div>
                            <div className="font-mono text-[7px] uppercase tracking-[0.12em] text-black/30 mb-1.5">
                                {step.tool}
                            </div>
                            <div className="font-serif text-[13px] font-normal mb-2 text-black">
                                {step.title}
                            </div>
                            {(isDone || isActive) && (
                                <div className="font-mono text-[8px] leading-relaxed text-black/45">
                                    {step.desc.slice(0, 52)}{step.desc.length > 52 ? "…" : ""}
                                </div>
                            )}
                            {isDone && (
                                <div className="mt-2.5 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-black" />
                                    <span className="font-mono text-[8px] text-black font-medium">Done</span>
                                </div>
                            )}
                            {isActive && (
                                <div className="mt-2.5 flex gap-1">
                                    {[0,1,2].map(d => (
                                        <span key={d} className="w-1 h-1 bg-black/30 animate-pulse"
                                            style={{ animationDelay: `${d * 0.2}s` }} />
                                    ))}
                                </div>
                            )}
                        </div>
                        {i < PROCESS_STEPS.length - 1 && (
                            <div className="flex-shrink-0 w-6 border-l border-r border-black/15 flex items-center justify-center bg-[#F3F3EF]">
                                <span className="font-mono text-[9px] text-black/30">→</span>
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

// S1 — Hero: Pain-point centric
function S1() {
    return (
        <Slide>
            <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-16">
                {/* Left */}
                <div className="flex-1 min-w-0 pt-2">
                    <Label>The AI Tool Problem</Label>
                    <h1 className="font-serif font-normal leading-[1.05] tracking-tight mb-5"
                        style={{ fontSize: "clamp(32px,3.8vw,54px)" }}>
                        Your competitors adopted<br />5 new AI tools while your<br />team was still evaluating one.
                    </h1>
                    <p className="font-mono text-sm text-black/55 leading-relaxed max-w-[440px]">
                        Most ops teams spend 14+ hours a week manually researching tools that are already outdated by the time they decide. Trackr eliminates that entirely.
                    </p>
                </div>

                {/* Right: Demo */}
                <div className="hidden sm:block flex-shrink-0 w-[400px]">
                    <div className="flex items-center gap-2 mb-2.5">
                        <div className="w-1.5 h-1.5 bg-black animate-pulse" />
                        <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">
                            Live Demo — Real-Time Tool Evaluation
                        </span>
                    </div>
                    <ResearchAgentDemo widgetHeight={480} />
                </div>
            </div>
        </Slide>
    );
}

// S2 — The Reality
function S2() {
    const PAIN_STATS = [
        {
            stat: "8,000+",
            body: "AI tools launched in 2024 alone — most your team has never heard of.",
            source: "CB Insights",
        },
        {
            stat: "73%",
            body: "of AI implementations fail because companies picked the wrong tool.",
            source: "McKinsey, 2025",
        },
        {
            stat: "14 hrs",
            body: "per week that ops leaders spend manually researching tools that may already be obsolete.",
            source: "Internal survey",
        },
        {
            stat: "$340B",
            body: "wasted annually on redundant, underused, and invisible software.",
            source: "Gartner, 2025",
        },
    ];
    return (
        <Slide>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.1fr] gap-8 sm:gap-14 items-start sm:items-center">
                {/* Left */}
                <div>
                    <Label>The Reality</Label>
                    <h2 className="font-serif font-normal leading-[1.06] tracking-tight mb-4"
                        style={{ fontSize: "clamp(28px,3.4vw,48px)" }}>
                        8,000 new AI tools launched last year. Your team has no system to evaluate any of them.
                    </h2>
                    <p className="font-mono text-xs text-black/50 leading-relaxed">
                        The companies winning with AI aren&apos;t smarter — they just have a system. Here&apos;s what the rest of the market is dealing with:
                    </p>
                </div>
                {/* Right: 2×2 pain stats */}
                <div className="grid grid-cols-2 gap-0 border border-black">
                    {PAIN_STATS.map((s, i) => (
                        <div key={s.stat}
                            className={`p-6 bg-white ${i % 2 === 0 ? "border-r border-black" : ""} ${i < 2 ? "border-b border-black" : ""}`}>
                            <div className="font-serif font-normal leading-none mb-2.5"
                                style={{ fontSize: "clamp(28px,3vw,44px)" }}>
                                {s.stat}
                            </div>
                            <p className="font-mono text-xs text-black/55 leading-relaxed mb-2">{s.body}</p>
                            <div className="font-mono text-[9px] text-black/30 uppercase tracking-widest">{s.source}</div>
                        </div>
                    ))}
                </div>
            </div>
        </Slide>
    );
}

// S3 — Why Companies Fall Behind on AI
function S3() {
    const REASONS = [
        {
            n: "01",
            title: "No dedicated AI researcher on the team",
            body: "Decisions happen based on who talks loudest in Slack, not data.",
            highlight: false,
        },
        {
            n: "02",
            title: "No system to evaluate or compare tools",
            body: "No scoring framework means every evaluation starts from zero.",
            highlight: true,
        },
        {
            n: "03",
            title: "No one proactively watching the market",
            body: "By the time a tool reaches your radar, your competitors deployed it 90 days ago.",
            highlight: false,
        },
    ];
    return (
        <Slide>
            <Label>Why Companies Fall Behind on AI</Label>
            <h2 className="font-serif font-normal leading-[1.05] tracking-tight mb-10"
                style={{ fontSize: "clamp(36px,4.5vw,60px)" }}>
                Every ops team has the<br />same three gaps. And<br />they&apos;re costing you.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border border-black">
                {REASONS.map((r, i) => (
                    <div key={r.n}
                        className={`p-8 ${i < 2 ? "border-b sm:border-b-0 sm:border-r border-black" : ""}`}
                        style={r.highlight ? { background: "#1a1a1a", color: "#F3F3EF" } : {}}>
                        <div className={`font-mono text-[9px] uppercase tracking-[0.15em] mb-4 ${r.highlight ? "text-white/30" : "text-black/30"}`}>{r.n}</div>
                        <h3 className={`font-serif text-xl font-normal mb-4 leading-snug ${r.highlight ? "text-white" : ""}`}>{r.title}</h3>
                        <p className={`font-mono text-xs leading-relaxed ${r.highlight ? "text-white/60" : "text-black/55"}`}>{r.body}</p>
                    </div>
                ))}
            </div>
        </Slide>
    );
}

// S4 — The Engagement: 4-phase horizontal timeline
function S4() {
    const PHASES = [
        {
            n: "01",
            title: "Stack Intake",
            body: "We map every tool your org pays for, who owns it, and what it's actually being used for.",
            dark: false,
        },
        {
            n: "02",
            title: "Expert Audit",
            body: "Every tool goes through our research agents — scored across 7 dimensions, benchmarked against best-in-class alternatives.",
            dark: false,
        },
        {
            n: "03",
            title: "Action Plan",
            body: "A prioritized list: what to cut, swap, and add — in order. Every recommendation backed by data, not opinion.",
            dark: false,
        },
        {
            n: "04",
            title: "Handoff",
            body: "Your Trackr workspace is fully populated. Stack intelligence stays live after we leave.",
            dark: true,
        },
    ];
    return (
        <Slide>
            <Label>How We Work</Label>
            <h2 className="font-serif font-normal leading-[1.05] tracking-tight mb-5"
                style={{ fontSize: "clamp(36px,4.5vw,60px)" }}>
                We come in. We fix it.<br />We leave you the system.
            </h2>
            <p className="font-mono text-sm text-black/55 leading-relaxed mb-10 max-w-[680px]">
                We audit your stack, deliver a scored action plan, and hand off a live workspace — no ongoing dependency on us.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-black">
                {PHASES.map((p, i) => (
                    <div key={p.n}
                        className={`p-6 sm:p-8 ${i % 2 === 0 && i < 3 ? "border-r border-black" : ""} ${i % 2 !== 0 && i < 3 ? "sm:border-r border-black" : ""} ${i < 2 ? "border-b sm:border-b-0 border-black" : ""}`}
                        style={p.dark ? { background: "#1a1a1a", color: "#F3F3EF" } : {}}>
                        <div className={`font-mono text-[9px] uppercase tracking-[0.15em] mb-3 ${p.dark ? "text-white/30" : "text-black/30"}`}>{p.n}</div>
                        <h3 className={`font-serif text-xl font-normal mb-4 ${p.dark ? "text-white" : ""}`}>{p.title}</h3>
                        <p className={`font-mono text-xs leading-relaxed ${p.dark ? "text-white/60" : "text-black/55"}`}>{p.body}</p>
                    </div>
                ))}
            </div>
        </Slide>
    );
}

// S5 — Our Methodology
function S5() {
    return (
        <Slide>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-8 sm:gap-14 items-start">
                <div>
                    <Label>Our Methodology</Label>
                    <h2 className="font-serif font-normal leading-[1.05] tracking-tight mb-4"
                        style={{ fontSize: "clamp(28px,3.5vw,48px)" }}>
                        While your team debates tools in Slack, our agents have already scored 8 competitors.
                    </h2>
                    <p className="font-mono text-xs text-black/55 leading-relaxed mb-5">
                        Our agents and human operators work in parallel — crawling product sites, review platforms, competitor pages, and community threads simultaneously. The scorecard you see isn&apos;t directional. It&apos;s defensible.
                    </p>
                    <div className="border border-black bg-white p-4 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                        <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-black/50 mb-3 font-medium">What We Analyze</div>
                        {[
                            "3 parallel AI agents running simultaneously",
                            "Product site, pricing page, changelog",
                            "G2, Capterra, TrustRadius, Trustpilot",
                            "Reddit + HackerNews community threads",
                            "Competitor pages + live pricing",
                            "LinkedIn pages + recent funding news",
                        ].map(s => (
                            <div key={s} className="flex items-start gap-2 font-mono text-xs text-black/55 mb-1.5">
                                <span className="w-1 h-1 bg-black flex-shrink-0 mt-1.5" /> {s}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="hidden sm:block">
                    <ResearchAgentDemo widgetHeight={460} />
                </div>
            </div>
        </Slide>
    );
}

// S6 — What We Find in Every Audit
function S6() {
    return (
        <Slide>
            <div className="w-full">
                <Label>What We Find in Every Audit</Label>
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
                    <h2 className="font-serif font-normal leading-[1.05] tracking-tight"
                        style={{ fontSize: "clamp(28px,3.5vw,48px)" }}>
                        Most companies are paying<br />for the same capability<br />three times.
                    </h2>
                    <div className="hidden sm:block flex-shrink-0 sm:ml-8 max-w-[320px]"
                        style={{ borderLeft: "3px solid #1a1a1a", paddingLeft: "20px" }}>
                        <p className="font-mono text-xs text-black/60 leading-relaxed">
                            In every audit, redundancy surfaces fast. Tools bought by one team, duplicated by another, paid for by a third. We make the overlap visible and build your action plan around eliminating it.
                        </p>
                    </div>
                    <p className="sm:hidden font-mono text-xs text-black/60 leading-relaxed border border-black bg-white px-4 py-3">
                        In every audit, redundancy surfaces fast. Tools bought by one team, duplicated by another, paid for by a third. We make the overlap visible and build your action plan around eliminating it.
                    </p>
                </div>
                <div className="hidden sm:block" style={{ height: 360 }}>
                    <SpendTrackerDemo />
                </div>
                <div className="mt-4 border-t border-black/20 pt-4">
                    <p className="font-mono text-sm font-semibold text-black">
                        Companies using Trackr identify an average of{" "}
                        <span className="font-bold">3–5 redundant tools within the first 30 days.</span>
                    </p>
                </div>
            </div>
        </Slide>
    );
}

// S7 — What We Leave Behind
function S7() {
    const CHAT_EXAMPLES = [
        { q: "What should we replace Zapier with?",               a: "Based on your stack: n8n (open source, free) or Make — both rated higher for your use case." },
        { q: "Which tools are up for renewal in Q2?",             a: "3 tools renewing in Q2: Gong ($9,600/yr), ZoomInfo ($5,400/yr), Datadog ($7,440/yr)." },
        { q: "Do we have any overlap between Sales and RevOps?",  a: "Yes — HubSpot and Salesforce have 60% feature overlap across your active workflows." },
    ];

    return (
        <Slide>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-8 sm:gap-10 items-start">
                {/* Left */}
                <div>
                    <Label>What We Leave Behind</Label>
                    <h2 className="font-serif font-normal leading-[1.05] tracking-tight mb-3"
                        style={{ fontSize: "clamp(28px,3.2vw,44px)" }}>
                        After we leave, your team has a permanent AI intelligence layer. Ask it anything. Any time.
                    </h2>
                    <p className="font-mono text-xs text-black/55 leading-relaxed mb-5">
                        Every tool we evaluated, every score, every renewal date — all live in your workspace when we hand off. Your team can research new tools, get swap recommendations, and stay current without re-engaging us. The value compounds after we leave.
                    </p>
                    <div className="space-y-2">
                        {[
                            "Renewal alerts before your tools auto-renew",
                            "Instant answers on any tool in your stack",
                            "New tool recommendations as the market evolves",
                        ].map(b => (
                            <div key={b} className="flex items-start gap-2 font-mono text-xs text-black/55">
                                <span className="flex-shrink-0">→</span>
                                <span>{b}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Ask Trackr AI chat UI */}
                <div className="border border-black bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] overflow-hidden">
                    <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: "#1a1a1a" }}>
                        <TrackrLogo size={12} />
                        <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "rgba(243,243,239,0.7)" }}>Ask Trackr AI</span>
                    </div>
                    <div className="p-4 space-y-4">
                        {CHAT_EXAMPLES.map((ex, i) => (
                            <div key={i} className="space-y-1.5">
                                <div className="flex items-start gap-2">
                                    <div className="w-4 h-4 bg-black flex-shrink-0 flex items-center justify-center mt-0.5">
                                        <span className="font-mono text-[8px] text-white">U</span>
                                    </div>
                                    <p className="font-mono text-[10px] text-black leading-snug">{ex.q}</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-4 h-4 border border-black/20 bg-[#F3F3EF] flex-shrink-0 flex items-center justify-center mt-0.5">
                                        <TrackrLogo size={8} />
                                    </div>
                                    <p className="font-mono text-[10px] text-black/55 leading-snug border border-black/10 bg-[#F3F3EF] px-2 py-1.5 flex-1">
                                        {ex.a}
                                        {i === CHAT_EXAMPLES.length - 1 && (
                                            <span className="inline-block w-[1px] h-2.5 bg-black/40 ml-0.5 animate-pulse align-middle" />
                                        )}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Slide>
    );
}

// S8 — The Trackr Difference
function S8() {
    const DIFFS = [
        {
            glyph: "◈",
            title: "Pre-market tool intelligence",
            body: "We track 500+ emerging tools every month before they hit Product Hunt. You get recommendations before your competitors hear about them.",
        },
        {
            glyph: "⚙",
            title: "Built by operators, not researchers",
            body: "Our team has implemented AI workflows inside real organizations. We know what breaks in deployment and what gets abandoned after week one.",
        },
        {
            glyph: "◎",
            title: "Custom to your org's reality",
            body: "Your stack is different from every other company. We audit your tools, map your workflows, and build a prioritized action plan from scratch — not from a template.",
        },
        {
            glyph: "✓",
            title: "AI adoption that actually sticks",
            body: "The goal isn't more AI in your stack. It's replacing processes your team avoids with tools they actually use — and training them to use those tools well.",
        },
    ];
    return (
        <Slide>
            <Label>The Trackr Difference</Label>
            <h2 className="font-serif font-normal leading-[1.05] tracking-tight mb-4"
                style={{ fontSize: "clamp(28px,3.5vw,50px)" }}>
                You don&apos;t just get software,<br />you get AI-native operators who&apos;ve<br />deployed this across <span className="font-bold">100+ organizations</span>.
            </h2>
            <p className="font-mono text-base text-black/55 leading-relaxed mb-7 max-w-[680px]">
                You&apos;re not buying a research tool. You&apos;re hiring operators who&apos;ve built AI infrastructure inside real organizations — and the tool is how we prove our work.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DIFFS.map((d) => (
                    <div key={d.title} className="border border-black p-6">
                        <div className="font-mono text-lg text-black/40 mb-3">{d.glyph}</div>
                        <h3 className="font-serif text-lg font-normal mb-2">{d.title}</h3>
                        <p className="font-mono text-xs text-black/55 leading-relaxed">{d.body}</p>
                    </div>
                ))}
            </div>
            <p className="font-mono text-[10px] text-black/35 mt-4">
                Trusted by ops teams at companies from 12 to 12,000 employees.
            </p>
        </Slide>
    );
}

// S9 — Closing
function S9() {
    return (
        <Slide>
            <div className="text-center max-w-[580px] mx-auto">
                <div className="flex items-center justify-center gap-3 mb-10">
                    <TrackrLogo size={22} />
                    <span className="font-serif text-xl font-normal tracking-tight">Trackr</span>
                </div>
                <Label>Next Steps</Label>
                <h1 className="font-serif font-normal leading-[1.04] tracking-tight mb-6"
                    style={{ fontSize: "clamp(36px,5vw,70px)" }}>
                    Let&apos;s talk about your stack.
                </h1>
                <p className="font-mono text-sm text-black/60 mb-1 leading-relaxed">
                    30 minutes. We&apos;ll show you exactly what we&apos;d find in your stack.
                </p>
                <p className="font-mono text-sm text-black/40 mb-8 leading-relaxed">
                    No pitch deck. No generic demo. Just your tools, scored.
                </p>
                <div className="mb-4">
                    <a href="https://trytrackr.com"
                        className="inline-block font-mono text-sm uppercase tracking-widest px-8 py-4 transition-colors"
                        style={{ background: "#1a1a1a", color: "#F3F3EF" }}>
                        Book a Free Stack Assessment →
                    </a>
                </div>
                <p className="font-mono text-[11px] text-black/40 mb-10">
                    Or email us:{" "}
                    <a href="mailto:hello@trytrackr.com"
                        className="underline underline-offset-2 hover:text-black transition-colors">
                        hello@trytrackr.com
                    </a>
                </p>
                <div className="grid grid-cols-3 gap-0 border border-black text-left">
                    {[
                        { n: "1", label: "Book 30-min call" },
                        { n: "2", label: "We audit your stack live" },
                        { n: "3", label: "You get a scored action plan" },
                    ].map((step, i) => (
                        <div key={step.n} className={`px-5 py-4 ${i < 2 ? "border-r border-black" : ""}`}>
                            <div className="font-mono text-[9px] uppercase tracking-widest text-black/30 mb-1">{step.n}</div>
                            <div className="font-mono text-[11px] text-black font-medium">{step.label}</div>
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
    1: () => <S1 />,
    2: () => <S2 />,
    3: () => <S3 />,
    4: () => <S4 />,
    5: () => <S5 />,
    6: () => <S6 />,
    7: () => <S7 />,
    8: () => <S8 />,
    9: () => <S9 />,
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

            <div className="relative overflow-x-hidden select-none"
                style={{ background: BG, minHeight: "100vh", width: "100vw" }}>

                {/* Progress bar */}
                <div className="fixed top-0 left-0 z-50 h-[2px] bg-black transition-all duration-500"
                    style={{ width: `${(cur / TOTAL) * 100}%` }} />

                {/* Counter */}
                <div className="fixed top-5 right-7 z-50 font-mono text-[11px] tracking-[0.1em] text-black/30">
                    {cur} / {TOTAL}
                </div>

                {/* Logo */}
                <div className="fixed top-5 left-7 z-50 flex items-center gap-1.5">
                    <TrackrLogo size={14} />
                    <span className="font-mono text-[10px] tracking-[0.12em] text-black/40">TRACKR</span>
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
                            className="h-2 transition-all"
                            style={{
                                width: i + 1 === cur ? 20 : 8,
                                background: i + 1 === cur ? "#000" : "transparent",
                                border: i + 1 === cur ? "1px solid #000" : "1px solid #999",
                                borderRadius: "2px",
                            }} />
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
