"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

export default function DashboardError({
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
        <div className="flex h-full min-h-[60vh] w-full flex-col items-center justify-center px-6 py-24 text-center">
            <div className="w-10 h-10 border border-black bg-white flex items-center justify-center mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mx-auto">
                <span className="font-mono font-bold">!</span>
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-3 block">
                Dashboard Error
            </span>
            <h2 className="text-2xl font-serif font-normal mb-3 max-w-sm">
                Something went wrong loading this page.
            </h2>
            <p className="font-mono text-sm text-neutral-500 mb-8 max-w-xs leading-relaxed">
                {error.digest ? `Ref: ${error.digest}` : "An unexpected error occurred."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                    onClick={reset}
                    className="bg-black text-white px-5 py-2.5 font-mono text-xs uppercase tracking-wide hover:bg-neutral-800 transition-colors border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                    Try Again
                </button>
                <Link
                    href="/"
                    className="bg-white text-black px-5 py-2.5 font-mono text-xs uppercase tracking-wide hover:bg-neutral-50 transition-colors border border-black"
                >
                    Dashboard Home
                </Link>
            </div>
        </div>
    );
}
