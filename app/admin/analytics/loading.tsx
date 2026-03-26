export default function AdminAnalyticsLoading() {
    return (
        <div className="max-w-6xl mx-auto px-8 py-10 space-y-6">
            <div className="h-8 w-48 bg-neutral-200 animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border border-black p-5 space-y-3">
                        <div className="h-3 w-20 bg-neutral-200 animate-pulse" />
                        <div className="h-8 w-24 bg-neutral-200 animate-pulse" />
                    </div>
                ))}
            </div>
            <div className="border border-black p-5 h-64 bg-neutral-50 animate-pulse" />
        </div>
    );
}
