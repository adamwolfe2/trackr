"use client";

import { useState } from "react";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { performDeepResearch } from "@/lib/actions/research";
import { toast } from "sonner";

interface ResearchButtonProps {
    toolId: string;
    isResearching: boolean;
    hasReport: boolean;
    isFailed?: boolean;
}

export function ResearchButton({ toolId, isResearching, hasReport, isFailed }: ResearchButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleResearch = async () => {
        setIsLoading(true);
        const toastId = toast.loading("Starting research — scraping site...");

        try {
            const result = await performDeepResearch(toolId);
            if (!result.success) {
                throw new Error(result.error ?? "Research failed");
            }
            toast.success("Research complete. Report generated.", { id: toastId });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Research failed";
            toast.error(message, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const label = isFailed ? "Retry Research" : hasReport ? "Re-Analyze" : "Run Research";
    const Icon = isFailed || hasReport ? RefreshCw : Sparkles;

    return (
        <button
            onClick={handleResearch}
            disabled={isLoading || isResearching}
            className="flex items-center gap-2 border border-black bg-white hover:bg-black hover:text-white px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
            {isLoading || isResearching ? (
                <><Loader2 className="h-3 w-3 animate-spin" /> Researching...</>
            ) : (
                <><Icon className="h-3 w-3" /> {label}</>
            )}
        </button>
    );
}
