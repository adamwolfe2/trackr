export default function AnalyticsLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-8 w-40 bg-neutral-200" />
                    <div className="h-4 w-64 bg-neutral-200" />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-black">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`p-6 ${i < 3 ? "border-r border-black" : ""}`}>
                        <div className="h-3 w-20 bg-neutral-200 mb-3" />
                        <div className="h-8 w-16 bg-neutral-200 mb-1" />
                        <div className="h-3 w-24 bg-neutral-200" />
                    </div>
                ))}
            </div>

            <div className="border border-black">
                <div className="border-b border-black px-5 py-3">
                    <div className="h-3 w-32 bg-neutral-200" />
                </div>
                <div className="p-6 space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="h-4 w-48 bg-neutral-200" />
                            <div className="h-4 w-16 bg-neutral-200" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
