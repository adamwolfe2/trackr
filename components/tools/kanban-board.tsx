"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { Star, Loader2, X, Search, Clock, AlertCircle, AlertTriangle } from "lucide-react";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    useDroppable,
    useDraggable,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { updateToolStatus, deleteTool, triggerResearch, triggerResearchBatch } from "@/lib/actions/tools";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/lib/utils/error-messages";

interface KanbanTool {
    id: string;
    name: string;
    websiteUrl: string | null;
    logoUrl: string | null;
    status: string;
    overallScore: string | null;
    lastResearchedAt: Date | null;
    category: string[] | null;
    researchInterval?: string | null;
}

interface Stats {
    totalTools: number;
    avgScore: string | null;
    researchedThisMonth: number;
    monthlySpend: number;
}

const COLUMNS = [
    { id: "backlog", label: "Backlog", statuses: ["queued", "submitted", "failed"] },
    { id: "researching", label: "Researching", statuses: ["researching"] },
    { id: "active", label: "Active", statuses: ["active", "testing"] },
    { id: "archived", label: "Archived", statuses: ["archived"] },
] as const;

// Map column id → the status to set when a card is dropped there
const COLUMN_STATUS_MAP: Record<string, string> = {
    backlog: "queued",
    active: "active",
    archived: "archived",
};

// No columns are fully locked — researching column handled specially in handleDragEnd
const LOCKED_DROP_TARGETS = new Set<string>();

function ToolLogo({ name, logoUrl, websiteUrl }: { name: string; logoUrl?: string | null; websiteUrl?: string | null }) {
    const [hasError, setHasError] = useState(false);
    const domain = websiteUrl ? (() => { try { return new URL(websiteUrl).hostname; } catch { return null; } })() : null;
    const src = (!hasError && logoUrl) ? logoUrl : domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : null;

    if (!src) {
        return <span className="text-sm font-bold text-neutral-400 font-mono w-6 h-6 flex items-center justify-center">{name.charAt(0)}</span>;
    }
    return <img src={src} alt={name} className="w-6 h-6 object-contain flex-shrink-0" width={24} height={24} loading="lazy" onError={() => setHasError(true)} />;
}

