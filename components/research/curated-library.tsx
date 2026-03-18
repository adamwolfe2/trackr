"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Search,
    ExternalLink,
    ChevronDown,
    Star,
    Sparkles,
    Layers,
    ArrowRight,
    Filter,
    X,
    TrendingUp,
} from "lucide-react";
import type { CuratedTool, Template } from "@/lib/types";
import { sortTools } from "@/lib/scoring";
import { VoteButtons } from "@/components/community/vote-buttons";

const TIER_LABELS: Record<string, string> = {
    essential: "Essential",
    power: "Power Tool",
    enterprise: "Enterprise",
    emerging: "Emerging",
};

const TIER_COLORS: Record<string, string> = {
    essential: "bg-black text-white",
    power: "border border-black text-black",
    enterprise: "border border-neutral-400 text-neutral-600",
    emerging: "border border-dashed border-black text-black",
};

const SIGNAL_COLORS: Record<string, string> = {
    YC: "bg-orange-500 text-white",
    Agents: "bg-purple-600 text-white",
    RAG: "bg-blue-600 text-white",
    OpenSource: "bg-black text-white",
    Viral: "border border-black text-black",
    Funded: "border border-neutral-400 text-neutral-500",
    "Fast-growing": "border border-neutral-400 text-neutral-500",
    EnterpriseReady: "border border-neutral-400 text-neutral-500",
    ProductHunt: "border border-neutral-400 text-neutral-500",
};

type SortKey = "score" | "popularity" | "insider" | "name";

interface Props {
    tools: CuratedTool[];
    templates: Template[];
    primaryCategories: string[];
    hotToolSlugs?: string[];
}

