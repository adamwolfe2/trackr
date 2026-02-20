"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdvertiseError({
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
            <div className="w-10 h-10 border border-black bg-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="font-mono font-bold">!</span>
            </div>
            <div className="space-y-2">
                <h2 className="font-serif text-2xl font-normal">Failed to load campaigns</h2>
                <p className="font-mono text-sm text-neutral-500 max-w-sm">
                    {error.digest ? `Ref: ${error.digest}` : "Could not load your ad campaigns. Please try again."}
                </p>
            </div>
            <div className="flex gap-3">
                <button onClick={reset} className="bg-black text-white border border-black px-4 py-2 font-mono text-sm hover:bg-neutral-800 transition-colors">
                    Retry
                </button>
                <Link href="/dashboard" className="border border-black px-4 py-2 font-mono text-sm hover:bg-neutral-100 transition-colors">
                    Dashboard
                </Link>
            </div>
        </div>
    );
}
