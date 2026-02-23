"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ── DATA ──────────────────────────────────────────────────────────────────────

const TOTAL = 14;

const RD: Record<string, { name: string; overall: number; dims: [string, number][] }> = {
    cursor:     { name: "Cursor",     overall: 9.2, dims: [["AI Quality",9.5],["UX/Design",9.1],["Features",9.0],["Value",8.8],["Integrations",9.0],["Support",8.9],["Momentum",9.7]] },
    notion:     { name: "Notion",     overall: 8.4, dims: [["AI Quality",7.8],["UX/Design",9.2],["Features",9.0],["Value",8.0],["Integrations",8.9],["Support",7.5],["Momentum",8.9]] },
    linear:     { name: "Linear",     overall: 9.0, dims: [["AI Quality",8.5],["UX/Design",9.7],["Features",9.1],["Value",8.8],["Integrations",8.6],["Support",8.4],["Momentum",9.3]] },
    claude:     { name: "Claude",     overall: 9.8, dims: [["AI Quality",9.9],["UX/Design",9.5],["Features",9.8],["Value",9.7],["Integrations",9.4],["Support",9.0],["Momentum",9.9]] },
    perplexity: { name: "Perplexity", overall: 8.7, dims: [["AI Quality",9.2],["UX/Design",8.4],["Features",8.6],["Value",9.0],["Integrations",7.8],["Support",8.0],["Momentum",9.5]] },
    cursor_ai:  { name: "Cursor",     overall: 9.2, dims: [["AI Quality",9.5],["UX/Design",9.1],["Features",9.0],["Value",8.8],["Integrations",9.0],["Support",8.9],["Momentum",9.7]] },
};

type SpendTool = [string, "AI" | "Legacy", number];
type DeptData = { ai: number; legacy: number; label: string; tools: SpendTool[] };

const SPEND_DATA: Record<string, DeptData> = {
    eng:   { ai: 4800, legacy: 3200, label: "Engineering", tools: [["Cursor","AI",280],["Copilot","AI",180],["Datadog","Legacy",620],["AWS","Legacy",1800]] },
    mkt:   { ai: 2400, legacy: 5800, label: "Marketing",   tools: [["Jasper","AI",299],["HubSpot","Legacy",1800],["Semrush","Legacy",400],["Figma","Legacy",450]] },
    ops:   { ai: 1800, legacy: 4200, label: "Operations",  tools: [["Notion AI","AI",160],["Jira","Legacy",900],["Confluence","Legacy",600],["Zoom","Legacy",500]] },
    sales: { ai: 3200, legacy: 6100, label: "Sales",       tools: [["Gong AI","AI",800],["Salesforce","Legacy",2400],["Outreach","Legacy",700],["ZoomInfo","Legacy",900]] },
};

const CATS = [
    { id: "cov",  label: "AI Tool Coverage",   sub: "What % of workflows have AI support?" },
    { id: "auto", label: "Automation Depth",   sub: "How much is automated vs. assisted?" },
    { id: "adp",  label: "Team Adoption",      sub: "Do all departments actively use AI?" },
    { id: "dat",  label: "Data Integration",   sub: "Are AI tools connected to core data?" },
    { id: "roi",  label: "Measured ROI",       sub: "Can you quantify AI value delivered?" },
    { id: "str",  label: "Strategic Alignment",sub: "Is AI embedded in the org roadmap?" },
];
const LEVELS = ["—", "Low", "Moderate", "Strong", "Excellent"];

const KB_INIT = [
    { col: "eval",   name: "Cursor",      cat: "Dev Tools",    score: 9.2 },
    { col: "eval",   name: "Perplexity",  cat: "Research AI",  score: 8.7 },
    { col: "eval",   name: "Runway",      cat: "Video AI",     score: 8.1 },
    { col: "active", name: "Claude",      cat: "AI Assistant", score: 9.8 },
    { col: "active", name: "Linear",      cat: "Project Mgmt", score: 9.0 },
    { col: "active", name: "Notion AI",   cat: "Workspace",    score: 8.4 },
    { col: "active", name: "Slack",       cat: "Comms",        score: 7.9 },
    { col: "hold",   name: "Jasper",      cat: "Marketing AI", score: 6.8 },
    { col: "hold",   name: "Intercom AI", cat: "Support",      score: 7.2 },
    { col: "cancel", name: "Zapier",      cat: "Automation",   score: 6.4 },
    { col: "cancel", name: "Salesforce",  cat: "CRM",          score: 5.9 },
];
const KB_COLS = [
    { id: "eval",   label: "Evaluating", color: "#E8C97A" },
    { id: "active", label: "Active",     color: "#4ADE80" },
    { id: "hold",   label: "On Hold",    color: "#94A3B8" },
    { id: "cancel", label: "Cancelled",  color: "#F87171" },
];

const CAROUSEL_TOOLS = [
    { name: "Cursor",      cat: "Dev Tools",      score: 9.2, icon: "⌨️", desc: "AI-first code editor with frontier model integration. Best-in-class autocomplete and multi-file edits." },
    { name: "Claude",      cat: "AI Assistant",   score: 9.8, icon: "🧠", desc: "Anthropic's flagship AI. Best for complex reasoning, long-context, and agentic workflows." },
    { name: "Perplexity",  cat: "Research AI",    score: 8.7, icon: "🔍", desc: "Real-time AI search with source citations. Replacing Google for research-heavy workflows." },
    { name: "Linear",      cat: "Project Mgmt",   score: 9.0, icon: "📋", desc: "Blazing-fast issue tracker with AI-powered triage. Built for modern engineering teams." },
    { name: "Notion AI",   cat: "Workspace",      score: 8.4, icon: "📝", desc: "All-in-one workspace with embedded AI. Deep integrations across docs, wikis, and databases." },
    { name: "Runway",      cat: "Video AI",       score: 8.1, icon: "🎬", desc: "Professional AI video generation and editing. Gen-3 models set the quality benchmark." },
    { name: "Midjourney",  cat: "Image AI",       score: 8.9, icon: "🎨", desc: "Highest quality AI image generation. Best for brand campaigns and creative teams." },
    { name: "Taskspace",   cat: "EOS Platform",   score: 9.8, icon: "🎯", desc: "AI-native EOS accountability platform with AI EOD parsing and MCP server. Replaces Ninety.io." },
];

