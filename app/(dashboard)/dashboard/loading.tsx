function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skel className="h-9 w-48" />
                <Skel className="h-4 w-32" />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border border-black p-5 space-y-2">
                        <Skel className="h-3 w-20" />
                        <Skel className="h-8 w-16" />
                    </div>
                ))}
            </div>

            {/* AI Nativeness Score skeleton */}
            <div className="border border-black p-5 space-y-3">
                <Skel className="h-3 w-36" />
                <Skel className="h-10 w-24" />
                <Skel className="h-3 w-64" />
            </div>

            {/* Two-column layout */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                {/* Recent Tools */}
                <div className="lg:col-span-4 border border-black">
                    <div className="border-b border-black px-5 py-3">
                        <Skel className="h-3 w-24" />
                    </div>
                    <div className="p-4 space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                    <Skel className="h-7 w-7" />
                                    <div className="space-y-1.5">
                                        <Skel className="h-4 w-32" />
                                        <Skel className="h-2.5 w-16" />
                                    </div>
                                </div>
                                <Skel className="h-4 w-8" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-3 border border-black">
                    <div className="border-b border-black px-5 py-3">
                        <Skel className="h-3 w-28" />
                    </div>
                    <div className="p-4 space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-start justify-between gap-3">
                                <div className="space-y-1.5">
                                    <Skel className="h-3.5 w-28" />
                                    <Skel className="h-2.5 w-20" />
                                </div>
                                <Skel className="h-5 w-14" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
