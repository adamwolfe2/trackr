import { Skeleton } from "@/components/ui/skeleton";

export default function ToolsLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-9 w-28" />
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-end gap-1">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-7 w-20" />
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 border border-black">
                {["Total Tools", "Avg Score", "Researched / Mo", "Monthly Spend"].map((label, i) => (
                    <div
                        key={label}
                        className={`p-4 ${i < 3 ? "border-r" : ""} ${i < 2 ? "border-b md:border-b-0" : ""} border-black`}
                    >
                        <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">{label}</div>
                        <Skeleton className="h-8 w-12 mt-1" />
                    </div>
                ))}
            </div>

            {/* Kanban Columns */}
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
                {["Backlog", "Researching", "Active", "Archived"].map((col) => (
                    <div key={col} className="flex-shrink-0 w-[260px] sm:w-[280px] lg:w-auto min-w-0 flex flex-col gap-2">
                        <div className="flex items-center justify-between pb-1.5 border-b-2 border-black">
                            <span className="text-[11px] font-mono font-bold uppercase tracking-widest">{col}</span>
                            <Skeleton className="h-4 w-5" />
                        </div>
                        <div className="flex flex-col gap-2 min-h-[160px]">
                            {col === "Backlog" ? (
                                <>
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </>
                            ) : (
                                <div className="border border-dashed border-neutral-200 min-h-[160px]" />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
