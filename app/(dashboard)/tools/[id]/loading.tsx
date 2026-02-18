import { Skeleton } from "@/components/ui/skeleton";

export default function ToolDetailLoading() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <Skeleton className="h-4 w-28" />
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-9 w-48" />
                            <Skeleton className="h-6 w-20" />
                        </div>
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-36" />
                        <Skeleton className="h-12 w-16" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div className="border border-black bg-white p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                        <Skeleton className="h-5 w-40 mb-4" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>

                    <div className="border border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex gap-2 p-4 border-b border-black">
                            {["Analysis", "Features", "History", "Notes"].map((tab) => (
                                <Skeleton key={tab} className="h-8 w-24" />
                            ))}
                        </div>
                        <div className="p-6 space-y-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-12" />
                                    </div>
                                    <Skeleton className="h-2 w-full" />
                                    <Skeleton className="h-3 w-3/4" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="border border-black bg-white p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                        <Skeleton className="h-5 w-28 mb-4" />
                        <div className="space-y-4">
                            <div><Skeleton className="h-3 w-20 mb-2" /><div className="flex gap-2"><Skeleton className="h-5 w-16" /><Skeleton className="h-5 w-20" /></div></div>
                            <div><Skeleton className="h-3 w-24 mb-2" /><Skeleton className="h-4 w-32" /></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
