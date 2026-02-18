"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function QueueAutoRefresh({ runningCount }: { runningCount: number }) {
    const router = useRouter();

    useEffect(() => {
        if (runningCount === 0) return;

        const interval = setInterval(() => {
            router.refresh();
        }, 3000);

        return () => clearInterval(interval);
    }, [runningCount, router]);

    if (runningCount === 0) return null;

    return (
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-50" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-black" />
            </span>
            Live
        </div>
    );
}
