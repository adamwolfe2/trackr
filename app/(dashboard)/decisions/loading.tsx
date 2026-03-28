function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function DecisionsLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skel className="h-8 w-40" />
                <Skel className="h-4 w-64" />
            </div>
            <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border border-black p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <Skel className="h-5 w-56" />
                            <Skel className="h-5 w-16" />
                        </div>
                        <Skel className="h-4 w-full" />
                        <Skel className="h-4 w-3/4" />
                    </div>
                ))}
            </div>
        </div>
    );
}
