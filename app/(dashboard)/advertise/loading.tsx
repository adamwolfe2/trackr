function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function AdvertiseLoading() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-2">
                    <Skel className="h-3 w-20" />
                    <Skel className="h-8 w-36" />
                    <Skel className="h-4 w-72" />
                </div>
                <Skel className="h-10 w-32 shrink-0" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border border-black">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={`p-6 ${i < 2 ? "border-b sm:border-b-0 sm:border-r border-black" : ""}`}>
                        <Skel className="h-3 w-20 mb-3" />
                        <Skel className="h-7 w-12 mb-1" />
                        <Skel className="h-3 w-28" />
                    </div>
                ))}
            </div>

            <div className="border border-black">
                <div className="border-b border-black px-5 py-3">
                    <Skel className="h-3 w-28" />
                </div>
                <div className="divide-y divide-neutral-100">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="p-5 flex items-center justify-between gap-4">
                            <div className="space-y-2 min-w-0 flex-1">
                                <Skel className="h-4 w-40" />
                                <Skel className="h-3 w-28" />
                            </div>
                            <Skel className="h-6 w-16 shrink-0" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