function isStale(tool: KanbanTool): boolean {
    if (tool.status !== "active" || !tool.lastResearchedAt) return false;
    const daysSince = (Date.now() - new Date(tool.lastResearchedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= 90;
}

function CardContent({ tool }: { tool: KanbanTool }) {
    const stale = isStale(tool);
    return (
        <div className="border border-black bg-white p-3 hover:bg-[#F3F3EF] transition-colors">
            <div className="flex items-center gap-2 mb-1.5">
                <ToolLogo name={tool.name} logoUrl={tool.logoUrl} websiteUrl={tool.websiteUrl} />
                <span className="text-sm font-semibold leading-tight line-clamp-1 flex-1 font-sans">{tool.name}</span>
                {stale && (
                    <span className="flex items-center gap-0.5 border border-neutral-400 text-neutral-500 text-[9px] font-mono px-1 py-0.5 shrink-0" title="Not researched in 90+ days">
                        <AlertCircle className="w-2.5 h-2.5" />
                        Refresh
                    </span>
                )}
                {tool.overallScore && (
                    <span className="flex items-center gap-0.5 bg-black text-white text-[10px] font-mono px-1.5 py-0.5 shrink-0">
                        <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                        {Number(tool.overallScore).toFixed(1)}
                    </span>
                )}
            </div>
            {tool.researchInterval && tool.researchInterval !== "manual" && (
                <div className="flex items-center gap-1 font-mono text-[9px] text-neutral-400 mb-1">
                    <Clock className="w-2 h-2" />
                    {tool.researchInterval}
                </div>
            )}
            <div className="text-[10px] font-mono text-neutral-400">
                {tool.status === "researching" ? (
                    <span className="flex items-center gap-1 text-neutral-500">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        Researching...
                    </span>
                ) : tool.status === "failed" ? (
                    <span className="text-neutral-500">Research failed — retry</span>
                ) : tool.lastResearchedAt ? (
                    formatDistanceToNow(new Date(tool.lastResearchedAt), { addSuffix: true })
                ) : (
                    "Queued for research"
                )}
            </div>
            {tool.category && tool.category.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                    {tool.category.slice(0, 2).map(c => (
                        <span key={c} className="text-[9px] font-mono border border-neutral-300 px-1 text-neutral-500">{c}</span>
                    ))}
                </div>
            )}
        </div>
    );
}

function DraggableCard({ tool, onDelete, isNew }: { tool: KanbanTool; onDelete: (id: string) => void; isNew?: boolean }) {
    const [deleting, setDeleting] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLocked = tool.status === "researching";
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: tool.id,
        disabled: isLocked,
    });

    const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirmingDelete(true);
        if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
        confirmTimerRef.current = setTimeout(() => setConfirmingDelete(false), 3000);
    };

    const handleConfirmDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
        setConfirmingDelete(false);
        setDeleting(true);
        onDelete(tool.id);
        try {
            await deleteTool(tool.id);
            toast.success("Tool deleted");
        } catch (err) {
            toast.error(getUserFriendlyError(err));
        }
    };

    const handleCancelDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
        setConfirmingDelete(false);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`relative group ${isDragging ? "opacity-30" : ""} ${!isLocked ? "cursor-grab active:cursor-grabbing" : ""} ${isNew ? "kanban-card-in" : ""}`}
        >
            <Link href={`/tools/${tool.id}`} onClick={(e) => isDragging && e.preventDefault()}>
                <CardContent tool={tool} />
            </Link>
            {confirmingDelete ? (
                <div
                    onPointerDown={(e) => e.stopPropagation()}
                    className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10"
                >
                    <span className="flex items-center gap-1 bg-white border border-black px-1.5 py-0.5 font-mono text-[10px]">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Delete?
                    </span>
                    <button
                        onClick={handleConfirmDelete}
                        className="bg-black text-white border border-black px-1.5 py-0.5 font-mono text-[10px] hover:bg-neutral-800"
                    >
                        Confirm
                    </button>
                    <button
                        onClick={handleCancelDelete}
                        className="bg-white border border-black px-1.5 py-0.5 font-mono text-[10px] hover:bg-neutral-100"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={handleDeleteClick}
                    disabled={deleting}
                    className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-white border border-black hover:bg-black hover:text-white disabled:opacity-40 z-10"
                    aria-label="Delete tool"
                >
                    <X className="w-2.5 h-2.5" />
                </button>
            )}
        </div>
    );
}

function DroppableColumn({
    col,
    toolCount,
    headerAction,
    children,
}: {
    col: typeof COLUMNS[number];
    toolCount: number;
    headerAction?: React.ReactNode;
    children: React.ReactNode;
}) {
    const isLocked = LOCKED_DROP_TARGETS.has(col.id);
    const { setNodeRef, isOver } = useDroppable({ id: col.id, disabled: isLocked });

    return (
        <div className="flex flex-col gap-2">
            {/* Column Header */}
            <div className="flex items-center justify-between px-0 pb-1.5 border-b-2 border-black">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest">{col.label}</span>
                <div className="flex items-center gap-1.5">
                    {headerAction}
                    <span className="text-[10px] font-mono bg-black text-white px-1.5 py-0.5">{toolCount}</span>
                </div>
            </div>

            {/* Drop Zone */}
            <div
                ref={setNodeRef}
                className={`flex flex-col gap-2 min-h-[160px] transition-colors rounded-none ${isOver && !isLocked ? "bg-neutral-100 outline-dashed outline-1 outline-neutral-400" : ""}`}
            >
                {children}
            </div>
        </div>
    );
}

