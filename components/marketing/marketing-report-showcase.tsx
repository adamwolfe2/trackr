"use client";

import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink, Search } from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────────── */
type Tier = "mainstream" | "underground";

interface Tool {
    name: string;
    url: string;
    domain: string;
    logoUrl?: string; // optional direct URL; falls back to Google favicons
    category: string;
    tier: Tier;
    score: number;
    pros: string[];
    cons: string[];
    verdict: string;
}

/* ─── Tool data ─────────────────────────────────────────────────────────── */
const TOOLS: Tool[] = [
    {
        name: "Perplexity",
        url: "perplexity.ai",
        domain: "perplexity.ai",
        category: "Search / Research",
        tier: "mainstream",
        score: 9.8,
        pros: ["Real-time web access with source citations", "Clean distraction-free UX", "API for building on top of it"],
        cons: ["Occasional hallucinations in deep tech topics", "Source quality varies by query"],
        verdict: "Replace Google for research-heavy workflows immediately.",
    },
    {
        name: "Cursor",
        url: "cursor.com",
        domain: "cursor.com",
        category: "Coding",
        tier: "mainstream",
        score: 9.9,
        pros: ["Best-in-class codebase indexing", "Multi-file context edits that actually work", "Seamless VS Code migration in minutes"],
        cons: ["Subscription cost adds up for small teams", "Context window limits on very large repos"],
        verdict: "Non-negotiable for any dev team. Deploy immediately.",
    },
    {
        name: "ElevenLabs",
        url: "elevenlabs.io",
        domain: "elevenlabs.io",
        category: "Voice AI",
        tier: "mainstream",
        score: 9.7,
        pros: ["Industry-leading latency and emotional depth", "Voice cloning in seconds", "Dubbing + localization API is world-class"],
        cons: ["High API costs at massive scale", "Voice cloning raises compliance questions"],
        verdict: "Best voice AI by a wide margin. Evaluate API pricing at scale.",
    },
    {
        name: "Linear",
        url: "linear.app",
        domain: "linear.app",
        category: "Product Management",
        tier: "mainstream",
        score: 9.5,
        pros: ["Extreme speed — keyboard-first UI", "AI-first triaging with Linear Asks", "Opinionated in the best possible way"],
        cons: ["Can feel rigid for non-technical teams", "Limited custom field flexibility"],
        verdict: "The Jira killer. Switch your engineering org immediately.",
    },
    {
        name: "Wispr Flow",
        url: "wispr.flow",
        domain: "wispr.flow",
        logoUrl: "https://wispr.flow/favicon.ico",
        category: "Voice Dictation",
        tier: "underground",
        score: 9.6,
        pros: ["Works in every Mac text field natively", "Context-aware, not just raw transcription", "Near-zero latency — faster than typing"],
        cons: ["Mac-only, no Windows or mobile yet", "Early-stage product, occasional quirks"],
        verdict: "The best productivity unlock most people haven't heard of.",
    },
    {
        name: "Granola",
        url: "granola.so",
        domain: "granola.so",
        category: "Meeting Intelligence",
        tier: "underground",
        score: 9.4,
        pros: ["Runs silently alongside any meeting — no bots", "AI notepad that feels fully native", "Pushes clean summaries automatically after calls"],
        cons: ["Fewer integrations than Fireflies or Otter", "Memory of past meetings still maturing"],
        verdict: "Best meeting AI for executives who hate bots. Install today.",
    },
    {
        name: "Clay",
        url: "clay.com",
        domain: "clay.com",
        category: "GTM Intelligence",
        tier: "underground",
        score: 9.8,
        pros: ["Unmatched data enrichment waterfall logic", "AI agents for outbound sequencing", "Natively integrates 50+ data sources"],
        cons: ["Steep learning curve for non-technical GTM", "Pricing scales fast with high usage"],
        verdict: "The unfair advantage for any outbound-heavy revenue team.",
    },
    {
        name: "v0 by Vercel",
        url: "v0.dev",
        domain: "v0.dev",
        category: "UI Generation",
        tier: "underground",
        score: 9.5,
        pros: ["Best prompt-to-UI output in the market", "Deploys to Vercel in one click", "Rapid prototyping for non-designers"],
        cons: ["Less control than hand-coded components", "Output can need cleanup for complex layouts"],
        verdict: "Replace Figma for early-stage prototyping. Ship in hours, not days.",
    },
    {
        name: "Dex",
        url: "getdex.com",
        domain: "getdex.com",
        category: "Personal CRM",
        tier: "underground",
        score: 9.3,
        pros: ["Relationship intelligence done right", "LinkedIn integration + automatic contact tracking", "Second brain for high-value networking"],
        cons: ["Niche use case — not built for sales teams", "Mobile app still catching up to desktop"],
        verdict: "The only personal CRM worth using. Essential for founders.",
    },
    {
        name: "Hey Lemon",
        url: "heylemon.ai",
        domain: "heylemon.ai",
        category: "AI Prospecting",
        tier: "underground",
        score: 9.2,
        pros: ["Deep account research at speed", "Structured output, not just generic summaries", "Built specifically for GTM and sales use cases"],
        cons: ["Early product — feature roadmap still building", "Occasional research gaps on niche markets"],
        verdict: "The best-kept secret in AI sales research. Get in early.",
    },
    {
        name: "Reflect",
        url: "reflect.app",
        domain: "reflect.app",
        category: "Note-taking / PKM",
        tier: "underground",
        score: 9.3,
        pros: ["Networked notes with AI-powered backlinking", "Beautiful distraction-free writing UX", "Daily notes + knowledge graph built in"],
        cons: ["Pricier than Notion for solo users", "Smaller ecosystem and fewer integrations"],
        verdict: "The thinking tool for operators who actually need to think.",
    },
    {
        name: "Rows",
        url: "rows.com",
        domain: "rows.com",
        category: "AI Spreadsheets",
        tier: "underground",
        score: 9.1,
        pros: ["AI-native with built-in live data sources", "Automations run natively inside the sheet", "Feels like the actual future of Excel"],
        cons: ["Not a full Sheets or Excel replacement yet", "Formula learning curve for advanced power users"],
        verdict: "Makes you question why you still use Google Sheets.",
    },
    {
        name: "Tana",
        url: "tana.inc",
        domain: "tana.inc",
        category: "Productivity / PKM",
        tier: "underground",
        score: 9.0,
        pros: ["Supertag-based knowledge graph is genuinely novel", "Extremely powerful for structured thinkers", "AI search across your entire knowledge base"],
        cons: ["Very high learning curve — not for casual users", "UI can feel overwhelming until it clicks"],
        verdict: "The power user's PKM. If it clicks, there's no going back.",
    },
    {
        name: "Lindy",
        url: "lindy.ai",
        domain: "lindy.ai",
        category: "AI Agents",
        tier: "underground",
        score: 9.4,
        pros: ["Deploy AI agents in minutes — email, CRM, scheduling", "No-code interface with full customization depth", "Handles multi-step workflows Zapier can't"],
        cons: ["Less community resources than Zapier or Make", "Complex agents need trial-and-error tuning"],
        verdict: "The Zapier of the AI agent era. Build your first agent today.",
    },
];

