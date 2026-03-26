export default function AdminApiLoading() {
    return (
        <div className="max-w-6xl mx-auto px-8 py-10 space-y-6">
            <div className="h-8 w-48 bg-neutral-200 animate-pulse" />
            <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border border-black p-5 space-y-3">
                        <div className="h-4 w-24 bg-neutral-200 animate-pulse" />
                        <div className="h-8 w-32 bg-neutral-200 animate-pulse" />
                    </div>
                ))}
            </div>
            <div className="border border-black p-5 space-y-3">
                <div className="h-4 w-32 bg-neutral-200 animate-pulse" />
                <div className="space-y-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-10 bg-neutral-100 animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    );
}
