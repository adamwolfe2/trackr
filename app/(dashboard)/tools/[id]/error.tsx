"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function ToolDetailError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="p-4 bg-red-50 rounded-full">
                <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Something went wrong</h2>
                <p className="text-muted-foreground max-w-sm">
                    {error.message || "Failed to load this tool's details. Please try again."}
                </p>
            </div>
            <div className="flex gap-3">
                <Button variant="outline" asChild>
                    <Link href="/tools">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Tools
                    </Link>
                </Button>
                <Button onClick={reset}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                </Button>
            </div>
        </div>
    );
}