const COMP_ROWS = [
    ["Automated tool research (AI agents)",    true,  false, false, false],
    ["AI-scored reports (7 dimensions)",       true,  false, false, false],
    ["Real-time spend tracking",               true,  false, null,  true ],
    ["Side-by-side tool comparison",           true,  true,  null,  false],
    ["AI-native scoring model",                true,  false, false, false],
    ["Renewal & contract alerts",              true,  false, null,  true ],
    ["Ask Trackr AI (custom Q&A)",             true,  false, false, false],
    ["Team collaboration + notes",             true,  false, true,  null ],
    ["Slack & webhook integrations",           true,  false, false, null ],
] as const;

// ── HELPERS ───────────────────────────────────────────────────────────────────

const GOLD = "#E8C97A";
const GREEN = "#4ADE80";
const RED = "#F87171";
const BG = "#F3F3EF";

function Eyebrow({ children }: { children: React.ReactNode }) {
    return <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-black/40 mb-3">{children}</p>;
}

function Chip({ icon, check }: { icon?: string; check?: boolean | null }) {
    if (check === true)  return <span className="text-[#4ADE80] text-base font-bold">✓</span>;
    if (check === false) return <span className="text-black/15 text-base">✗</span>;
    if (check === null)  return <span style={{ color: GOLD }} className="text-sm font-bold">~</span>;
    return <span>{icon}</span>;
}

