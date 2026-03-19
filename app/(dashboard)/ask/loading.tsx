import { Skeleton } from "@/components/ui/skeleton";

export default function AskLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-80" />
            </div>

            <div className="border border-black bg-white p-6 space-y-4">
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 pt-4 border-t border-black">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
        </div>
    );
}
