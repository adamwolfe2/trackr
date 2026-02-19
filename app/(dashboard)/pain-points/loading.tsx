export default function PainPointsLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-3 w-24 bg-neutral-200" />
                    <div className="h-8 w-44 bg-neutral-200" />
                    <div className="h-4 w-72 bg-neutral-200" />
                </div>
                <div className="h-10 w-36 bg-neutral-200" />
            </div>

            <div className="border border-black">
                <div className="border-b border-black px-5 py-3">
                    <div className="h-3 w-24 bg-neutral-200" />
                </div>
                <div className="divide-y divide-neutral-100">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="p-5 flex items-start justify-between gap-4">
                            <div className="space-y-2 flex-1">
                                <div className="h-4 w-48 bg-neutral-200" />
                                <div className="h-3 w-full bg-neutral-200" />
                                <div className="h-3 w-3/4 bg-neutral-200" />
                                <div className="h-5 w-20 bg-neutral-200" />
                            </div>
                            <div className="h-8 w-20 bg-neutral-200 flex-shrink-0" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
