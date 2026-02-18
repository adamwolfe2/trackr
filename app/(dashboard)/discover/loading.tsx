import { Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DiscoverLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-purple-600" />
                        Discovery
                    </h1>
                    <p className="text-sm text-muted-foreground">AI-suggested tools based on your active pain points.</p>
                </div>
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-28" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-6 space-y-4">
                        <div className="flex justify-between">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-5 w-16" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-9 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}
