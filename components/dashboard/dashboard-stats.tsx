"use client";

import { Activity, FileText, Star, AlertCircle } from "lucide-react";

export function DashboardStats({
    avgScore = 0,
    activeTools = 0,
    researchReports = 0,
    activePainPoints = 0
}: {
    avgScore?: number;
    activeTools?: number;
    researchReports?: number;
    activePainPoints?: number;
}) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 border border-black">
            <div className="p-5 border-r border-b md:border-b-0 border-black">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Avg Score</span>
                    <Star className="h-3.5 w-3.5 text-neutral-400" />
                </div>
                <div className="font-mono text-3xl font-bold">
                    {avgScore > 0 ? avgScore.toFixed(1) : "—"}
                </div>
                <p className="font-mono text-[10px] text-neutral-400 mt-1">across all researched tools</p>
            </div>

            <div className="p-5 border-b md:border-b-0 md:border-r border-black">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Total Tools</span>
                    <Activity className="h-3.5 w-3.5 text-neutral-400" />
                </div>
                <div className="font-mono text-3xl font-bold">{activeTools}</div>
                <p className="font-mono text-[10px] text-neutral-400 mt-1">in your workspace</p>
            </div>

            <div className="p-5 border-r border-black">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Reports</span>
                    <FileText className="h-3.5 w-3.5 text-neutral-400" />
                </div>
                <div className="font-mono text-3xl font-bold">{researchReports}</div>
                <p className="font-mono text-[10px] text-neutral-400 mt-1">reports generated</p>
            </div>

            <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Pain Points</span>
                    <AlertCircle className="h-3.5 w-3.5 text-neutral-400" />
                </div>
                <div className="font-mono text-3xl font-bold">{activePainPoints}</div>
                <p className="font-mono text-[10px] text-neutral-400 mt-1">problems tracked</p>
            </div>
        </div>
    );
}
