function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function FeedLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skel className="h-8 w-40" />
                    <Skel className="h-4 w-64" />
                </div>
                <Skel className="h-10 w-32" />
            </div>

            <div className="flex gap-2">
                <Skel className="h-8 w-16" />
                <Skel className="h-8 w-20" />
                <Skel className="h-8 w-18" />
            </div>

            <div className="border border-black divide-y divide-neutral-100">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <Skel className="h-5 w-3/5" />
                            <Skel className="h-4 w-20" />
                        </div>
                        <Skel className="h-4 w-full" />
                        <Skel className="h-4 w-4/5" />
                        <div className="flex gap-2 pt-1">
                            <Skel className="h-5 w-16" />
                            <Skel className="h-5 w-12" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