function countUp(el: HTMLElement | null, to: number, prefix = "") {
    if (!el) return;
    const start = Date.now(); const dur = 600;
    const tick = () => {
        const p = Math.min(1, (Date.now() - start) / dur);
        el.textContent = prefix + Math.round(to * p).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

function ts() {
    const n = new Date();
    return [n.getHours(), n.getMinutes(), n.getSeconds()].map(v => String(v).padStart(2, "0")).join(":");
}

// ── SLIDE WRAPPER ─────────────────────────────────────────────────────────────

function Slide({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`w-full h-screen flex items-center justify-center overflow-hidden ${className}`}
            style={{ padding: "72px 110px" }}>
            <div className="w-full max-w-[1060px]">{children}</div>
        </div>
    );
}

// ── SLIDE 1: HERO ─────────────────────────────────────────────────────────────

function S1({ goTo }: { goTo: (n: number) => void }) {
    return (
        <Slide>
            <Eyebrow>AI Native Solutions × Trackr</Eyebrow>
            <h1 className="font-serif font-black leading-[1.04] tracking-tight mb-5"
                style={{ fontSize: "clamp(36px,5.5vw,72px)" }}>
                Know Your Stack.<br />
                <span style={{ color: GOLD }}>Before It Costs You.</span>
            </h1>
            <p className="font-mono text-sm text-black/55 max-w-[520px] leading-relaxed mb-8">
                The AI intelligence layer for modern ops teams — research, track, score, and decide on every tool in your stack.
            </p>
            <div className="flex gap-3 mb-14">
                <button onClick={() => goTo(2)}
                    className="flex items-center gap-2 bg-black text-white px-7 py-3.5 font-mono text-xs uppercase tracking-widest hover:bg-black/80 transition-colors">
                    See the Demos →
                </button>
                <button onClick={() => goTo(12)}
                    className="flex items-center gap-2 border border-black bg-transparent px-7 py-3.5 font-mono text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                    View Pricing
                </button>
            </div>
            <div className="flex gap-4 flex-wrap">
                {[
                    { num: "9.9",  lbl: "Cursive score",   c: GOLD  },
                    { num: "500+", lbl: "tools indexed",   c: GREEN },
                    { num: "$2.3M",lbl: "spend tracked",   c: "black" },
                    { num: "37%",  lbl: "avg waste cut",   c: RED   },
                ].map(x => (
                    <div key={x.lbl} className="border border-black bg-white px-5 py-3 flex items-center gap-3 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                        <span className="font-serif text-2xl font-black" style={{ color: x.c }}>{x.num}</span>
                        <span className="font-mono text-[11px] text-black/50">{x.lbl}</span>
                    </div>
                ))}
            </div>
        </Slide>
    );
}

// ── SLIDE 2: PROBLEM ──────────────────────────────────────────────────────────

function S2() {
    return (
        <Slide>
            <Eyebrow>The Problem</Eyebrow>
            <h2 className="font-serif font-black leading-tight tracking-tight mb-2"
                style={{ fontSize: "clamp(28px,4vw,52px)" }}>
                Most companies think they&apos;re{" "}
                <span className="line-through opacity-35">AI-native.</span>
            </h2>
            <h2 className="font-serif font-black leading-tight tracking-tight mb-10"
                style={{ fontSize: "clamp(28px,4vw,52px)", color: GOLD }}>
                They&apos;re flying blind.
            </h2>
            <div className="grid grid-cols-3 gap-5 mb-8">
                {[
                    { num: "73",    c: GOLD, lbl: "avg SaaS tools per enterprise — most teams can't even name them all" },
                    { num: "47%",   c: RED,  lbl: "of software spend is duplicated, underused, or completely wasted" },
                    { num: "Daily", c: "black", lbl: "new AI tools launch — no one tracks which ones actually move the needle" },
                ].map(s => (
                    <div key={s.num} className="border border-black bg-white p-6">
                        <div className="font-serif font-black leading-none mb-3" style={{ fontSize: 52, color: s.c }}>{s.num}</div>
                        <div className="font-mono text-xs text-black/55 leading-relaxed">{s.lbl}</div>
                    </div>
                ))}
            </div>
            <p className="font-mono text-sm text-black/55 max-w-[640px] leading-relaxed">
                You&apos;re making $100K+ software decisions based on a Slack thread and a G2 star rating,
                while falling further behind AI-native competitors every quarter.
            </p>
        </Slide>
    );
}

// ── SLIDE 3: SOLUTION ─────────────────────────────────────────────────────────

function S3() {
    return (
        <Slide>
            <Eyebrow>The Solution</Eyebrow>
            <h2 className="font-serif font-black leading-tight tracking-tight mb-2"
                style={{ fontSize: "clamp(28px,4vw,52px)" }}>
                <span style={{ color: GOLD }}>Research, track, and decide.</span> One platform.
            </h2>
            <p className="font-mono text-sm text-black/55 mb-10">
                Trackr replaces spreadsheets, endless trials, and gut-feel software decisions.
            </p>
            <div className="grid grid-cols-3 gap-0 border border-black">
                {[
                    { icon: "🔬", title: "Research Agent", desc: "AI agents scrape product sites, pull G2/Reddit/Trustpilot reviews, run competitive analysis, and generate a scored report — in minutes, not weeks." },
                    { icon: "💸", title: "Spend Tracker",  desc: "Map every dollar to a team and owner. See your AI vs. legacy spend breakdown, cancel waste instantly, and export CFO-ready reports with one click." },
                    { icon: "🧠", title: "AI Nativeness Score", desc: "Proprietary scoring across 7 dimensions: adoption, automation, coverage, ROI, and more. Know exactly where your org stands — and get a prioritized action plan." },
                ].map((p, i) => (
                    <div key={p.title} className={`p-8 ${i < 2 ? "border-r border-black" : ""} hover:bg-black/[0.03] transition-colors`}>
                        <div className="text-2xl mb-4 w-11 h-11 border border-black flex items-center justify-center bg-white">
                            {p.icon}
                        </div>
                        <h3 className="font-serif text-lg font-bold mb-3">{p.title}</h3>
                        <p className="font-mono text-xs text-black/55 leading-relaxed">{p.desc}</p>
                    </div>
                ))}
            </div>
        </Slide>
    );
}

// ── SLIDE 4: HOW IT WORKS ─────────────────────────────────────────────────────

function S4() {
    return (
        <Slide>
            <Eyebrow>How It Works</Eyebrow>
            <h2 className="font-serif font-black leading-tight tracking-tight mb-2"
                style={{ fontSize: "clamp(28px,4vw,52px)" }}>
                From discovery to decision <span style={{ color: GOLD }}>in one platform.</span>
            </h2>
            <p className="font-mono text-sm text-black/55 mb-10">Four steps. One system. Zero spreadsheets.</p>
            <div className="flex border border-black">
                {[
                    { n: "01", title: "Add Tools",         desc: "Paste a URL, type a name, or import from Chrome. Trackr ingests any SaaS tool instantly and creates a full profile." },
                    { n: "02", title: "Agents Research",   desc: "AI agents run autonomously — scraping, reviewing, benchmarking, and scoring on 7 dimensions. Zero manual work required." },
                    { n: "03", title: "Score & Compare",   desc: "Side-by-side comparisons, custom scorecards, team notes, and renewal tracking — all in one view your whole team can use." },
                    { n: "04", title: "Act with Confidence",desc: "Cancel what's not working. Double down on what is. Ask Trackr AI for recommendations tailored to your exact stack." },
                ].map((s, i) => (
                    <div key={s.n} className={`flex-1 p-6 ${i < 3 ? "border-r border-black" : ""}`}>
                        <div className="font-mono text-[10px] font-bold tracking-[0.15em] mb-3" style={{ color: GOLD }}>STEP {s.n}</div>
                        <div className="font-serif text-base font-bold mb-3">{s.title}</div>
                        <div className="font-mono text-xs text-black/55 leading-relaxed">{s.desc}</div>
                    </div>
                ))}
            </div>
        </Slide>
    );
}

// ── SLIDE 5: MARKET ───────────────────────────────────────────────────────────

function S5() {
    return (
        <Slide>
            <Eyebrow>The Opportunity</Eyebrow>
            <h2 className="font-serif font-black leading-tight tracking-tight mb-12"
                style={{ fontSize: "clamp(28px,4vw,52px)" }}>
                The market is <span style={{ color: GOLD }}>massive.</span>{" "}
                The problem is <span style={{ color: RED }}>urgent.</span>
            </h2>
            <div className="grid grid-cols-3 gap-0 border border-black mb-10">
                {[
                    { num: "$127B", lbl: "in enterprise SaaS spend annually — growing 18% year over year", c: GOLD },
                    { num: "10K+",  lbl: "new AI tools launched in the last 12 months — no one can keep up", c: GREEN },
                    { num: "37%",   lbl: "of enterprise SaaS licenses go completely unused every month", c: RED },
                ].map((x, i) => (
                    <div key={x.num} className={`p-10 text-center ${i < 2 ? "border-r border-black" : ""}`}>
                        <div className="font-serif font-black leading-none mb-4" style={{ fontSize: 68, color: x.c }}>{x.num}</div>
                        <div className="font-mono text-xs text-black/55 leading-relaxed mx-auto max-w-[180px]">{x.lbl}</div>
                    </div>
                ))}
            </div>
            <p className="font-mono text-sm text-black/55 text-center">
                Every mid-market and enterprise ops team has this problem.{" "}
                <span className="text-black font-semibold">None of them have a good solution yet.</span>
            </p>
        </Slide>
    );
}

// ── SLIDE 6: RESEARCH AGENT ───────────────────────────────────────────────────

type LogEntry = { ts: string; text: string; type: "normal" | "active" | "success" };
type ResearchResult = { name: string; overall: number; dims: [string, number][] };

const LOG_STEPS: [number, (n: string) => string, "normal" | "active" | "success"][] = [
    [300,  n => `> Researching "${n}"…`,                            "active"  ],
    [900,  () => "> Scraping product site + changelog…",            "normal"  ],
    [1500, () => "✓ 147 pages ingested",                            "success" ],
    [2100, () => "> Pulling G2 + Capterra + Trustpilot reviews…",   "normal"  ],
    [2800, () => "✓ 342 reviews analyzed",                          "success" ],
    [3300, () => "> Scanning Reddit + HackerNews threads…",         "normal"  ],
    [4000, () => "✓ Sentiment: 87% positive (1.2k mentions)",       "success" ],
    [4500, () => "> Running competitive analysis…",                 "normal"  ],
    [5200, () => "✓ 4 competitors benchmarked",                     "success" ],
    [5700, () => "> Generating scorecard…",                         "active"  ],
    [6400, () => "✓ Report complete. Displaying results.",          "success" ],
];

function S6() {
    const [input, setInput] = useState("Cursor");
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState<ResearchResult | null>(null);
    const [bars, setBars] = useState(false);
    const logRef = useRef<HTMLDivElement>(null);
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);
    useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);

    const run = () => {
        if (running) return;
        timers.current.forEach(clearTimeout);
        timers.current = [];
        setRunning(true); setLogs([]); setResult(null); setBars(false);
        const name = input.trim() || "Cursor";
        const data: ResearchResult = RD[name.toLowerCase()] ?? {
            name, overall: parseFloat((7.5 + Math.random() * 2).toFixed(1)),
            dims: [["AI Quality","UX/Design","Features","Value","Integrations","Support","Momentum"]
                .map(l => [l, parseFloat((7 + Math.random() * 2.5).toFixed(1))] as [string, number])][0],
        };
        LOG_STEPS.forEach(([delay, msg, type]) => {
            timers.current.push(setTimeout(() => setLogs(p => [...p, { ts: ts(), text: msg(name), type }]), delay));
        });
        timers.current.push(setTimeout(() => { setResult(data); setRunning(false); }, 7000));
        timers.current.push(setTimeout(() => setBars(true), 7150));
    };

    return (
        <Slide className="!items-start">
            <div className="flex gap-12 pt-4">
                <div className="flex-[0_0_290px]">
                    <Eyebrow>Live Demo</Eyebrow>
                    <h2 className="font-serif font-black leading-tight tracking-tight mb-4"
                        style={{ fontSize: "clamp(24px,3vw,42px)" }}>Research Agent</h2>
                    <p className="font-mono text-xs text-black/55 leading-relaxed mb-6">
                        Type any AI tool name. Agents research 5+ sources, score 7 dimensions, and deliver insights automatically.
                    </p>
                    <div className="border border-black bg-white p-5">
                        <div className="font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-black/40 mb-3">Sources Analyzed</div>
                        {["Product site + changelog","G2, Capterra, Trustpilot","Reddit + HackerNews","Competitor pages","Pricing + feature data"].map(s => (
                            <div key={s} className="flex items-center gap-2 font-mono text-xs text-black/55 mb-2">
                                <span style={{ color: GREEN }}>✓</span> {s}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex-1">
                    <div className="border border-black bg-white p-5">
                        <div className="font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-black/40 mb-3">Research a Tool</div>
                        <div className="flex gap-2 mb-4">
                            <input value={input} onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && run()}
                                placeholder="e.g. Notion, Cursor, Linear…"
                                className="flex-1 border border-black bg-[#F3F3EF] px-3 py-2 font-mono text-sm outline-none focus:bg-white placeholder:text-black/30" />
                            <button onClick={run} disabled={running}
                                className="px-4 py-2 bg-black text-white font-mono text-xs uppercase tracking-widest hover:bg-black/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                {running ? "Running…" : "Research"}
                            </button>
                        </div>
                        <div ref={logRef}
                            className="h-[170px] overflow-y-auto border border-black/10 bg-[#F8F8F6] p-3 font-mono text-[10px] leading-[1.9]"
                            style={{ scrollbarWidth: "thin" }}>
                            {logs.length === 0 && <span className="text-black/25">— Ready. Enter a tool and click Research.</span>}
                            {logs.map((l, i) => (
                                <div key={i} className="flex gap-2">
                                    <span className="text-black/25 flex-shrink-0">{l.ts}</span>
                                    <span style={{ color: l.type === "success" ? GREEN : l.type === "active" ? GOLD : "inherit", opacity: l.type === "normal" ? 0.6 : 1 }}>
                                        {l.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {result && (
                            <div className="mt-4 border border-black/15 bg-[#F8F8F6] p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="font-serif text-base font-bold">{result.name}</div>
                                        <div className="font-mono text-[10px] text-black/40 mt-0.5">Research complete</div>
                                    </div>
                                    <div>
                                        <span className="font-serif text-4xl font-black" style={{ color: GOLD }}>{result.overall}</span>
                                        <span className="font-mono text-sm text-black/40">/10</span>
                                    </div>
                                </div>
                                {result.dims.map(([lbl, val]) => (
                                    <div key={lbl} className="flex items-center gap-2 mb-2">
                                        <div className="font-mono text-[10px] text-black/50 w-24 flex-shrink-0">{lbl}</div>
                                        <div className="flex-1 h-[3px] bg-black/08">
                                            <div className="h-full bg-black transition-all duration-700"
                                                style={{ width: bars ? `${(val / 10) * 100}%` : "0%" }} />
                                        </div>
                                        <div className="font-mono text-[10px] font-bold w-6 text-right">{val}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Slide>
    );
}

// ── SLIDE 7: SPEND TRACKER ────────────────────────────────────────────────────

function S7() {
    const [active, setActive] = useState(new Set(["eng","mkt","ops","sales"]));
    const totalRef = useRef<HTMLSpanElement>(null);
    const aiRef = useRef<HTMLSpanElement>(null);
    const legRef = useRef<HTMLSpanElement>(null);

    const toggle = (d: string) => setActive(prev => {
        if (prev.size <= 1 && prev.has(d)) return prev;
        const next = new Set(prev);
        next.has(d) ? next.delete(d) : next.add(d);
        return next;
    });

    const depts = Object.entries(SPEND_DATA).filter(([k]) => active.has(k));
    const totalAi  = depts.reduce((s, [, d]) => s + d.ai, 0);
    const totalLeg = depts.reduce((s, [, d]) => s + d.legacy, 0);
    const maxVal = Math.max(...depts.flatMap(([, d]) => [d.ai, d.legacy]));

    useEffect(() => {
        countUp(totalRef.current, totalAi + totalLeg, "$");
        countUp(aiRef.current, totalAi, "$");
        countUp(legRef.current, totalLeg, "$");
    }, [active, totalAi, totalLeg]);

    const allTools = depts.flatMap(([, d]) => d.tools).sort((a, b) => b[2] - a[2]).slice(0, 6);
    const maxTool = Math.max(...allTools.map(t => t[2]));

    return (
        <Slide className="!items-start">
            <div className="flex gap-12 pt-4">
                <div className="flex-[0_0_280px]">
                    <Eyebrow>Live Demo</Eyebrow>
                    <h2 className="font-serif font-black leading-tight tracking-tight mb-4"
                        style={{ fontSize: "clamp(24px,3vw,42px)" }}>Spend Tracker</h2>
                    <p className="font-mono text-xs text-black/55 leading-relaxed mb-5">
                        Map every dollar to a team. See the AI vs. legacy breakdown your CFO actually wants.
                    </p>
                    <div className="font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-black/40 mb-2">Filter Departments</div>
                    <div className="flex flex-wrap gap-2 mb-5">
                        {Object.entries(SPEND_DATA).map(([key, d]) => (
                            <button key={key} onClick={() => toggle(key)}
                                className="px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wide border transition-all"
                                style={{
                                    borderColor: active.has(key) ? GOLD : "rgba(0,0,0,0.2)",
                                    background: active.has(key) ? "rgba(232,201,122,0.12)" : "transparent",
                                    color: active.has(key) ? GOLD : "rgba(0,0,0,0.4)",
                                }}>
                                {d.label}
                            </button>
                        ))}
                    </div>
                    <div className="border border-black bg-white p-4 mb-3">
                        <div className="font-mono text-[9px] text-black/40 mb-1">Monthly Total</div>
                        <div className="font-serif text-3xl font-black"><span ref={totalRef}>$0</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="border border-black bg-white p-3">
                            <div className="font-mono text-[9px] text-black/40 mb-1">AI Tools</div>
                            <div className="font-serif text-2xl font-black" style={{ color: GREEN }}><span ref={aiRef}>$0</span></div>
                        </div>
                        <div className="border border-black bg-white p-3">
                            <div className="font-mono text-[9px] text-black/40 mb-1">Legacy</div>
                            <div className="font-serif text-2xl font-black text-black/40"><span ref={legRef}>$0</span></div>
                        </div>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="border border-black bg-white p-5">
                        <div className="font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-black/40 mb-4">Monthly Spend by Department</div>
                        <div className="flex items-end gap-3 h-[150px] mb-3">
                            {depts.map(([key, d]) => {
                                const aiH = maxVal > 0 ? Math.round((d.ai / maxVal) * 140) : 4;
                                const legH = maxVal > 0 ? Math.round((d.legacy / maxVal) * 140) : 4;
                                return (
                                    <div key={key} className="flex-1 flex flex-col items-center gap-1">
                                        <div className="flex gap-1 items-end w-full">
                                            <div className="flex-1 rounded-t-sm transition-all duration-700"
                                                style={{ height: aiH, background: `linear-gradient(180deg, ${GREEN}, rgba(74,222,128,0.4))` }} />
                                            <div className="flex-1 rounded-t-sm transition-all duration-700"
                                                style={{ height: legH, background: "linear-gradient(180deg,#4B5563,rgba(75,85,99,0.4))" }} />
                                        </div>
                                        <div className="font-mono text-[9px] text-black/40">{d.label.slice(0,3)}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex gap-4 mb-5">
                            <div className="flex items-center gap-1.5 font-mono text-[10px] text-black/50">
                                <div className="w-2 h-2 rounded-full" style={{ background: GREEN }} /> AI Tools
                            </div>
                            <div className="flex items-center gap-1.5 font-mono text-[10px] text-black/50">
                                <div className="w-2 h-2 rounded-full bg-[#4B5563]" /> Legacy
                            </div>
                        </div>
                        <div className="border-t border-black/10 pt-4">
                            <div className="font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-black/40 mb-3">Top Spend</div>
                            <div className="grid gap-2">
                                {allTools.map(([name, type, cost]) => (
                                    <div key={name} className="flex items-center gap-2">
                                        <div className="font-mono text-[10px] text-black/50 w-24 flex-shrink-0 text-right">{name}</div>
                                        <div className="flex-1 h-[3px] bg-black/08">
                                            <div className="h-full transition-all duration-500"
                                                style={{ width: `${(cost / maxTool) * 100}%`, background: type === "AI" ? GREEN : "#4B5563" }} />
                                        </div>
                                        <div className="font-mono text-[10px] font-bold w-10 text-right">${cost}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Slide>
    );
}

// ── SLIDE 8: AI NATIVENESS SCORE ──────────────────────────────────────────────

function S8() {
    const [vals, setVals] = useState<Record<string, number>>(Object.fromEntries(CATS.map(c => [c.id, 0])));
    const rated = Object.values(vals).filter(v => v > 0);
    const score = rated.length ? Math.round((rated.reduce((a, b) => a + b, 0) / rated.length / 4) * 100) : null;
    const band = score === null ? null
        : score < 30  ? { lbl: "AI-Adjacent",      c: RED   }
        : score < 55  ? { lbl: "Early AI Adoption", c: GOLD  }
        : score < 75  ? { lbl: "AI-Enabled",        c: GOLD  }
        : score < 90  ? { lbl: "AI-Native",          c: GREEN }
        :               { lbl: "Fully AI-Native",    c: GREEN };

    const cycle = (id: string) => setVals(p => ({ ...p, [id]: (p[id] + 1) % 5 }));
    const L_COLORS = ["rgba(0,0,0,0.2)", RED, GOLD, GREEN, GREEN];

    return (
        <Slide className="!items-start">
            <div className="flex gap-12 pt-4">
                <div className="flex-[0_0_280px]">
                    <Eyebrow>Live Demo</Eyebrow>
                    <h2 className="font-serif font-black leading-tight tracking-tight mb-4"
                        style={{ fontSize: "clamp(24px,3vw,42px)" }}>AI Nativeness Score</h2>
                    <p className="font-mono text-xs text-black/55 leading-relaxed mb-6">
                        Click each dimension to rate your organization. Your overall score updates in real time.
                    </p>
                    <div className="border border-black bg-white p-6 text-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                        <div className="font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-black/40 mb-3">Your Score</div>
                        <div className="font-serif font-black leading-none mb-2"
                            style={{ fontSize: 80, color: band?.c ?? "rgba(0,0,0,0.2)" }}>
                            {score ?? "—"}
                        </div>
                        <div className="font-mono text-xs text-black/50">{band?.lbl ?? "Rate dimensions to see your score"}</div>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-black/40 mb-3">
                        Click to rate your org (cycles through levels)
                    </div>
                    {CATS.map(c => {
                        const v = vals[c.id];
                        const color = L_COLORS[v];
                        const pct = (v / 4) * 100;
                        return (
                            <button key={c.id} onClick={() => cycle(c.id)}
                                className="w-full flex items-center gap-3 p-3 border mb-2 text-left transition-all hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                                style={{
                                    borderColor: v > 0 ? GOLD : "rgba(0,0,0,0.12)",
                                    background: v > 0 ? "rgba(232,201,122,0.07)" : "white",
                                }}>
                                <div className="flex-1">
                                    <div className="font-mono text-xs font-bold text-black">{c.label}</div>
                                    <div className="font-mono text-[10px] text-black/40 mt-0.5">{c.sub}</div>
                                </div>
                                <div className="w-20 h-[3px] bg-black/08 flex-shrink-0">
                                    <div className="h-full transition-all duration-400" style={{ width: `${pct}%`, background: color }} />
                                </div>
                                <div className="font-mono text-[10px] font-bold w-16 text-right flex-shrink-0" style={{ color }}>
                                    {LEVELS[v]}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </Slide>
    );
}

// ── SLIDE 9: KANBAN ───────────────────────────────────────────────────────────

function S9() {
    const [cards, setCards] = useState([...KB_INIT]);
    const dragName = useRef<string | null>(null);

    return (
        <Slide>
            <div className="flex items-baseline justify-between mb-5">
                <div>
                    <Eyebrow>Live Demo</Eyebrow>
                    <h2 className="font-serif font-black leading-tight tracking-tight"
                        style={{ fontSize: "clamp(24px,3vw,42px)" }}>Tool Pipeline</h2>
                </div>
                <p className="font-mono text-xs text-black/40 max-w-[260px] text-right">
                    Drag cards between columns to manage your evaluation pipeline.
                </p>
            </div>
            <div className="grid grid-cols-4 gap-3">
                {KB_COLS.map(col => {
                    const colCards = cards.filter(c => c.col === col.id);
                    return (
                        <div key={col.id} className="border border-black bg-white p-3 min-h-[280px] transition-all"
                            onDragOver={e => { e.preventDefault(); }}
                            onDrop={e => {
                                e.preventDefault();
                                const name = dragName.current;
                                if (!name) return;
                                setCards(prev => prev.map(c => c.name === name ? { ...c, col: col.id } : c));
                                dragName.current = null;
                            }}>
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
                                    style={{ color: col.color }}>{col.label}</span>
                                <span className="font-mono text-[9px] text-black/40 border border-black/15 px-1.5 py-0.5">
                                    {colCards.length}
                                </span>
                            </div>
                            {colCards.map(card => (
                                <div key={card.name} draggable
                                    onDragStart={() => { dragName.current = card.name; }}
                                    className="p-2.5 border border-black/12 bg-[#F8F8F6] mb-2 cursor-grab active:cursor-grabbing hover:border-black hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all select-none">
                                    <div className="font-mono text-xs font-bold mb-0.5">{card.name}</div>
                                    <div className="font-mono text-[10px] text-black/40">{card.cat}</div>
                                    <span className="inline-block mt-1.5 font-mono text-[9px] font-bold px-1.5 py-0.5 border"
                                        style={{ borderColor: "rgba(232,201,122,0.4)", color: GOLD, background: "rgba(232,201,122,0.1)" }}>
                                        {card.score}
                                    </span>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </Slide>
    );
}

// ── SLIDE 10: SOCIAL PROOF ────────────────────────────────────────────────────

function S10() {
    return (
        <Slide>
            <Eyebrow>Why Teams Choose Trackr</Eyebrow>
            <h2 className="font-serif font-black leading-tight tracking-tight mb-8"
                style={{ fontSize: "clamp(28px,4vw,52px)" }}>
                Teams that <span style={{ color: GOLD }}>know their stack</span> outperform those that don&apos;t.
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                    { q: "We cut $40K/year in duplicate tools in the first 90 days. Trackr found overlap we didn't even know existed across our engineering and ops stacks.", name: "Sarah K.", role: "Head of Operations, Series B SaaS" },
                    { q: "The research agent alone is worth it. What used to take my team 3 days of vendor research now takes 8 minutes. The scoring is actually credible.", name: "Marcus T.", role: "CTO, 200-person agency" },
                ].map(t => (
                    <div key={t.name} className="border border-black bg-white p-6">
                        <p className="font-mono text-sm text-black/70 leading-relaxed mb-5 italic">
                            &ldquo;{t.q}&rdquo;
                        </p>
                        <div className="font-mono text-xs font-bold text-black">{t.name}</div>
                        <div className="font-mono text-[10px] text-black/40 mt-1">{t.role}</div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-3 border border-black">
                {[
                    { num: "2.3×",  c: GOLD,  lbl: "more shadow IT eliminated in first 90 days" },
                    { num: "8 min", c: GREEN, lbl: "avg tool research time vs. 3+ days manually" },
                    { num: "$40K",  c: "black", lbl: "avg annual software savings per team" },
                ].map((m, i) => (
                    <div key={m.num} className={`p-6 text-center ${i < 2 ? "border-r border-black" : ""}`}>
                        <div className="font-serif font-black text-4xl mb-2" style={{ color: m.c }}>{m.num}</div>
                        <div className="font-mono text-xs text-black/50">{m.lbl}</div>
                    </div>
                ))}
            </div>
        </Slide>
    );
}

// ── SLIDE 11: TOOL CAROUSEL ───────────────────────────────────────────────────

function S11() {
    const [offset, setOffset] = useState(0);
    const [selected, setSelected] = useState(CAROUSEL_TOOLS[0]);

    const CARD_W = 200 + 14; // width + gap
    const maxOffset = Math.max(0, (CAROUSEL_TOOLS.length - 4) * CARD_W);

    return (
        <Slide>
            <Eyebrow>Curated Library</Eyebrow>
            <h2 className="font-serif font-black leading-tight tracking-tight mb-2"
                style={{ fontSize: "clamp(28px,4vw,52px)" }}>
                500+ AI tools. <span style={{ color: GOLD }}>Every one scored.</span>
            </h2>
            <p className="font-mono text-sm text-black/55 mb-5">
                Every score is backed by real agent research across 5+ sources and 7 dimensions.
            </p>
            <div className="overflow-hidden mb-3">
                <div className="flex gap-3.5 transition-transform duration-400"
                    style={{ transform: `translateX(-${offset}px)` }}>
                    {CAROUSEL_TOOLS.map(t => (
                        <button key={t.name} onClick={() => setSelected(t)}
                            className="flex-shrink-0 w-[200px] p-4 border text-left transition-all hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
                            style={{
                                borderColor: selected.name === t.name ? "black" : "rgba(0,0,0,0.15)",
                                background: selected.name === t.name ? "white" : "rgba(255,255,255,0.6)",
                                boxShadow: selected.name === t.name ? "3px 3px 0 0 rgba(0,0,0,1)" : "none",
                            }}>
                            <div className="text-xl mb-3 w-9 h-9 border border-black/10 bg-[#F3F3EF] flex items-center justify-center">
                                {t.icon}
                            </div>
                            <div className="font-serif text-sm font-bold mb-1">{t.name}</div>
                            <div className="font-mono text-[10px] text-black/40 mb-3">{t.cat}</div>
                            <div className="font-serif text-2xl font-black" style={{ color: GOLD }}>{t.score}</div>
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex items-center justify-between mb-3">
                <div className="flex gap-2">
                    {[{label:"←",fn:()=>setOffset(p=>Math.max(0,p-CARD_W))},{label:"→",fn:()=>setOffset(p=>Math.min(maxOffset,p+CARD_W))}].map(b => (
                        <button key={b.label} onClick={b.fn}
                            className="w-8 h-8 border border-black flex items-center justify-center font-mono text-sm hover:bg-black hover:text-white transition-colors">
                            {b.label}
                        </button>
                    ))}
                </div>
                <span className="font-mono text-[10px] text-black/40">Click any card for details</span>
            </div>
            <div className="border border-black bg-white p-4" style={{ borderColor: GOLD, background: "rgba(232,201,122,0.06)" }}>
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <div className="font-serif text-base font-bold">{selected.name}</div>
                        <div className="font-mono text-[10px] text-black/40">{selected.cat}</div>
                    </div>
                    <span className="font-serif text-3xl font-black" style={{ color: GOLD }}>{selected.score}</span>
                </div>
                <p className="font-mono text-xs text-black/55 leading-relaxed">{selected.desc}</p>
            </div>
        </Slide>
    );
}

// ── SLIDE 12: PRICING ─────────────────────────────────────────────────────────

const PRICES = { team: [49, 39], startup: [99, 79], ent: [199, 159] };

function S12() {
    const [annual, setAnnual] = useState(false);
    const idx = annual ? 1 : 0;

    const features = {
        free:    ["5 tools","3 research credits/mo","1 member","Basic reports"],
        team:    ["Unlimited tools","50 research credits/mo","10 members","Slack integration","Spend tracking + exports"],
        startup: ["Everything in Team","150 research credits/mo","25 members","Ask Trackr AI","Scorecard recipes","Renewal alerts"],
        ent:     ["Everything in Startup","Unlimited credits","Unlimited members","API access","Dedicated success manager"],
    };

    return (
        <Slide>
            <Eyebrow>Pricing</Eyebrow>
            <h2 className="font-serif font-black leading-tight tracking-tight mb-4"
                style={{ fontSize: "clamp(28px,4vw,52px)" }}>
                Simple. <span style={{ color: GOLD }}>Transparent.</span> No contracts.
            </h2>
            <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-xs font-bold" style={{ color: annual ? "rgba(0,0,0,0.4)" : "black" }}>Monthly</span>
                <button onClick={() => setAnnual(p => !p)}
                    className="w-11 h-6 border border-black relative transition-all"
                    style={{ background: annual ? "rgba(232,201,122,0.15)" : "transparent" }}>
                    <div className="absolute top-[3px] w-4 h-4 bg-black transition-all"
                        style={{ left: annual ? "calc(100% - 20px)" : "3px", background: annual ? GOLD : "black" }} />
                </button>
                <span className="font-mono text-xs font-bold" style={{ color: annual ? "black" : "rgba(0,0,0,0.4)" }}>
                    Annual <span style={{ color: GREEN }}>— Save 20%</span>
                </span>
            </div>
            <div className="grid grid-cols-4 border border-black">
                {[
                    { key: "free",    label: "Free",       price: "$0",                    period: "always free", annual: null,        hot: false, feats: features.free    },
                    { key: "team",    label: "Team",       price: `$${PRICES.team[idx]}`,  period: "/mo",          annual: annual ? `$${PRICES.team[1]*12}/yr billed` : null, hot: true,  feats: features.team    },
                    { key: "startup", label: "Startup",    price: `$${PRICES.startup[idx]}`,period: "/mo",          annual: annual ? `$${PRICES.startup[1]*12}/yr billed` : null,hot: false,feats: features.startup },
                    { key: "ent",     label: "Enterprise", price: `$${PRICES.ent[idx]}`,   period: "/mo",          annual: annual ? `$${PRICES.ent[1]*12}/yr billed` : null,    hot: false, feats: features.ent     },
                ].map((col, i) => (
                    <div key={col.key} className={`p-5 relative ${i < 3 ? "border-r border-black" : ""} ${col.hot ? "bg-black text-white" : "bg-white"}`}>
                        {col.hot && (
                            <div className="absolute top-0 left-0 right-0 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-center py-1"
                                style={{ background: GOLD, color: "black" }}>Most Popular</div>
                        )}
                        <div className={`font-mono text-[9px] font-bold uppercase tracking-[0.14em] mb-1 ${col.hot ? "mt-6 text-white/50" : "text-black/40"}`}>{col.label}</div>
                        <div className={`font-serif text-4xl font-black leading-none mb-0.5 transition-all`}>{col.price}</div>
                        <div className={`font-mono text-xs mb-1 ${col.hot ? "text-white/40" : "text-black/40"}`}>{col.period}</div>
                        <div className="font-mono text-[10px] mb-4 min-h-[14px]" style={{ color: GREEN }}>{col.annual ?? ""}</div>
                        {col.feats.map(f => (
                            <div key={f} className={`flex items-center gap-1.5 font-mono text-[10px] py-1.5 border-b ${col.hot ? "border-white/10 text-white/70" : "border-black/08 text-black/55"}`}>
                                <span style={{ color: GREEN }}>✓</span> {f}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </Slide>
    );
}

// ── SLIDE 13: COMPARISON ──────────────────────────────────────────────────────

function S13() {
    const [visible, setVisible] = useState(0);

    useEffect(() => {
        const iv = setInterval(() => setVisible(p => {
            if (p >= COMP_ROWS.length) { clearInterval(iv); return p; }
            return p + 1;
        }), 80);
        return () => clearInterval(iv);
    }, []);

    return (
        <Slide>
            <Eyebrow>Competitive Position</Eyebrow>
            <h2 className="font-serif font-black leading-tight tracking-tight mb-6"
                style={{ fontSize: "clamp(28px,4vw,52px)" }}>
                No one else does <span style={{ color: GOLD }}>all of this.</span>
            </h2>
            <table className="w-full border border-black border-collapse">
                <thead>
                    <tr className="border-b border-black">
                        <th className="text-left p-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-black/40 w-[32%]">Capability</th>
                        <th className="p-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-center" style={{ color: GOLD }}>Trackr</th>
                        <th className="p-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-center text-black/40">G2 / Reviews</th>
                        <th className="p-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-center text-black/40">Spreadsheets</th>
                        <th className="p-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-center text-black/40">Procurement</th>
                    </tr>
                </thead>
                <tbody>
                    {COMP_ROWS.map((row, i) => (
                        <tr key={i} className="border-b border-black/10 transition-all duration-300"
                            style={{ opacity: i < visible ? 1 : 0, transform: i < visible ? "translateX(0)" : "translateX(-12px)" }}>
                            <td className="p-3 font-mono text-[11px] text-black/60">{row[0]}</td>
                            {[row[1], row[2], row[3], row[4]].map((v, j) => (
                                <td key={j} className="p-3 text-center">
                                    {v === true  && <span className="font-bold text-base" style={{ color: GREEN }}>✓</span>}
                                    {v === false && <span className="text-base text-black/15">✗</span>}
                                    {v === null  && <span className="text-sm font-bold" style={{ color: GOLD }}>~</span>}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex gap-5 mt-4 font-mono text-[10px] text-black/40">
                <div><span style={{ color: GREEN }} className="font-bold">✓</span> Full support</div>
                <div><span style={{ color: GOLD }} className="font-bold">~</span> Limited</div>
                <div className="text-black/20">✗</div><div>Not supported</div>
            </div>
        </Slide>
    );
}

// ── SLIDE 14: CTA ─────────────────────────────────────────────────────────────

function S14() {
    return (
        <Slide>
            <div className="text-center">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-black/35 mb-6">
                    Trackr × AI Native Solutions
                </div>
                <h1 className="font-serif font-black leading-[1.04] tracking-tight mb-5"
                    style={{ fontSize: "clamp(36px,5.5vw,72px)" }}>
                    Ready to become<br />
                    <span style={{ color: GOLD }}>actually AI-native?</span>
                </h1>
                <p className="font-mono text-sm text-black/55 max-w-[500px] mx-auto leading-relaxed mb-10">
                    Join 500+ ops teams who use Trackr to cut waste, make smarter software decisions,
                    and stay ahead of the AI curve.
                </p>
                <div className="flex gap-3 justify-center mb-14">
                    <a href="https://trytrackr.com/sign-up" target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-black text-white px-8 py-3.5 font-mono text-xs uppercase tracking-widest hover:bg-black/80 transition-colors">
                        Start Free Today →
                    </a>
                    <a href="https://cal.com/adamwolfe/trackr" target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 border border-black bg-transparent px-8 py-3.5 font-mono text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                        Book an Enterprise Audit
                    </a>
                </div>
                <div className="flex justify-center gap-10 flex-wrap">
                    {[
                        { num: "500+",  lbl: "ops teams onboarded",  c: GOLD    },
                        { num: "$2.3M", lbl: "in tracked spend",     c: GREEN   },
                        { num: "8 min", lbl: "avg research time",    c: "black" },
                        { num: "$40K",  lbl: "avg annual savings",   c: RED     },
                    ].map(x => (
                        <div key={x.lbl} className="text-center border border-black bg-white px-6 py-4 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                            <div className="font-serif text-3xl font-black mb-1" style={{ color: x.c }}>{x.num}</div>
                            <div className="font-mono text-[10px] text-black/45">{x.lbl}</div>
                        </div>
                    ))}
                </div>
            </div>
        </Slide>
    );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────

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
    11: () => <S11 />,
    12: () => <S12 />,
    13: () => <S13 />,
    14: () => <S14 />,
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
        }, 250);
    }, [cur]);

    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (["ArrowRight", " "].includes(e.key)) { e.preventDefault(); goTo(cur + 1); }
            else if (e.key === "ArrowLeft")            { e.preventDefault(); goTo(cur - 1); }
        };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [cur, goTo]);

    const progress = (cur / TOTAL) * 100;

    return (
        <div className="relative overflow-hidden select-none"
            style={{ background: BG, height: "100vh", width: "100vw", fontFamily: "inherit" }}>

            {/* Progress bar */}
            <div className="fixed top-0 left-0 z-50 h-[2px] bg-black transition-all duration-500"
                style={{ width: `${progress}%` }} />

            {/* Slide counter */}
            <div className="fixed top-5 right-7 z-50 font-mono text-[11px] font-bold tracking-[0.1em] text-black/35">
                {cur} / {TOTAL}
            </div>

            {/* Prev arrow */}
            <button onClick={() => goTo(cur - 1)} disabled={cur === 1}
                className="fixed left-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-all disabled:opacity-15 disabled:cursor-not-allowed"
                style={{ background: BG }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            </button>

            {/* Next arrow */}
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
                        className="w-1.5 h-1.5 rounded-full transition-all"
                        style={{ background: i + 1 === cur ? "black" : "rgba(0,0,0,0.2)", transform: i + 1 === cur ? "scale(1.5)" : "scale(1)" }} />
                ))}
            </div>

            {/* Slide */}
            <div style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(10px)",
                transition: "opacity 0.28s ease, transform 0.28s ease",
            }}>
                {SLIDES[cur]?.({ goTo })}
            </div>
        </div>
    );
}
