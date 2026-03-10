"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const RESEARCH_STEPS = [
    { id: 1, label: "Mapping Site", pattern: /step 1/i },
    { id: 2, label: "Scraping Pages", pattern: /step 2/i },
    { id: 3, label: "Searching Reviews", pattern: /step 3/i },
    { id: 4, label: "Trust & Reputation", pattern: /step 4/i },
    { id: 5, label: "Reddit Deep Dive", pattern: /step 5/i },
    { id: 6, label: "Competitive Intel", pattern: /step 6/i },
    { id: 7, label: "AI Synthesis", pattern: /step 7/i },
] as const;

function detectCurrentStep(logs: { message: string }[]): number {
    let step = 0;
    for (const log of logs) {
        for (const s of RESEARCH_STEPS) {
            if (s.pattern.test(log.message) && s.id > step) step = s.id;
        }
    }
    return step;
}

function formatElapsed(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `${s}s`;
}

export function ResearchStream({ toolId, initialStatus }: { toolId: string; initialStatus?: string }) {
    const [logs, setLogs] = useState<{ message: string, timestamp: string }[]>([]);
    const [status, setStatus] = useState(initialStatus ?? "initializing");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [networkError, setNetworkError] = useState(false);
    const [scoreReveal, setScoreReveal] = useState<{ score: string | null; toolName: string } | null>(null);
    const consecutiveFailsRef = useRef(0);
    const router = useRouter();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const triggeredRef = useRef(false);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch(`/api/tools/${toolId}/logs`);
                if (!res.ok) {
                    consecutiveFailsRef.current += 1;
                    if (consecutiveFailsRef.current >= 2) setNetworkError(true);
                    return;
                }
                consecutiveFailsRef.current = 0;
                setNetworkError(false);
                const data = await res.json() as {
                    logs?: { message: string; timestamp: string }[];
                    status?: string;
                    errorMessage?: string | null;
                    score?: string | null;
                    toolName?: string | null;
                };

                if (data.logs) setLogs(data.logs);
                if (data.status) setStatus(data.status);
                if (data.errorMessage) setErrorMessage(data.errorMessage);

                // Fallback: if still queued after first poll, after() may not have fired — trigger via API
                if (data.status === "queued" && !triggeredRef.current) {
                    triggeredRef.current = true;
                    fetch(`/api/research/start`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ toolId }),
                    }).catch(() => { /* fallback trigger failed — polling will retry */ });
                }

                if (data.status === "active" || data.status === "failed") {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    if (timerRef.current) clearInterval(timerRef.current);
                    if (data.status === "active" && !scoreReveal) {
                        setScoreReveal({ score: data.score ?? null, toolName: data.toolName ?? "" });
                    }
                }
            } catch {
                consecutiveFailsRef.current += 1;
                if (consecutiveFailsRef.current >= 2) setNetworkError(true);
            }
        };

        // Poll every 2.5s
        fetchLogs();
        intervalRef.current = setInterval(fetchLogs, 2500);

        // Elapsed timer
        timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [toolId, router]);

    // Auto-dismiss score reveal after 8 seconds
    useEffect(() => {
        if (!scoreReveal) return;
        const timer = setTimeout(() => {
            setScoreReveal(null);
            router.refresh();
        }, 8000);
        return () => clearTimeout(timer);
    }, [scoreReveal, router]);

    // Auto-scroll to bottom
    const bottomRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    if (scoreReveal !== null) {
        return (
            <div className="border border-black bg-[#F3F3EF] p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <span className="font-serif text-xl">Research Complete</span>
                </div>
                {scoreReveal.score && (
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Overall Score</span>
                        <span className="bg-black text-white font-mono text-xl px-3 py-1">
                            {Number(scoreReveal.score).toFixed(1)} / 10
                        </span>
                    </div>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                    <button
                        onClick={() => { setScoreReveal(null); router.refresh(); }}
                        className="border border-black bg-black text-white font-mono text-xs px-4 py-2 hover:bg-neutral-800 transition-colors"
                    >
                        View Full Report
                    </button>
                    <Link
                        href="/compare"
                        onClick={() => setScoreReveal(null)}
                        className="border border-black font-mono text-xs px-4 py-2 hover:bg-black hover:text-white transition-colors"
                    >
                        Compare
                    </Link>
                    <Link
                        href={`/tools?share=${toolId}`}
                        onClick={() => setScoreReveal(null)}
                        className="border border-black font-mono text-xs px-4 py-2 hover:bg-black hover:text-white transition-colors"
                    >
                        Share
                    </Link>
                </div>
                <p className="font-mono text-[10px] text-neutral-400">Auto-loading report in 8 seconds...</p>
            </div>
        );
    }

    if (logs.length === 0 && status !== "researching" && status !== "queued" && status !== "initializing") return null;

    const currentStep = detectCurrentStep(logs);
    const isDone = status === "active";
    const isFailed = status === "failed";

    const statusLabel =
        status === "queued" ? "QUEUED" :
        status === "researching" ? "RUNNING" :
        isDone ? "COMPLETE" :
        isFailed ? "FAILED" :
        status.toUpperCase();

    return (
        <div className="border border-black">
            {/* Header */}
            <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="font-mono text-xs uppercase tracking-widest font-bold">Research Agent</span>
                    {status === "researching" && (
                        <span className="font-mono text-xs text-neutral-400">{formatElapsed(elapsed)}</span>
                    )}
                </div>
                <span className={`font-mono text-xs uppercase tracking-widest border border-black px-2 py-0.5 ${
                    status === "queued" || status === "researching" ? "animate-pulse" :
                    isFailed ? "border-red-600 text-red-600" :
                    isDone ? "bg-black text-white" :
                    ""
                }`}>
                    {statusLabel}
                </span>
            </div>

            {/* Step Progress Bar */}
            <div className="border-b border-black/10 px-5 py-3">
                <div className="flex items-center gap-1">
                    {RESEARCH_STEPS.map((step) => {
                        const isComplete = isDone || step.id < currentStep;
                        const isActive = !isDone && !isFailed && step.id === currentStep;
                        return (
                            <div key={step.id} className="flex-1 flex flex-col items-center gap-1.5">
                                <div className={`h-1.5 w-full transition-all duration-500 ${
                                    isComplete ? "bg-black" :
                                    isActive ? "bg-black/40 animate-pulse" :
                                    "bg-neutral-200"
                                }`} />
                                <span className={`font-mono text-[9px] uppercase tracking-wide hidden sm:block ${
                                    isComplete ? "text-black font-medium" :
                                    isActive ? "text-black" :
                                    "text-neutral-300"
                                }`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
                {status === "researching" && currentStep > 0 && (
                    <p className="font-mono text-[10px] text-neutral-400 mt-2 text-center">
                        Step {currentStep} of 7 · Typically completes in under 2 minutes
                    </p>
                )}
            </div>

            {/* Log Area */}
            <div className="h-40 overflow-y-auto p-4 font-mono text-xs space-y-1.5">
                {logs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                        <span className="text-neutral-400 shrink-0">
                            [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}]
                        </span>
                        <span className={i === logs.length - 1 && status === "researching" ? "text-black font-medium" : "text-neutral-700"}>
                            {log.message}
                        </span>
                    </div>
                ))}

                {(status === "queued" || status === "researching") && !networkError && (
                    <div className="flex items-center gap-2 text-neutral-400 pt-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>{status === "queued" ? "Starting research agents..." : "Processing..."}</span>
                    </div>
                )}

                {networkError && (
                    <div className="flex items-center gap-2 text-amber-600 pt-1 border-t border-neutral-200 mt-2">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        <span>Connection issue — retrying. Research may still be running.</span>
                    </div>
                )}

                {isDone && (
                    <div className="flex items-center gap-2 text-black font-medium pt-1 border-t border-neutral-200 mt-2">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Research complete in {formatElapsed(elapsed)}. Report generated.</span>
                    </div>
                )}

                {isFailed && (
                    <div className="pt-1 border-t border-neutral-200 mt-2 space-y-2">
                        <div className="flex items-center gap-2 text-red-600 font-medium">
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                            <span>Research failed{errorMessage ? `: ${errorMessage}` : ". Please retry."}</span>
                        </div>
                        <div className="bg-neutral-50 border border-neutral-200 p-3 space-y-1.5">
                            <span className="font-bold text-neutral-600 block">Troubleshooting</span>
                            <ul className="list-disc list-inside text-neutral-500 space-y-0.5">
                                <li>Verify the tool&apos;s website URL is correct and publicly accessible</li>
                                <li>Some sites block automated scraping — try a different URL or the tool&apos;s documentation page</li>
                                <li>If this is a timeout, the tool&apos;s site may be slow — retrying usually works</li>
                                <li>Click <strong className="text-black">Retry Research</strong> above to try again</li>
                            </ul>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>
        </div>
    );
}
