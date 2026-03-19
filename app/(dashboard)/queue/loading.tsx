import { Skeleton } from "@/components/ui/skeleton";

export default function QueueLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Research Queue</h1>
                <Skeleton className="h-6 w-20" />
            </div>
            <div className="grid gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="border border-black p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-28" />
                            </div>
                        </div>
                        <Skeleton className="h-6 w-20" />
                    </div>
                ))}
            </div>
        </div>
    );
}
