function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function CompetitorsLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skel className="h-8 w-40" />
                <Skel className="h-4 w-64" />
            </div>
            <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border border-black p-4 flex items-center gap-4">
                        <Skel className="h-10 w-10" />
                        <div className="flex-1 space-y-2">
                            <Skel className="h-5 w-48" />
                            <Skel className="h-4 w-72" />
                        </div>
                        <Skel className="h-6 w-20" />
                    </div>
                ))}
            </div>
        </div>
    );
}