/* ─── Carousel constants ─────────────────────────────────────────────────── */
const CARD_W = 320;
const CARD_GAP = 16;
const CARD_STEP = CARD_W + CARD_GAP; // 336px
const CYCLE = TOOLS.length * CARD_STEP; // 4704px

/* ─── Easing helpers ─────────────────────────────────────────────────────── */
// Ease-in-out-quad: slow at center, fast at edges
function easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/* ─── Tool card ─────────────────────────────────────────────────────────── */
function ToolCard({ tool }: { tool: Tool }) {
    const scoreWidth = `${(tool.score / 10) * 100}%`;
    return (
        <div
            className="bg-white h-full flex flex-col border border-black/10 transition-[border-color,box-shadow] duration-200"
            style={{ borderColor: "rgba(0,0,0,0.10)" }}
        >
            {/* Header */}
            <div className="px-4 pt-3.5 pb-3 border-b border-black/8">
                {/* Tier badge */}
                {tool.tier === "underground" ? (
                    <span className="font-mono text-[9px] bg-black text-white px-2 py-0.5 uppercase tracking-widest inline-flex items-center gap-1 mb-2">
                        <Search className="w-2.5 h-2.5" /> Insider Tool
                    </span>
                ) : (
                    <span className="font-mono text-[9px] border border-neutral-300 text-neutral-400 px-2 py-0.5 uppercase tracking-widest inline-block mb-2">
                        Mainstream
                    </span>
                )}

                {/* Name + score */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                        <Image
                            src={tool.logoUrl ?? `https://www.google.com/s2/favicons?domain=${tool.domain}&sz=32`}
                            alt=""
                            width={18}
                            height={18}
                            className="flex-shrink-0"
                            unoptimized
                        />
                        <div className="min-w-0">
                            <div className="font-serif text-base font-medium leading-tight">{tool.name}</div>
                            <div className="font-mono text-[10px] text-neutral-400 truncate">{tool.category}</div>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <div className="font-mono text-2xl font-bold leading-none">{tool.score}</div>
                        <div className="font-mono text-[9px] text-neutral-400">/10</div>
                    </div>
                </div>

                {/* Score bar */}
                <div className="h-[3px] bg-neutral-100 border border-neutral-200">
                    <div className="h-full bg-black" style={{ width: scoreWidth }} />
                </div>
            </div>

            {/* Pros / Cons */}
            <div className="grid grid-cols-2 flex-1 border-b border-black/8">
                <div className="px-3 py-3 border-r border-black/8">
                    <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-1.5">Pros</div>
                    <ul className="space-y-1.5">
                        {tool.pros.map((pro, i) => (
                            <li key={i} className="font-mono text-[10px] text-neutral-700 flex gap-1.5">
                                <span className="text-neutral-300 flex-shrink-0 mt-[1px]">+</span>
                                <span className="leading-snug">{pro}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="px-3 py-3">
                    <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-1.5">Cons</div>
                    <ul className="space-y-1.5">
                        {tool.cons.map((con, i) => (
                            <li key={i} className="font-mono text-[10px] text-neutral-700 flex gap-1.5">
                                <span className="text-neutral-300 flex-shrink-0 mt-[1px]">−</span>
                                <span className="leading-snug">{con}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Verdict */}
            <div className="px-4 py-2.5 bg-[#F3F3EF] border-t border-black/8">
                <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-0.5">Verdict</div>
                <p className="font-mono text-[11px] text-neutral-700 leading-relaxed">{tool.verdict}</p>
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 flex items-center justify-between border-t border-black/8">
                <span className="font-mono text-[9px] border border-neutral-200 text-neutral-500 px-1.5 py-0.5 uppercase tracking-wider">
                    {tool.category.split("/")[0].trim()}
                </span>
                <a
                    href={`https://${tool.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[9px] text-neutral-400 hover:text-black transition-colors flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                >
                    {tool.url} <ExternalLink className="w-2.5 h-2.5" />
                </a>
            </div>
        </div>
    );
}

/* ─── Main export ────────────────────────────────────────────────────────── */
export function MarketingReportShowcase() {
    const headingRef = useRef<HTMLDivElement>(null);
    const inView = useInView(headingRef, { once: true, margin: "-60px" });

    const trackRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const offset = useRef(-CYCLE); // start at middle of triple set
    const vel = useRef(0);
    const dragging = useRef(false);
    const hovered = useRef(false);
    const lastPtrX = useRef(0);
    const lastTs = useRef(0);
    const rafRef = useRef<number>(0);

    const tripleCards = [...TOOLS, ...TOOLS, ...TOOLS];

    useEffect(() => {
        const tick = (ts: number) => {
            const dt = lastTs.current ? Math.min(ts - lastTs.current, 50) : 16.67;
            lastTs.current = ts;

            if (!dragging.current) {
                if (Math.abs(vel.current) > 0.05) {
                    // Momentum decay — runs whether hovering or not
                    vel.current *= Math.pow(0.93, dt / 16.67);
                    offset.current += vel.current;
                } else if (!hovered.current) {
                    // Auto-scroll when idle + not hovered
                    vel.current = 0;
                    offset.current -= 0.55 * (dt / 16.67);
                }
                // If hovering with no momentum: paused (do nothing)
            }

            // Infinite loop normalization
            if (offset.current < -CYCLE * 2) offset.current += CYCLE;
            if (offset.current > 0) offset.current -= CYCLE;

            const track = trackRef.current;
            if (!track) {
                rafRef.current = requestAnimationFrame(tick);
                return;
            }

            track.style.transform = `translateX(${offset.current}px)`;

            // Per-card scale + opacity + active border
            const container = containerRef.current;
            if (container) {
                const centerX = container.offsetWidth / 2;
                const cardEls = track.children;

                for (let i = 0; i < cardEls.length; i++) {
                    const wrapper = cardEls[i] as HTMLElement;
                    const cardVisualLeft = i * CARD_STEP + offset.current;
                    const cardCenter = cardVisualLeft + CARD_W / 2;
                    const dist = Math.abs(cardCenter - centerX);

                    // t: 0 at center, 1 at 1.5 cards away — with ease-in-out-quad
                    const tRaw = Math.min(dist / (CARD_STEP * 1.6), 1);
                    const t = easeInOutQuad(tRaw);

                    // Scale: 1.05 at center → 0.87 at edge
                    const scale = 1.05 - 0.18 * t;
                    // Opacity: 1.0 → 0.55
                    const opacity = 1 - 0.45 * t;

                    wrapper.style.transform = `scale(${scale.toFixed(4)})`;
                    wrapper.style.opacity = opacity.toFixed(4);

                    // Active card: heavier border + offset shadow
                    const isActive = dist < CARD_W * 0.5;
                    const inner = wrapper.firstElementChild as HTMLElement | null;
                    if (inner) {
                        inner.style.borderColor = isActive
                            ? "rgba(0,0,0,0.90)"
                            : "rgba(0,0,0,0.10)";
                        inner.style.boxShadow = isActive
                            ? "4px 4px 0 0 rgba(0,0,0,1)"
                            : "none";
                    }
                }
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    /* Pointer handlers */
    const onPointerDown = (e: React.PointerEvent) => {
        dragging.current = true;
        lastPtrX.current = e.clientX;
        vel.current = 0;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        e.preventDefault();
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (!dragging.current) return;
        const dx = e.clientX - lastPtrX.current;
        // EMA velocity tracking for smooth momentum
        vel.current = 0.65 * dx + 0.35 * vel.current;
        offset.current += dx;
        lastPtrX.current = e.clientX;
    };

    const onPointerUp = () => {
        dragging.current = false;
        // vel.current carries the throw momentum
    };

    return (
        <section className="w-full py-24 border-t border-black/10" id="reports">
            {/* Section header */}
            <motion.div
                ref={headingRef}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
                className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
            >
                <div>
                    <span className="text-sm font-mono uppercase tracking-wider text-neutral-500 mb-4 block">
                        Real Research Output
                    </span>
                    <h2 className="text-3xl md:text-5xl font-serif font-normal max-w-2xl">
                        This is what you get. Every time.
                    </h2>
                    <p className="font-mono text-sm text-neutral-500 mt-4 max-w-xl leading-relaxed">
                        14 real tool evaluations — mainstream best-in-class and underground insider picks — all generated automatically by Trackr&apos;s research agents.
                    </p>
                </div>
                <Link
                    href="/sign-up"
                    className="flex-shrink-0 flex items-center gap-2 border border-black px-6 py-3.5 font-mono text-sm uppercase tracking-wide bg-black text-white hover:bg-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all whitespace-nowrap"
                >
                    Get your reports <ArrowRight className="w-4 h-4" />
                </Link>
            </motion.div>

            {/* ── Infinite ticker — full viewport bleed ──────────────────── */}
            <div
                ref={containerRef}
                className="relative overflow-hidden py-6 cursor-grab active:cursor-grabbing select-none"
                style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)" }}
                onMouseEnter={() => { hovered.current = true; }}
                onMouseLeave={() => {
                    hovered.current = false;
                    dragging.current = false;
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
            >
                {/* Left fade */}
                <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-36 bg-gradient-to-r from-[#F3F3EF] to-transparent z-10 pointer-events-none" />
                {/* Right fade */}
                <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-36 bg-gradient-to-l from-[#F3F3EF] to-transparent z-10 pointer-events-none" />

                {/* Track */}
                <div
                    ref={trackRef}
                    className="flex will-change-transform"
                    style={{
                        gap: CARD_GAP,
                        width: tripleCards.length * CARD_STEP,
                    }}
                >
                    {tripleCards.map((tool, i) => (
                        <div
                            key={`${tool.domain}-${i}`}
                            style={{ width: CARD_W, flexShrink: 0 }}
                        >
                            <ToolCard tool={tool} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Badge legend */}
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] bg-black text-white px-2 py-0.5 uppercase tracking-widest inline-flex items-center gap-1">
                        <Search className="w-2.5 h-2.5" /> Insider Tool
                    </span>
                    <span className="font-mono text-[10px] text-neutral-500">
                        Underground picks — tools insiders rely on before mass market
                    </span>
                </div>
                <div className="hidden sm:block w-px h-4 bg-neutral-300" />
                <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] border border-neutral-300 text-neutral-400 px-2 py-0.5 uppercase tracking-widest">
                        Mainstream
                    </span>
                    <span className="font-mono text-[10px] text-neutral-500">
                        Best-in-class established tools
                    </span>
                </div>
            </div>
        </section>
    );
}
