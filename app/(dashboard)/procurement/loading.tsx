function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

const COLUMNS = ["Pending", "Researching", "Reviewed", "Approved", "Rejected"];

export default function ProcurementLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                    <Skel className="h-8 w-44" />
                    <Skel className="h-4 w-64" />
                </div>
                <Skel className="h-9 w-32 shrink-0" />
            </div>

            {/* Kanban columns — desktop */}
            <div className="hidden md:grid grid-cols-5 gap-0 border border-black">
                {COLUMNS.map((col, i) => (
                    <div
                        key={col}
                        className={`${i < COLUMNS.length - 1 ? "border-r border-black" : ""}`}
                    >
                        <div className="border-b border-black px-4 py-3">
                            <Skel className="h-4 w-20" />
                        </div>
                        <div className="p-3 space-y-3 min-h-[200px]">
                            {i === 0 && (
                                <>
                                    <div className="border border-black p-3 space-y-2">
                                        <Skel className="h-4 w-28" />
                                        <Skel className="h-3 w-20" />
                                    </div>
                                    <div className="border border-black p-3 space-y-2">
                                        <Skel className="h-4 w-32" />
                                        <Skel className="h-3 w-16" />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Mobile tab — single column */}
            <div className="md:hidden">
                <div className="flex overflow-x-auto border-b border-black gap-0">
                    {COLUMNS.map((col) => (
                        <div key={col} className="px-4 py-2 border-r border-black shrink-0">
                            <Skel className="h-4 w-16" />
                        </div>
                    ))}
                </div>
                <div className="border border-t-0 border-black p-4 space-y-3 min-h-[200px]">
                    <div className="border border-black p-3 space-y-2">
                        <Skel className="h-4 w-32" />
                        <Skel className="h-3 w-24" />
                    </div>
                </div>
            </div>
        </div>
    );
}
