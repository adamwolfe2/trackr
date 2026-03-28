function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function AskLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skel className="h-8 w-48" />
                <Skel className="h-4 w-80" />
            </div>

            <div className="border border-black p-6 space-y-4">
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skel className="h-4 w-full" />
                            <Skel className="h-4 w-3/4" />
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 pt-4 border-t border-black">
                    <Skel className="h-10 flex-1" />
                    <Skel className="h-10 w-24" />
                </div>
            </div>
        </div>
    );
}
