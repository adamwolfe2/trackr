function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function LiteracyLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skel className="h-8 w-40" />
                <Skel className="h-4 w-64" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border border-black p-4 space-y-3">
                        <Skel className="h-5 w-32" />
                        <Skel className="h-4 w-full" />
                        <Skel className="h-4 w-3/4" />
                        <Skel className="h-8 w-24" />
                    </div>
                ))}
            </div>
        </div>
    );
}
