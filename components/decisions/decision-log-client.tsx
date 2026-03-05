"use client";

import { useState, useTransition } from "react";
import {
    PlusCircle,
    Archive,
    Search,
    RefreshCw,
    DollarSign,
    FileText,
    ShieldAlert,
    CheckCircle,
    XCircle,
    Zap,
    Clock,
    ArrowRight,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { getDecisionLog } from "@/lib/actions/decision-log";
import Link from "next/link";

type DecisionEntry = {
    id: string;
    toolId: string | null;
    toolName: string | null;
    action: string;
    actorId: string;
    actorName: string | null;
    details: Record<string, unknown> | null;
    createdAt: string;
};

const ACTION_CONFIG: Record<string, { icon: typeof PlusCircle; label: string; color: string }> = {
    tool_added: { icon: PlusCircle, label: "Tool Added", color: "border-black text-black" },
    tool_archived: { icon: Archive, label: "Tool Archived", color: "border-neutral-400 text-neutral-500" },
    tool_researched: { icon: Search, label: "Tool Researched", color: "border-blue-400 text-blue-600" },
    score_changed: { icon: RefreshCw, label: "Score Changed", color: "border-blue-400 text-blue-600" },
    spend_added: { icon: DollarSign, label: "Spend Added", color: "border-black text-black" },
    spend_updated: { icon: DollarSign, label: "Spend Updated", color: "border-neutral-400 text-neutral-500" },
    contract_uploaded: { icon: FileText, label: "Contract Uploaded", color: "border-black text-black" },
    procurement_approved: { icon: CheckCircle, label: "Procurement Approved", color: "border-black text-black" },
    procurement_rejected: { icon: XCircle, label: "Procurement Rejected", color: "border-red-400 text-red-500" },
    risk_alert: { icon: ShieldAlert, label: "Risk Alert", color: "border-red-400 text-red-500" },
    custom: { icon: Zap, label: "Custom", color: "border-neutral-400 text-neutral-500" },
};

const ALL_ACTIONS = Object.keys(ACTION_CONFIG);

interface DecisionLogClientProps {
    workspaceId: string;
    initialEntries: DecisionEntry[];
    initialTotal: number;
    availableTools: { id: string; name: string }[];
}

export function DecisionLogClient({
    workspaceId,
    initialEntries,
    initialTotal,
    availableTools,
}: DecisionLogClientProps) {
    const [entries, setEntries] = useState(initialEntries);
    const [total, setTotal] = useState(initialTotal);
    const [page, setPage] = useState(0);
    const [actionFilter, setActionFilter] = useState<string>("");
    const [toolFilter, setToolFilter] = useState<string>("");
    const [isPending, startTransition] = useTransition();

    const pageSize = 50;
    const totalPages = Math.ceil(total / pageSize);

    function applyFilters(newAction?: string, newTool?: string, newPage?: number) {
        const action = newAction !== undefined ? newAction : actionFilter;
        const tool = newTool !== undefined ? newTool : toolFilter;
        const p = newPage !== undefined ? newPage : 0;

        setActionFilter(action);
        setToolFilter(tool);
        setPage(p);

        startTransition(async () => {
            const result = await getDecisionLog(workspaceId, {
                action: action || undefined,
                toolId: tool || undefined,
                limit: pageSize,
                offset: p * pageSize,
            });
            setEntries(result.entries);
            setTotal(result.total);
        });
    }

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="border border-black bg-white">
                <div className="border-b border-black px-5 py-3">
                    <span className="font-mono text-xs uppercase tracking-widest">Filters</span>
                </div>
                <div className="p-4 flex flex-wrap gap-4">
                    <div className="relative">
                        <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
                            Action Type
                        </label>
                        <div className="relative">
                            <select
                                value={actionFilter}
                                onChange={(e) => applyFilters(e.target.value, undefined)}
                                className="appearance-none border border-black px-3 py-2 pr-8 font-mono text-xs bg-white focus:outline-none focus:ring-1 focus:ring-black min-w-[180px]"
                            >
                                <option value="">All Actions</option>
                                {ALL_ACTIONS.map((a) => (
                                    <option key={a} value={a}>
                                        {ACTION_CONFIG[a].label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="relative">
                        <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
                            Tool
                        </label>
                        <div className="relative">
                            <select
                                value={toolFilter}
                                onChange={(e) => applyFilters(undefined, e.target.value)}
                                className="appearance-none border border-black px-3 py-2 pr-8 font-mono text-xs bg-white focus:outline-none focus:ring-1 focus:ring-black min-w-[180px]"
                            >
                                <option value="">All Tools</option>
                                {availableTools.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-400 pointer-events-none" />
                        </div>
                    </div>

                    {(actionFilter || toolFilter) && (
                        <div className="flex items-end">
                            <button
                                onClick={() => applyFilters("", "")}
                                className="border border-neutral-300 px-3 py-2 font-mono text-xs hover:border-black transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Timeline */}
            <div className="border border-black bg-white">
                <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                    <h2 className="font-mono text-xs uppercase tracking-widest">
                        Decision Timeline
                    </h2>
                    <span className="font-mono text-[10px] text-neutral-400">
                        {total} entr{total === 1 ? "y" : "ies"}
                    </span>
                </div>

                {isPending && (
                    <div className="px-5 py-3 border-b border-neutral-100">
                        <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">Loading...</span>
                    </div>
                )}

                {entries.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                        <p className="font-mono text-sm text-neutral-400">No decisions logged yet.</p>
                        <p className="font-mono text-[10px] text-neutral-400 mt-1">
                            Decisions are automatically logged when you add, research, or archive tools.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-100">
                        {entries.map((entry) => {
                            const config = ACTION_CONFIG[entry.action] ?? ACTION_CONFIG.custom;
                            const Icon = config.icon;
                            const d = new Date(entry.createdAt);

                            return (
                                <div key={entry.id} className="flex items-center gap-4 px-5 py-3">
                                    {/* Timestamp */}
                                    <div className="w-24 shrink-0 text-right">
                                        <div className="font-mono text-[10px] text-neutral-400">
                                            {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </div>
                                        <div className="font-mono text-[9px] text-neutral-300">
                                            {d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                                        </div>
                                    </div>

                                    {/* Divider + Icon */}
                                    <div className="flex flex-col items-center">
                                        <div className={`border p-1.5 ${config.color}`}>
                                            <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                                        </div>
                                    </div>

                                    {/* Actor */}
                                    <div className="w-28 shrink-0">
                                        <span className="font-mono text-xs truncate block">
                                            {entry.actorName ?? (entry.actorId === "system" ? "System" : "Team Member")}
                                        </span>
                                    </div>

                                    {/* Action description */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-mono text-[9px] border px-1.5 py-0.5 uppercase tracking-wide ${config.color}`}>
                                                {config.label}
                                            </span>
                                            {entry.details?.description ? (
                                                <span className="font-mono text-xs text-neutral-600 truncate">
                                                    {String(entry.details.description)}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>

                                    {/* Tool link */}
                                    {entry.toolId && entry.toolName ? (
                                        <Link
                                            href={`/tools/${entry.toolId}`}
                                            className="font-mono text-[10px] border border-neutral-300 px-2 py-1 hover:border-black hover:text-black text-neutral-500 transition-colors shrink-0 flex items-center gap-1"
                                        >
                                            {entry.toolName}
                                            <ArrowRight className="h-2.5 w-2.5" />
                                        </Link>
                                    ) : (
                                        <div className="w-20 shrink-0" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="border-t border-black px-5 py-3 flex items-center justify-between">
                        <button
                            onClick={() => applyFilters(undefined, undefined, page - 1)}
                            disabled={page === 0 || isPending}
                            className="border border-black p-1.5 hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-3 w-3" />
                        </button>
                        <span className="font-mono text-[10px] text-neutral-400">
                            Page {page + 1} of {totalPages}
                        </span>
                        <button
                            onClick={() => applyFilters(undefined, undefined, page + 1)}
                            disabled={page >= totalPages - 1 || isPending}
                            className="border border-black p-1.5 hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="h-3 w-3" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
