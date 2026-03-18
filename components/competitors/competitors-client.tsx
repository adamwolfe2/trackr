"use client";

import { useState, useTransition } from "react";
import { addCompetitor, removeCompetitor, pauseCompetitor } from "@/lib/actions/competitor-intel";
import {
    PlusCircle,
    Trash2,
    X,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronUp,
    Globe,
    Clock,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

type DiscoveredTool = {
    name: string;
    url?: string;
    category?: string;
    confidence: number;
    source: string;
};

type Competitor = {
    id: string;
    workspaceId: string;
    competitorName: string;
    competitorDomain: string;
    discoveredTools: DiscoveredTool[] | unknown;
    lastScannedAt: Date | null;
    status: string;
    createdBy: string | null;
    createdAt: Date;
};

function getToolsArray(discoveredTools: unknown): DiscoveredTool[] {
    if (Array.isArray(discoveredTools)) return discoveredTools;
    return [];
}

function confidenceBadge(confidence: number) {
    if (confidence >= 0.8) return { label: "HIGH", className: "bg-black text-white" };
    if (confidence >= 0.5) return { label: "MEDIUM", className: "bg-neutral-200 text-black" };
    return { label: "LOW", className: "bg-white text-neutral-500" };
}

export function CompetitorsClient({
    initialData = [],
    workspaceId,
    userId,
    planLimit,
}: {
    initialData?: Competitor[];
    workspaceId: string;
    userId: string;
    planLimit: number;
}) {
    const [isPending, startTransition] = useTransition();
    const [showForm, setShowForm] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [domain, setDomain] = useState("");
    const router = useRouter();

    const handleAdd = () => {
        if (!name.trim() || !domain.trim()) {
            toast.error("Both name and domain are required");
            return;
        }
        const formName = name.trim();
        const formDomain = domain.trim();
        setName("");
        setDomain("");
        setShowForm(false);

        startTransition(async () => {
            try {
                await addCompetitor(workspaceId, {
                    competitorName: formName,
                    competitorDomain: formDomain,
                    createdBy: userId,
                });
                toast.success(`Now tracking ${formName}`);
                router.refresh();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to add competitor");
            }
        });
    };

    const handleRemove = (id: string) => {
        setConfirmDeleteId(null);
        startTransition(async () => {
            try {
                await removeCompetitor(id, workspaceId);
                toast.success("Competitor removed");
                router.refresh();
            } catch {
                toast.error("Failed to remove competitor");
            }
        });
    };

    const handlePause = (id: string) => {
        startTransition(async () => {
            try {
                const result = await pauseCompetitor(id, workspaceId);
                toast.success(result.status === "paused" ? "Tracking paused" : "Tracking resumed");
                router.refresh();
            } catch {
                toast.error("Failed to update tracking status");
            }
        });
    };

    const limitDisplay = planLimit === Infinity ? null : planLimit;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">Intelligence</p>
                    <h1 className="font-serif text-2xl font-normal">Competitor Stacks</h1>
                    <p className="font-mono text-xs text-neutral-500 mt-1">
                        Track what tools your competitors are using.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {limitDisplay !== null && (
                        <span className="font-mono text-xs text-neutral-400">
                            Tracking {initialData.length} of {limitDisplay}
                        </span>
                    )}
                    <button
                        onClick={() => setShowForm(prev => !prev)}
                        className="flex items-center gap-2 border border-black px-4 py-2.5 font-mono text-xs bg-black text-white hover:bg-neutral-800 whitespace-nowrap"
                    >
                        {showForm ? <X className="h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
                        {showForm ? "Cancel" : "Track Competitor"}
                    </button>
                </div>
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="border border-black bg-white">
                    <div className="border-b border-black px-5 py-3">
                        <span className="font-mono text-xs uppercase tracking-widest">New Competitor</span>
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-mono text-xs uppercase tracking-widest mb-2">
                                    Company Name <span className="text-neutral-400">(required)</span>
                                </label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    maxLength={200}
                                    placeholder="e.g. Acme Corp"
                                    className="w-full border border-black px-4 py-2.5 font-mono text-sm bg-white focus:outline-none"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block font-mono text-xs uppercase tracking-widest mb-2">
                                    Domain <span className="text-neutral-400">(required)</span>
                                </label>
                                <input
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                    maxLength={200}
                                    placeholder="e.g. acme.com"
                                    className="w-full border border-black px-4 py-2.5 font-mono text-sm bg-white focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleAdd}
                                disabled={isPending || !name.trim() || !domain.trim()}
                                className="border border-black px-6 py-2.5 font-mono text-xs bg-black text-white hover:bg-neutral-800 disabled:opacity-40"
                            >
                                Start Tracking
                            </button>
                            <button
                                onClick={() => { setShowForm(false); setName(""); setDomain(""); }}
                                className="border border-black px-6 py-2.5 font-mono text-xs bg-white hover:bg-neutral-100"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Competitor List */}
            {initialData.length === 0 ? (
                <div className="border border-black bg-white p-12 text-center">
                    <Eye className="w-8 h-8 mx-auto mb-4 text-neutral-300" />
                    <h3 className="font-serif text-lg mb-2">No competitors tracked yet</h3>
                    <p className="font-mono text-xs text-neutral-500 mb-6 max-w-sm mx-auto">
                        Add competitors to discover their tool stacks, tech choices, and gain intelligence on how they build and operate.
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-2 border border-black px-4 py-2 font-mono text-xs bg-black text-white hover:bg-neutral-800"
                    >
                        <PlusCircle className="w-3.5 h-3.5" /> Track Your First Competitor
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {initialData.map((competitor) => {
                        const toolsArr = getToolsArray(competitor.discoveredTools);
                        const isExpanded = expandedId === competitor.id;

                        return (
                            <div key={competitor.id} className="border border-black bg-white">
                                {/* Card Header */}
                                <div className="px-5 py-4 flex items-center gap-4">
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : competitor.id)}
                                        className="shrink-0 border border-black w-7 h-7 flex items-center justify-center hover:bg-neutral-100"
                                    >
                                        {isExpanded
                                            ? <ChevronUp className="w-4 h-4" />
                                            : <ChevronDown className="w-4 h-4" />
                                        }
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h3 className="font-serif text-base leading-snug">{competitor.competitorName}</h3>
                                            <span className="font-mono text-[10px] border border-black px-1.5 py-0.5 text-neutral-500 flex items-center gap-1">
                                                <Globe className="w-3 h-3" />
                                                {competitor.competitorDomain}
                                            </span>
                                            <span className={`font-mono text-[10px] border border-black px-1.5 py-0.5 ${
                                                competitor.status === "tracking"
                                                    ? "bg-black text-white"
                                                    : "bg-neutral-100 text-neutral-500"
                                            }`}>
                                                {competitor.status === "tracking" ? "TRACKING" : "PAUSED"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="font-mono text-[10px] text-neutral-400">
                                                {toolsArr.length} tool{toolsArr.length !== 1 ? "s" : ""} discovered
                                            </span>
                                            {competitor.lastScannedAt && (
                                                <span className="font-mono text-[10px] text-neutral-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Scanned {formatDistanceToNow(new Date(competitor.lastScannedAt), { addSuffix: true })}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="shrink-0 flex items-center gap-1">
                                        <button
                                            onClick={() => handlePause(competitor.id)}
                                            disabled={isPending}
                                            className="border border-neutral-200 p-2 hover:border-black hover:text-black text-neutral-400 transition-colors"
                                            aria-label={competitor.status === "tracking" ? "Pause tracking" : "Resume tracking"}
                                        >
                                            {competitor.status === "tracking"
                                                ? <EyeOff className="h-3.5 w-3.5" />
                                                : <Eye className="h-3.5 w-3.5" />
                                            }
                                        </button>

                                        {confirmDeleteId === competitor.id ? (
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs text-neutral-500">Delete?</span>
                                                <button
                                                    onClick={() => handleRemove(competitor.id)}
                                                    className="border border-black px-3 py-1 font-mono text-xs bg-black text-white hover:bg-neutral-800"
                                                >
                                                    Yes
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDeleteId(null)}
                                                    className="border border-black px-3 py-1 font-mono text-xs bg-white hover:bg-neutral-100"
                                                >
                                                    No
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setConfirmDeleteId(competitor.id)}
                                                className="border border-neutral-200 p-2 hover:border-black hover:text-black text-neutral-400 transition-colors"
                                                aria-label="Remove competitor"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded: Discovered Tools Grid */}
                                {isExpanded && (
                                    <div className="border-t border-black">
                                        {toolsArr.length === 0 ? (
                                            <div className="px-5 py-8 text-center">
                                                <p className="font-mono text-xs text-neutral-400">
                                                    No tools discovered yet. Stack scanning runs periodically.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-black">
                                                {toolsArr.map((tool, i) => {
                                                    const badge = confidenceBadge(tool.confidence);
                                                    return (
                                                        <div key={i} className="bg-white px-4 py-3">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="min-w-0">
                                                                    <p className="font-mono text-sm font-semibold truncate">
                                                                        {tool.name}
                                                                    </p>
                                                                    {tool.category && (
                                                                        <p className="font-mono text-[10px] text-neutral-500 mt-0.5">
                                                                            {tool.category}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <span className={`font-mono text-[10px] border border-black px-1.5 py-0.5 shrink-0 ${badge.className}`}>
                                                                    {badge.label}
                                                                </span>
                                                            </div>
                                                            {tool.url && (
                                                                <a
                                                                    href={tool.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="font-mono text-[10px] text-neutral-400 hover:text-black truncate block mt-1"
                                                                >
                                                                    {tool.url}
                                                                </a>
                                                            )}
                                                            <p className="font-mono text-[10px] text-neutral-400 mt-1">
                                                                Source: {tool.source}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
