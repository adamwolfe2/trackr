function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function NotificationsLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skel className="h-8 w-56" />
                <Skel className="h-4 w-80" />
            </div>
            <div className="border border-black divide-y divide-black/10">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-4 gap-4">
                        <div className="space-y-1.5 min-w-0 flex-1">
                            <Skel className="h-4 w-40" />
                            <Skel className="h-3 w-64" />
                        </div>
                        <Skel className="h-6 w-11 shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    );
}
