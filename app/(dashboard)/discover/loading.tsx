function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function DiscoverLoading() {
    return (
        <div className="space-y-10">
            {/* AI News section skeleton */}
            <section className="space-y-5">
                <div className="space-y-2">
                    <Skel className="h-3 w-16" />
                    <Skel className="h-8 w-48" />
                    <Skel className="h-3 w-72" />
                </div>
                <div className="grid gap-0 md:grid-cols-2 border border-black">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className={`p-5 space-y-3 bg-white ${i % 2 === 1 ? "md:border-r border-black" : ""} ${i < 3 ? "border-b border-black" : ""}`}
                        >
                            <Skel className="h-2.5 w-20" />
                            <Skel className="h-5 w-full" />
                            <Skel className="h-3 w-full" />
                            <Skel className="h-3 w-3/4" />
                            <div className="flex gap-2 pt-2 border-t border-neutral-100">
                                <Skel className="h-7 flex-1" />
                                <Skel className="h-7 w-16" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Suggestions section skeleton */}
            <section className="space-y-5">
                <Skel className="h-8 w-56" />
                <div className="grid gap-0 md:grid-cols-2 lg:grid-cols-3 border border-black">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`p-5 space-y-3 bg-white ${i < 3 ? "lg:border-r border-black" : ""} ${i % 2 === 1 ? "md:border-r border-black lg:border-r-0" : ""}`}
                        >
                            <Skel className="h-5 w-32" />
                            <Skel className="h-3 w-full" />
                            <Skel className="h-3 w-4/5" />
                            <Skel className="h-8 w-full" />
                            <div className="flex gap-2 pt-2 border-t border-neutral-100">
                                <Skel className="h-8 flex-1" />
                                <Skel className="h-8 w-10" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
