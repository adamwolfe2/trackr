export default function ScorecardLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="space-y-2">
                <div className="h-3 w-24 bg-neutral-200" />
                <div className="h-8 w-40 bg-neutral-200" />
                <div className="h-4 w-80 bg-neutral-200" />
            </div>

            <div className="border border-black">
                <div className="border-b border-black px-5 py-3">
                    <div className="h-3 w-36 bg-neutral-200" />
                </div>
                <div className="p-5 space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="border border-black p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-4 w-32 bg-neutral-200" />
                                <div className="h-4 w-16 bg-neutral-200" />
                            </div>
                            <div className="h-2 w-full bg-neutral-200" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <div className="h-10 w-32 bg-neutral-200" />
            </div>
        </div>
    );
}
