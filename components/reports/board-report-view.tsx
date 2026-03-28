"use client";

import { useState } from "react";
import { AnimatedBar } from "@/components/common/animated-bar";
import {
    Share2,
    Check,
    Printer,
    ArrowLeft,
    Activity,
    DollarSign,
    Database,
    Cpu,
    BookOpen,
    CalendarClock,
    FlaskConical,
} from "lucide-react";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────

interface ReportData {
    period: string;
    periodLabel: string;
    generatedAt: string;
    healthScore: number | null;
    healthBreakdown: Record<string, number> | null;
    totalMonthlySpend: number;
    spendByCategory: Array<{ category: string; total: number }>;
    spendMoMChange: number | null;
    totalTools: number;
    toolsByStatus: Record<string, number>;
    topToolsByScore: Array<{ name: string; score: number }>;
    newToolsThisPeriod: number;
    aiNativenessScore: number;
    aiNativenessLabel: string;
    aiNativeCount: number;
    aiEnabledCount: number;
    traditionalCount: number;
    recentDecisions: Array<{
        action: string;
        actorName: string | null;
        details: unknown;
        createdAt: string;
    }>;
    upcomingRenewals: Array<{
        toolName: string;
        renewalDate: string;
        monthlyCost: string | null;
    }>;
    researchSuccessRate: number;
    totalResearchJobs: number;
}

