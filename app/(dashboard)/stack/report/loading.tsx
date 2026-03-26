export default function StackReportLoading() {
    return (
        <div className="space-y-8 animate-pulse max-w-4xl mx-auto">
            <div className="space-y-2">
                <div className="h-3 w-24 bg-neutral-200" />
                <div className="h-8 w-64 bg-neutral-200" />
                <div className="h-4 w-48 bg-neutral-200" />
            </div>

            {/* Score summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-black">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`p-5 ${i < 3 ? "border-r border-black" : ""}`}>
                        <div className="h-3 w-20 bg-neutral-200 mb-3" />
                        <div className="h-7 w-24 bg-neutral-200 mb-1" />
                        <div className="h-3 w-16 bg-neutral-200" />
                    </div>
                ))}
            </div>

            {/* Report sections */}
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-black p-6 space-y-4">
                    <div className="h-5 w-40 bg-neutral-200" />
                    <div className="h-4 w-full bg-neutral-200" />
                    <div className="h-4 w-3/4 bg-neutral-200" />
                    <div className="h-4 w-5/6 bg-neutral-200" />
                </div>
            ))}
        </div>
    );
}
