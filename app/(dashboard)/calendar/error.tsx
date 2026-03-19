"use client";
import * as Sentry from "@sentry/nextjs";

import { useEffect } from "react";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">Something went wrong</p>
            <p className="font-mono text-sm text-neutral-600 max-w-md text-center">
                An unexpected error occurred. Please try again.
            </p>
            <button
                onClick={reset}
                className="border border-black bg-black text-white font-mono text-xs uppercase tracking-widest px-4 py-2 hover:bg-neutral-800 transition-colors"
            >
                Try Again
            </button>
        </div>
    );
}
