"use client";

import Link from "next/link";
import { useState } from "react";
import { Star, Loader2, Clock } from "lucide-react";

interface GridTool {
    id: string;
    name: string;
    websiteUrl: string | null;
    logoUrl: string | null;
    status: string;
    overallScore: string | null;
    category: string[] | null;
}

function ToolIcon({ name, logoUrl, websiteUrl }: { name: string; logoUrl?: string | null; websiteUrl?: string | null }) {
    const [hasError, setHasError] = useState(false);
    const domain = websiteUrl
        ? (() => { try { return new URL(websiteUrl).hostname.replace("www.", ""); } catch { return null; } })()
        : null;
    const src = !hasError && logoUrl ? logoUrl : domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null;

    if (!src) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-neutral-100">
                <span className="font-mono font-bold text-2xl text-neutral-400">{name.charAt(0)}</span>
            </div>
        );
    }
    return (
        <img
            src={src}
            alt={name}
            className="w-full h-full object-contain p-2"
            onError={() => setHasError(true)}
        />
    );
}

const STATUS_DOT: Record<string, string> = {
    active: "bg-black",
    researching: "bg-neutral-400 animate-pulse",
    failed: "bg-red-400",
    queued: "bg-neutral-300",
    archived: "bg-neutral-200",
};

export function ToolGrid({ tools, scoreDeltaMap = {} }: { tools: GridTool[]; scoreDeltaMap?: Record<string, number> }) {
    if (tools.length === 0) {
        return (
            <div className="border border-dashed border-neutral-300 py-20 text-center">
                <p className="font-mono text-sm text-neutral-400">No tools yet. Add one to get started.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-px border border-black bg-black">
            {tools.map((tool) => (
                <Link
                    key={tool.id}
                    href={`/tools/${tool.id}`}
                    className="group bg-white hover:bg-[#F3F3EF] transition-colors flex flex-col items-center gap-1.5 p-3 relative"
                >
                    {/* Status dot */}
                    <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 ${STATUS_DOT[tool.status] ?? "bg-neutral-300"}`} />

                    {/* Logo */}
                    <div className="w-10 h-10 flex-shrink-0">
                        <ToolIcon name={tool.name} logoUrl={tool.logoUrl} websiteUrl={tool.websiteUrl} />
                    </div>

                    {/* Name */}
                    <span className="font-mono text-[10px] text-neutral-700 text-center leading-tight line-clamp-2 w-full">
                        {tool.name}
                    </span>

                    {/* Status indicator for in-progress tools */}
                    {tool.status === "researching" ? (
                        <span className="flex items-center gap-1 font-mono text-[9px] text-neutral-500">
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            Researching
                        </span>
                    ) : tool.status === "queued" ? (
                        <span className="flex items-center gap-1 font-mono text-[9px] text-neutral-400">
                            <Clock className="w-2.5 h-2.5" />
                            Queued
                        </span>
                    ) : tool.status === "failed" ? (
                        <span className="font-mono text-[9px] text-red-400">
                            Failed
                        </span>
                    ) : tool.overallScore ? (
                        <div className="flex items-center gap-1">
                            <span className="flex items-center gap-0.5 font-mono text-[9px] text-neutral-500">
                                <Star className="w-2 h-2 fill-neutral-400 text-neutral-400" />
                                {Number(tool.overallScore).toFixed(1)}
                            </span>
                            {scoreDeltaMap[tool.id] !== undefined && (
                                <span className={`font-mono text-[8px] ${scoreDeltaMap[tool.id] > 0 ? "text-black" : "text-neutral-400"}`}>
                                    {scoreDeltaMap[tool.id] > 0 ? "↑" : "↓"}{Math.abs(scoreDeltaMap[tool.id]).toFixed(1)}
                                </span>
                            )}
                        </div>
                    ) : null}
                </Link>
            ))}
        </div>
    );
}
