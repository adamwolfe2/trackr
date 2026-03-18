"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ArrowRightLeft, Plus, ExternalLink, Search, ChevronDown, Link2 } from "lucide-react";
import Link from "next/link";

type PricingEntry = { price?: string; tier?: string; [key: string]: unknown };
type FeaturesValue = string[] | { list: string[] } | null;

interface CompareTool {
    id: string;
    name: string;
    score: number | null;
    logoUrl?: string | null;
    websiteUrl: string | null;
    status: string;
    pros: string[];
    cons: string[];
    pricing: PricingEntry[] | string | null;
    features: FeaturesValue;
    summary: string | null;
    integrations: string[];
    competitors: string[];
}

interface CompareClientProps {
    tools: CompareTool[];
    preSelectedIds: string[];
}

const MAX_TOOLS = 3;

// Searchable dropdown component
function ToolSelector({
    tools,
    selectedId,
    disabledIds,
    onSelect,
    label,
}: {
    tools: CompareTool[];
    selectedId: string | null;
    disabledIds: string[];
    onSelect: (id: string | null) => void;
    label: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearch("");
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered = tools.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase())
    );

    const selectedTool = tools.find(t => t.id === selectedId);

    return (
        <div ref={ref} className="relative">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">
                {label}
            </label>
            <button
                type="button"
                onClick={() => { setIsOpen(!isOpen); setSearch(""); }}
                className="w-full flex items-center justify-between border border-black px-3 py-2 font-mono text-xs bg-white text-left hover:bg-neutral-100 transition-colors"
            >
                <span className={selectedTool ? "text-black" : "text-neutral-400"}>
                    {selectedTool
                        ? `${selectedTool.name}${selectedTool.score !== null ? ` (${selectedTool.score.toFixed(1)})` : ""}`
                        : "Select tool..."}
                </span>
                <ChevronDown className="h-3 w-3 text-neutral-400 flex-shrink-0" />
            </button>
            {isOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 border border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-64 flex flex-col">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-black">
                        <Search className="h-3 w-3 text-neutral-400 flex-shrink-0" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search tools..."
                            className="w-full font-mono text-xs bg-transparent outline-none placeholder:text-neutral-300"
                            autoFocus
                        />
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {selectedId && (
                            <button
                                type="button"
                                onClick={() => { onSelect(null); setIsOpen(false); setSearch(""); }}
                                className="w-full text-left px-3 py-2 font-mono text-xs text-neutral-400 hover:bg-neutral-100 border-b border-neutral-100"
                            >
                                Clear selection
                            </button>
                        )}
                        {filtered.length === 0 && (
                            <div className="px-3 py-4 font-mono text-xs text-neutral-400 text-center">
                                No tools found
                            </div>
                        )}
                        {filtered.map(t => {
                            const isDisabled = disabledIds.includes(t.id) && t.id !== selectedId;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() => {
                                        onSelect(t.id);
                                        setIsOpen(false);
                                        setSearch("");
                                    }}
                                    className={`w-full text-left px-3 py-2 font-mono text-xs flex items-center justify-between transition-colors ${
                                        isDisabled
                                            ? "text-neutral-300 cursor-not-allowed"
                                            : t.id === selectedId
                                              ? "bg-black text-white"
                                              : "hover:bg-neutral-100 text-black"
                                    }`}
                                >
                                    <span>{t.name}</span>
                                    {t.score !== null && (
                                        <span className="text-neutral-400">
                                            {t.score.toFixed(1)}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export function CompareClient({ tools, preSelectedIds }: CompareClientProps) {
    const router = useRouter();
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [selectedToolIds, setSelectedToolIds] = useState<(string | null)[]>(() => {
        const initial: (string | null)[] = [null, null, null];
        for (let i = 0; i < MAX_TOOLS; i++) {
            if (preSelectedIds[i] && tools.some(t => t.id === preSelectedIds[i])) {
                initial[i] = preSelectedIds[i];
            }
        }
        return initial;
    });

    // Update URL when selections change
    useEffect(() => {
        const selected = selectedToolIds.filter(Boolean);
        if (selected.length > 0) {
            router.push(`/compare?tools=${selected.join(",")}`, { scroll: false });
        } else {
            router.push("/compare", { scroll: false });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedToolIds]);

    const handleToolSelect = (index: number, toolId: string | null) => {
        const newSelection = [...selectedToolIds];
        newSelection[index] = toolId;
        setSelectedToolIds(newSelection);
    };

    const selectedTools = selectedToolIds.map(id => id ? tools.find(t => t.id === id) ?? null : null);
    const selectedCount = selectedTools.filter(Boolean).length;

    const getPricingDisplay = (pricing: PricingEntry[] | string | null): React.ReactNode => {
        if (!pricing) return <span className="italic text-neutral-400">Unknown</span>;
        if (typeof pricing === "string") return pricing;
        if (Array.isArray(pricing) && pricing.length > 0) {
            return (
                <div className="space-y-1.5">
                    {pricing.map((p, i) => (
                        <div key={i} className="flex items-baseline gap-2">
                            {p.tier && <span className="font-mono text-xs font-medium">{p.tier}</span>}
                            {p.price && <span className="font-mono text-xs text-neutral-500">{p.price}</span>}
                        </div>
                    ))}
                </div>
            );
        }
        return <span className="italic text-neutral-400">See website</span>;
    };

    const getFeaturesList = (features: FeaturesValue): string[] => {
        if (!features) return [];
        if (Array.isArray(features)) return features;
        if (typeof features === "object" && "list" in features && Array.isArray(features.list)) {
            return features.list;
        }
        return [];
    };

    // Determine winner for score row (highest score wins)
    const getScoreWinner = (): number | null => {
        const scores = selectedTools.map((t, i) => ({ idx: i, score: t?.score ?? null })).filter(s => s.score !== null);
        if (scores.length < 2) return null;
        const max = Math.max(...scores.map(s => s.score!));
        const winners = scores.filter(s => s.score === max);
        return winners.length === 1 ? winners[0].idx : null;
    };

    const scoreWinner = getScoreWinner();

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

    const noneSelected = selectedCount === 0;
    const oneSelected = selectedCount === 1;
    const disabledIds = selectedToolIds.filter(Boolean) as string[];

    // Column grid classes
    const gridCols = `grid-cols-${MAX_TOOLS + 1}`; // label + 3 data cols = 4
    const labelBorder = "border-r border-black bg-neutral-50";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                    <ArrowRightLeft className="h-5 w-5" strokeWidth={1.5} />
                    <h1 className="font-serif text-2xl font-normal">Compare Tools</h1>
                    <span className="font-mono text-[10px] text-neutral-400 border border-neutral-200 px-2 py-0.5">Up to 3</span>
                </div>
                {selectedCount >= 2 && (
                    <button
                        onClick={async () => {
                            await navigator.clipboard.writeText(window.location.href);
                            setCopiedUrl(true);
                            setTimeout(() => setCopiedUrl(false), 2000);
                        }}
                        className="flex items-center gap-2 border border-black px-4 py-2 font-mono text-xs bg-white hover:bg-black hover:text-white transition-colors"
                    >
                        {copiedUrl ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                        {copiedUrl ? "Copied!" : "Copy Link"}
                    </button>
                )}
            </div>

            {/* Empty state */}
            {noneSelected && (
                <div className="border border-black/20 p-6 text-center">
                    <ArrowRightLeft className="h-6 w-6 mx-auto mb-3 text-neutral-300" strokeWidth={1.5} />
                    <p className="font-mono text-xs text-neutral-500">
                        Select up to 3 tools to compare side-by-side
                    </p>
                </div>
            )}

            {/* One selected hint */}
            {oneSelected && (
                <div className="border border-black/20 p-4 font-mono text-xs text-neutral-500">
                    Select a second tool to compare (you can add up to 3)
                </div>
            )}

            {/* Tool Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0, 1, 2].map((index) => {
                    const tool = selectedTools[index];
                    return (
                        <div key={index} className="border border-black p-4 bg-white">
                            <ToolSelector
                                tools={tools}
                                selectedId={selectedToolIds[index]}
                                disabledIds={disabledIds}
                                onSelect={(id) => handleToolSelect(index, id)}
                                label={`Tool ${index + 1}`}
                            />
                            {tool && (
                                <div className="mt-2 flex items-center gap-2">
                                    {(() => {
                                        const domain = tool.websiteUrl ? (() => { try { return new URL(tool.websiteUrl).hostname; } catch { return null; } })() : null;
                                        const src = tool.logoUrl ?? (domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : null);
                                        return src ? <img src={src} alt={tool.name} className="w-5 h-5 object-contain flex-shrink-0" loading="lazy" /> : null;
                                    })()}
                                    {tool.websiteUrl && (
                                        <a
                                            href={tool.websiteUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 font-mono text-xs text-neutral-400 hover:text-black transition-colors"
                                        >
                                            {(() => { try { return new URL(tool.websiteUrl).hostname; } catch { return tool.websiteUrl; } })()}
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Comparison Table */}
            {selectedCount >= 1 && (
                <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className={`border border-black`}>
                        {/* Overall Score Row */}
                        <div className={`grid ${gridCols} border-b border-black`}>
                            <div className={`p-4 ${labelBorder}`}>
                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Overall Score</span>
                            </div>
                            {[0, 1, 2].map((index) => {
                                const tool = selectedTools[index];
                                const isWinner = selectedCount >= 2 && scoreWinner === index;
                                return (
                                    <div key={index} className={`p-4 ${index < 2 ? "border-r border-black" : ""}`}>
                                        {tool ? (
                                            tool.score !== null ? (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-serif text-3xl">{tool.score.toFixed(1)}</span>
                                                        <span className="font-mono text-xs text-neutral-400">/10</span>
                                                        {isWinner && (
                                                            <span className="bg-black text-white font-mono text-[10px] uppercase tracking-widest px-2 py-0.5">
                                                                Winner
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="h-2 border border-black bg-white">
                                                        <div
                                                            className="h-full bg-black transition-all duration-500"
                                                            style={{ width: `${(tool.score / 10) * 100}%` }}
                                                        />
                                                    </div>
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

                        {/* Summary Row */}
                        <div className={`grid ${gridCols} border-b border-black`}>
                            <div className={`p-4 ${labelBorder}`}>
                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Summary</span>
                            </div>
                            {[0, 1, 2].map((index) => {
                                const tool = selectedTools[index];
                                return (
                                    <div key={index} className={`p-4 ${index < 2 ? "border-r border-black" : ""}`}>
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

                        {/* Features Row */}
                        <div className={`grid ${gridCols} border-b border-black`}>
                            <div className={`p-4 ${labelBorder}`}>
                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Features</span>
                            </div>
                            {[0, 1, 2].map((index) => {
                                const tool = selectedTools[index];
                                const featuresList = tool ? getFeaturesList(tool.features) : [];
                                return (
                                    <div key={index} className={`p-4 ${index < 2 ? "border-r border-black" : ""}`}>
                                        {tool ? (
                                            featuresList.length > 0 ? (
                                                <ul className="space-y-1.5">
                                                    {featuresList.map((feat, i) => (
                                                        <li key={i} className="flex items-start gap-2 font-mono text-xs">
                                                            <span className="text-neutral-300 mt-0.5 flex-shrink-0">&#8250;</span>
                                                            <span>{feat}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="font-mono text-xs text-neutral-400 italic">No features extracted</span>
                                            )
                                        ) : (
                                            <span className="font-mono text-xs text-neutral-200">—</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pricing Row */}
                        <div className={`grid ${gridCols} border-b border-black`}>
                            <div className={`p-4 ${labelBorder}`}>
                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Pricing</span>
                            </div>
                            {[0, 1, 2].map((index) => {
                                const tool = selectedTools[index];
                                return (
                                    <div key={index} className={`p-4 ${index < 2 ? "border-r border-black" : ""}`}>
                                        {tool ? (
                                            <div className="font-mono text-xs">
                                                {getPricingDisplay(tool.pricing)}
                                            </div>
                                        ) : (
                                            <span className="font-mono text-xs text-neutral-200">—</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pros Row */}
                        <div className={`grid ${gridCols} border-b border-black`}>
                            <div className={`p-4 ${labelBorder}`}>
                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Pros</span>
                            </div>
                            {[0, 1, 2].map((index) => {
                                const tool = selectedTools[index];
                                return (
                                    <div key={index} className={`p-4 ${index < 2 ? "border-r border-black" : ""}`}>
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
                        <div className={`grid ${gridCols} border-b border-black`}>
                            <div className={`p-4 ${labelBorder}`}>
                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Cons</span>
                            </div>
                            {[0, 1, 2].map((index) => {
                                const tool = selectedTools[index];
                                return (
                                    <div key={index} className={`p-4 ${index < 2 ? "border-r border-black" : ""}`}>
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

                        {/* Integrations Row */}
                        <div className={`grid ${gridCols} border-b border-black`}>
                            <div className={`p-4 ${labelBorder}`}>
                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Integrations</span>
                            </div>
                            {[0, 1, 2].map((index) => {
                                const tool = selectedTools[index];
                                return (
                                    <div key={index} className={`p-4 ${index < 2 ? "border-r border-black" : ""}`}>
                                        {tool ? (
                                            tool.integrations.length > 0 ? (
                                                <div className="space-y-2">
                                                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                                                        {tool.integrations.length} total
                                                    </span>
                                                    <ul className="space-y-1">
                                                        {tool.integrations.slice(0, 5).map((intg, i) => (
                                                            <li key={i} className="flex items-start gap-2 font-mono text-xs">
                                                                <span className="text-neutral-300 mt-0.5 flex-shrink-0">&#8250;</span>
                                                                <span>{intg}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    {tool.integrations.length > 5 && (
                                                        <span className="font-mono text-[10px] text-neutral-400">
                                                            +{tool.integrations.length - 5} more
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="font-mono text-xs text-neutral-400 italic">No integrations listed</span>
                                            )
                                        ) : (
                                            <span className="font-mono text-xs text-neutral-200">—</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Competitors Row */}
                        <div className={`grid ${gridCols}`}>
                            <div className={`p-4 ${labelBorder}`}>
                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Competitors</span>
                            </div>
                            {[0, 1, 2].map((index) => {
                                const tool = selectedTools[index];
                                return (
                                    <div key={index} className={`p-4 ${index < 2 ? "border-r border-black" : ""}`}>
                                        {tool ? (
                                            tool.competitors.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {tool.competitors.map((comp, i) => (
                                                        <span
                                                            key={i}
                                                            className="inline-block border border-black px-2 py-0.5 font-mono text-[10px]"
                                                        >
                                                            {comp}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="font-mono text-xs text-neutral-400 italic">No competitors listed</span>
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
            )}
        </div>
    );
}
