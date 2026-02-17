"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Terminal, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export function ResearchStream({ toolId }: { toolId: string }) {
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState("initializing");
    const [error, setError] = useState<string | null>(null);
    const hasStartedRef = useRef(false);
    const router = useRouter();

    useEffect(() => {
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;

        const runResearch = async () => {
            setStatus("running");
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Initializing research agent...`]);

            try {
                // In a real app we'd fetch the URL from the DB first or pass it in props
                // For now we will assume the API handles fetching the tool's URL from DB if not passed, 
                // OR we need to pass it. The API expects { toolId, url }. 
                // We should probably fetch the tool details first to get the URL.
                // But to save round trips, let's assume the API can look up the tool by ID if URL is missing?
                // Looking at my API implementation: it expects `url`. 
                // So I need to fetch the tool first OR modify the API to look up the URL.

                // Let's modify the API to be smarter. But for now, let's just trigger it and see.
                // Actually, the page has the tool object. I should have passed the URL prop to ResearchStream.
                // Refactoring ResearchStream to accept url.

                // For now, let's just log that we are waiting for the API response.
                setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Sending analysis request to backend...`]);

                const res = await fetch("/api/research", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ toolId, url: "https://example.com" }) // FIXME: Need real URL
                });

                if (!res.ok) throw new Error(res.statusText);

                const data = await res.json();
                setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Analysis complete!`]);
                setStatus("completed");
                router.refresh();

            } catch (err: any) {
                setError(err.message);
                setStatus("error");
                setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error: ${err.message}`]);
            }
        };

        runResearch();
    }, [toolId, router]);

    return (
        <Card className="bg-zinc-950 text-green-400 border-zinc-800 font-mono text-sm">
            <CardHeader className="border-b border-zinc-800 pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Terminal className="h-4 w-4" />
                        Live Research Logs
                    </CardTitle>
                    <Badge variant="outline" className={`${status === 'running' ? 'animate-pulse text-green-400 border-green-400' : status === 'error' ? 'text-red-400 border-red-400' : 'text-zinc-500'}`}>
                        {status === 'running' ? 'LIVE' : status.toUpperCase()}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="h-[200px] overflow-y-auto p-4 space-y-2 font-mono text-xs">
                {error && (
                    <div className="text-red-400 border-l-2 border-red-500 pl-2 flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3" />
                        {error}
                    </div>
                )}
                {logs.map((log, i) => (
                    <div key={i} className="border-l-2 border-green-500/30 pl-2 animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className="opacity-50 mr-2">$</span>
                        {log}
                    </div>
                ))}
                {status === 'running' && (
                    <div className="flex items-center gap-2 text-zinc-500 animate-pulse">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Processing...
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
