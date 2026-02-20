"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, ChevronLeft } from "lucide-react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

export default function ToolDetailError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="p-4 border border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <AlertTriangle className="h-10 w-10" />
            </div>
            <div className="space-y-2">
                <h2 className="font-serif text-2xl font-normal">Something went wrong</h2>
                <p className="font-mono text-sm text-neutral-500 max-w-sm">
                    {error.digest
                        ? `Failed to load this tool. Ref: ${error.digest}`
                        : "Failed to load this tool's details. Please try again."}
                </p>
            </div>
            <div className="flex gap-3">
                <Link
                    href="/tools"
                    className="flex items-center gap-2 border border-black px-4 py-2 font-mono text-sm hover:bg-neutral-100 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Tools
                </Link>
                <button
                    onClick={reset}
                    className="flex items-center gap-2 bg-black text-white border border-black px-4 py-2 font-mono text-sm hover:bg-neutral-800 transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                </button>
            </div>
        </div>
    );
}
