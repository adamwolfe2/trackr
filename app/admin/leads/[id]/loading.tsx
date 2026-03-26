export default function LeadDetailLoading() {
    return (
        <div className="max-w-6xl mx-auto px-8 py-10 space-y-8">
            <div className="flex items-center gap-3">
                <div className="w-16 h-16 border border-neutral-200 bg-neutral-100 animate-pulse" />
                <div className="space-y-2">
                    <div className="h-6 w-48 bg-neutral-200 animate-pulse" />
                    <div className="h-3 w-32 bg-neutral-100 animate-pulse" />
                </div>
            </div>
            <div className="border border-black p-6 space-y-4">
                <div className="h-4 w-24 bg-neutral-200 animate-pulse" />
                <div className="flex items-end gap-4">
                    <div className="h-16 w-20 bg-neutral-200 animate-pulse" />
                    <div className="flex-1 h-4 bg-neutral-100 animate-pulse" />
                </div>
                <div className="h-20 bg-neutral-50 animate-pulse" />
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="border border-black p-5 h-64 animate-pulse bg-neutral-50" />
                <div className="border border-black p-5 h-64 animate-pulse bg-neutral-50" />
            </div>
        </div>
    );
}
