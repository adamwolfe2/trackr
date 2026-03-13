export default function Loading() {
    return (
        <div className="space-y-8 animate-pulse">
            <div>
                <div className="h-3 w-16 bg-neutral-300 mb-2" />
                <div className="h-8 w-56 bg-neutral-200" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px border border-black bg-black">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-[#F3F3EF] p-5">
                        <div className="h-2 w-28 bg-neutral-300 mb-3" />
                        <div className="h-7 w-20 bg-neutral-200 mb-1" />
                        <div className="h-2 w-16 bg-neutral-100" />
                    </div>
                ))}
            </div>
            <div className="border border-black">
                <div className="border-b border-black p-5">
                    <div className="h-2 w-40 bg-neutral-300" />
                </div>
                <div className="p-3 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex gap-4">
                            <div className="h-4 w-28 bg-neutral-200" />
                            <div className="h-4 w-40 bg-neutral-100" />
                            <div className="h-4 w-16 bg-neutral-200" />
                            <div className="h-4 w-20 bg-neutral-100" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
