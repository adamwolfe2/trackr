export default function AdvertiseLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-3 w-20 bg-neutral-200 mb-1" />
                    <div className="h-8 w-36 bg-neutral-200" />
                    <div className="h-4 w-72 bg-neutral-200" />
                </div>
                <div className="h-10 w-32 bg-neutral-200" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border border-black">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={`p-6 ${i < 2 ? "border-r border-black" : ""}`}>
                        <div className="h-3 w-20 bg-neutral-200 mb-3" />
                        <div className="h-7 w-12 bg-neutral-200 mb-1" />
                        <div className="h-3 w-28 bg-neutral-200" />
                    </div>
                ))}
            </div>

            <div className="border border-black">
                <div className="border-b border-black px-5 py-3">
                    <div className="h-3 w-28 bg-neutral-200" />
                </div>
                <div className="divide-y divide-neutral-100">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="p-5 flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="h-4 w-40 bg-neutral-200" />
                                <div className="h-3 w-28 bg-neutral-200" />
                            </div>
                            <div className="h-6 w-16 bg-neutral-200" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
