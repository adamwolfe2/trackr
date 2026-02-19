"use client";

import { useState } from "react";
import { Check, X, ArrowRightLeft, Plus, ExternalLink } from "lucide-react";
import Link from "next/link";

interface CompareTool {
    id: string;
    name: string;
    score: number | null;
    websiteUrl: string | null;
    status: string;
    pros: string[];
    cons: string[];
    pricing: any;
    features: any;
    summary: string | null;
}

interface CompareClientProps {
    tools: CompareTool[];
}

export function CompareClient({ tools }: CompareClientProps) {
    const [selectedToolIds, setSelectedToolIds] = useState<(string | null)[]>([null, null]);

    const handleToolSelect = (index: number, toolId: string) => {
        const newSelection = [...selectedToolIds];
        newSelection[index] = toolId;
        setSelectedToolIds(newSelection);
    };

    const selectedTools = selectedToolIds.map(id => id ? tools.find(t => t.id === id) ?? null : null);

    const getPricingText = (pricing: any): string => {
        if (!pricing) return "Unknown";
        if (typeof pricing === "string") return pricing;
        if (Array.isArray(pricing) && pricing.length > 0) {
            return pricing[0]?.price ?? pricing[0]?.tier ?? "See website";
        }
        return "See website";
    };

    const getFeaturesList = (features: any): string[] => {
        if (!features) return [];
        if (Array.isArray(features)) return features.slice(0, 5);
        if (typeof features === "object" && "list" in features && Array.isArray(features.list)) {
            return features.list.slice(0, 5);
        }
        return [];
    };

    if (tools.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <ArrowRightLeft className="h-5 w-5" strokeWidth={1.5} />
                    <h1 className="font-serif text-2xl font-normal">Compare Tools</h1>
                </div>
                <div className="border border-black p-16 text-center">
                    <ArrowRightLeft className="h-8 w-8 mx-auto mb-4 text-neutral-400" strokeWidth={1.5} />
                    <p className="font-serif text-lg mb-1">No tools to compare</p>
                    <p className="font-mono text-xs text-neutral-500 mb-6">
                        Submit and research at least 2 tools to start comparing them side by side.
                    </p>
                    <Link
                        href="/submit"
                        className="inline-block border border-black px-6 py-2.5 font-mono text-xs uppercase tracking-widest bg-black text-white hover:bg-neutral-800"
                    >
                        Submit a Tool
                    </Link>
                </div>
            </div>
        );
    }

    const noneSelected = selectedTools.every(t => !t);

    const ROW_LABELS = ["Overall Score", "Starting Price", "Summary", "Pros", "Cons", "Key Features"];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <ArrowRightLeft className="h-5 w-5" strokeWidth={1.5} />
                <h1 className="font-serif text-2xl font-normal">Compare Tools</h1>
            </div>

            {noneSelected && (
                <div className="border border-black/20 p-4 font-mono text-xs text-neutral-500">
                    Select 2 tools below to compare them side by side.
                </div>
            )}

            <div className="overflow-x-auto pb-4">
                <div className="min-w-[700px] border border-black">
                    {/* Tool Selectors Row */}
                    <div className="grid grid-cols-3 border-b border-black">
                        <div className="p-4 border-r border-black bg-neutral-50">
                            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">Criteria</span>
                        </div>
                        {[0, 1].map((index) => {
                            const tool = selectedTools[index];
                            return (
                                <div key={index} className={`p-4 ${index === 0 ? "border-r border-black" : ""}`}>
                                    <label className="block font-mono text-xs uppercase tracking-widest text-neutral-400 mb-2">
                                        Tool {index + 1}
                                    </label>
                                    <select
                                        value={selectedToolIds[index] ?? ""}
                                        onChange={(e) => handleToolSelect(index, e.target.value)}
                                        className="w-full border border-black px-3 py-2 font-mono text-xs bg-white focus:outline-none"
                                    >
                                        <option value="">Select tool...</option>
                                        {tools.map(t => (
                                            <option
                                                key={t.id}
                                                value={t.id}
                                                disabled={selectedToolIds.includes(t.id) && selectedToolIds[index] !== t.id}
                                            >
                                                {t.name}{t.score !== null ? ` (${t.score.toFixed(1)})` : ""}
                                            </option>
                                        ))}
                                    </select>
                                    {tool?.websiteUrl && (
                                        <a
                                            href={tool.websiteUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 flex items-center gap-1 font-mono text-xs text-neutral-400 hover:text-black"
                                        >
                                            {(() => { try { return new URL(tool.websiteUrl).hostname; } catch { return tool.websiteUrl; } })()}
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Score Row */}
                    <div className="grid grid-cols-3 border-b border-black">
                        <div className="p-4 border-r border-black bg-neutral-50">
                            <span className="font-mono text-xs text-neutral-500">Overall Score</span>
                        </div>
                        {[0, 1].map((index) => {
                            const tool = selectedTools[index];
                            return (
                                <div key={index} className={`p-4 ${index === 0 ? "border-r border-black" : ""}`}>
                                    {tool ? (
                                        tool.score !== null ? (
                                            <div className="flex items-center gap-3">
                                                <span className="font-serif text-2xl">{tool.score.toFixed(1)}</span>
                                                <div className="flex-1 h-2 border border-black bg-white">
                                                    <div
                                                        className="h-full bg-black"
                                                        style={{ width: `${(tool.score / 10) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="font-mono text-xs text-neutral-400">/10</span>
                                            </div>
                                        ) : (
                                            <span className="font-mono text-xs text-neutral-400 italic">No score yet</span>
                                        )
                                    ) : (
                                        <span className="font-mono text-xs text-neutral-200">—</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Pricing Row */}
                    <div className="grid grid-cols-3 border-b border-black">
                        <div className="p-4 border-r border-black bg-neutral-50">
                            <span className="font-mono text-xs text-neutral-500">Starting Price</span>
                        </div>
                        {[0, 1].map((index) => {
                            const tool = selectedTools[index];
                            return (
                                <div key={index} className={`p-4 ${index === 0 ? "border-r border-black" : ""}`}>
                                    {tool ? (
                                        <span className="font-mono text-sm">{getPricingText(tool.pricing)}</span>
                                    ) : (
                                        <span className="font-mono text-xs text-neutral-200">—</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary Row */}
                    <div className="grid grid-cols-3 border-b border-black">
                        <div className="p-4 border-r border-black bg-neutral-50">
                            <span className="font-mono text-xs text-neutral-500">Summary</span>
                        </div>
                        {[0, 1].map((index) => {
                            const tool = selectedTools[index];
                            return (
                                <div key={index} className={`p-4 ${index === 0 ? "border-r border-black" : ""}`}>
                                    {tool ? (
                                        <p className="font-mono text-xs text-neutral-600 leading-relaxed">
                                            {tool.summary || <span className="italic text-neutral-400">No summary yet</span>}
                                        </p>
                                    ) : (
                                        <span className="font-mono text-xs text-neutral-200">—</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Pros Row */}
                    <div className="grid grid-cols-3 border-b border-black">
                        <div className="p-4 border-r border-black bg-neutral-50">
                            <span className="font-mono text-xs text-neutral-500">Pros</span>
                        </div>
                        {[0, 1].map((index) => {
                            const tool = selectedTools[index];
                            return (
                                <div key={index} className={`p-4 ${index === 0 ? "border-r border-black" : ""}`}>
                                    {tool ? (
                                        tool.pros.length > 0 ? (
                                            <ul className="space-y-1.5">
                                                {tool.pros.map((p, i) => (
                                                    <li key={i} className="flex items-start gap-2 font-mono text-xs">
                                                        <Check className="h-3.5 w-3.5 mt-0.5 shrink-0" strokeWidth={2.5} />
                                                        <span>{p}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span className="font-mono text-xs text-neutral-400 italic">No pros listed</span>
                                        )
                                    ) : (
                                        <span className="font-mono text-xs text-neutral-200">—</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Cons Row */}
                    <div className="grid grid-cols-3 border-b border-black">
                        <div className="p-4 border-r border-black bg-neutral-50">
                            <span className="font-mono text-xs text-neutral-500">Cons</span>
                        </div>
                        {[0, 1].map((index) => {
                            const tool = selectedTools[index];
                            return (
                                <div key={index} className={`p-4 ${index === 0 ? "border-r border-black" : ""}`}>
                                    {tool ? (
                                        tool.cons.length > 0 ? (
                                            <ul className="space-y-1.5">
                                                {tool.cons.map((c, i) => (
                                                    <li key={i} className="flex items-start gap-2 font-mono text-xs">
                                                        <X className="h-3.5 w-3.5 mt-0.5 shrink-0 text-neutral-400" strokeWidth={2.5} />
                                                        <span>{c}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span className="font-mono text-xs text-neutral-400 italic">No cons listed</span>
                                        )
                                    ) : (
                                        <span className="font-mono text-xs text-neutral-200">—</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Features Row */}
                    <div className="grid grid-cols-3">
                        <div className="p-4 border-r border-black bg-neutral-50">
                            <span className="font-mono text-xs text-neutral-500">Key Features</span>
                        </div>
                        {[0, 1].map((index) => {
                            const tool = selectedTools[index];
                            const featuresList = tool ? getFeaturesList(tool.features) : [];
                            return (
                                <div key={index} className={`p-4 ${index === 0 ? "border-r border-black" : ""}`}>
                                    {tool ? (
                                        featuresList.length > 0 ? (
                                            <ul className="space-y-1.5">
                                                {featuresList.map((feat, i) => (
                                                    <li key={i} className="flex items-start gap-2 font-mono text-xs">
                                                        <span className="text-neutral-300 mt-0.5">›</span>
                                                        <span>{feat}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span className="font-mono text-xs text-neutral-400 italic">No features extracted</span>
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 text-neutral-300">
                                            <Plus className="h-6 w-6 mb-2" strokeWidth={1.5} />
                                            <span className="font-mono text-xs">Select a tool above</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
