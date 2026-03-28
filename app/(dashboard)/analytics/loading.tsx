function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function AnalyticsLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skel className="h-8 w-40" />
                    <Skel className="h-4 w-64" />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-black">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`p-6 ${i < 3 ? "border-r border-black" : ""}`}>
                        <Skel className="h-3 w-20 mb-3" />
                        <Skel className="h-8 w-16 mb-1" />
                        <Skel className="h-3 w-24" />
                    </div>
                ))}
            </div>

            <div className="border border-black">
                <div className="border-b border-black px-5 py-3">
                    <Skel className="h-3 w-32" />
                </div>
                <div className="p-6 space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <Skel className="h-4 w-48" />
                            <Skel className="h-4 w-16" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
