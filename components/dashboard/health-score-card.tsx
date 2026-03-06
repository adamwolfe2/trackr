"use client";

import { Shield, TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";

interface HealthScoreCardProps {
    score: number | null;
    previousScore?: number | null;
}

export function HealthScoreCard({ score, previousScore }: HealthScoreCardProps) {
    const delta =
        score !== null && previousScore !== null && previousScore !== undefined
            ? score - previousScore
            : null;

    const label =
        score === null
            ? "Not computed"
            : score >= 80
              ? "Excellent"
              : score >= 60
                ? "Good"
                : score >= 40
                  ? "Fair"
                  : "Needs Work";

    return (
        <Link
            href="/health"
            className="block border border-black p-5 hover:bg-neutral-50 transition-colors"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                    Stack Health
                </span>
                <Shield className="h-3.5 w-3.5 text-neutral-400" strokeWidth={1.5} />
            </div>

            <div className="flex items-end gap-2">
                <span className="font-mono text-2xl sm:text-3xl font-bold">
                    {score !== null ? score : "\u2014"}
                </span>
                {score !== null && (
                    <span className="font-mono text-sm text-neutral-400 mb-0.5">/100</span>
                )}
            </div>

            <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-[10px] text-neutral-400">{label}</span>
                {delta !== null && (
                    <span className="inline-flex items-center gap-0.5 font-mono text-[10px] font-medium">
                        {delta > 0 ? (
                            <>
                                <TrendingUp className="h-2.5 w-2.5" />
                                +{delta}
                            </>
                        ) : delta < 0 ? (
                            <>
                                <TrendingDown className="h-2.5 w-2.5 text-neutral-400" />
                                {delta}
                            </>
                        ) : (
                            <>
                                <Minus className="h-2.5 w-2.5 text-neutral-400" />
                                0
                            </>
                        )}
                    </span>
                )}
            </div>
        </Link>
    );
}
