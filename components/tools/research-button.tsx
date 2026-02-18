"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { performDeepResearch } from "@/lib/actions/research";
import { toast } from "sonner";

interface ResearchButtonProps {
    toolId: string;
    isResearching: boolean;
    hasReport: boolean;
}

export function ResearchButton({ toolId, isResearching, hasReport }: ResearchButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleResearch = async () => {
        setIsLoading(true);
        const toastId = toast.loading("Starting deep research — scraping site...");

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

    return (
        <Button
            onClick={handleResearch}
            disabled={isLoading || isResearching}
            variant={hasReport ? "outline" : "default"}
            size="sm"
            className={!hasReport ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
        >
            {isLoading || isResearching ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Researching...
                </>
            ) : hasReport ? (
                <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Re-Analyze
                </>
            ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Run Deep Analysis
                </>
            )}
        </Button>
    );
}
