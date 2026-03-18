"use client";

import { useState } from "react";
import { RiskBadge } from "./risk-badge";
import {
    ChevronDown,
    ChevronUp,
    AlertTriangle,
    Shield,
    Activity,
    PlusCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type AlertLevel = "low" | "medium" | "high" | "critical";

type RiskBreakdown = {
    securityPosture: number;
    complianceCerts: number;
    dataBreaches: number;
    vendorStability: number;
    privacyPolicy: number;
};

type Finding = {
    category: string;
    finding: string;
    severity: "low" | "medium" | "high" | "critical";
    source?: string;
};

type ToolWithRisk = {
    toolId: string;
    toolName: string;
    logoUrl: string | null;
    status: string;
    websiteUrl: string | null;
    overallRisk: number;
    alertLevel: string;
    breakdown: RiskBreakdown;
    findings: Finding[] | null;
    assessedAt: Date;
};

type RiskAlert = {
    id: string;
    toolId: string;
    toolName: string;
    overallRisk: number;
    alertLevel: string;
    assessedAt: Date;
};

type Stats = {
    totalMonitored: number;
    avgRisk: number;
    highCriticalCount: number;
};

const BREAKDOWN_LABELS: Record<keyof RiskBreakdown, string> = {
    securityPosture: "Security Posture",
    complianceCerts: "Compliance Certs",
    dataBreaches: "Data Breaches",
    vendorStability: "Vendor Stability",
    privacyPolicy: "Privacy Policy",
};

function riskBarColor(score: number): string {
    if (score >= 80) return "bg-black";
    if (score >= 60) return "bg-neutral-700";
    if (score >= 30) return "bg-neutral-400";
    return "bg-neutral-200";
}

function heatmapColor(score: number): string {
    if (score >= 80) return "bg-neutral-200 border-black";
    if (score >= 60) return "bg-neutral-100 border-neutral-700";
    if (score >= 30) return "bg-neutral-50 border-neutral-400";
    return "bg-white border-neutral-300";
}

export function RiskClient({
    tools = [],
    stats,
    alerts = [],
}: {
    tools?: ToolWithRisk[];
    stats: Stats;
    alerts?: RiskAlert[];
}) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filterLevel, setFilterLevel] = useState<AlertLevel | "all">("all");
    const [sortDesc, setSortDesc] = useState(true);

    const filtered = tools
        .filter(t => filterLevel === "all" || t.alertLevel === filterLevel)
        .sort((a, b) => sortDesc ? b.overallRisk - a.overallRisk : a.overallRisk - b.overallRisk);

    return (
        <div className="space-y-6">
            {/* Alert Banner */}
            {alerts.length > 0 && (
                <div className="border border-black bg-neutral-100 px-5 py-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-black shrink-0 mt-0.5" />
                    <div>
                        <p className="font-mono text-sm font-semibold text-black">
                            {alerts.length} tool{alerts.length !== 1 ? "s" : ""} with high or critical risk
                        </p>
                        <p className="font-mono text-xs text-neutral-600 mt-1">
                            {alerts.map(a => a.toolName).join(", ")}
                        </p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">Intelligence</p>
                    <h1 className="font-serif text-2xl font-normal">Risk Monitor</h1>
                    <p className="font-mono text-xs text-neutral-500 mt-1">
                        Vendor risk scoring across your tool stack.
                    </p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-black border border-black">
                <div className="bg-white px-5 py-4">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Tools Monitored</p>
                    <p className="font-serif text-2xl">{stats.totalMonitored}</p>
                </div>
                <div className="bg-white px-5 py-4">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Avg Risk Score</p>
                    <div className="flex items-center gap-2">
                        <p className="font-serif text-2xl">{stats.avgRisk}</p>
                        <span className="font-mono text-[10px] text-neutral-400">/ 100</span>
                    </div>
                </div>
                <div className="bg-white px-5 py-4">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">High / Critical Alerts</p>
                    <p className={`font-serif text-2xl ${stats.highCriticalCount > 0 ? "text-black font-bold" : ""}`}>
                        {stats.highCriticalCount}
                    </p>
                </div>
            </div>

            {/* Risk Heatmap */}
            {tools.length > 0 && (
                <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">Risk Heatmap</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                        {tools.map((tool) => (
                            <button
                                key={tool.toolId}
                                onClick={() => setExpandedId(expandedId === tool.toolId ? null : tool.toolId)}
                                className={`border p-3 text-left transition-colors hover:opacity-80 ${heatmapColor(tool.overallRisk)}`}
                            >
                                <p className="font-mono text-xs font-semibold truncate">{tool.toolName}</p>
                                <p className="font-serif text-lg mt-1">{tool.overallRisk}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {tools.length === 0 ? (
                <div className="border border-black bg-white p-12 text-center">
                    <Shield className="w-8 h-8 mx-auto mb-4 text-neutral-300" />
                    <h3 className="font-serif text-lg mb-2">No risk assessments yet</h3>
                    <p className="font-mono text-xs text-neutral-500 mb-6 max-w-sm mx-auto">
                        Risk profiles are generated automatically when you research tools. Add and research tools to see security posture, compliance, and vendor stability scores.
                    </p>
                    <a href="/tools" className="inline-flex items-center gap-2 border border-black px-4 py-2 font-mono text-xs bg-black text-white hover:bg-neutral-800">
                        <PlusCircle className="w-3.5 h-3.5" /> Add Tools to Monitor
                    </a>
                </div>
            ) : (
                <>
                    {/* Filters */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Filter:</span>
                        {(["all", "critical", "high", "medium", "low"] as const).map((level) => (
                            <button
                                key={level}
                                onClick={() => setFilterLevel(level)}
                                className={`font-mono text-xs px-3 py-1 border ${
                                    filterLevel === level
                                        ? "border-black bg-black text-white"
                                        : "border-neutral-300 hover:border-black"
                                }`}
                            >
                                {level === "all" ? "All" : level.charAt(0).toUpperCase() + level.slice(1)}
                            </button>
                        ))}
                        <button
                            onClick={() => setSortDesc(!sortDesc)}
                            className="flex items-center gap-1 font-mono text-xs px-3 py-1 border border-neutral-300 hover:border-black ml-auto"
                        >
                            <Activity className="w-3 h-3" />
                            {sortDesc ? "Highest First" : "Lowest First"}
                        </button>
                    </div>

                    {/* Tool Risk List */}
                    <div className="border border-black bg-white divide-y divide-black">
                        {filtered.map((tool) => {
                            const isExpanded = expandedId === tool.toolId;
                            const findings = tool.findings ?? [];

                            return (
                                <div key={tool.toolId}>
                                    {/* Row */}
                                    <div
                                        className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-neutral-50 transition-colors"
                                        onClick={() => setExpandedId(isExpanded ? null : tool.toolId)}
                                    >
                                        <button className="shrink-0 border border-black w-7 h-7 flex items-center justify-center">
                                            {isExpanded
                                                ? <ChevronUp className="w-4 h-4" />
                                                : <ChevronDown className="w-4 h-4" />
                                            }
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-sm font-semibold truncate">{tool.toolName}</span>
                                                <RiskBadge alertLevel={tool.alertLevel as AlertLevel} />
                                            </div>
                                        </div>

                                        {/* Risk Score Bar */}
                                        <div className="hidden sm:flex items-center gap-3 w-48">
                                            <div className="flex-1 h-3 bg-neutral-100 border border-black relative">
                                                <div
                                                    className={`absolute inset-y-0 left-0 ${riskBarColor(tool.overallRisk)}`}
                                                    style={{ width: `${tool.overallRisk}%` }}
                                                />
                                            </div>
                                            <span className="font-mono text-xs font-semibold w-8 text-right">{tool.overallRisk}</span>
                                        </div>

                                        <span className="font-mono text-[10px] text-neutral-400 shrink-0 hidden lg:block">
                                            {formatDistanceToNow(new Date(tool.assessedAt), { addSuffix: true })}
                                        </span>
                                    </div>

                                    {/* Expanded Detail */}
                                    {isExpanded && (
                                        <div className="border-t border-black bg-neutral-50 px-5 py-5 space-y-4">
                                            {/* Mobile score bar */}
                                            <div className="sm:hidden flex items-center gap-3">
                                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Score:</span>
                                                <div className="flex-1 h-3 bg-neutral-100 border border-black relative">
                                                    <div
                                                        className={`absolute inset-y-0 left-0 ${riskBarColor(tool.overallRisk)}`}
                                                        style={{ width: `${tool.overallRisk}%` }}
                                                    />
                                                </div>
                                                <span className="font-mono text-xs font-semibold">{tool.overallRisk}/100</span>
                                            </div>

                                            {/* Breakdown Bars */}
                                            <div>
                                                <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">Risk Breakdown</p>
                                                <div className="space-y-2">
                                                    {(Object.entries(BREAKDOWN_LABELS) as [keyof RiskBreakdown, string][]).map(([key, label]) => {
                                                        const score = tool.breakdown[key] ?? 0;
                                                        return (
                                                            <div key={key} className="flex items-center gap-3">
                                                                <span className="font-mono text-[10px] text-neutral-500 w-32 shrink-0 text-right">{label}</span>
                                                                <div className="flex-1 h-2.5 bg-neutral-100 border border-black relative">
                                                                    <div
                                                                        className={`absolute inset-y-0 left-0 ${riskBarColor(score)}`}
                                                                        style={{ width: `${score}%` }}
                                                                    />
                                                                </div>
                                                                <span className="font-mono text-[10px] w-8 text-right">{score}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Findings */}
                                            {findings.length > 0 && (
                                                <div>
                                                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">
                                                        Findings ({findings.length})
                                                    </p>
                                                    <div className="border border-black divide-y divide-black bg-white">
                                                        {findings.map((finding, i) => (
                                                            <div key={i} className="px-4 py-3 flex items-start gap-3">
                                                                <RiskBadge alertLevel={finding.severity} />
                                                                <div className="min-w-0">
                                                                    <p className="font-mono text-xs">{finding.finding}</p>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <span className="font-mono text-[10px] text-neutral-400">{finding.category}</span>
                                                                        {finding.source && (
                                                                            <span className="font-mono text-[10px] text-neutral-400">
                                                                                -- {finding.source}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Assessed timestamp */}
                                            <p className="font-mono text-[10px] text-neutral-400">
                                                Last assessed {formatDistanceToNow(new Date(tool.assessedAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {filtered.length === 0 && (
                            <div className="px-5 py-8 text-center">
                                <p className="font-mono text-xs text-neutral-400">
                                    No tools match the selected filter.
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
