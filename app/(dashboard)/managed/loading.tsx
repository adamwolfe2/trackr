function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function ManagedLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <Skel className="h-3 w-28" />
                <Skel className="h-8 w-48" />
            </div>

            {/* Architect profile card */}
            <div className="border border-black bg-white max-w-2xl">
                <div className="border-b border-black px-6 py-4 flex items-center gap-4">
                    <Skel className="w-12 h-12 shrink-0" />
                    <div className="space-y-1.5">
                        <Skel className="h-5 w-36" />
                        <Skel className="h-3 w-24" />
                    </div>
                    <div className="ml-auto">
                        <Skel className="h-6 w-14" />
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <Skel className="w-4 h-4 shrink-0" />
                            <div className="space-y-1">
                                <Skel className="h-2.5 w-10" />
                                <Skel className="h-3.5 w-40" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Skel className="w-4 h-4 shrink-0" />
                            <div className="space-y-1">
                                <Skel className="h-2.5 w-16" />
                                <Skel className="h-3.5 w-24" />
                            </div>
                        </div>
                    </div>
                    <Skel className="h-9 w-36" />
                </div>
            </div>

            {/* Request review card */}
            <div className="border border-black bg-white max-w-2xl">
                <div className="border-b border-black px-6 py-3">
                    <Skel className="h-4 w-44" />
                </div>
                <div className="p-6 space-y-4">
                    <Skel className="h-3 w-full" />
                    <Skel className="h-3 w-3/4" />
                    <Skel className="h-20 w-full" />
                    <Skel className="h-9 w-32" />
                </div>
            </div>
        </div>
    );
}
