"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  AlertTriangle,
  Search,
  MessageSquare,
  TrendingUp,
  Zap,
} from "lucide-react";

/* ─── Shared: window chrome wrapper ──────────────────────────────────── */
function DemoWindow({
  title,
  children,
  statusLabel,
  showStatus,
}: {
  title: string;
  children: React.ReactNode;
  statusLabel?: string;
  showStatus?: boolean;
}) {
  return (
    <div className="relative w-full">
      <div className="w-full border border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        {/* Title bar */}
        <div className="bg-black px-4 py-2.5 flex items-center gap-2">
          <div className="w-2 h-2 bg-white/20" />
          <div className="w-2 h-2 bg-white/20" />
          <div className="w-2 h-2 bg-white/20" />
          <span className="ml-2 font-mono text-[10px] text-white/60 uppercase tracking-wider">
            {title}
          </span>
          {showStatus && statusLabel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-auto flex items-center gap-1.5"
            >
              <motion.div
                className="w-1.5 h-1.5 bg-white/50"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <span className="font-mono text-[9px] text-white/50 uppercase tracking-wider">
                {statusLabel}
              </span>
            </motion.div>
          )}
        </div>
        {children}
      </div>
      <div className="absolute -bottom-3 -right-3 w-full h-full border border-black/20 -z-10" />
    </div>
  );
}

