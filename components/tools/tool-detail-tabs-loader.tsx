"use client";

import nextDynamic from "next/dynamic";

function TabsLoadingSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex gap-1 border-b border-black pb-0">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-9 w-20 bg-neutral-100 animate-pulse" />
                ))}
            </div>
            <div className="space-y-3 pt-2">
                <div className="h-4 w-3/4 bg-neutral-100 animate-pulse" />
                <div className="h-4 w-full bg-neutral-100 animate-pulse" />
                <div className="h-4 w-5/6 bg-neutral-100 animate-pulse" />
                <div className="h-4 w-2/3 bg-neutral-100 animate-pulse" />
                <div className="h-20 w-full bg-neutral-100 animate-pulse mt-4" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-24 bg-neutral-100 animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export const ToolDetailTabsLoader = nextDynamic(
    () => import("@/components/tools/tool-detail-tabs").then((m) => m.ToolDetailTabs),
    { ssr: false, loading: () => <TabsLoadingSkeleton /> }
);
