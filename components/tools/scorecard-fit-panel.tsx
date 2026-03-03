"use client";

import { AlertTriangle, Target, Building2, Settings } from "lucide-react";
import Link from "next/link";

type DealBreakerFlag = {
    trigger: string;
    severity: "hard" | "soft";
    explanation: string;
};

type PainPointMapping = {
    painPointTitle: string;
    addressesIt: "fully" | "partially" | "tangentially";
    explanation: string;
};

type BusinessUnitRelevance = {
    unitName: string;
    relevanceScore: number;
    reason: string;
};

export type WorkspaceFitData = {
    fitScore: number;
    fitJustification: string;
    dealBreakerFlags: DealBreakerFlag[];
    painPointMapping: PainPointMapping[];
    businessUnitRelevance: BusinessUnitRelevance[];
};

interface ScorecardFitPanelProps {
    fitData: WorkspaceFitData | null;
    hasRecipe: boolean;
    hasReport: boolean;
}

const coverageBadge: Record<string, { label: string; className: string }> = {
    fully: { label: "Fully", className: "border-black bg-black text-white" },
    partially: { label: "Partially", className: "border-black text-black" },
    tangentially: { label: "Tangentially", className: "border-neutral-400 text-neutral-500" },
};

export function ScorecardFitPanel({ fitData, hasRecipe, hasReport }: ScorecardFitPanelProps) {
    // No recipe configured — CTA to settings
    if (!hasRecipe) {
        return (
            <div className="border border-neutral-300 p-5">
                <div className="flex items-start gap-3">
                    <Settings className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <h2 className="font-mono text-xs uppercase tracking-widest mb-1">Workspace Fit</h2>
                        <p className="font-mono text-xs text-neutral-500 mb-3">
                            Configure a scorecard recipe in workspace settings to get workspace-specific fit scoring for every tool you research.
                        </p>
                        <Link
                            href="/settings"
                            className="font-mono text-xs uppercase tracking-widest border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors inline-block"
                        >
                            Configure Recipe
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Has recipe but no fit data (old report or research hasn't run yet)
    if (!fitData) {
        return (
            <div className="border border-neutral-300 p-5">
                <div className="flex items-start gap-3">
                    <Target className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <h2 className="font-mono text-xs uppercase tracking-widest mb-1">Workspace Fit</h2>
                        <p className="font-mono text-xs text-neutral-500">
                            {hasReport
                                ? "This report was generated before fit scoring was available. Re-run research to generate workspace fit data."
                                : "Run research to generate workspace fit scoring."}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="border border-black p-5 space-y-5">
            <h2 className="font-mono text-xs uppercase tracking-widest">Workspace Fit</h2>

            {/* A. Fit Score */}
            <div className="flex items-start gap-4">
                <div className="text-right flex-shrink-0">
                    <div className="font-mono text-3xl font-bold">{fitData.fitScore.toFixed(1)}</div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Fit</div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="h-1.5 w-full bg-neutral-100 border border-neutral-200 mb-2">
                        <div className="h-full bg-black" style={{ width: `${(fitData.fitScore / 10) * 100}%` }} />
                    </div>
                    <p className="font-mono text-xs text-neutral-600 leading-relaxed">{fitData.fitJustification}</p>
                </div>
            </div>

            {/* B. Deal Breaker Flags */}
            <div>
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Deal Breakers</h3>
                {fitData.dealBreakerFlags.length === 0 ? (
                    <p className="font-mono text-xs text-neutral-500">No deal breakers detected.</p>
                ) : (
                    <div className="space-y-2">
                        {fitData.dealBreakerFlags.map((flag, i) => (
                            <div
                                key={i}
                                className={`border p-3 flex items-start gap-2 ${
                                    flag.severity === "hard"
                                        ? "border-red-600 bg-red-50"
                                        : "border-yellow-500 bg-yellow-50"
                                }`}
                            >
                                <AlertTriangle
                                    className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${
                                        flag.severity === "hard" ? "text-red-600" : "text-yellow-600"
                                    }`}
                                />
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-mono text-xs font-bold">{flag.trigger}</span>
                                        <span
                                            className={`font-mono text-[10px] uppercase border px-1.5 py-0.5 ${
                                                flag.severity === "hard"
                                                    ? "border-red-600 text-red-600"
                                                    : "border-yellow-600 text-yellow-600"
                                            }`}
                                        >
                                            {flag.severity}
                                        </span>
                                    </div>
                                    <p className="font-mono text-xs text-neutral-600 mt-1">{flag.explanation}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* C. Pain Point Mapping */}
            {fitData.painPointMapping.length > 0 && (
                <div>
                    <h3 className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Pain Point Coverage</h3>
                    <div className="space-y-2">
                        {fitData.painPointMapping.map((pp, i) => (
                            <div key={i} className="border border-black p-3">
                                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                                    <span className="font-mono text-xs font-bold">{pp.painPointTitle}</span>
                                    <span
                                        className={`font-mono text-[10px] uppercase border px-1.5 py-0.5 ${
                                            coverageBadge[pp.addressesIt]?.className ?? "border-neutral-300 text-neutral-500"
                                        }`}
                                    >
                                        {coverageBadge[pp.addressesIt]?.label ?? pp.addressesIt}
                                    </span>
                                </div>
                                <p className="font-mono text-xs text-neutral-600">{pp.explanation}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* D. Business Unit Relevance */}
            {fitData.businessUnitRelevance.length > 0 && (
                <div>
                    <h3 className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2 flex items-center gap-1.5">
                        <Building2 className="h-3 w-3" />
                        Business Unit Relevance
                    </h3>
                    <div className="space-y-3">
                        {fitData.businessUnitRelevance.map((bu, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-mono text-xs">{bu.unitName}</span>
                                    <span className="font-mono text-xs font-bold">{bu.relevanceScore}/10</span>
                                </div>
                                <div className="h-1.5 w-full bg-neutral-100 border border-neutral-200">
                                    <div className="h-full bg-black" style={{ width: `${(bu.relevanceScore / 10) * 100}%` }} />
                                </div>
                                <p className="font-mono text-[10px] text-neutral-500 mt-1">{bu.reason}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
