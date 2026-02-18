import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                </div>
                <Skeleton className="h-10 w-[120px]" />
            </div>

            {/* Stats/Grid Skeleton */}
            <div className="grid gap-4 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-[60px] mb-2" />
                            <Skeleton className="h-3 w-[140px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Skeleton */}
            <Card className="min-h-[400px]">
                <CardHeader>
                    <Skeleton className="h-6 w-[150px]" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[200px]" />
                                    <Skeleton className="h-3 w-[150px]" />
                                </div>
                            </div>
                            <Skeleton className="h-8 w-[80px]" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
