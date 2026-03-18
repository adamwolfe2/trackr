"use client";

import { useState, useTransition, useEffect } from "react";
import { Clock, ChevronDown } from "lucide-react";
import { updateResearchSchedule, type ResearchInterval } from "@/lib/actions/schedule";
import { toast } from "sonner";
import Link from "next/link";

interface ResearchSchedulePickerProps {
    toolId: string;
    currentInterval: ResearchInterval;
    nextResearchAt: string | null; // ISO string
    canSchedule: boolean;
}

const INTERVAL_LABELS: Record<ResearchInterval, string> = {
    manual: "Manual only",
    weekly: "Weekly",
    biweekly: "Every 2 weeks",
    monthly: "Monthly",
};

function formatNextRun(iso: string | null, interval: ResearchInterval): string {
    if (interval === "manual" || !iso) return "—";
    try {
        const d = new Date(iso);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
        return "—";
    }
}

export function ResearchSchedulePicker({
    toolId,
    currentInterval,
    nextResearchAt,
    canSchedule,
}: ResearchSchedulePickerProps) {
    const [interval, setInterval] = useState<ResearchInterval>(currentInterval);
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);

    // Close dropdown on resize (prevents misaligned dropdown after orientation change)
    useEffect(() => {
        if (!open) return;
        const handleResize = () => setOpen(false);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [open]);

    const handleSelect = (value: ResearchInterval) => {
        setOpen(false);
        if (value === interval) return;
        startTransition(async () => {
            const result = await updateResearchSchedule(toolId, value);
            if (result.success) {
                setInterval(value);
                toast.success(
                    value === "manual"
                        ? "Research schedule cleared."
                        : `Research scheduled ${INTERVAL_LABELS[value].toLowerCase()}.`,
                );
            } else {
                toast.error(result.error ?? "Failed to update schedule.");
            }
        });
    };

    if (!canSchedule) {
        return (
            <div className="border border-black p-4">
                <h3 className="font-mono text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Research Schedule
                </h3>
                <p className="font-mono text-[10px] text-neutral-500 leading-relaxed mb-3">
                    Auto-research keeps your tool data fresh without manual effort.
                </p>
                <Link
                    href="/settings/billing"
                    className="block w-full border border-black px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-center hover:bg-black hover:text-white transition-colors"
                >
                    Upgrade to Enable
                </Link>
            </div>
        );
    }

    return (
        <div className="border border-black p-4">
            <h3 className="font-mono text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Research Schedule
            </h3>

            {/* Dropdown */}
            <div className="relative mb-3">
                <button
                    onClick={() => setOpen(prev => !prev)}
                    disabled={isPending}
                    className="w-full flex items-center justify-between border border-black px-3 py-2 font-mono text-xs bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span>{INTERVAL_LABELS[interval]}</span>
                    <ChevronDown className="h-3 w-3 text-neutral-400" />
                </button>

                {open && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} role="presentation" aria-hidden="true" />
                        <div className="absolute left-0 right-0 top-full z-20 border border-black bg-white border-t-0">
                            {(Object.keys(INTERVAL_LABELS) as ResearchInterval[]).map((val) => (
                                <button
                                    key={val}
                                    onClick={() => handleSelect(val)}
                                    className={`w-full text-left px-3 py-2 font-mono text-xs hover:bg-black hover:text-white border-b border-neutral-200 last:border-0 ${
                                        val === interval ? "bg-black text-white" : ""
                                    }`}
                                >
                                    {INTERVAL_LABELS[val]}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Next run */}
            <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Next run</span>
                <span className="font-mono text-[10px] text-neutral-600">
                    {formatNextRun(nextResearchAt, interval)}
                </span>
            </div>

            {isPending && (
                <p className="font-mono text-[10px] text-neutral-400 mt-2">Saving...</p>
            )}
        </div>
    );
}