interface BoardReportViewProps {
    report: {
        id: string;
        title: string;
        period: string;
        createdAt: string;
        shareToken: string | null;
        data: Record<string, unknown>;
    };
    isPublic: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────

const ACTION_LABELS: Record<string, string> = {
    tool_added: "Tool Added",
    tool_archived: "Tool Archived",
    tool_researched: "Tool Researched",
    score_changed: "Score Changed",
    spend_added: "Spend Added",
    spend_updated: "Spend Updated",
    contract_uploaded: "Contract Uploaded",
    procurement_approved: "Procurement Approved",
    procurement_rejected: "Procurement Rejected",
    risk_alert: "Risk Alert",
    custom: "Custom",
};

function formatCurrency(n: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(n);
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

// ── Component ────────────────────────────────────────────────────────

export function BoardReportView({ report, isPublic }: BoardReportViewProps) {
    const [copied, setCopied] = useState(false);
    const data = report.data as unknown as ReportData;

    function handleShare() {
        if (!report.shareToken) return;
        const url = `${window.location.origin}/share/report/${report.shareToken}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    function handlePrint() {
        window.print();
    }

    const healthBreakdownEntries = data.healthBreakdown
        ? Object.entries(data.healthBreakdown)
        : [];

    const maxCategorySpend = data.spendByCategory.length > 0
        ? Math.max(...data.spendByCategory.map((c) => c.total))
        : 1;

    return (
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6 animate-fade-in-up">
            {/* Back + Actions */}
            {!isPublic && (
                <div className="flex items-center justify-between print:hidden">
                    <Link
                        href="/reports"
                        className="flex items-center gap-2 font-mono text-xs text-neutral-500 hover:text-black transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        All Reports
                    </Link>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="w-8 h-8 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                            title="Print report"
                        >
                            <Printer className="w-3.5 h-3.5" />
                        </button>
                        {report.shareToken && (
                            <button
                                onClick={handleShare}
                                className="border border-black px-3 py-1.5 font-mono text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors flex items-center gap-2"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3 h-3" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Share2 className="w-3 h-3" />
                                        Share
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* 1. Executive Summary */}
            <div className="border border-black p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
                            Executive Summary
                        </span>
                        <h1 className="font-serif text-2xl font-normal">
                            {report.title}
                        </h1>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="font-mono text-[10px] uppercase tracking-widest border border-neutral-300 px-1.5 py-0.5 text-neutral-500">
                                {data.periodLabel}
                            </span>
                            <span className="font-mono text-[10px] text-neutral-400">
                                Generated {formatDate(data.generatedAt)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Key metrics row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-200">
                    <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">
                            Tools
                        </span>
                        <span className="font-mono text-2xl font-bold">
                            {data.totalTools}
                        </span>
                    </div>
                    <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">
                            Monthly Spend
                        </span>
                        <span className="font-mono text-2xl font-bold">
                            {formatCurrency(data.totalMonthlySpend)}
                        </span>
                    </div>
                    <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">
                            Health Score
                        </span>
                        <span className="font-mono text-2xl font-bold">
                            {data.healthScore !== null ? data.healthScore : "--"}
                        </span>
                    </div>
                    <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">
                            AI Score
                        </span>
                        <span className="font-mono text-2xl font-bold">
                            {data.aiNativenessScore}
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Stack Health Score */}
            <div className="border border-black p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4" strokeWidth={1.5} />
                    <h2 className="font-mono text-xs uppercase tracking-widest">
                        Stack Health Score
                    </h2>
                </div>
                {data.healthScore !== null ? (
                    <>
                        <div className="flex items-end gap-3 mb-4">
                            <span className="font-mono text-5xl font-bold">
                                {data.healthScore}
                            </span>
                            <span className="font-mono text-sm text-neutral-400 pb-2">
                                / 100
                            </span>
                        </div>
                        {healthBreakdownEntries.length > 0 && (
                            <div className="space-y-3">
                                {healthBreakdownEntries.map(([key, value]) => (
                                    <div key={key}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-mono text-xs capitalize">
                                                {key.replace(/([A-Z])/g, " $1").trim()}
                                            </span>
                                            <span className="font-mono text-xs font-bold">
                                                {typeof value === "number" ? value : 0}
                                            </span>
                                        </div>
                                        <AnimatedBar
                                            value={Math.min(typeof value === "number" ? value : 0, 100)}
                                            height="h-1.5"
                                            delay={150}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <p className="font-mono text-sm text-neutral-400">
                        No health score computed yet. Run a health check to generate one.
                    </p>
                )}
            </div>

            {/* 3. Spend Overview */}
            <div className="border border-black p-6">
                <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-4 h-4" strokeWidth={1.5} />
                    <h2 className="font-mono text-xs uppercase tracking-widest">
                        Spend Overview
                    </h2>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">
                            Total Monthly
                        </span>
                        <span className="font-mono text-3xl font-bold">
                            {formatCurrency(data.totalMonthlySpend)}
                        </span>
                    </div>
                    <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">
                            Annualized
                        </span>
                        <span className="font-mono text-3xl font-bold">
                            {formatCurrency(data.totalMonthlySpend * 12)}
                        </span>
                    </div>
                </div>

                {data.spendMoMChange !== null && (
                    <div className="border border-neutral-200 p-3 mb-4">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">
                            Month-over-Month Change
                        </span>
                        <span
                            className={`font-mono text-sm font-bold ${
                                data.spendMoMChange > 0
                                    ? "text-red-600"
                                    : data.spendMoMChange < 0
                                    ? "text-black"
                                    : ""
                            }`}
                        >
                            {data.spendMoMChange > 0 ? "+" : ""}
                            {data.spendMoMChange.toFixed(1)}%
                        </span>
                    </div>
                )}

                {/* Category Breakdown */}
                {data.spendByCategory.length > 0 && (
                    <div className="space-y-2">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">
                            By Category
                        </span>
                        {data.spendByCategory.map((cat) => (
                            <div key={cat.category}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-mono text-xs">
                                        {cat.category}
                                    </span>
                                    <span className="font-mono text-xs font-bold">
                                        {formatCurrency(cat.total)}/mo
                                    </span>
                                </div>
                                <AnimatedBar
                                    value={(cat.total / maxCategorySpend) * 100}
                                    height="h-1.5"
                                    delay={150}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 4. Tool Portfolio */}
            <div className="border border-black p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Database className="w-4 h-4" strokeWidth={1.5} />
                    <h2 className="font-mono text-xs uppercase tracking-widest">
                        Tool Portfolio
                    </h2>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
                    <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">
                            Total
                        </span>
                        <span className="font-mono text-xl sm:text-2xl font-bold">
                            {data.totalTools}
                        </span>
                    </div>
                    <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">
                            New This Period
                        </span>
                        <span className="font-mono text-xl sm:text-2xl font-bold">
                            {data.newToolsThisPeriod}
                        </span>
                    </div>
                    <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">
                            Research Rate
                        </span>
                        <span className="font-mono text-xl sm:text-2xl font-bold">
                            {data.researchSuccessRate}%
                        </span>
                    </div>
                </div>

                {/* Status breakdown */}
                {Object.keys(data.toolsByStatus).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {Object.entries(data.toolsByStatus).map(([status, count]) => (
                            <div
                                key={status}
                                className="border border-black px-3 py-1.5"
                            >
                                <span className="font-mono text-xs capitalize">
                                    {status}
                                </span>
                                <span className="font-mono text-xs font-bold ml-2">
                                    {count}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Top 5 by score */}
                {data.topToolsByScore.length > 0 && (
                    <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-2">
                            Top 5 by Score
                        </span>
                        <div className="space-y-2">
                            {data.topToolsByScore.map((tool, i) => (
                                <div
                                    key={tool.name}
                                    className="flex items-center justify-between border border-neutral-200 px-3 py-2"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[10px] text-neutral-400 w-4">
                                            {i + 1}.
                                        </span>
                                        <span className="font-mono text-xs">
                                            {tool.name}
                                        </span>
                                    </div>
                                    <span className="font-mono text-xs font-bold">
                                        {tool.score.toFixed(1)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 5. AI Nativeness */}
            <div className="border border-black p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Cpu className="w-4 h-4" strokeWidth={1.5} />
                    <h2 className="font-mono text-xs uppercase tracking-widest">
                        AI Nativeness
                    </h2>
                </div>
                <div className="flex items-end gap-3 mb-1">
                    <span className="font-mono text-5xl font-bold">
                        {data.aiNativenessScore}
                    </span>
                    <span className="font-mono text-sm text-neutral-400 pb-2">
                        / 100
                    </span>
                </div>
                <span className="font-mono text-xs text-neutral-500 block mb-6">
                    {data.aiNativenessLabel}
                </span>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="border border-black p-2 sm:p-3 text-center">
                        <span className="font-mono text-xl sm:text-2xl font-bold block">
                            {data.aiNativeCount}
                        </span>
                        <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-neutral-500">
                            AI-Native
                        </span>
                    </div>
                    <div className="border border-black p-2 sm:p-3 text-center">
                        <span className="font-mono text-xl sm:text-2xl font-bold block">
                            {data.aiEnabledCount}
                        </span>
                        <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-neutral-500">
                            AI-Enabled
                        </span>
                    </div>
                    <div className="border border-black p-2 sm:p-3 text-center">
                        <span className="font-mono text-xl sm:text-2xl font-bold block">
                            {data.traditionalCount}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                            Traditional
                        </span>
                    </div>
                </div>
            </div>

            {/* 6. Recent Decisions */}
            {data.recentDecisions.length > 0 && (
                <div className="border border-black p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="w-4 h-4" strokeWidth={1.5} />
                        <h2 className="font-mono text-xs uppercase tracking-widest">
                            Recent Decisions
                        </h2>
                    </div>
                    <div className="space-y-2">
                        {data.recentDecisions.map((decision, i) => (
                            <div
                                key={i}
                                className="flex items-start justify-between gap-3 border border-neutral-200 px-3 py-2"
                            >
                                <div className="min-w-0">
                                    <span className="font-mono text-[10px] uppercase tracking-widest border border-neutral-300 px-1.5 py-0.5 text-neutral-500">
                                        {ACTION_LABELS[decision.action] ?? decision.action}
                                    </span>
                                    {decision.actorName && (
                                        <span className="font-mono text-[10px] text-neutral-400 ml-2">
                                            by {decision.actorName}
                                        </span>
                                    )}
                                </div>
                                <span className="font-mono text-[10px] text-neutral-400 flex-shrink-0">
                                    {formatDate(decision.createdAt)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 7. Upcoming Renewals */}
            {data.upcomingRenewals.length > 0 && (
                <div className="border border-black p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <CalendarClock className="w-4 h-4" strokeWidth={1.5} />
                        <h2 className="font-mono text-xs uppercase tracking-widest">
                            Upcoming Renewals
                        </h2>
                        <span className="font-mono text-[10px] text-neutral-400">
                            (Next 90 days)
                        </span>
                    </div>
                    <div className="space-y-2">
                        {data.upcomingRenewals.map((renewal, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between border border-neutral-200 px-3 py-2"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-xs font-medium">
                                        {renewal.toolName}
                                    </span>
                                    <span className="font-mono text-[10px] text-neutral-400">
                                        {formatDate(renewal.renewalDate)}
                                    </span>
                                </div>
                                {renewal.monthlyCost && (
                                    <span className="font-mono text-xs font-bold">
                                        {formatCurrency(parseFloat(renewal.monthlyCost))}/mo
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Research Stats */}
            <div className="border border-black p-6">
                <div className="flex items-center gap-2 mb-4">
                    <FlaskConical className="w-4 h-4" strokeWidth={1.5} />
                    <h2 className="font-mono text-xs uppercase tracking-widest">
                        Research Activity
                    </h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">
                            Total Jobs
                        </span>
                        <span className="font-mono text-2xl font-bold">
                            {data.totalResearchJobs}
                        </span>
                    </div>
                    <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">
                            Success Rate
                        </span>
                        <span className="font-mono text-2xl font-bold">
                            {data.researchSuccessRate}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
