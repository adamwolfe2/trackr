"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { performDeepResearch } from "@/lib/actions/research";
import { useToast } from "@/lib/hooks/use-toast";

interface ResearchButtonProps {
    toolId: string;
    isResearching: boolean;
    hasReport: boolean;
}

export function ResearchButton({ toolId, isResearching, hasReport }: ResearchButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleResearch = async () => {
        setIsLoading(true);
        toast({
            title: "Starting Deep Research",
            description: "Firecrawl is scraping the site. AI will analyze it shortly.",
        });

        try {
            const result = await performDeepResearch(toolId);
            if (!result.success) {
                throw new Error(result.error);
            }
            toast({
                title: "Research Complete",
                description: "The report has been generated.",
                className: "bg-emerald-50 border-emerald-200 text-emerald-800",
            });
        } catch (error: any) {
            toast({
                title: "Research Failed",
                description: error.message,
                variant: "destructive",
            });
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