/* ─── Animated counter ───────────────────────────────────────────────── */
function AnimatedCounter({
  target,
  duration = 1500,
  prefix = "",
  suffix = "",
  animate,
}: {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  animate: boolean;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!animate) {
      setDisplay(0); // eslint-disable-line react-hooks/set-state-in-effect -- reset on animation toggle
      return;
    }
    let start = 0;
    const steps = 30;
    const inc = target / steps;
    const interval = duration / steps;
    const t = setInterval(() => {
      start += inc;
      if (start >= target) {
        setDisplay(target);
        clearInterval(t);
      } else {
        setDisplay(Math.round(start));
      }
    }, interval);
    return () => clearInterval(t);
  }, [animate, target, duration]);
  return (
    <span>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DEMO 1: Stack Intelligence
   ═══════════════════════════════════════════════════════════════════════ */

const STACK_TOOLS = [
  {
    name: "Slack",
    domain: "slack.com",
    classification: "ai-enabled",
    score: 6,
  },
  {
    name: "Notion",
    domain: "notion.so",
    classification: "ai-enabled",
    score: 7,
  },
  {
    name: "GitHub Copilot",
    domain: "github.com",
    classification: "ai-native",
    score: 10,
  },
  {
    name: "Cursor",
    domain: "cursor.com",
    classification: "ai-native",
    score: 10,
  },
  {
    name: "Jira",
    domain: "atlassian.com",
    classification: "traditional",
    score: 3,
  },
  {
    name: "Salesforce",
    domain: "salesforce.com",
    classification: "ai-enabled",
    score: 5,
  },
  {
    name: "ChatGPT",
    domain: "openai.com",
    classification: "ai-native",
    score: 10,
  },
  {
    name: "Figma",
    domain: "figma.com",
    classification: "ai-enabled",
    score: 6,
  },
];

function classificationDot(c: string) {
  if (c === "ai-native") return "bg-black";
  if (c === "ai-enabled") return "bg-neutral-400";
  return "bg-neutral-200 border border-neutral-300";
}

function classificationLabel(c: string) {
  if (c === "ai-native") return "AI-Native";
  if (c === "ai-enabled") return "AI-Enabled";
  return "Traditional";
}

function StackIntelligenceDemo() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [visibleCount, setVisibleCount] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [showBenchmark, setShowBenchmark] = useState(false);
  const [showOpportunity, setShowOpportunity] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!inView || hasStarted.current) return;
    hasStarted.current = true;

    // Stagger tool appearance
    let count = 0;
    const toolInterval = setInterval(() => {
      count++;
      setVisibleCount(count);
      if (count >= STACK_TOOLS.length) {
        clearInterval(toolInterval);
        // Show score after all tools appear
        setTimeout(() => setShowScore(true), 400);
        setTimeout(() => setShowBenchmark(true), 1200);
        setTimeout(() => setShowOpportunity(true), 2000);
      }
    }, 250);

    return () => clearInterval(toolInterval);
  }, [inView]);

  return (
    <div ref={ref}>
      <DemoWindow
        title="trackr — stack intelligence"
        statusLabel="Analyzing"
        showStatus={inView && !showScore}
      >
        <div className="p-4">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">
                AI Nativeness Score
              </span>
            </div>
            <div className="text-right">
              <div className="font-mono text-3xl font-bold text-black leading-none">
                {showScore ? (
                  <AnimatedCounter
                    target={67}
                    animate={showScore}
                    duration={1000}
                  />
                ) : (
                  <span className="text-neutral-200">--</span>
                )}
              </div>
              <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider">
                /100
              </span>
            </div>
          </div>

          {/* Tools table */}
          <div className="border border-black mb-3">
            <div className="bg-black px-3 py-1.5 flex items-center">
              <span className="font-mono text-[9px] text-white/60 uppercase tracking-widest flex-1">
                Tool
              </span>
              <span className="font-mono text-[9px] text-white/60 uppercase tracking-widest w-24 text-right">
                Classification
              </span>
            </div>
            <div className="divide-y divide-black/10">
              {STACK_TOOLS.slice(0, visibleCount).map((tool) => (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center px-3 py-2"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${tool.domain}&sz=32`}
                      alt=""
                      width={14}
                      height={14}
                      className="flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <span className="font-mono text-[11px] text-black truncate">
                      {tool.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 w-24 justify-end">
                    <div
                      className={`w-2 h-2 flex-shrink-0 ${classificationDot(tool.classification)}`}
                    />
                    <span className="font-mono text-[9px] text-neutral-500">
                      {classificationLabel(tool.classification)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-3">
            {[
              { c: "ai-native", label: "AI-Native" },
              { c: "ai-enabled", label: "AI-Enabled" },
              { c: "traditional", label: "Traditional" },
            ].map((item) => (
              <div key={item.c} className="flex items-center gap-1">
                <div
                  className={`w-1.5 h-1.5 ${classificationDot(item.c)}`}
                />
                <span className="font-mono text-[8px] text-neutral-400 uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Benchmark */}
          <AnimatePresence>
            {showBenchmark && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-neutral-100 border border-black px-3 py-2.5 mb-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">
                      Benchmark
                    </span>
                    <span className="font-serif text-sm font-medium text-black">
                      Early Adopter
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3 text-black" />
                    <span className="font-mono text-[10px] text-black font-semibold">
                      Ahead of 75% of companies
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Opportunity */}
          <AnimatePresence>
            {showOpportunity && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="border border-black/20 px-3 py-2.5"
              >
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
                  Opportunity
                </span>
                <div className="flex items-start gap-2">
                  <Zap className="w-3 h-3 text-black flex-shrink-0 mt-0.5" />
                  <span className="font-mono text-[10px] text-neutral-700">
                    Replace Jira with Linear for built-in AI triage, auto-prioritization, and 3x faster workflows
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DemoWindow>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DEMO 2: Spend Tracker
   ═══════════════════════════════════════════════════════════════════════ */

const SPEND_CATEGORIES = [
  { label: "Communication", amount: 3200, pct: 26 },
  { label: "Dev Tools", amount: 4100, pct: 33 },
  { label: "Design", amount: 2150, pct: 17 },
  { label: "Sales & CRM", amount: 1800, pct: 14 },
  { label: "Analytics", amount: 1200, pct: 10 },
];

function SpendTrackerDemo() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [showBars, setShowBars] = useState(false);
  const [showRenewal, setShowRenewal] = useState(false);
  const [showFlag, setShowFlag] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!inView || hasStarted.current) return;
    hasStarted.current = true;

    setTimeout(() => setShowBars(true), 600);
    setTimeout(() => setShowRenewal(true), 2000);
    setTimeout(() => setShowFlag(true), 3000);
  }, [inView]);

  return (
    <div ref={ref}>
      <DemoWindow
        title="trackr — spend tracker"
        statusLabel="Syncing"
        showStatus={inView && !showBars}
      >
        <div className="p-4">
          {/* Top stats */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 border border-black p-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
                Monthly Spend
              </span>
              <div className="font-mono text-2xl font-bold text-black leading-none">
                {inView ? (
                  <AnimatedCounter
                    target={12450}
                    animate={inView}
                    prefix="$"
                    duration={1200}
                  />
                ) : (
                  "$0"
                )}
              </div>
            </div>
            <div className="flex-1 border border-black/20 p-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
                Annual Projection
              </span>
              <div className="font-mono text-2xl font-bold text-neutral-500 leading-none">
                {inView ? (
                  <AnimatedCounter
                    target={149400}
                    animate={inView}
                    prefix="$"
                    duration={1400}
                  />
                ) : (
                  "$0"
                )}
              </div>
            </div>
          </div>

          {/* Bar chart */}
          <div className="mb-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-2">
              Spend by Category
            </span>
            <div className="space-y-2">
              {SPEND_CATEGORIES.map((cat, i) => (
                <div key={cat.label}>
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-mono text-[10px] text-neutral-500">
                      {cat.label}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-black">
                      ${cat.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-[6px] bg-neutral-100 border border-neutral-200">
                    <motion.div
                      className="h-full bg-black"
                      initial={{ width: 0 }}
                      animate={{ width: showBars ? `${cat.pct}%` : 0 }}
                      transition={{
                        duration: 0.6,
                        delay: i * 0.12,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Renewal alert */}
          <AnimatePresence>
            {showRenewal && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="bg-neutral-100 border border-black px-3 py-2.5 mb-3"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-black flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">
                      Renewal Alert
                    </span>
                    <span className="font-mono text-[11px] text-black font-semibold">
                      Salesforce renews in 7 days — $2,400/mo
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Flagged tool */}
          <AnimatePresence>
            {showFlag && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="border border-black/20 px-3 py-2.5"
              >
                <div className="flex items-start gap-2">
                  <BarChart3 className="w-3.5 h-3.5 text-black flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">
                      Flagged
                    </span>
                    <span className="font-mono text-[11px] text-neutral-700">
                      Basecamp scored 4.2/10 — consider replacing with a higher-rated alternative
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DemoWindow>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DEMO 3: AI Chat / Ask
   ═══════════════════════════════════════════════════════════════════════ */

const QUERY_TEXT = "What tools did we evaluate for outreach automation?";

const CHAT_RESULTS = [
  {
    name: "Clay",
    domain: "clay.com",
    score: 9.3,
    verdict: "Best-in-class AI enrichment and outreach automation.",
  },
  {
    name: "Apollo",
    domain: "apollo.io",
    score: 7.8,
    verdict: "Strong prospecting database with built-in sequences.",
  },
  {
    name: "Lemlist",
    domain: "lemlist.com",
    score: 6.5,
    verdict: "Good for cold email personalization at lower volume.",
  },
];

function AskDemo() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [typedQuery, setTypedQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [visibleResults, setVisibleResults] = useState(0);
  const [showFooter, setShowFooter] = useState(false);
  const hasStarted = useRef(false);

  const startTyping = useCallback(() => {
    let i = 0;
    const typeNext = () => {
      if (i <= QUERY_TEXT.length) {
        setTypedQuery(QUERY_TEXT.slice(0, i));
        i++;
        setTimeout(typeNext, 40);
      } else {
        // After typing, show results
        setTimeout(() => {
          setShowResults(true);
          let count = 0;
          const resultInterval = setInterval(() => {
            count++;
            setVisibleResults(count);
            if (count >= CHAT_RESULTS.length) {
              clearInterval(resultInterval);
              setTimeout(() => setShowFooter(true), 400);
            }
          }, 350);
        }, 500);
      }
    };
    typeNext();
  }, []);

  useEffect(() => {
    if (!inView || hasStarted.current) return;
    hasStarted.current = true;
    setTimeout(startTyping, 400);
  }, [inView, startTyping]);

  return (
    <div ref={ref}>
      <DemoWindow
        title="trackr — ask your workspace"
        statusLabel="Searching"
        showStatus={showResults && !showFooter}
      >
        <div className="p-4">
          {/* Search input */}
          <div className="border border-black px-3 py-2.5 flex items-center gap-2 mb-4 bg-white">
            <Search className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
            <span className="font-mono text-[11px] text-neutral-700 flex-1 min-h-[18px]">
              {typedQuery}
              {!showResults && inView && (
                <span className="inline-block w-0.5 h-3.5 bg-black ml-0.5 animate-pulse align-middle" />
              )}
              {!inView && (
                <span className="text-neutral-400">
                  Ask anything about your tools...
                </span>
              )}
            </span>
            {showResults && !showFooter && (
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="flex gap-0.5"
              >
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="w-1 h-1 bg-black/30 inline-block"
                  />
                ))}
              </motion.div>
            )}
          </div>

          {/* Response area */}
          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-1.5 mb-3">
                  <MessageSquare className="w-3 h-3 text-neutral-400" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                    Results from your workspace
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  {CHAT_RESULTS.slice(0, visibleResults).map((tool) => (
                    <motion.div
                      key={tool.name}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border border-black bg-white p-3"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${tool.domain}&sz=32`}
                            alt=""
                            width={14}
                            height={14}
                            className="flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                          <span className="font-serif text-sm font-medium text-black">
                            {tool.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-lg font-bold text-black leading-none">
                            {tool.score}
                          </span>
                          <span className="font-mono text-[8px] text-neutral-400">
                            /10
                          </span>
                        </div>
                      </div>
                      <p className="font-mono text-[10px] text-neutral-500 leading-relaxed">
                        {tool.verdict}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <AnimatePresence>
            {showFooter && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-neutral-100 border border-black/20 px-3 py-2 flex items-center gap-2"
              >
                <Search className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                <span className="font-mono text-[10px] text-neutral-500">
                  Based on 12 research reports in your workspace
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DemoWindow>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN SECTION
   ═══════════════════════════════════════════════════════════════════════ */

const DEMOS = [
  {
    label: "Stack Intelligence",
    description:
      "See your AI nativeness score update in real time as tools are classified.",
    Component: StackIntelligenceDemo,
  },
  {
    label: "Spend Tracker",
    description:
      "Track every dollar across your AI stack with renewal alerts and flags.",
    Component: SpendTrackerDemo,
  },
  {
    label: "Ask Your Workspace",
    description:
      "Semantic search across every research report your team has generated.",
    Component: AskDemo,
  },
];

export function MarketingInteractiveDemos() {
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-40px" });

  return (
    <section className="mb-24 md:mb-32">
      {/* Section heading */}
      <motion.div
        ref={headingRef}
        initial={{ opacity: 0, y: 16 }}
        animate={headingInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="text-center mb-16"
      >
        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-4">
          Interactive Demos
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-normal tracking-tight mb-4">
          See It In Action
        </h2>
        <p className="font-mono text-sm text-neutral-500 max-w-lg mx-auto leading-relaxed">
          Each feature auto-animates below. No clicks needed — just scroll and watch your AI tool stack come to life.
        </p>
      </motion.div>

      {/* Demos stacked */}
      <div className="space-y-16 max-w-xl mx-auto">
        {DEMOS.map((demo) => (
          <div key={demo.label}>
            <div className="mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-black" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                {demo.label}
              </span>
            </div>
            <p className="font-mono text-xs text-neutral-500 mb-4 max-w-md">
              {demo.description}
            </p>
            <demo.Component />
          </div>
        ))}
      </div>
    </section>
  );
}
