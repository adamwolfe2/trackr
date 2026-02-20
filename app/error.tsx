"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

export default function Error({
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
        <div className="flex h-screen w-full flex-col items-center justify-center bg-[#F3F3EF] px-6 text-center">
            <div className="max-w-lg">
                <div className="w-12 h-12 border border-black bg-white flex items-center justify-center mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mx-auto">
                    <span className="font-mono font-bold text-lg">!</span>
                </div>
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-4 block">
                    Error
                </span>
                <h2 className="text-4xl font-serif font-normal mb-4">
                    Something went wrong.
                </h2>
                <p className="font-mono text-sm text-neutral-600 mb-10 leading-relaxed">
                    {error.digest
                        ? `An unexpected error occurred. Reference: ${error.digest}`
                        : "An unexpected error occurred. The team has been notified."}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={reset}
                        className="bg-black text-white px-6 py-3 font-mono text-sm uppercase tracking-wide hover:bg-neutral-800 transition-colors border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="bg-white text-black px-6 py-3 font-mono text-sm uppercase tracking-wide hover:bg-neutral-100 transition-colors border border-black"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
