export default function BillingLoading() {
    return (
        <div className="space-y-8 animate-pulse">
            <div>
                <div className="h-8 w-48 bg-neutral-200 mb-2" />
                <div className="h-4 w-80 bg-neutral-200" />
            </div>

            {/* Plan cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border border-black p-5 space-y-4">
                        <div className="h-4 w-20 bg-neutral-200" />
                        <div className="h-8 w-24 bg-neutral-200" />
                        <div className="h-3 w-full bg-neutral-200" />
                        <div className="space-y-2">
                            {Array.from({ length: 4 }).map((_, j) => (
                                <div key={j} className="h-3 w-32 bg-neutral-200" />
                            ))}
                        </div>
                        <div className="h-10 w-full bg-neutral-200" />
                    </div>
                ))}
            </div>

            {/* Usage stats skeleton */}
            <div className="border border-black bg-white p-6 space-y-5">
                <div className="h-6 w-40 bg-neutral-200" />
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i}>
                        <div className="flex items-baseline justify-between mb-1.5">
                            <div className="h-3 w-28 bg-neutral-200" />
                            <div className="h-4 w-16 bg-neutral-200" />
                        </div>
                        <div className="h-2 bg-neutral-200 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}
