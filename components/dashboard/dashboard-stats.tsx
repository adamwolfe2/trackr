"use client";

import { Activity, FileText, Star, AlertCircle, TrendingUp } from "lucide-react";

function WeekDelta({ count }: { count: number }) {
    if (count <= 0) return null;
    return (
        <span className="inline-flex items-center gap-0.5 font-mono text-[10px] text-black font-medium">
            <TrendingUp className="h-2.5 w-2.5" />
            +{count} this week
        </span>
    );
}

export function DashboardStats({
    avgScore = 0,
    activeTools = 0,
    researchReports = 0,
    activePainPoints = 0,
    toolsThisWeek = 0,
    reportsThisWeek = 0,
}: {
    avgScore?: number;
    activeTools?: number;
    researchReports?: number;
    activePainPoints?: number;
    toolsThisWeek?: number;
    reportsThisWeek?: number;
}) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 border border-black">
            <div className="p-5 border-r border-b md:border-b-0 border-black">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Avg Score</span>
                    <Star className="h-3.5 w-3.5 text-neutral-400" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold">
                    {avgScore > 0 ? avgScore.toFixed(1) : "—"}
                </div>
                <p className="font-mono text-[10px] text-neutral-400 mt-1">across all researched tools</p>
            </div>

            <div className="p-5 border-b md:border-b-0 md:border-r border-black">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Total Tools</span>
                    <Activity className="h-3.5 w-3.5 text-neutral-400" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold">{activeTools}</div>
                <p className="font-mono text-[10px] text-neutral-400 mt-1">
                    <WeekDelta count={toolsThisWeek} />
                    {toolsThisWeek <= 0 && "in your workspace"}
                </p>
            </div>

            <div className="p-5 border-r border-black">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Reports</span>
                    <FileText className="h-3.5 w-3.5 text-neutral-400" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold">{researchReports}</div>
                <p className="font-mono text-[10px] text-neutral-400 mt-1">
                    <WeekDelta count={reportsThisWeek} />
                    {reportsThisWeek <= 0 && "reports generated"}
                </p>
            </div>

            <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Pain Points</span>
                    <AlertCircle className="h-3.5 w-3.5 text-neutral-400" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold">{activePainPoints}</div>
                <p className="font-mono text-[10px] text-neutral-400 mt-1">problems tracked</p>
            </div>
        </div>
    );
}
