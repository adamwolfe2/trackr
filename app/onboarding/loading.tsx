function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function OnboardingLoading() {
    return (
        <div className="min-h-screen bg-[#F3F3EF] flex items-center justify-center px-4">
            <div className="w-full max-w-2xl space-y-8">
                {/* Logo placeholder */}
                <div className="flex justify-center">
                    <Skeleton className="h-8 w-32" />
                </div>

                {/* Step indicators */}
                <div className="flex items-center justify-center gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <Skeleton className="h-7 w-7" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    ))}
                </div>

                {/* Form card */}
                <div className="border border-black bg-white p-8 space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-48" />
                        <Skeleton className="h-4 w-72" />
                    </div>

                    {/* Form fields */}
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-28" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    </div>

                    {/* Button */}
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </div>
    );
}
