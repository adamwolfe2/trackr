"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    X, ArrowRight, Loader2, CheckCircle2, XCircle,
    Clock, Layers, AlertCircle, ChevronLeft,
} from "lucide-react";
import {
    parseBulkInput,
    bulkSubmitAndResearch,
    type ParsedTool,
    type BulkSubmitResult,
} from "@/lib/actions/bulk-research";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "idle" | "parsing" | "previewing" | "submitting" | "live";

type LiveStatus = {
    id: string;
    name: string;
    url: string;
    status: "queued" | "researching" | "active" | "failed";
    overallScore?: string | null;
    logoUrl?: string | null;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Favicon({ domain, size = 14 }: { domain: string; size?: number }) {
    return (
        <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
            alt=""
            width={size}
            height={size}
            className="flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
    );
}

function StatusBadge({ status }: { status: LiveStatus["status"] }) {
    if (status === "researching") {
        return (
            <span className="flex items-center gap-1 font-mono text-[10px] text-black/60">
                <Loader2 className="w-3 h-3 animate-spin" />
                Researching…
            </span>
        );
    }
    if (status === "active") {
        return (
            <span className="flex items-center gap-1 font-mono text-[10px] text-black">
                <CheckCircle2 className="w-3 h-3" />
                Done
            </span>
        );
    }
    if (status === "failed") {
        return (
            <span className="flex items-center gap-1 font-mono text-[10px] text-black/40">
                <XCircle className="w-3 h-3" />
                Failed
            </span>
        );
    }
    return (
        <span className="flex items-center gap-1 font-mono text-[10px] text-black/35">
            <Clock className="w-3 h-3" />
            Queued
        </span>
    );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface BulkResearchModalProps {
    onClose: () => void;
}

export function BulkResearchModal({ onClose }: BulkResearchModalProps) {
    const [phase, setPhase] = useState<Phase>("idle");
    const [rawText, setRawText] = useState("");
    const [parseError, setParseError] = useState<string | null>(null);
    const [parsed, setParsed] = useState<ParsedTool[]>([]);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [results, setResults] = useState<BulkSubmitResult[]>([]);
    const [liveTools, setLiveTools] = useState<LiveStatus[]>([]);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Focus textarea on open
    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    // Keyboard: Escape to close
    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [onClose]);

    // Stop polling on unmount
    useEffect(() => {
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, []);

    // ── Parse ──────────────────────────────────────────────────────────────────

    const handleParse = useCallback(async () => {
        if (!rawText.trim()) return;
        setParseError(null);
        setPhase("parsing");

        const res = await parseBulkInput(rawText);

        if (res.error || !res.tools.length) {
            setParseError(res.error ?? "No tools found. Try adding more names or URLs.");
            setPhase("idle");
            return;
        }

        setParsed(res.tools);
        setSelected(new Set(res.tools.map((_, i) => i))); // select all by default
        setPhase("previewing");
    }, [rawText]);

    // ── Poll ──────────────────────────────────────────────────────────────────

    const pollStatus = useCallback(async (ids: string[]) => {
        try {
            const res = await fetch(`/api/research/bulk-status?ids=${ids.join(",")}`);
            if (!res.ok) return;
            const data: Array<{
                id: string; name: string; status: string;
                overallScore?: string | null; logoUrl?: string | null; websiteUrl?: string;
            }> = await res.json();

            setLiveTools(prev => prev.map(lt => {
                const updated = data.find(d => d.id === lt.id);
                if (!updated) return lt;
                return {
                    ...lt,
                    status: updated.status as LiveStatus["status"],
                    overallScore: updated.overallScore,
                    logoUrl: updated.logoUrl ?? lt.logoUrl,
                };
            }));

            // Stop polling if all tools are done/failed
            const allDone = data.every(d => d.status === "active" || d.status === "failed");
            if (allDone && pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
            }
        } catch { /* ignore poll errors */ }
    }, []);

    // ── Submit ─────────────────────────────────────────────────────────────────

    const handleSubmit = useCallback(async () => {
        const toSubmit = parsed.filter((_, i) => selected.has(i));
        if (!toSubmit.length) return;

        setSubmitError(null);
        setPhase("submitting");

        try {
            const { results: res } = await bulkSubmitAndResearch(toSubmit);
            setResults(res);

            // Seed live tools from results that have toolIds
            const queued: LiveStatus[] = res
                .filter(r => r.toolId && r.status === "queued")
                .map(r => {
                    let domain = "";
                    try { domain = new URL(r.url).hostname.replace("www.", ""); } catch { /* */ }
                    return {
                        id: r.toolId!,
                        name: r.name,
                        url: r.url,
                        status: "queued" as const,
                        logoUrl: domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : null,
                    };
                });

            setLiveTools(queued);
            setPhase("live");

            // Start polling if there are tools to watch
            if (queued.length > 0) {
                pollRef.current = setInterval(async () => {
                    await pollStatus(queued.map(t => t.id));
                }, 4000);
            }
        } catch (err) {
            // Submit error — show user-facing message
            setSubmitError("Something went wrong. Please try again.");
            setPhase("previewing");
        }
    }, [parsed, selected, pollStatus]);

    // ── Helpers ────────────────────────────────────────────────────────────────

    const toggleSelect = (i: number) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(i)) next.delete(i); else next.add(i);
            return next;
        });
    };

    const toggleAll = () => {
        if (selected.size === parsed.length) setSelected(new Set());
        else setSelected(new Set(parsed.map((_, i) => i)));
    };

    const doneCount   = liveTools.filter(t => t.status === "active").length;
    const failedCount = liveTools.filter(t => t.status === "failed").length;
    const totalCount  = liveTools.length;
    const allFinished = totalCount > 0 && (doneCount + failedCount) === totalCount;

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Panel */}
            <div className="relative z-10 w-full max-w-2xl bg-[#F3F3EF] border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-[85vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-start justify-between px-6 py-4 border-b border-black">
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <Layers className="w-3.5 h-3.5" />
                            <span className="font-mono text-[10px] uppercase tracking-widest text-black/50">
                                Bulk Research
                            </span>
                        </div>
                        <h2 className="font-serif text-xl font-normal leading-tight">
                            {phase === "idle" || phase === "parsing"
                                ? "Research multiple tools at once"
                                : phase === "previewing"
                                ? `${parsed.length} tool${parsed.length !== 1 ? "s" : ""} found`
                                : phase === "submitting"
                                ? "Adding tools to queue…"
                                : allFinished
                                ? `${doneCount} of ${totalCount} researched`
                                : `Researching ${totalCount} tool${totalCount !== 1 ? "s" : ""}…`}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="mt-0.5 p-1 hover:bg-black hover:text-white transition-colors border border-transparent hover:border-black"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* ── Phase: idle / parsing ── */}
                {(phase === "idle" || phase === "parsing") && (
                    <div className="p-6">
                        <p className="font-mono text-xs text-black/55 leading-relaxed mb-4">
                            Paste tool names, URLs, or a mix of both. AI extracts and queues each tool for research immediately.
                        </p>
                        <textarea
                            ref={textareaRef}
                            value={rawText}
                            onChange={e => setRawText(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                    e.preventDefault();
                                    handleParse();
                                }
                            }}
                            disabled={phase === "parsing"}
                            placeholder={`Paste anything — tool names, URLs, or notes:\n\nnotion.so, Linear, https://clay.com\nFigma - we use for design\ncursor.sh\nGong AI, ZoomInfo, Salesforce\n\nAI will extract and queue each one.`}
                            rows={9}
                            className="w-full resize-none bg-white border border-black px-4 py-3 font-mono text-sm text-black placeholder:text-black/25 focus:outline-none focus:ring-1 focus:ring-black"
                        />
                        {parseError && (
                            <div className="flex items-center gap-2 mt-2 text-black/60">
                                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="font-mono text-xs">{parseError}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between mt-4">
                            <span className="font-mono text-[10px] text-black/30">
                                ⌘↵ to parse
                            </span>
                            <button
                                onClick={handleParse}
                                disabled={!rawText.trim() || phase === "parsing"}
                                className="flex items-center gap-2 bg-black text-white px-5 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-40 shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                            >
                                {phase === "parsing"
                                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Extracting…</>
                                    : <>Parse &amp; Preview <ArrowRight className="w-3.5 h-3.5" /></>
                                }
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Phase: previewing ── */}
                {phase === "previewing" && (
                    <div className="p-6">
                        {submitError && (
                            <div className="flex items-center gap-2 mb-4 bg-white border border-black/20 px-3 py-2">
                                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-black/50" />
                                <span className="font-mono text-xs text-black/60">{submitError}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">
                                {selected.size} selected
                            </span>
                            <button
                                onClick={toggleAll}
                                className="font-mono text-[10px] uppercase tracking-widest text-black/50 hover:text-black underline underline-offset-2"
                            >
                                {selected.size === parsed.length ? "Deselect all" : "Select all"}
                            </button>
                        </div>

                        <div className="border border-black bg-white overflow-hidden max-h-72 overflow-y-auto">
                            {parsed.map((tool, i) => {
                                let domain = "";
                                try { domain = new URL(tool.url).hostname.replace("www.", ""); } catch { /* */ }
                                return (
                                    <label
                                        key={i}
                                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[#F3F3EF] border-b border-black/06 last:border-0 transition-colors"
                                    >
                                        {/* Checkbox */}
                                        <div
                                            onClick={() => toggleSelect(i)}
                                            className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors ${
                                                selected.has(i) ? "bg-black border-black" : "border-black/30 bg-white"
                                            }`}
                                        >
                                            {selected.has(i) && (
                                                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                                    <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                        {/* Favicon */}
                                        {domain && (
                                            <div className="w-5 h-5 border border-black/10 bg-[#F3F3EF] flex items-center justify-center flex-shrink-0">
                                                <Favicon domain={domain} size={12} />
                                            </div>
                                        )}
                                        {/* Name + URL */}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-mono text-xs font-medium text-black truncate">{tool.name}</div>
                                            <div className="font-mono text-[10px] text-black/40 truncate">{domain || tool.url}</div>
                                        </div>
                                        {/* Confidence */}
                                        {tool.confidence === "medium" && (
                                            <span className="font-mono text-[9px] text-black/30 uppercase tracking-widest flex-shrink-0">
                                                inferred
                                            </span>
                                        )}
                                    </label>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <button
                                onClick={() => setPhase("idle")}
                                className="flex items-center gap-1.5 font-mono text-xs text-black/50 hover:text-black transition-colors"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={selected.size === 0}
                                className="flex items-center gap-2 bg-black text-white px-5 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-40 shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                            >
                                Research {selected.size} Tool{selected.size !== 1 ? "s" : ""} <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Phase: submitting ── */}
                {phase === "submitting" && (
                    <div className="p-8 flex flex-col items-center justify-center gap-4 min-h-[200px]">
                        <Loader2 className="w-6 h-6 animate-spin text-black/40" />
                        <p className="font-mono text-sm text-black/50">Adding tools to workspace…</p>
                    </div>
                )}

                {/* ── Phase: live ── */}
                {phase === "live" && (
                    <div className="p-6">
                        {/* Progress bar */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="font-mono text-[10px] text-black/40 uppercase tracking-widest">
                                    {allFinished ? "Research complete" : "Research in progress"}
                                </span>
                                <span className="font-mono text-[10px] text-black/40">
                                    {doneCount + failedCount} / {totalCount}
                                </span>
                            </div>
                            <div className="h-[2px] bg-black/10 w-full">
                                <div
                                    className="h-full bg-black transition-all duration-700"
                                    style={{ width: totalCount ? `${((doneCount + failedCount) / totalCount) * 100}%` : "0%" }}
                                />
                            </div>
                        </div>

                        {/* Tool list */}
                        <div className="border border-black bg-white overflow-hidden max-h-80 overflow-y-auto mb-4">
                            {liveTools.map((tool, i) => {
                                let domain = "";
                                try { domain = new URL(tool.url).hostname.replace("www.", ""); } catch { /* */ }
                                const isActive = tool.status === "researching";
                                return (
                                    <div
                                        key={tool.id}
                                        className={`flex items-center gap-3 px-4 py-3 border-b border-black/06 last:border-0 transition-colors ${
                                            isActive ? "bg-[#F3F3EF]" : ""
                                        }`}
                                        style={{
                                            animation: `fadeSlideIn 0.2s ease ${i * 0.04}s both`,
                                        }}
                                    >
                                        {/* Favicon */}
                                        <div className="w-5 h-5 border border-black/10 bg-[#F3F3EF] flex items-center justify-center flex-shrink-0">
                                            <Favicon domain={domain} size={12} />
                                        </div>
                                        {/* Name */}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-mono text-xs font-medium text-black truncate">{tool.name}</div>
                                            <div className="font-mono text-[9px] text-black/35 truncate">{domain}</div>
                                        </div>
                                        {/* Status */}
                                        <StatusBadge status={tool.status} />
                                        {/* Score if done */}
                                        {tool.status === "active" && tool.overallScore && (
                                            <span className="font-mono text-xs font-medium text-black ml-2 flex-shrink-0">
                                                {Math.round(parseFloat(tool.overallScore) * 10)}/100
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                            {/* Non-queued results (duplicates, errors) */}
                            {results
                                .filter(r => r.status !== "queued")
                                .map((r, i) => {
                                    let domain = "";
                                    try { domain = new URL(r.url).hostname.replace("www.", ""); } catch { /* */ }
                                    return (
                                        <div key={`skip-${i}`}
                                            className="flex items-center gap-3 px-4 py-3 border-b border-black/06 last:border-0 opacity-50">
                                            <div className="w-5 h-5 border border-black/10 bg-[#F3F3EF] flex items-center justify-center flex-shrink-0">
                                                <Favicon domain={domain} size={12} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-mono text-xs text-black truncate">{r.name}</div>
                                            </div>
                                            <span className="font-mono text-[10px] text-black/40 uppercase tracking-widest">
                                                {r.status === "duplicate" ? "Already in workspace" : r.status === "limit_reached" ? "Plan limit" : "Error"}
                                            </span>
                                        </div>
                                    );
                                })}
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="font-mono text-[10px] text-black/35 leading-relaxed max-w-xs">
                                {allFinished
                                    ? "All done. Reports are in your tool database."
                                    : "Research runs in the background — you can close this window."}
                            </p>
                            <div className="flex gap-2">
                                <a
                                    href="/queue"
                                    className="font-mono text-xs text-black/50 hover:text-black underline underline-offset-2 transition-colors px-3 py-2"
                                >
                                    View Queue
                                </a>
                                <button
                                    onClick={onClose}
                                    className="flex items-center gap-2 bg-black text-white px-5 py-2 font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                                >
                                    Done <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

// ─── Trigger button (self-contained, mounts modal on click) ───────────────────

export function BulkResearchButton() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 border border-black px-4 py-2 font-mono text-sm bg-white text-black hover:bg-black hover:text-white transition-colors whitespace-nowrap"
            >
                <Layers className="h-4 w-4" />
                Bulk Research
            </button>
            {open && <BulkResearchModal onClose={() => setOpen(false)} />}
        </>
    );
}
