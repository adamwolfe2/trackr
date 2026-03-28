function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function QueueLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                    <Skel className="h-8 w-52" />
                    <Skel className="h-3 w-64" />
                </div>
                <div className="flex gap-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="border border-black px-4 py-2 w-20 space-y-1.5">
                            <Skel className="h-2 w-12 mx-auto" />
                            <Skel className="h-6 w-8 mx-auto" />
                        </div>
                    ))}
                </div>
            </div>
            <div className="border border-black divide-y divide-black/10">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center justify-between px-5 py-4">
                        <div className="flex items-center gap-4">
                            <Skel className="h-4 w-4 rounded-full" />
                            <div className="space-y-1.5">
                                <Skel className="h-4 w-40" />
                                <Skel className="h-3 w-28" />
                            </div>
                        </div>
                        <Skel className="h-6 w-20" />
                    </div>
                ))}
            </div>
        </div>
    );
}
