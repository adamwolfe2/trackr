"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Star, Loader2 } from "lucide-react";

interface KanbanTool {
    id: string;
    name: string;
    websiteUrl: string | null;
    logoUrl: string | null;
    status: string;
    overallScore: string | null;
    lastResearchedAt: Date | null;
    category: string[] | null;
}

interface Stats {
    totalTools: number;
    avgScore: string | null;
    researchedThisMonth: number;
    monthlySpend: number;
}

const COLUMNS = [
    { id: "backlog", label: "Backlog", statuses: ["queued", "submitted", "failed"] },
    { id: "researching", label: "Researching", statuses: ["researching"] },
    { id: "active", label: "Active", statuses: ["active", "testing"] },
    { id: "archived", label: "Archived", statuses: ["archived"] },
] as const;

function ToolLogo({ name, logoUrl, websiteUrl }: { name: string; logoUrl?: string | null; websiteUrl?: string | null }) {
    const [hasError, setHasError] = useState(false);
    const domain = websiteUrl ? (() => { try { return new URL(websiteUrl).hostname; } catch { return null; } })() : null;
    const src = (!hasError && logoUrl) ? logoUrl : domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : null;

    if (!src) {
        return <span className="text-sm font-bold text-neutral-400 font-mono w-6 h-6 flex items-center justify-center">{name.charAt(0)}</span>;
    }

    return <img src={src} alt={name} className="w-6 h-6 object-contain flex-shrink-0" onError={() => setHasError(true)} />;
}

function ToolCard({ tool }: { tool: KanbanTool }) {
    return (
        <Link href={`/tools/${tool.id}`}>
            <div className="border border-black bg-white p-3 hover:bg-[#F3F3EF] transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-1.5">
                    <ToolLogo name={tool.name} logoUrl={tool.logoUrl} websiteUrl={tool.websiteUrl} />
                    <span className="text-sm font-semibold leading-tight line-clamp-1 flex-1 font-sans">{tool.name}</span>
                    {tool.overallScore && (
                        <span className="flex items-center gap-0.5 bg-black text-white text-[10px] font-mono px-1.5 py-0.5 shrink-0">
                            <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                            {Number(tool.overallScore).toFixed(1)}
                        </span>
                    )}
                </div>
                <div className="text-[10px] font-mono text-neutral-400">
                    {tool.status === "researching" ? (
                        <span className="flex items-center gap-1 text-blue-600">
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            Researching...
                        </span>
                    ) : tool.status === "failed" ? (
                        <span className="text-red-500">Research failed</span>
                    ) : tool.lastResearchedAt ? (
                        formatDistanceToNow(new Date(tool.lastResearchedAt), { addSuffix: true })
                    ) : (
                        "Queued for research"
                    )}
                </div>
                {tool.category && tool.category.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                        {tool.category.slice(0, 2).map(c => (
                            <span key={c} className="text-[9px] font-mono border border-neutral-300 px-1 text-neutral-500">{c}</span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
}

export function KanbanBoard({ tools, stats }: { tools: KanbanTool[]; stats: Stats }) {
    return (
        <div className="space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 border border-black">
                <div className="p-4 border-r border-b md:border-b-0 border-black">
                    <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Total Tools</div>
                    <div className="text-3xl font-bold font-mono mt-1">{stats.totalTools}</div>
                </div>
                <div className="p-4 border-b md:border-b-0 md:border-r border-black">
                    <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Avg Score</div>
                    <div className="text-3xl font-bold font-mono mt-1">
                        {stats.avgScore ?? "—"}
                        {stats.avgScore && <span className="text-sm text-neutral-400 font-normal">/10</span>}
                    </div>
                </div>
                <div className="p-4 border-r border-black">
                    <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Researched / Mo</div>
                    <div className="text-3xl font-bold font-mono mt-1">{stats.researchedThisMonth}</div>
                </div>
                <div className="p-4">
                    <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Monthly Spend</div>
                    <div className="text-3xl font-bold font-mono mt-1">
                        ${stats.monthlySpend.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                </div>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {COLUMNS.map((col) => {
                    const colTools = tools.filter(t => (col.statuses as readonly string[]).includes(t.status));
                    return (
                        <div key={col.id} className="flex flex-col gap-2">
                            {/* Column Header */}
                            <div className="flex items-center justify-between px-0 pb-1.5 border-b-2 border-black">
                                <span className="text-[11px] font-mono font-bold uppercase tracking-widest">{col.label}</span>
                                <span className="text-[10px] font-mono bg-black text-white px-1.5 py-0.5">{colTools.length}</span>
                            </div>

                            {/* Cards */}
                            <div className="flex flex-col gap-2 min-h-[160px]">
                                {colTools.map((tool) => (
                                    <ToolCard key={tool.id} tool={tool} />
                                ))}
                                {colTools.length === 0 && (
                                    <div className="border border-dashed border-neutral-300 p-4 text-center text-[10px] font-mono text-neutral-400">
                                        Empty
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