export function KanbanBoard({ tools: initialTools, stats, isEmpty = false }: { tools: KanbanTool[]; stats: Stats; isEmpty?: boolean }) {
    const [tools, setTools] = useState(initialTools);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [newlyActiveIds, setNewlyActiveIds] = useState<Set<string>>(new Set());
    const [mobileTab, setMobileTab] = useState<string>("backlog");

    // Keep a ref so the polling interval always sees the latest tool list without re-mounting
    const toolsRef = useRef(tools);
    useEffect(() => { toolsRef.current = tools; }, [tools]);

    // Real-time polling: every 5s check if any researching/queued tools have completed
    useEffect(() => {
        const poll = async () => {
            const watching = toolsRef.current.filter(
                t => t.status === "researching" || t.status === "queued"
            );
            if (watching.length === 0) return;

            const ids = watching.map(t => t.id).join(",");
            try {
                const res = await fetch(`/api/research/bulk-status?ids=${ids}`, { cache: "no-store" });
                if (!res.ok) return;
                const updates = await res.json() as Array<{
                    id: string;
                    status: string;
                    overallScore: string | null;
                    logoUrl: string | null;
                    category: string[] | null;
                    lastResearchedAt: string | null;
                }>;

                const justCompleted: string[] = [];
                setTools(prev => prev.map(t => {
                    const u = updates.find(u => u.id === t.id);
                    if (!u || u.status === t.status) return t;
                    if (u.status === "active") justCompleted.push(u.id);
                    return {
                        ...t,
                        status: u.status,
                        overallScore: u.overallScore ?? t.overallScore,
                        logoUrl: u.logoUrl ?? t.logoUrl,
                        category: u.category ?? t.category,
                        lastResearchedAt: u.lastResearchedAt ? new Date(u.lastResearchedAt) : t.lastResearchedAt,
                    };
                }));

                if (justCompleted.length > 0) {
                    setNewlyActiveIds(prev => new Set([...prev, ...justCompleted]));
                    // Remove animation class after it finishes
                    setTimeout(() => {
                        setNewlyActiveIds(prev => {
                            const next = new Set(prev);
                            justCompleted.forEach(id => next.delete(id));
                            return next;
                        });
                    }, 1600);
                }
            } catch { /* silent — polling is best-effort */ }
        };

        const interval = setInterval(poll, 5000);
        return () => clearInterval(interval);
    }, []); // mount-only — uses toolsRef to avoid stale closures

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    const handleDragStart = ({ active }: DragStartEvent) => {
        setActiveId(active.id as string);
    };

    const handleDragEnd = async ({ active, over }: DragEndEvent) => {
        setActiveId(null);
        if (!over) return;

        const toolId = active.id as string;
        const columnId = over.id as string;
        const tool = tools.find(t => t.id === toolId);
        if (!tool) return;

        // Dropping onto Researching column triggers research
        if (columnId === "researching") {
            if (tool.status === "researching") return;
            const prevTools = [...tools];
            setTools(prev => prev.map(t => t.id === toolId ? { ...t, status: "researching" } : t));
            try {
                await triggerResearch(toolId);
                toast.success("Research started");
            } catch (err) {
                setTools(prevTools);
                toast.error(getUserFriendlyError(err));
            }
            return;
        }

        const newStatus = COLUMN_STATUS_MAP[columnId];
        if (!newStatus || tool.status === newStatus) return;

        // Optimistic update
        const prevTools = [...tools];
        setTools(prev => prev.map(t => t.id === toolId ? { ...t, status: newStatus } : t));

        try {
            await updateToolStatus(toolId, newStatus);
            const colLabel = COLUMNS.find(c => c.id === columnId)?.label;
            toast.success(`Moved to ${colLabel}`);
        } catch (err) {
            setTools(prevTools);
            toast.error(getUserFriendlyError(err));
        }
    };

    const handleDelete = (id: string) => {
        setTools(prev => prev.filter(t => t.id !== id));
    };

    const [researchingAll, setResearchingAll] = useState(false);
    const handleResearchAll = async () => {
        const backlogTools = tools.filter(t =>
            (COLUMNS[0].statuses as readonly string[]).includes(t.status) && t.status !== "researching"
        );
        if (backlogTools.length === 0) return;
        setResearchingAll(true);
        const prevTools = [...tools];
        const ids = backlogTools.map(t => t.id);
        setTools(prev => prev.map(t => ids.includes(t.id) ? { ...t, status: "researching" } : t));
        try {
            const result = await triggerResearchBatch(ids);
            toast.success(`Research started for ${result.started} tool${result.started !== 1 ? "s" : ""}`);
        } catch (err) {
            setTools(prevTools);
            toast.error(getUserFriendlyError(err));
        } finally {
            setResearchingAll(false);
        }
    };

    const activeTool = activeId ? tools.find(t => t.id === activeId) : null;

    // Filter tools by search query
    const filteredTools = searchQuery.trim()
        ? tools.filter(t =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category?.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : tools;

    const backlogEmptyState = (
        <div className="border border-dashed border-neutral-300 p-5 space-y-4">
            <div>
                <p className="font-serif text-xl">Submit your first tool.</p>
                <p className="font-mono text-xs text-neutral-500 mt-1 leading-relaxed">
                    Paste any tool URL. Research agents analyze it in under 2 minutes.
                </p>
            </div>
            <div className="border border-black bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Sample Report</span>
                    <span className="bg-black text-white font-mono text-xs px-2 py-0.5">8.4 / 10</span>
                </div>
                <div className="font-sans text-sm font-semibold">Notion</div>
                <div className="space-y-2">
                    {[
                        { label: "Value", score: 81 },
                        { label: "Support", score: 74 },
                        { label: "Integration", score: 88 },
                        { label: "Security", score: 80 },
                    ].map(({ label, score }) => (
                        <div key={label} className="space-y-0.5">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px] text-neutral-500">{label}</span>
                                <span className="font-mono text-[10px] text-neutral-500">{(score / 10).toFixed(1)}</span>
                            </div>
                            <div className="bg-neutral-200 h-1.5 w-full">
                                <div className="bg-black h-1.5" style={{ width: `${score}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Link href="/submit" className="inline-block border border-black px-5 py-2.5 font-mono text-xs bg-black text-white hover:bg-neutral-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all">
                Submit Tool →
            </Link>
        </div>
    );

    const columnEmptyText = (colId: string) =>
        colId === "researching" ? "No tools being analyzed right now" :
        colId === "active" ? "No completed reports yet" :
        colId === "archived" ? "No archived tools" :
        "Empty";

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="space-y-6">
                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 border border-black">
                    <div className="p-4 border-r border-b md:border-b-0 border-black">
                        <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Total Tools</div>
                        <div className="text-2xl sm:text-3xl font-bold font-mono mt-1">{stats.totalTools}</div>
                    </div>
                    <div className="p-4 border-b md:border-b-0 md:border-r border-black">
                        <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Avg Score</div>
                        <div className="text-2xl sm:text-3xl font-bold font-mono mt-1">
                            {stats.avgScore ?? "—"}
                            {stats.avgScore && <span className="text-sm text-neutral-400 font-normal">/10</span>}
                        </div>
                    </div>
                    <div className="p-4 border-r border-black">
                        <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Researched / Mo</div>
                        <div className="text-2xl sm:text-3xl font-bold font-mono mt-1">{stats.researchedThisMonth}</div>
                    </div>
                    <div className="p-4">
                        <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Monthly Spend</div>
                        <div className="text-2xl sm:text-3xl font-bold font-mono mt-1">
                            ${stats.monthlySpend.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                    </div>
                </div>

                {/* Search Filter */}
                {tools.length > 5 && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter tools by name or category..."
                            className="w-full sm:w-80 border border-black pl-9 pr-8 py-2 font-mono text-xs bg-white focus:outline-none focus:ring-1 focus:ring-black"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-neutral-100"
                            >
                                <X className="h-3 w-3 text-neutral-400" />
                            </button>
                        )}
                    </div>
                )}

                {/* Mobile tab selector — visible only on small screens */}
                <div className="flex sm:hidden border border-black">
                    {COLUMNS.map((col) => {
                        const colTools = filteredTools.filter(t => (col.statuses as readonly string[]).includes(t.status));
                        return (
                            <button
                                key={col.id}
                                onClick={() => setMobileTab(col.id)}
                                className={`flex-1 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                                    mobileTab === col.id
                                        ? "bg-black text-white"
                                        : "bg-white text-neutral-500 hover:bg-neutral-100"
                                }`}
                            >
                                {col.label}
                                <span className="ml-1 text-[9px]">{colTools.length}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Mobile: single column full-width, Desktop: 4-column grid */}
                {/* Mobile view — one tab at a time */}
                <div className="sm:hidden">
                    {COLUMNS.filter(col => col.id === mobileTab).map((col) => {
                        const colTools = filteredTools.filter(t => (col.statuses as readonly string[]).includes(t.status));
                        const backlogAction = col.id === "backlog" && colTools.length > 0 ? (
                            <button
                                onClick={handleResearchAll}
                                disabled={researchingAll}
                                className="text-[9px] font-mono uppercase tracking-widest border border-black px-1.5 py-0.5 hover:bg-black hover:text-white transition-colors disabled:opacity-40"
                            >
                                {researchingAll ? <Loader2 className="w-2.5 h-2.5 animate-spin inline" /> : "Research All"}
                            </button>
                        ) : undefined;
                        return (
                            <div key={col.id} className="w-full">
                                <DroppableColumn col={col} toolCount={colTools.length} headerAction={backlogAction}>
                                    {colTools.map((tool) => (
                                        <DraggableCard key={tool.id} tool={tool} onDelete={handleDelete} isNew={newlyActiveIds.has(tool.id)} />
                                    ))}
                                    {colTools.length === 0 && col.id === "backlog" && isEmpty ? (
                                        backlogEmptyState
                                    ) : colTools.length === 0 ? (
                                        <div className="border border-dashed border-neutral-300 p-4 text-center text-[10px] font-mono text-neutral-400">
                                            {columnEmptyText(col.id)}
                                        </div>
                                    ) : null}
                                </DroppableColumn>
                            </div>
                        );
                    })}
                </div>

                {/* Desktop view — 4-column grid */}
                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {COLUMNS.map((col) => {
                        const colTools = filteredTools.filter(t => (col.statuses as readonly string[]).includes(t.status));
                        const backlogAction = col.id === "backlog" && colTools.length > 0 ? (
                            <button
                                onClick={handleResearchAll}
                                disabled={researchingAll}
                                className="text-[9px] font-mono uppercase tracking-widest border border-black px-1.5 py-0.5 hover:bg-black hover:text-white transition-colors disabled:opacity-40"
                            >
                                {researchingAll ? <Loader2 className="w-2.5 h-2.5 animate-spin inline" /> : "Research All"}
                            </button>
                        ) : undefined;
                        return (
                            <div key={col.id} className="min-w-0 flex flex-col">
                                <DroppableColumn col={col} toolCount={colTools.length} headerAction={backlogAction}>
                                    {colTools.map((tool) => (
                                        <DraggableCard key={tool.id} tool={tool} onDelete={handleDelete} isNew={newlyActiveIds.has(tool.id)} />
                                    ))}
                                    {colTools.length === 0 && col.id === "backlog" && isEmpty ? (
                                        backlogEmptyState
                                    ) : colTools.length === 0 ? (
                                        <div className="border border-dashed border-neutral-300 p-4 text-center text-[10px] font-mono text-neutral-400">
                                            {columnEmptyText(col.id)}
                                        </div>
                                    ) : null}
                                </DroppableColumn>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Drag Overlay — renders the card being dragged at cursor level */}
            <DragOverlay>
                {activeTool ? (
                    <div className="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] opacity-95">
                        <CardContent tool={activeTool} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
