function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function CalendarLoading() {
    return (
        <div className="space-y-6">
            {/* Month navigation card */}
            <div className="border border-black bg-white">
                {/* Nav bar */}
                <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                    <Skel className="h-7 w-7" />
                    <Skel className="h-4 w-32" />
                    <Skel className="h-7 w-7" />
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-neutral-200">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="py-2 flex justify-center">
                            <Skel className="h-3 w-6" />
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="border-b border-neutral-200 px-3 py-2 flex items-center gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skel key={i} className="h-3 w-16" />
                    ))}
                </div>

                {/* Day grid — 5 weeks */}
                <div className="grid grid-cols-7">
                    {Array.from({ length: 35 }).map((_, i) => (
                        <div
                            key={i}
                            className={`min-h-[60px] sm:min-h-[80px] p-1.5 ${i % 7 !== 6 ? "border-r border-neutral-100" : ""} ${i < 28 ? "border-b border-neutral-100" : ""}`}
                        >
                            <Skel className="h-4 w-5 mb-1" />
                            {i % 5 === 0 && <Skel className="h-3 w-full mt-1" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Upcoming events list */}
            <div className="border border-black bg-white">
                <div className="border-b border-black px-5 py-3">
                    <Skel className="h-4 w-40" />
                </div>
                <div className="divide-y divide-neutral-100">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-4 px-5 py-4">
                            <Skel className="h-10 w-10 shrink-0" />
                            <div className="space-y-1.5 flex-1 min-w-0">
                                <Skel className="h-4 w-48" />
                                <Skel className="h-3 w-32" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
