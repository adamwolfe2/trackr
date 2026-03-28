function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function RiskLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skel className="h-8 w-40" />
                <Skel className="h-4 w-64" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border border-black p-4 space-y-2">
                        <Skel className="h-4 w-24" />
                        <Skel className="h-10 w-16" />
                    </div>
                ))}
            </div>
            <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border border-black p-4 flex items-center gap-4">
                        <Skel className="h-6 w-6" />
                        <div className="flex-1 space-y-2">
                            <Skel className="h-4 w-48" />
                            <Skel className="h-3 w-64" />
                        </div>
                        <Skel className="h-5 w-16" />
                    </div>
                ))}
            </div>
        </div>
    );
}
