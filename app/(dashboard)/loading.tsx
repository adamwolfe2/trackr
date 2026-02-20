import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-36" />
                <Skeleton className="h-4 w-28" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px border border-black bg-black">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white p-4 space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="border border-black bg-white">
                <div className="border-b border-black px-5 py-3">
                    <Skeleton className="h-3 w-28" />
                </div>
                <div className="divide-y divide-neutral-100">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-5 py-3">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 flex-1" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                <div className="lg:col-span-4 border border-black">
                    <div className="border-b border-black px-5 py-3">
                        <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="p-4 space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-7 w-7" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                                <Skeleton className="h-5 w-8" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-3 border border-black">
                    <div className="border-b border-black px-5 py-3">
                        <Skeleton className="h-3 w-28" />
                    </div>
                    <div className="p-4 space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-20" />
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
