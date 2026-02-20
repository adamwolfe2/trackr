import { Skeleton } from "@/components/ui/skeleton";

export default function ToolsLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-52" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-10 w-28" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border border-black bg-white p-4">
                <Skeleton className="h-10 w-full sm:w-72" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 w-40" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <Skeleton className="h-28 w-full rounded-none" />
                        <div className="p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-28" />
                                <Skeleton className="h-5 w-16" />
                            </div>
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-4/5" />
                            <div className="flex gap-2">
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-5 w-20" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
