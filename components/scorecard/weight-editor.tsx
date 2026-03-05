"use client";

import { useState, useTransition } from "react";
import { saveScorecardWeights } from "@/lib/actions/workspace";
import { toast } from "sonner";
import { Loader2, RotateCcw } from "lucide-react";

export interface ScorecardWeights {
    core: number;
    ease: number;
    integration: number;
    pricing: number;
    ai: number;
    community: number;
    scale: number;
}

const DEFAULT_WEIGHTS: ScorecardWeights = {
    core: 25,
    ease: 15,
    integration: 15,
    pricing: 15,
    ai: 15,
    community: 10,
    scale: 5,
};

const DIMENSION_LABELS: Record<keyof ScorecardWeights, string> = {
    core: "Core Capability",
    ease: "Ease of Use",
    integration: "Integration Depth",
    pricing: "Pricing Value",
    ai: "AI Sophistication",
    community: "Community & Support",
    scale: "Scalability",
};

interface WeightEditorProps {
    savedWeights?: ScorecardWeights | null;
    canEditWeights: boolean;
}

export function WeightEditor({ savedWeights, canEditWeights }: WeightEditorProps) {
    const [weights, setWeights] = useState<ScorecardWeights>(savedWeights || DEFAULT_WEIGHTS);
    const [isPending, startTransition] = useTransition();

    const total = Object.values(weights).reduce((sum, v) => sum + v, 0);
    const isValid = total === 100;

    const updateWeight = (key: keyof ScorecardWeights, value: number) => {
        if (!canEditWeights) return;
        setWeights((prev) => ({ ...prev, [key]: Math.max(0, Math.min(100, value)) }));
    };

    const handleReset = () => {
        setWeights(DEFAULT_WEIGHTS);
    };

    const handleSave = () => {
        if (!isValid) return;
        startTransition(async () => {
            try {
                await saveScorecardWeights(weights);
                toast.success("Scoring weights saved. New research will use these weights.");
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to save weights.");
            }
        });
    };

    return (
        <div className="border border-black bg-white">
            <div className="border-b border-black px-4 py-3 flex items-center justify-between bg-neutral-50 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold uppercase tracking-wide">Scoring Weights</span>
                    <span className={`font-mono text-[10px] px-2 py-0.5 border ${isValid ? "border-black" : "border-red-500 text-red-600"}`}>
                        {total}% / 100%
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReset}
                        disabled={!canEditWeights}
                        className="flex items-center gap-1.5 border border-black px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide hover:bg-neutral-100 transition-colors disabled:opacity-40"
                    >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isPending || !isValid || !canEditWeights}
                        className="flex items-center gap-1.5 bg-black text-white px-4 py-1.5 font-mono text-[10px] uppercase tracking-wide border border-black disabled:opacity-40"
                    >
                        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Save Weights
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-3">
                {!canEditWeights && (
                    <div className="border border-neutral-300 bg-neutral-50 p-3 mb-2">
                        <p className="font-mono text-xs text-neutral-500">
                            Custom scoring weights require a Startup plan or higher.
                        </p>
                    </div>
                )}

                {(Object.keys(DIMENSION_LABELS) as Array<keyof ScorecardWeights>).map((key) => (
                    <div key={key} className="flex items-center gap-4">
                        <div className="w-40 flex-shrink-0">
                            <span className="font-mono text-xs">{DIMENSION_LABELS[key]}</span>
                        </div>
                        <div className="flex-1 relative h-6 border border-black bg-[#F3F3EF]">
                            <div
                                className="absolute inset-y-0 left-0 bg-black transition-all"
                                style={{ width: `${weights[key]}%` }}
                            />
                        </div>
                        <div className="w-16 flex-shrink-0">
                            <input
                                type="number"
                                value={weights[key]}
                                onChange={(e) => updateWeight(key, parseInt(e.target.value) || 0)}
                                disabled={!canEditWeights}
                                min={0}
                                max={100}
                                className="w-full border border-black px-2 py-1 font-mono text-xs text-center bg-white focus:outline-none disabled:opacity-40"
                            />
                        </div>
                        <span className="font-mono text-[10px] text-neutral-400 w-4">%</span>
                    </div>
                ))}

                {!isValid && (
                    <p className="font-mono text-xs text-red-600 mt-2">
                        Weights must total 100%. Currently: {total}%.
                    </p>
                )}

                <p className="font-mono text-[10px] text-neutral-400 mt-3">
                    Weights affect how the overall score is calculated for newly researched tools. Existing scores are not affected.
                </p>
            </div>
        </div>
    );
}
