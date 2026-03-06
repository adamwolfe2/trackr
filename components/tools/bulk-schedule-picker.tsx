"use client";

import { useState, useTransition } from "react";
import { CalendarClock, X, Check, ChevronDown } from "lucide-react";
import { updateBulkResearchSchedule, type ResearchInterval } from "@/lib/actions/schedule";
import { toast } from "sonner";

interface BulkTool {
    id: string;
    name: string;
    researchInterval?: string | null;
    status: string;
}

const INTERVAL_LABELS: Record<ResearchInterval, string> = {
    manual: "Manual only",
    weekly: "Weekly",
    biweekly: "Bi-weekly",
    monthly: "Monthly",
};

export function BulkSchedulePicker({ tools, canSchedule }: { tools: BulkTool[]; canSchedule: boolean }) {
    const [open, setOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [interval, setInterval] = useState<ResearchInterval>("weekly");
    const [isPending, startTransition] = useTransition();

    const activePlanTools = tools.filter((t) => t.status !== "archived");

    const toggleAll = () => {
        if (selectedIds.size === activePlanTools.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(activePlanTools.map((t) => t.id)));
        }
    };

    const toggleTool = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleApply = () => {
        if (selectedIds.size === 0) {
            toast.error("Select at least one tool.");
            return;
        }
        startTransition(async () => {
            const result = await updateBulkResearchSchedule([...selectedIds], interval);
            if (result.success) {
                toast.success(`Schedule updated for ${result.updated} tool${result.updated !== 1 ? "s" : ""}.`);
                setOpen(false);
                setSelectedIds(new Set());
            } else {
                toast.error(result.error ?? "Failed to update schedule.");
            }
        });
    };

    if (!canSchedule) {
        return (
            <a
                href="/settings/billing"
                className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs border border-neutral-300 text-neutral-400 hover:border-black hover:text-black transition-colors"
            >
                <CalendarClock className="w-3.5 h-3.5" />
                Bulk Schedule
                <span className="text-[9px] border border-neutral-300 px-1 py-0.5 uppercase tracking-widest ml-1">Team+</span>
            </a>
        );
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs border border-black bg-white hover:bg-neutral-100 transition-colors"
            >
                <CalendarClock className="w-3.5 h-3.5" />
                Bulk Schedule
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setOpen(false)}
                    />

                    {/* Modal */}
                    <div className="relative z-10 w-full max-w-md bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-h-[85vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-black px-5 py-4">
                            <div>
                                <h2 className="font-mono text-sm font-semibold uppercase tracking-widest">Bulk Research Schedule</h2>
                                <p className="font-mono text-[10px] text-neutral-400 mt-0.5">
                                    Set a schedule for multiple tools at once.
                                </p>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="text-neutral-400 hover:text-black transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Interval selector */}
                        <div className="px-5 py-4 border-b border-neutral-100">
                            <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
                                Schedule Interval
                            </label>
                            <div className="relative">
                                <select
                                    value={interval}
                                    onChange={(e) => setInterval(e.target.value as ResearchInterval)}
                                    className="w-full border border-black px-3 py-2 font-mono text-sm bg-white appearance-none pr-8 focus:outline-none"
                                >
                                    {(Object.keys(INTERVAL_LABELS) as ResearchInterval[]).map((key) => (
                                        <option key={key} value={key}>{INTERVAL_LABELS[key]}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Tool list */}
                        <div className="px-5 py-3 border-b border-neutral-100 max-h-[40vh] sm:max-h-64 overflow-y-auto">
                            {activePlanTools.length === 0 ? (
                                <p className="font-mono text-xs text-neutral-400 py-4 text-center">No active tools.</p>
                            ) : (
                                <>
                                    <button
                                        onClick={toggleAll}
                                        className="flex items-center gap-2 w-full font-mono text-[10px] text-neutral-500 hover:text-black transition-colors mb-2 pb-2 border-b border-neutral-100"
                                    >
                                        <div className={`w-3.5 h-3.5 border flex items-center justify-center flex-shrink-0 transition-colors ${
                                            selectedIds.size === activePlanTools.length ? "border-black bg-black" : "border-neutral-300"
                                        }`}>
                                            {selectedIds.size === activePlanTools.length && <Check className="w-2.5 h-2.5 text-white" />}
                                        </div>
                                        {selectedIds.size === activePlanTools.length ? "Deselect all" : "Select all"}
                                        <span className="text-neutral-300">·</span>
                                        <span>{activePlanTools.length} tools</span>
                                    </button>

                                    <div className="space-y-0.5">
                                        {activePlanTools.map((tool) => {
                                            const checked = selectedIds.has(tool.id);
                                            const currentInterval = tool.researchInterval && tool.researchInterval !== "manual"
                                                ? INTERVAL_LABELS[tool.researchInterval as ResearchInterval] ?? tool.researchInterval
                                                : null;
                                            return (
                                                <button
                                                    key={tool.id}
                                                    onClick={() => toggleTool(tool.id)}
                                                    className="flex items-center gap-3 w-full px-1 py-1.5 hover:bg-neutral-50 transition-colors text-left"
                                                >
                                                    <div className={`w-3.5 h-3.5 border flex items-center justify-center flex-shrink-0 transition-colors ${
                                                        checked ? "border-black bg-black" : "border-neutral-300"
                                                    }`}>
                                                        {checked && <Check className="w-2.5 h-2.5 text-white" />}
                                                    </div>
                                                    <span className="font-mono text-xs flex-1 truncate">{tool.name}</span>
                                                    {currentInterval && (
                                                        <span className="font-mono text-[9px] text-neutral-400 border border-neutral-200 px-1.5 py-0.5 uppercase tracking-widest flex-shrink-0">
                                                            {currentInterval}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between px-5 py-4">
                            <span className="font-mono text-[10px] text-neutral-400">
                                {selectedIds.size} selected
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setOpen(false)}
                                    className="px-4 py-2 font-mono text-xs border border-neutral-300 hover:border-black transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApply}
                                    disabled={isPending || selectedIds.size === 0}
                                    className="px-4 py-2 font-mono text-xs border border-black bg-black text-white hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isPending ? "Saving..." : `Apply to ${selectedIds.size} tool${selectedIds.size !== 1 ? "s" : ""}`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
