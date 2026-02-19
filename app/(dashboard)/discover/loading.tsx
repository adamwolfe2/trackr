export default function DiscoverLoading() {
    return (
        <div className="space-y-10">
            {/* AI News section skeleton */}
            <section className="space-y-5">
                <div>
                    <div className="h-3 w-16 bg-neutral-200 animate-pulse mb-2" />
                    <div className="h-8 w-48 bg-neutral-200 animate-pulse" />
                    <div className="h-3 w-72 bg-neutral-200 animate-pulse mt-2" />
                </div>
                <div className="grid gap-0 md:grid-cols-2 border border-black">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className={`p-5 space-y-3 bg-white ${i % 2 === 1 ? "md:border-r border-black" : ""} ${i < 3 ? "border-b border-black" : ""}`}
                        >
                            <div className="h-2.5 w-20 bg-neutral-200 animate-pulse" />
                            <div className="h-5 w-full bg-neutral-200 animate-pulse" />
                            <div className="h-3 w-full bg-neutral-200 animate-pulse" />
                            <div className="h-3 w-3/4 bg-neutral-200 animate-pulse" />
                            <div className="flex gap-2 pt-2 border-t border-neutral-100">
                                <div className="h-7 flex-1 bg-neutral-200 animate-pulse" />
                                <div className="h-7 w-16 bg-neutral-200 animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Suggestions section skeleton */}
            <section className="space-y-5">
                <div className="h-8 w-56 bg-neutral-200 animate-pulse" />
                <div className="grid gap-0 md:grid-cols-2 lg:grid-cols-3 border border-black">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`p-5 space-y-3 bg-white ${i < 3 ? "lg:border-r border-black" : ""} ${i % 2 === 1 ? "md:border-r border-black lg:border-r-0" : ""}`}
                        >
                            <div className="h-5 w-32 bg-neutral-200 animate-pulse" />
                            <div className="h-3 w-full bg-neutral-200 animate-pulse" />
                            <div className="h-3 w-4/5 bg-neutral-200 animate-pulse" />
                            <div className="h-8 w-full bg-neutral-200 animate-pulse" />
                            <div className="flex gap-2 pt-2 border-t border-neutral-100">
                                <div className="h-8 flex-1 bg-neutral-200 animate-pulse" />
                                <div className="h-8 w-10 bg-neutral-200 animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
