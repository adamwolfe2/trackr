function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function ScorecardLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skel className="h-3 w-24" />
                <Skel className="h-8 w-40" />
                <Skel className="h-4 w-80" />
            </div>

            <div className="border border-black">
                <div className="border-b border-black px-5 py-3">
                    <Skel className="h-3 w-36" />
                </div>
                <div className="p-5 space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="border border-black p-4">
                            <div className="flex items-center justify-between mb-3">
                                <Skel className="h-4 w-32" />
                                <Skel className="h-4 w-16" />
                            </div>
                            <Skel className="h-2 w-full" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <Skel className="h-10 w-32" />
            </div>
        </div>
    );
}
