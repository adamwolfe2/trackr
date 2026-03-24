"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Plus, X, Search, Loader2 } from "lucide-react";
import { LogoImage } from "@/components/common/logo-image";
import {
    searchToolsForRecommendation,
    addRecommendedTool,
    removeRecommendedTool,
} from "./actions";
import type { ToolSearchResult } from "./actions";

// ── Types ────────────────────────────────────────────────────────────────────

type RecommendedTool = {
    name: string;
    websiteDomain: string | null;
    category: string;
    reason: string;
    estimatedCostPerUser: string | null;
    impact: "High" | "Medium" | "Low";
};

interface RecommendedToolsEditorProps {
    submissionId: string;
    initialTools: RecommendedTool[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function toolLogos(name: string, domain?: string | null) {
    const d =
        domain ??
        `${name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "")}.com`;
    return {
        src: `https://logo.clearbit.com/${d}`,
        fallbackSrc: `https://www.google.com/s2/favicons?sz=64&domain=${d}`,
    };
}

function impactBadge(level: string) {
    const colors: Record<string, string> = {
        High: "bg-red-50 text-red-700 border-red-200",
        Medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
        Low: "bg-neutral-50 text-neutral-600 border-neutral-200",
    };
    return colors[level] ?? colors.Low;
}

function domainFromUrl(url: string | null): string | null {
    if (!url) return null;
    try {
        const full = url.startsWith("http") ? url : `https://${url}`;
        return new URL(full).hostname.replace("www.", "");
    } catch {
        return null;
    }
}

// ── Component ────────────────────────────────────────────────────────────────

export function RecommendedToolsEditor({
    submissionId,
    initialTools,
}: RecommendedToolsEditorProps) {
    const [tools, setTools] = useState<RecommendedTool[]>(initialTools);
    const [showAddForm, setShowAddForm] = useState(false);
    const [removing, setRemoving] = useState<string | null>(null);

    const handleRemove = useCallback(
        async (toolName: string) => {
            setRemoving(toolName);
            const result = await removeRecommendedTool({
                submissionId,
                toolName,
            });
            if (result.success) {
                setTools((prev) =>
                    prev.filter(
                        (t) => t.name.toLowerCase() !== toolName.toLowerCase(),
                    ),
                );
            }
            setRemoving(null);
        },
        [submissionId],
    );

    const handleAdd = useCallback(
        (tool: RecommendedTool) => {
            setTools((prev) => [...prev, tool]);
            setShowAddForm(false);
        },
        [],
    );

    return (
        <div className="border border-black">
            <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                <h2 className="font-mono text-xs uppercase tracking-widest">
                    Recommended Tools
                </h2>
                <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="font-mono text-[10px] uppercase tracking-widest border border-black px-2.5 py-1 hover:bg-black hover:text-white transition-colors flex items-center gap-1.5"
                >
                    <Plus className="w-3 h-3" />
                    Add Tool
                </button>
            </div>

            {/* Logo strip */}
            {tools.length > 0 && (
                <div className="px-5 py-4 border-b border-neutral-100 flex flex-wrap gap-2.5">
                    {tools.map((t, i) => {
                        const logos = toolLogos(t.name, t.websiteDomain);
                        return (
                            <div
                                key={i}
                                title={t.name}
                                className="w-10 h-10 border border-neutral-200 p-1 flex items-center justify-center overflow-hidden"
                            >
                                <LogoImage
                                    src={logos.src}
                                    fallbackSrc={logos.fallbackSrc}
                                    alt={t.name}
                                    fallbackChar={t.name}
                                    className="w-7 h-7"
                                    fallbackClassName="w-10 h-10 text-[10px]"
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Detailed list */}
            {tools.length > 0 && (
                <div className="divide-y divide-neutral-100">
                    {tools.map((t, i) => {
                        const logos = toolLogos(t.name, t.websiteDomain);
                        return (
                            <div
                                key={i}
                                className="px-4 py-3 flex items-start gap-3 group"
                            >
                                <div className="w-9 h-9 border border-neutral-200 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                    <LogoImage
                                        src={logos.src}
                                        fallbackSrc={logos.fallbackSrc}
                                        alt={t.name}
                                        fallbackChar={t.name}
                                        className="w-6 h-6"
                                        fallbackClassName="w-9 h-9 text-[10px]"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="font-mono text-xs font-bold">
                                            {t.name}
                                        </span>
                                        <span className="font-mono text-[9px] uppercase tracking-widest border border-neutral-200 px-1.5 py-0.5 text-neutral-500">
                                            {t.category}
                                        </span>
                                        <span
                                            className={`font-mono text-[9px] border px-1.5 py-0.5 ${impactBadge(t.impact)}`}
                                        >
                                            {t.impact} Impact
                                        </span>
                                    </div>
                                    <p className="font-mono text-[10px] text-neutral-600 leading-relaxed">
                                        {t.reason}
                                    </p>
                                    {t.estimatedCostPerUser && (
                                        <p className="font-mono text-[9px] text-neutral-400 mt-1">
                                            {t.estimatedCostPerUser}
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemove(t.name)}
                                    disabled={removing === t.name}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-neutral-100 flex-shrink-0"
                                    title="Remove recommendation"
                                >
                                    {removing === t.name ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />
                                    ) : (
                                        <X className="w-3.5 h-3.5 text-neutral-400 hover:text-red-600" />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {tools.length === 0 && !showAddForm && (
                <div className="px-5 py-8 text-center">
                    <p className="font-mono text-xs text-neutral-400 mb-3">
                        No recommended tools yet
                    </p>
                    <button
                        type="button"
                        onClick={() => setShowAddForm(true)}
                        className="font-mono text-[10px] uppercase tracking-widest border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors"
                    >
                        Add First Tool
                    </button>
                </div>
            )}

            {/* Add Tool Form */}
            {showAddForm && (
                <AddToolForm
                    submissionId={submissionId}
                    existingNames={tools.map((t) => t.name.toLowerCase())}
                    onAdd={handleAdd}
                    onCancel={() => setShowAddForm(false)}
                />
            )}
        </div>
    );
}

// ── Add Tool Form ────────────────────────────────────────────────────────────

function AddToolForm({
    submissionId,
    existingNames,
    onAdd,
    onCancel,
}: {
    submissionId: string;
    existingNames: string[];
    onAdd: (tool: RecommendedTool) => void;
    onCancel: () => void;
}) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<ToolSearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<"search" | "manual">("search");
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Form fields for manual entry / selected tool override
    const [name, setName] = useState("");
    const [websiteDomain, setWebsiteDomain] = useState("");
    const [category, setCategory] = useState("");
    const [reason, setReason] = useState("");
    const [estimatedCost, setEstimatedCost] = useState("");
    const [impact, setImpact] = useState<"High" | "Medium" | "Low">("Medium");

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSearch = useCallback((value: string) => {
        setQuery(value);
        setError(null);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (value.length < 2) {
            setResults([]);
            return;
        }
        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await searchToolsForRecommendation(value);
                setResults(res);
            } catch {
                setResults([]);
            }
            setSearching(false);
        }, 300);
    }, []);

    const selectFromSearch = useCallback(
        (tool: ToolSearchResult) => {
            if (existingNames.includes(tool.name.toLowerCase())) {
                setError("Tool already in recommendations");
                return;
            }
            setName(tool.name);
            setWebsiteDomain(domainFromUrl(tool.websiteUrl) ?? "");
            setCategory(tool.category?.[0] ?? "");
            setMode("manual");
            setResults([]);
            setQuery("");
        },
        [existingNames],
    );

    const handleSubmit = useCallback(async () => {
        if (!name.trim() || !category.trim() || !reason.trim()) {
            setError("Name, category, and reason are required");
            return;
        }
        if (existingNames.includes(name.toLowerCase())) {
            setError("Tool already in recommendations");
            return;
        }

        setSubmitting(true);
        setError(null);

        const input = {
            submissionId,
            name: name.trim(),
            websiteDomain: websiteDomain.trim() || null,
            category: category.trim(),
            reason: reason.trim(),
            estimatedCostPerUser: estimatedCost.trim() || null,
            impact,
        };

        const result = await addRecommendedTool(input);
        if (result.success) {
            onAdd({
                name: input.name,
                websiteDomain: input.websiteDomain,
                category: input.category,
                reason: input.reason,
                estimatedCostPerUser: input.estimatedCostPerUser,
                impact: input.impact,
            });
        } else {
            setError(result.error ?? "Failed to add tool");
        }
        setSubmitting(false);
    }, [
        submissionId,
        name,
        websiteDomain,
        category,
        reason,
        estimatedCost,
        impact,
        existingNames,
        onAdd,
    ]);

    return (
        <div className="border-t border-black bg-neutral-50 p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-[10px] uppercase tracking-widest font-bold">
                    Add Recommended Tool
                </h3>
                <div className="flex items-center gap-2">
                    {mode === "manual" && (
                        <button
                            type="button"
                            onClick={() => {
                                setMode("search");
                                setName("");
                                setWebsiteDomain("");
                                setCategory("");
                            }}
                            className="font-mono text-[10px] text-neutral-500 hover:text-black underline"
                        >
                            Back to search
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onCancel}
                        className="p-1 hover:bg-neutral-200 transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {mode === "search" && (
                <>
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search tools in Trackr database..."
                            className="w-full pl-9 pr-3 py-2 font-mono text-xs border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black"
                        />
                        {searching && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-neutral-400" />
                        )}
                    </div>

                    {/* Search results */}
                    {results.length > 0 && (
                        <div className="border border-neutral-200 bg-white divide-y divide-neutral-100 mb-3 max-h-48 overflow-y-auto">
                            {results.map((t) => {
                                const logos = toolLogos(
                                    t.name,
                                    domainFromUrl(t.websiteUrl),
                                );
                                const alreadyAdded = existingNames.includes(
                                    t.name.toLowerCase(),
                                );
                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => selectFromSearch(t)}
                                        disabled={alreadyAdded}
                                        className={`w-full px-3 py-2 flex items-center gap-3 text-left transition-colors ${
                                            alreadyAdded
                                                ? "opacity-40 cursor-not-allowed"
                                                : "hover:bg-neutral-50"
                                        }`}
                                    >
                                        <div className="w-7 h-7 border border-neutral-200 p-0.5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            <LogoImage
                                                src={logos.src}
                                                fallbackSrc={logos.fallbackSrc}
                                                alt={t.name}
                                                fallbackChar={t.name}
                                                className="w-5 h-5"
                                                fallbackClassName="w-7 h-7 text-[9px]"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="font-mono text-xs font-bold">
                                                {t.name}
                                            </span>
                                            {t.category?.[0] && (
                                                <span className="font-mono text-[9px] text-neutral-400 ml-2">
                                                    {t.category[0]}
                                                </span>
                                            )}
                                        </div>
                                        {t.overallScore && (
                                            <span className="font-mono text-[10px] text-neutral-400">
                                                {Number(t.overallScore).toFixed(1)}/10
                                            </span>
                                        )}
                                        {alreadyAdded && (
                                            <span className="font-mono text-[9px] text-neutral-400">
                                                Added
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {query.length >= 2 && !searching && results.length === 0 && (
                        <p className="font-mono text-[10px] text-neutral-400 mb-3">
                            No tools found matching &ldquo;{query}&rdquo;
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={() => {
                            setMode("manual");
                            if (query.trim()) setName(query.trim());
                        }}
                        className="font-mono text-[10px] text-neutral-500 hover:text-black underline"
                    >
                        Or add a tool manually
                    </button>
                </>
            )}

            {mode === "manual" && (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-500 block mb-1">
                                Tool Name *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Notion AI"
                                className="w-full px-3 py-2 font-mono text-xs border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black"
                            />
                        </div>
                        <div>
                            <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-500 block mb-1">
                                Website Domain
                            </label>
                            <input
                                type="text"
                                value={websiteDomain}
                                onChange={(e) => setWebsiteDomain(e.target.value)}
                                placeholder="e.g. notion.so"
                                className="w-full px-3 py-2 font-mono text-xs border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-500 block mb-1">
                                Category *
                            </label>
                            <input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="e.g. AI Writing"
                                className="w-full px-3 py-2 font-mono text-xs border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black"
                            />
                        </div>
                        <div>
                            <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-500 block mb-1">
                                Est. Cost / User
                            </label>
                            <input
                                type="text"
                                value={estimatedCost}
                                onChange={(e) => setEstimatedCost(e.target.value)}
                                placeholder="e.g. $10-$25/user/month"
                                className="w-full px-3 py-2 font-mono text-xs border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-500 block mb-1">
                            Impact Level *
                        </label>
                        <div className="flex gap-2">
                            {(["High", "Medium", "Low"] as const).map((level) => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setImpact(level)}
                                    className={`font-mono text-[10px] border px-3 py-1.5 transition-colors ${
                                        impact === level
                                            ? "border-black bg-black text-white"
                                            : "border-neutral-200 text-neutral-500 hover:border-black"
                                    }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-500 block mb-1">
                            Reason / Pitch *
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Why this tool fits this prospect's needs..."
                            rows={2}
                            className="w-full px-3 py-2 font-mono text-xs border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black resize-none"
                        />
                    </div>

                    {error && (
                        <p className="font-mono text-[10px] text-red-600">{error}</p>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border border-neutral-200 text-neutral-500 hover:border-black hover:text-black transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting || !name.trim() || !category.trim() || !reason.trim()}
                            className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border border-black bg-black text-white hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                            {submitting && (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            )}
                            Add to Recommendations
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
