export default function ReferralsLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="space-y-2">
                <div className="h-3 w-20 bg-neutral-200" />
                <div className="h-8 w-36 bg-neutral-200" />
                <div className="h-4 w-72 bg-neutral-200" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-black">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={`p-6 ${i < 2 ? "border-b md:border-b-0 md:border-r border-black" : ""}`}>
                        <div className="h-3 w-20 bg-neutral-200 mb-3" />
                        <div className="h-8 w-12 bg-neutral-200 mb-1" />
                        <div className="h-3 w-28 bg-neutral-200" />
                    </div>
                ))}
            </div>

            <div className="border border-black">
                <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                    <div className="h-3 w-28 bg-neutral-200" />
                    <div className="h-8 w-36 bg-neutral-200" />
                </div>
                <div className="p-6">
                    <div className="border border-black p-4 flex items-center justify-between">
                        <div className="h-5 w-48 bg-neutral-200" />
                        <div className="h-8 w-20 bg-neutral-200" />
                    </div>
                </div>
            </div>
        </div>
    );
}
