export default function StackLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-3 w-20 bg-neutral-200" />
                    <div className="h-8 w-36 bg-neutral-200" />
                    <div className="h-4 w-72 bg-neutral-200" />
                </div>
                <div className="h-10 w-36 bg-neutral-200" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-black">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`p-5 ${i < 3 ? "border-r border-black" : ""}`}>
                        <div className="h-3 w-20 bg-neutral-200 mb-3" />
                        <div className="h-7 w-24 bg-neutral-200 mb-1" />
                        <div className="h-3 w-16 bg-neutral-200" />
                    </div>
                ))}
            </div>

            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="border border-black overflow-hidden min-w-[600px]">
                {/* Table header */}
                <div className="grid grid-cols-5 border-b border-black bg-neutral-50 px-4 py-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-3 w-16 bg-neutral-200" />
                    ))}
                </div>
                {/* Table rows */}
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-5 border-b border-neutral-100 px-4 py-4 items-center">
                        <div className="h-4 w-32 bg-neutral-200" />
                        <div className="h-4 w-20 bg-neutral-200" />
                        <div className="h-4 w-16 bg-neutral-200" />
                        <div className="h-5 w-14 bg-neutral-200" />
                        <div className="h-4 w-8 bg-neutral-200" />
                    </div>
                ))}
            </div>
            </div>
        </div>
    );
}
