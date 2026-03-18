"use client";

import { useState } from "react";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getUserFriendlyError } from "@/lib/utils/error-messages";

interface ResearchButtonProps {
    toolId: string;
    isResearching: boolean;
    hasReport: boolean;
    isFailed?: boolean;
}

export function ResearchButton({ toolId, isResearching, hasReport, isFailed }: ResearchButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleResearch = async () => {
        setIsLoading(true);
        const toastId = toast.loading("Starting research...");

        try {
            const res = await fetch("/api/research/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ toolId }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({ error: "Research failed" }));
                throw new Error(data.error ?? "Research failed");
            }

            toast.success("Research started — this takes 1-2 minutes. The page will update automatically.", { id: toastId });
            // Refresh the page data to show "researching" status
            router.refresh();
        } catch (error: unknown) {
            toast.error(getUserFriendlyError(error), { id: toastId });
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
