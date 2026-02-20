"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ResearchStream({ toolId }: { toolId: string }) {
    const [logs, setLogs] = useState<{ message: string, timestamp: string }[]>([]);
    const [status, setStatus] = useState("initializing");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch(`/api/tools/${toolId}/logs`);
                if (!res.ok) return;
                const data = await res.json() as {
                    logs?: { message: string; timestamp: string }[];
                    status?: string;
                    errorMessage?: string | null;
                };

                if (data.logs) setLogs(data.logs);
                if (data.status) setStatus(data.status);
                if (data.errorMessage) setErrorMessage(data.errorMessage);

                if (data.status === "active" || data.status === "failed") {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    if (data.status === "active") router.refresh();
                }
            } catch {
                // Silent — polling will retry
            }
        };

        // Poll every 2.5s (was 1s — reduced to cut server load)
        fetchLogs();
        intervalRef.current = setInterval(fetchLogs, 2500);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [toolId, router]);

    // Auto-scroll to bottom
    const bottomRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    if (logs.length === 0 && status !== "researching") return null;

    const statusLabel =
        status === "researching" ? "RUNNING" :
        status === "active" ? "COMPLETE" :
        status === "failed" ? "FAILED" :
        status.toUpperCase();

    return (
        <div className="border border-black">
            {/* Header */}
            <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest font-bold">Research Agent Logs</span>
                <span className={`font-mono text-xs uppercase tracking-widest border border-black px-2 py-0.5 ${
                    status === "researching" ? "animate-pulse" :
                    status === "failed" ? "border-red-600 text-red-600" :
                    status === "active" ? "bg-black text-white" :
                    ""
                }`}>
                    {statusLabel}
                </span>
            </div>

            {/* Log Area */}
            <div className="h-48 overflow-y-auto p-4 font-mono text-xs space-y-1.5">
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

                {status === "researching" && (
                    <div className="flex items-center gap-2 text-neutral-400 pt-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Processing...</span>
                    </div>
                )}

                {status === "active" && (
                    <div className="flex items-center gap-2 text-black font-medium pt-1 border-t border-neutral-200 mt-2">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Research complete. Report generated.</span>
                    </div>
                )}

                {status === "failed" && (
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
