"use client";

import { useState } from "react";
import { LayoutGrid, Kanban } from "lucide-react";
import { KanbanBoard } from "./kanban-board";
import { ToolGrid } from "./tool-grid";
import { BulkSchedulePicker } from "./bulk-schedule-picker";

interface Tool {
    id: string;
    name: string;
    websiteUrl: string | null;
    logoUrl: string | null;
    status: string;
    overallScore: string | null;
    lastResearchedAt: Date | null;
    category: string[] | null;
    researchInterval?: string | null;
}

interface Stats {
    totalTools: number;
    avgScore: string | null;
    researchedThisMonth: number;
    monthlySpend: number;
}

export function ToolsView({ tools, stats, isEmpty, canSchedule = false, scoreDeltaMap = {} }: { tools: Tool[]; stats: Stats; isEmpty: boolean; canSchedule?: boolean; scoreDeltaMap?: Record<string, number> }) {
    const [view, setView] = useState<"kanban" | "grid">("kanban");

    return (
        <div className="space-y-4">
            {/* View toggle + bulk actions */}
            <div className="flex items-center justify-between gap-2">
                <BulkSchedulePicker tools={tools} canSchedule={canSchedule} />
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setView("kanban")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs border transition-colors ${
                            view === "kanban"
                                ? "border-black bg-black text-white"
                                : "border-black bg-white text-neutral-500 hover:bg-neutral-100"
                        }`}
                    >
                        <Kanban className="w-3.5 h-3.5" />
                        Board
                    </button>
                    <button
                        onClick={() => setView("grid")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs border transition-colors ${
                            view === "grid"
                                ? "border-black bg-black text-white"
                                : "border-black bg-white text-neutral-500 hover:bg-neutral-100"
                        }`}
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        Icon Grid
                    </button>
                </div>
            </div>

            {view === "kanban" ? (
                <KanbanBoard tools={tools} stats={stats} isEmpty={isEmpty} />
            ) : (
                <ToolGrid tools={tools} scoreDeltaMap={scoreDeltaMap} />
            )}
        </div>
    );
}
