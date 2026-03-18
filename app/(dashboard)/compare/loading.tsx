import { ArrowRightLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompareLoading() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <ArrowRightLeft className="h-6 w-6" />
                Compare Tools
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-4 pt-16">
                    {["Overall Score", "Pricing", "Summary", "Pros", "Cons", "Features"].map(label => (
                        <Skeleton key={label} className="h-10 w-full" />
                    ))}
                </div>
                {[0, 1].map(i => (
                    <div key={i} className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        {[1, 2, 3, 4, 5, 6].map(j => (
                            <Skeleton key={j} className="h-10 w-full" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
