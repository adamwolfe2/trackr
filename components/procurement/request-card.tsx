"use client";

import { ExternalLink } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────

export interface ProcurementRequestData {
    id: string;
    toolName: string;
    toolUrl: string | null;
    justification: string;
    urgency: string;
    category: string | null;
    estimatedBudget: string | null;
    status: string;
    requestedBy: string;
    requestedByName: string | null;
    reviewedBy: string | null;
    reviewedByName: string | null;
    reviewNotes: string | null;
    approvedBudget: string | null;
    createdAt: string;
    updatedAt: string;
}

interface RequestCardProps {
    request: ProcurementRequestData;
    onClick: () => void;
}

// ── Urgency styling ──────────────────────────────────────────────────

const URGENCY_STYLES: Record<string, string> = {
    low: "border-l-neutral-400",
    medium: "border-l-blue-500",
    high: "border-l-yellow-500",
    critical: "border-l-red-500",
};

const URGENCY_LABELS: Record<string, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
};

const URGENCY_BADGE_STYLES: Record<string, string> = {
    low: "border-neutral-300 text-neutral-500",
    medium: "border-blue-400 text-blue-600",
    high: "border-yellow-500 text-yellow-700",
    critical: "border-red-500 text-red-600",
};

// ── Component ────────────────────────────────────────────────────────

export function RequestCard({ request, onClick }: RequestCardProps) {
    const dateStr = new Date(request.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });

    return (
        <button
            onClick={onClick}
            className={`w-full text-left border border-black border-l-4 ${
                URGENCY_STYLES[request.urgency] ?? "border-l-neutral-400"
            } bg-white p-3 hover:bg-neutral-50 transition-colors cursor-pointer`}
        >
            {/* Tool name */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="font-mono text-xs font-medium truncate">
                    {request.toolName}
                </span>
                {request.toolUrl && (
                    <ExternalLink className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                )}
            </div>

            {/* Requester */}
            <span className="font-mono text-[10px] text-neutral-400 block mb-2">
                {request.requestedByName ?? "Team Member"}
            </span>

            {/* Badges row */}
            <div className="flex items-center gap-1.5 flex-wrap">
                <span
                    className={`font-mono text-[10px] uppercase tracking-widest border px-1.5 py-0.5 ${
                        URGENCY_BADGE_STYLES[request.urgency] ?? "border-neutral-300 text-neutral-500"
                    }`}
                >
                    {URGENCY_LABELS[request.urgency] ?? request.urgency}
                </span>
                {request.category && (
                    <span className="font-mono text-[10px] border border-neutral-300 px-1.5 py-0.5 text-neutral-500">
                        {request.category}
                    </span>
                )}
                <span className="font-mono text-[10px] text-neutral-400 ml-auto">
                    {dateStr}
                </span>
            </div>

            {/* Budget */}
            {request.estimatedBudget && (
                <div className="mt-2 pt-2 border-t border-neutral-100">
                    <span className="font-mono text-[10px] text-neutral-400">
                        Est. ${parseFloat(request.estimatedBudget).toLocaleString()}/mo
                    </span>
                </div>
            )}
        </button>
    );
}
