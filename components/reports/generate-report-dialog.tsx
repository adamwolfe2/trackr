"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateBoardReport } from "@/lib/actions/board-reports";
import { X, Loader2 } from "lucide-react";

type Period = "monthly" | "quarterly" | "annual";

interface GenerateReportDialogProps {
    workspaceId: string;
    userId: string;
    onClose: () => void;
}

const PERIOD_OPTIONS: Array<{ value: Period; label: string; description: string }> = [
    { value: "monthly", label: "This Month", description: "Current month snapshot" },
    { value: "quarterly", label: "This Quarter", description: "Current quarter overview" },
    { value: "annual", label: "This Year", description: "Year-to-date summary" },
];

export function GenerateReportDialog({
    workspaceId,
    userId,
    onClose,
}: GenerateReportDialogProps) {
    const router = useRouter();
    const [period, setPeriod] = useState<Period>("monthly");
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function handleGenerate() {
        setError(null);
        startTransition(async () => {
            try {
                const report = await generateBoardReport(workspaceId, period, userId);
                router.push(`/reports/${report.id}`);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to generate report");
            }
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-md border border-black bg-white p-4 sm:p-6 mx-4 max-h-[85vh] overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="report-dialog-title">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 id="report-dialog-title" className="font-serif text-xl font-normal">Generate Board Report</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center border border-black hover:bg-neutral-100 transition-colors"
                        disabled={isPending}
                        aria-label="Close dialog"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Period Selection */}
                <div className="space-y-2 mb-6">
                    <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 block">
                        Report Period
                    </span>
                    {PERIOD_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setPeriod(opt.value)}
                            disabled={isPending}
                            className={`w-full text-left border p-3 transition-colors ${
                                period === opt.value
                                    ? "border-black bg-black text-white"
                                    : "border-black hover:bg-neutral-50"
                            }`}
                        >
                            <span className="font-mono text-sm font-medium block">
                                {opt.label}
                            </span>
                            <span
                                className={`font-mono text-[10px] ${
                                    period === opt.value
                                        ? "text-neutral-400"
                                        : "text-neutral-500"
                                }`}
                            >
                                {opt.description}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="border border-red-300 bg-red-50 p-3 mb-4">
                        <p className="font-mono text-xs text-red-600">{error}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        className="flex-1 border border-black px-4 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-neutral-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isPending}
                        className="flex-1 border border-black bg-black text-white px-4 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            "Generate"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
