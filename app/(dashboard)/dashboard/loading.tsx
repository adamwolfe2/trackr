function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-4 w-32" />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border border-black p-5 space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                ))}
            </div>

            {/* AI Nativeness Score skeleton */}
            <div className="border border-black p-5 space-y-3">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-3 w-64" />
            </div>

            {/* Two-column layout */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                {/* Recent Tools */}
                <div className="lg:col-span-4 border border-black">
                    <div className="border-b border-black px-5 py-3">
                        <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="p-4 space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-7 w-7" />
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-2.5 w-16" />
                                    </div>
                                </div>
                                <Skeleton className="h-4 w-8" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-3 border border-black">
                    <div className="border-b border-black px-5 py-3">
                        <Skeleton className="h-3 w-28" />
                    </div>
                    <div className="p-4 space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-start justify-between gap-3">
                                <div className="space-y-1.5">
                                    <Skeleton className="h-3.5 w-28" />
                                    <Skeleton className="h-2.5 w-20" />
                                </div>
                                <Skeleton className="h-5 w-14" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
