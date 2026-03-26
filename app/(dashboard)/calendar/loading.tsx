function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function CalendarLoading() {
    return (
        <div className="space-y-6 p-6 font-mono">
            <div className="space-y-2">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-64" />
            </div>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="grid grid-cols-7 gap-2 min-w-[700px]">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="border border-black p-3 space-y-2">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
            </div>
            </div>
        </div>
    );
}
