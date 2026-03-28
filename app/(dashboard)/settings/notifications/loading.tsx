export default function NotificationsLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="h-8 w-56 bg-neutral-200 animate-pulse" />
                <div className="h-4 w-80 bg-neutral-100 animate-pulse" />
            </div>
            <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between border border-neutral-200 p-4">
                        <div className="space-y-1.5">
                            <div className="h-4 w-40 bg-neutral-200 animate-pulse" />
                            <div className="h-3 w-64 bg-neutral-100 animate-pulse" />
                        </div>
                        <div className="h-6 w-10 bg-neutral-200 rounded-full animate-pulse" />
                    </div>
                ))}
            </div>
        </div>
    );
}
