"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Terminal, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ResearchStream({ toolId }: { toolId: string }) {
    const [logs, setLogs] = useState<{ message: string, timestamp: string }[]>([]);
    const [status, setStatus] = useState("initializing");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Initial fetch
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch(`/api/tools/${toolId}/logs`);
                if (!res.ok) return;
                const data = await res.json();

                // @ts-ignore
                if (data.logs) setLogs(data.logs);
                // @ts-ignore
                if (data.status) setStatus(data.status);

                if (data.status === 'active' || data.status === 'failed') {
                    // Stop polling if complete
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    if (data.status === 'active') router.refresh();
                }
            } catch (e) {
                console.error(e);
            }
        };

        // Poll every 1 second
        fetchLogs();
        intervalRef.current = setInterval(fetchLogs, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [toolId, router]);

    // Auto-scroll to bottom
    const bottomRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    if (logs.length === 0 && status !== 'researching') return null;

    return (
        <Card className="bg-zinc-950 text-green-400 border-zinc-800 font-mono text-sm shadow-xl">
            <CardHeader className="border-b border-zinc-800 pb-2 bg-zinc-900/50">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Terminal className="h-4 w-4" />
                        Research Agent Logs
                    </CardTitle>
                    <Badge variant="outline" className={`${status === 'researching' ? 'animate-pulse text-green-400 border-green-400' : status === 'failed' ? 'text-red-400 border-red-400' : 'text-zinc-500'}`}>
                        {status === 'researching' ? 'RUNNING' : status.toUpperCase()}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="h-[250px] overflow-y-auto p-4 space-y-2 font-mono text-xs scrollbar-thin scrollbar-thumb-zinc-800">
                {logs.map((log, i) => (
                    <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className="text-zinc-600 shrink-0">
                            [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                        </span>
                        <div className="flex-1">
                            {i === logs.length - 1 && status === 'researching' ? (
                                <span className="text-green-400 font-bold">{log.message}</span>
                            ) : (
                                <span className="text-green-400/80">{log.message}</span>
                            )}
                        </div>
                    </div>
                ))}

                {status === 'researching' && (
                    <div className="flex items-center gap-2 text-zinc-500 animate-pulse mt-2 pt-2 border-t border-zinc-800/50">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Thinking...</span>
                    </div>
                )}

                {status === 'active' && (
                    <div className="flex items-center gap-2 text-emerald-500 mt-2 pt-2 border-t border-zinc-800/50 font-bold">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Research gathered and synthesized successfully.</span>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="flex items-center gap-2 text-red-500 mt-2 pt-2 border-t border-zinc-800/50 font-bold">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Research process failed. Please retry.</span>
                    </div>
                )}
                <div ref={bottomRef} />
            </CardContent>
        </Card>
    );
}
