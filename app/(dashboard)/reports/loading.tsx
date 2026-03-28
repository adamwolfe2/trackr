function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function ReportsLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skel className="h-8 w-40" />
                <Skel className="h-4 w-64" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border border-black p-4 space-y-3">
                        <Skel className="h-5 w-36" />
                        <Skel className="h-4 w-full" />
                        <Skel className="h-4 w-2/3" />
                        <Skel className="h-3 w-20" />
                    </div>
                ))}
            </div>
        </div>
    );
}