export function CuratedLibrary({ tools, templates, primaryCategories, hotToolSlugs = [] }: Props) {
    const [activeTab, setActiveTab] = useState<"tools" | "templates">("tools");
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedTier, setSelectedTier] = useState<string | null>(null);
    const [selectedSignal, setSelectedSignal] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortKey>("score");
    const [showFilters, setShowFilters] = useState(false);
    const [voteData, setVoteData] = useState<Record<string, { up: number; down: number }>>({});

    useEffect(() => {
        fetch("/api/votes")
            .then((r) => r.json())
            .then((d) => { if (d.votes) setVoteData(d.votes); })
            .catch(() => { /* votes unavailable — show base scores */ });
    }, []);

    const filteredTools = useMemo(() => {
        let result = tools;

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (t) =>
                    t.name.toLowerCase().includes(q) ||
                    t.tagline.toLowerCase().includes(q) ||
                    t.description.toLowerCase().includes(q) ||
                    t.tags.some((tag) => tag.toLowerCase().includes(q))
            );
        }

        if (selectedCategory) {
            result = result.filter(
                (t) => t.category === selectedCategory || t.tags.includes(selectedCategory)
            );
        }

        if (selectedType) {
            result = result.filter((t) => t.type === selectedType);
        }

        if (selectedTier) {
            result = result.filter((t) => t.tier === selectedTier);
        }

        if (selectedSignal) {
            result = result.filter((t) =>
                t.signals.some((s) => s === selectedSignal)
            );
        }

        return sortTools(result, sortBy);
    }, [tools, search, selectedCategory, selectedType, selectedTier, selectedSignal, sortBy]);

    const filteredTemplates = useMemo(() => {
        if (!search.trim()) return templates;
        const q = search.toLowerCase();
        return templates.filter(
            (t) =>
                t.name.toLowerCase().includes(q) ||
                t.tagline.toLowerCase().includes(q) ||
                t.tags.some((tag) => tag.toLowerCase().includes(q))
        );
    }, [templates, search]);

    const hotTools = useMemo(() => {
        if (!hotToolSlugs.length) return [];
        return hotToolSlugs
            .map((slug) => tools.find((t) => t.slug === slug))
            .filter(Boolean) as CuratedTool[];
    }, [tools, hotToolSlugs]);

    const hasActiveFilters = selectedCategory || selectedType || selectedTier || selectedSignal;

    const clearFilters = () => {
        setSelectedCategory(null);
        setSelectedType(null);
        setSelectedTier(null);
        setSelectedSignal(null);
        setSearch("");
    };

    return (
        <div>
            {/* Tabs */}
            <div className="flex gap-0 border border-black mb-6 w-fit">
                {(["tools", "templates"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`font-mono text-xs uppercase tracking-widest px-5 py-2.5 transition-colors ${
                            activeTab === tab
                                ? "bg-black text-white"
                                : "bg-white text-neutral-500 hover:text-black"
                        }`}
                    >
                        {tab === "tools" ? (
                            <span className="flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> AI Tools ({tools.length})</span>
                        ) : (
                            <span className="flex items-center gap-1.5"><Layers className="h-3 w-3" /> Templates ({templates.length})</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Hot This Week — hidden when filters are active */}
            {hotTools.length > 0 && activeTab === "tools" && (hasActiveFilters || search) && (
                <div className="mb-4 flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-neutral-300" />
                    <span className="font-mono text-[10px] text-neutral-400">
                        Hot tools hidden while filters are active —{" "}
                        <button onClick={clearFilters} className="underline underline-offset-2 hover:text-black">
                            clear filters
                        </button>{" "}
                        to see them
                    </span>
                </div>
            )}
            {hotTools.length > 0 && activeTab === "tools" && !hasActiveFilters && !search && (
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-3 w-3 text-neutral-400" />
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Hot this week</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px border border-black bg-black">
                        {hotTools.map((tool) => (
                            <Link
                                key={tool.id}
                                href={`/research/${tool.slug}`}
                                className="group bg-white hover:bg-[#F3F3EF] transition-colors p-4 flex flex-col gap-2"
                            >
                                <div className="flex items-center gap-2">
                                    <Image
                                        src={tool.logoUrl ?? `https://www.google.com/s2/favicons?domain=${tool.domain}&sz=32`}
                                        alt={tool.name}
                                        className="w-5 h-5 object-contain flex-shrink-0"
                                        width={20}
                                        height={20}
                                        unoptimized
                                    />
                                    <span className="font-serif text-sm group-hover:underline underline-offset-2 truncate">{tool.name}</span>
                                </div>
                                <p className="font-mono text-[9px] text-neutral-400 line-clamp-2 leading-relaxed">{tool.tagline}</p>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="font-mono text-[9px] uppercase tracking-widest border border-neutral-200 px-1 py-0.5 text-neutral-400">
                                        {tool.category}
                                    </span>
                                    <div className="flex items-center gap-0.5">
                                        <Star className="w-2 h-2 fill-black" />
                                        <span className="font-mono text-[10px] font-bold">{tool.overallScore.toFixed(1)}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Search + Sort bar */}
            <div className="flex gap-3 mb-4 flex-wrap">
                <div className="flex-1 min-w-0 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder={activeTab === "tools" ? "Search AI tools…" : "Search templates…"}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full border border-black bg-white font-mono text-xs pl-8 pr-4 py-2.5 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-black"
                    />
                </div>
                {activeTab === "tools" && (
                    <>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-1.5 border px-3 py-2.5 font-mono text-xs transition-colors ${
                                hasActiveFilters
                                    ? "border-black bg-black text-white"
                                    : "border-black bg-white hover:bg-black hover:text-white"
                            }`}
                        >
                            <Filter className="h-3 w-3" />
                            Filters{hasActiveFilters ? ` (${[selectedCategory, selectedType, selectedTier, selectedSignal].filter(Boolean).length})` : ""}
                        </button>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortKey)}
                                className="border border-black bg-white font-mono text-xs px-3 py-2.5 pr-8 appearance-none focus:outline-none cursor-pointer"
                            >
                                <option value="score">Sort: Score</option>
                                <option value="popularity">Sort: Popularity</option>
                                <option value="insider">Sort: Insider Pick</option>
                                <option value="name">Sort: Name (A–Z)</option>
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none text-neutral-500" />
                        </div>
                    </>
                )}
            </div>

            {/* Filter panel */}
            {activeTab === "tools" && showFilters && (
                <div className="border border-black bg-white p-5 mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Category */}
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2.5">Category</p>
                        <div className="flex flex-col gap-1.5">
                            {primaryCategories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                                    className={`text-left font-mono text-xs px-2 py-1 transition-colors ${
                                        selectedCategory === cat
                                            ? "bg-black text-white"
                                            : "text-neutral-600 hover:text-black hover:bg-neutral-50"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Type */}
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2.5">Pricing Model</p>
                        <div className="flex flex-col gap-1.5">
                            {["freemium", "paid", "free", "open-source", "enterprise"].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedType(selectedType === type ? null : type)}
                                    className={`text-left font-mono text-xs px-2 py-1 capitalize transition-colors ${
                                        selectedType === type
                                            ? "bg-black text-white"
                                            : "text-neutral-600 hover:text-black hover:bg-neutral-50"
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tier */}
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2.5">Tier</p>
                        <div className="flex flex-col gap-1.5">
                            {["essential", "power", "enterprise", "emerging"].map((tier) => (
                                <button
                                    key={tier}
                                    onClick={() => setSelectedTier(selectedTier === tier ? null : tier)}
                                    className={`text-left font-mono text-xs px-2 py-1 transition-colors ${
                                        selectedTier === tier
                                            ? "bg-black text-white"
                                            : "text-neutral-600 hover:text-black hover:bg-neutral-50"
                                    }`}
                                >
                                    {TIER_LABELS[tier]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Signals */}
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2.5">Signal</p>
                        <div className="flex flex-col gap-1.5">
                            {["YC", "Agents", "RAG", "OpenSource", "Viral", "Funded", "Fast-growing"].map((sig) => (
                                <button
                                    key={sig}
                                    onClick={() => setSelectedSignal(selectedSignal === sig ? null : sig)}
                                    className={`text-left font-mono text-xs px-2 py-1 transition-colors ${
                                        selectedSignal === sig
                                            ? "bg-black text-white"
                                            : "text-neutral-600 hover:text-black hover:bg-neutral-50"
                                    }`}
                                >
                                    {sig}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Active filter chips */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap mb-4">
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">Filtered by:</span>
                    {[selectedCategory, selectedType, selectedTier, selectedSignal].filter(Boolean).map((f) => (
                        <button
                            key={f}
                            onClick={() => {
                                if (f === selectedCategory) setSelectedCategory(null);
                                if (f === selectedType) setSelectedType(null);
                                if (f === selectedTier) setSelectedTier(null);
                                if (f === selectedSignal) setSelectedSignal(null);
                            }}
                            className="flex items-center gap-1 font-mono text-[10px] border border-black px-2 py-0.5 hover:bg-black hover:text-white transition-colors"
                        >
                            {f} <X className="h-2.5 w-2.5" />
                        </button>
                    ))}
                    <button
                        onClick={clearFilters}
                        className="font-mono text-[10px] text-neutral-400 hover:text-black underline underline-offset-2"
                    >
                        Clear all
                    </button>
                </div>
            )}

            {/* Results count */}
            {activeTab === "tools" && (
                <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-4">
                    {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""}
                    {hasActiveFilters || search ? " matching filters" : " in library"}
                </p>
            )}

            {/* ── TOOLS GRID ── */}
            {activeTab === "tools" && (
                <>
                    {filteredTools.length === 0 ? (
                        <div className="border border-dashed border-neutral-300 py-16 text-center">
                            <p className="font-mono text-sm text-neutral-400 mb-3">No tools match your filters.</p>
                            <button
                                onClick={clearFilters}
                                className="font-mono text-xs text-neutral-400 hover:text-black underline underline-offset-2"
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px border border-black bg-black">
                            {filteredTools.map((tool) => (
                                <ToolCard key={tool.id} tool={tool} votes={voteData[tool.slug]} />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ── TEMPLATES GRID ── */}
            {activeTab === "templates" && (
                <>
                    {filteredTemplates.length === 0 ? (
                        <div className="border border-dashed border-neutral-300 py-16 text-center">
                            <p className="font-mono text-sm text-neutral-400">No templates match your search.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px border border-black bg-black">
                            {filteredTemplates.map((tpl) => (
                                <TemplateCard key={tpl.id} template={tpl} allTools={tools} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function adjustedScore(base: number, up: number, down: number): number {
    const total = up + down;
    if (total === 0) return base;
    const sentiment = (up - down) / total; // -1 to +1
    const weight = Math.min(1, total / 200); // full weight at 200+ votes
    const adjustment = sentiment * weight * 0.3;
    return Math.min(10, Math.round((base + adjustment) * 10) / 10);
}

function ToolCard({ tool, votes }: { tool: CuratedTool; votes?: { up: number; down: number } }) {
    const prioritySignals = tool.signals.filter((s) =>
        ["YC", "Agents", "RAG", "OpenSource"].includes(s)
    );
    const secondarySignals = tool.signals.filter((s) =>
        !["YC", "Agents", "RAG", "OpenSource"].includes(s)
    );

    const displayScore = votes
        ? adjustedScore(tool.overallScore, votes.up, votes.down)
        : tool.overallScore;

    return (
        <div className="bg-white flex flex-col group">
            <div className="p-5 flex flex-col gap-3 flex-1">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                    {/* Tool favicon + category pill */}
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <Image
                            src={tool.logoUrl ?? `https://www.google.com/s2/favicons?domain=${tool.domain}&sz=32`}
                            alt={tool.name}
                            className="w-5 h-5 object-contain flex-shrink-0"
                            width={20}
                            height={20}
                            unoptimized
                        />
                    </div>
                    {/* Category pill */}
                    <span className="font-mono text-[9px] uppercase tracking-widest border border-neutral-300 px-1.5 py-0.5 text-neutral-500 shrink-0 whitespace-nowrap">
                        {tool.category}
                    </span>
                </div>

                {/* Name + score */}
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <h3 className="font-serif text-lg leading-tight">{tool.name}</h3>
                        <p className="font-mono text-[10px] text-neutral-400">{tool.domain}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <div className="font-mono text-xl font-bold">{displayScore.toFixed(1)}</div>
                        <div className="flex items-center gap-0.5 justify-end">
                            <Star className="w-2.5 h-2.5 fill-black" />
                            <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest">Score</span>
                        </div>
                    </div>
                </div>

                {/* Tagline */}
                <p className="font-mono text-xs text-neutral-500 leading-relaxed line-clamp-2">
                    {tool.tagline}
                </p>

                {/* Signals + tier */}
                <div className="flex items-center gap-1.5 flex-wrap mt-auto">
                    <span className={`font-mono text-[9px] px-1.5 py-0.5 ${TIER_COLORS[tool.tier]}`}>
                        {TIER_LABELS[tool.tier]}
                    </span>
                    {prioritySignals.slice(0, 2).map((sig) => (
                        <span key={sig} className={`font-mono text-[9px] px-1.5 py-0.5 ${SIGNAL_COLORS[sig] ?? "border border-neutral-300 text-neutral-500"}`}>
                            {sig}
                        </span>
                    ))}
                    {secondarySignals.slice(0, 1).map((sig) => (
                        <span key={sig} className={`font-mono text-[9px] px-1.5 py-0.5 ${SIGNAL_COLORS[sig] ?? "border border-neutral-300 text-neutral-500"}`}>
                            {sig}
                        </span>
                    ))}
                </div>
            </div>

            {/* Vote bar */}
            {votes && (
                <div className="px-3 pb-3">
                    <VoteButtons
                        slug={tool.slug}
                        initialUp={votes.up}
                        initialDown={votes.down}
                    />
                </div>
            )}

            {/* CTA */}
            <div className="border-t border-neutral-100 p-3 flex gap-2">
                <Link
                    href={`/research/${tool.slug}`}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-black px-3 py-2 font-mono text-xs bg-black text-white hover:bg-neutral-800 transition-colors"
                >
                    View Scorecard <ArrowRight className="h-3 w-3" />
                </Link>
                <a
                    href={`https://${tool.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-neutral-200 px-3 py-2 font-mono text-xs hover:border-black transition-colors flex items-center"
                >
                    <ExternalLink className="h-3 w-3" />
                </a>
            </div>
        </div>
    );
}

function TemplateCard({ template, allTools }: { template: Template; allTools: CuratedTool[] }) {
    const recommendedToolObjects = template.recommendedTools
        .map((slug) => allTools.find((t) => t.slug === slug))
        .filter(Boolean) as CuratedTool[];

    return (
        <div className="bg-white flex flex-col">
            <div className="p-5 flex flex-col gap-3 flex-1">
                <div className="flex items-start justify-between gap-3">
                    <span className="font-mono text-[9px] uppercase tracking-widest border border-neutral-300 px-1.5 py-0.5 text-neutral-500">
                        {template.category}
                    </span>
                    <span className="font-mono text-[9px] text-neutral-400">{template.estimatedSetup} setup</span>
                </div>

                <div>
                    <h3 className="font-serif text-lg leading-tight mb-1">{template.name}</h3>
                    <p className="font-mono text-xs text-neutral-500 line-clamp-2 leading-relaxed">{template.tagline}</p>
                </div>

                {/* Recommended tools favicons */}
                {recommendedToolObjects.length > 0 && (
                    <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[9px] text-neutral-400">Uses:</span>
                        {recommendedToolObjects.map((t) => (
                            <div key={t.id} title={t.name}>
                                <Image
                                    src={`https://www.google.com/s2/favicons?domain=${t.domain}&sz=16`}
                                    alt={t.name}
                                    width={16}
                                    height={16}
                                    className="w-4 h-4 object-contain"
                                    unoptimized
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Steps preview */}
                <div className="space-y-1.5 mt-auto">
                    {template.steps.slice(0, 3).map((step, i) => (
                        <div key={i} className="flex gap-2">
                            <span className="font-mono text-[9px] text-neutral-300 flex-shrink-0 pt-0.5">{i + 1}</span>
                            <p className="font-mono text-[10px] text-neutral-500 leading-relaxed line-clamp-1">{step}</p>
                        </div>
                    ))}
                    {template.steps.length > 3 && (
                        <p className="font-mono text-[9px] text-neutral-400 ml-4">
                            +{template.steps.length - 3} more steps
                        </p>
                    )}
                </div>

                {/* Outcome */}
                <div className="bg-neutral-50 border border-neutral-200 px-3 py-2">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-0.5">Outcome</p>
                    <p className="font-mono text-[10px] text-neutral-600 leading-relaxed line-clamp-2">{template.outcome}</p>
                </div>
            </div>

            <div className="border-t border-neutral-100 p-3">
                <Link
                    href={`/research/templates/${template.slug}`}
                    className="w-full flex items-center justify-center gap-1.5 border border-black px-3 py-2 font-mono text-xs bg-black text-white hover:bg-neutral-800 transition-colors"
                >
                    View Template <ArrowRight className="h-3 w-3" />
                </Link>
            </div>
        </div>
    );
}
