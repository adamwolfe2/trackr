function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function PainPointsLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skel className="h-3 w-24" />
                    <Skel className="h-8 w-44" />
                    <Skel className="h-4 w-72" />
                </div>
                <Skel className="h-10 w-36" />
            </div>

            <div className="border border-black">
                <div className="border-b border-black px-5 py-3">
                    <Skel className="h-3 w-24" />
                </div>
                <div className="divide-y divide-neutral-100">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="p-5 flex items-start justify-between gap-4">
                            <div className="space-y-2 flex-1">
                                <Skel className="h-4 w-48" />
                                <Skel className="h-3 w-full" />
                                <Skel className="h-3 w-3/4" />
                                <Skel className="h-5 w-20" />
                            </div>
                            <Skel className="h-8 w-20 flex-shrink-0" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
