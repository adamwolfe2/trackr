function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function CompareLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <Skel className="h-8 w-40" />
                <Skel className="h-3 w-56" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-4 pt-16">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Skel key={i} className="h-10 w-full" />
                    ))}
                </div>
                {[0, 1].map(i => (
                    <div key={i} className="space-y-4">
                        <Skel className="h-16 w-full" />
                        {[1, 2, 3, 4, 5, 6].map(j => (
                            <Skel key={j} className="h-10 w-full" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
