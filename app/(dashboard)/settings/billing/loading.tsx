function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function BillingLoading() {
    return (
        <div className="space-y-8">
            <div>
                <Skel className="h-8 w-48 mb-2" />
                <Skel className="h-4 w-80" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border border-black p-5 space-y-4">
                        <Skel className="h-4 w-20" />
                        <Skel className="h-8 w-24" />
                        <Skel className="h-3 w-full" />
                        <div className="space-y-2">
                            {Array.from({ length: 4 }).map((_, j) => (
                                <Skel key={j} className="h-3 w-32" />
                            ))}
                        </div>
                        <Skel className="h-10 w-full" />
                    </div>
                ))}
            </div>

            <div className="border border-black bg-white p-6 space-y-5">
                <Skel className="h-6 w-40" />
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i}>
                        <div className="flex items-baseline justify-between mb-1.5">
                            <Skel className="h-3 w-28" />
                            <Skel className="h-4 w-16" />
                        </div>
                        <Skel className="h-2 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}
