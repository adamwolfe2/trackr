function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function StackLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skel className="h-3 w-20" />
                    <Skel className="h-8 w-36" />
                    <Skel className="h-4 w-72" />
                </div>
                <Skel className="h-10 w-36 shrink-0" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-black">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`p-5 ${i < 3 ? "border-r border-black" : ""}`}>
                        <Skel className="h-3 w-20 mb-3" />
                        <Skel className="h-7 w-24 mb-1" />
                        <Skel className="h-3 w-16" />
                    </div>
                ))}
            </div>

            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="border border-black overflow-hidden min-w-[600px]">
                    <div className="grid grid-cols-5 border-b border-black bg-neutral-50 px-4 py-3 gap-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skel key={i} className="h-3 w-16" />
                        ))}
                    </div>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-5 border-b border-neutral-100 px-4 py-4 items-center gap-4">
                            <Skel className="h-4 w-32" />
                            <Skel className="h-4 w-20" />
                            <Skel className="h-4 w-16" />
                            <Skel className="h-5 w-14" />
                            <Skel className="h-4 w-8" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
