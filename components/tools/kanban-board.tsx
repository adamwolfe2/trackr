"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Star, Loader2, X, Search, Clock } from "lucide-react";
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
import { updateToolStatus, deleteTool } from "@/lib/actions/tools";
import { toast } from "sonner";

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

// Columns that cannot receive drops
const LOCKED_DROP_TARGETS = new Set(["researching"]);

function ToolLogo({ name, logoUrl, websiteUrl }: { name: string; logoUrl?: string | null; websiteUrl?: string | null }) {
    const [hasError, setHasError] = useState(false);
    const domain = websiteUrl ? (() => { try { return new URL(websiteUrl).hostname; } catch { return null; } })() : null;
    const src = (!hasError && logoUrl) ? logoUrl : domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : null;

    if (!src) {
        return <span className="text-sm font-bold text-neutral-400 font-mono w-6 h-6 flex items-center justify-center">{name.charAt(0)}</span>;
    }
    return <img src={src} alt={name} className="w-6 h-6 object-contain flex-shrink-0" onError={() => setHasError(true)} />;
}

function CardContent({ tool }: { tool: KanbanTool }) {
    return (
        <div className="border border-black bg-white p-3 hover:bg-[#F3F3EF] transition-colors">
            <div className="flex items-center gap-2 mb-1.5">
                <ToolLogo name={tool.name} logoUrl={tool.logoUrl} websiteUrl={tool.websiteUrl} />
                <span className="text-sm font-semibold leading-tight line-clamp-1 flex-1 font-sans">{tool.name}</span>
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

function DraggableCard({ tool, onDelete }: { tool: KanbanTool; onDelete: (id: string) => void }) {
    const [deleting, setDeleting] = useState(false);
    const isLocked = tool.status === "researching";
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: tool.id,
        disabled: isLocked,
    });

    const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleting(true);
        onDelete(tool.id); // optimistic
        try {
            await deleteTool(tool.id);
        } catch {
            toast.error("Failed to delete tool");
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`relative group ${isDragging ? "opacity-30" : ""} ${!isLocked ? "cursor-grab active:cursor-grabbing" : ""}`}
        >
            <Link href={`/tools/${tool.id}`} onClick={(e) => isDragging && e.preventDefault()}>
                <CardContent tool={tool} />
            </Link>
            <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleDelete}
                disabled={deleting}
                className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-white border border-black hover:bg-black hover:text-white disabled:opacity-40 z-10"
                aria-label="Delete tool"
            >
                <X className="w-2.5 h-2.5" />
            </button>
        </div>
    );
}

function DroppableColumn({
    col,
    toolCount,
    children,
}: {
    col: typeof COLUMNS[number];
    toolCount: number;
    children: React.ReactNode;
}) {
    const isLocked = LOCKED_DROP_TARGETS.has(col.id);
    const { setNodeRef, isOver } = useDroppable({ id: col.id, disabled: isLocked });

    return (
        <div className="flex flex-col gap-2">
            {/* Column Header */}
            <div className="flex items-center justify-between px-0 pb-1.5 border-b-2 border-black">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest">{col.label}</span>
                <span className="text-[10px] font-mono bg-black text-white px-1.5 py-0.5">{toolCount}</span>
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

        if (LOCKED_DROP_TARGETS.has(columnId)) return;

        const tool = tools.find(t => t.id === toolId);
        if (!tool) return;

        const newStatus = COLUMN_STATUS_MAP[columnId];
        if (!newStatus || tool.status === newStatus) return;

        // Optimistic update
        const prevTools = [...tools];
        setTools(prev => prev.map(t => t.id === toolId ? { ...t, status: newStatus } : t));

        try {
            await updateToolStatus(toolId, newStatus);
            const colLabel = COLUMNS.find(c => c.id === columnId)?.label;
            toast.success(`Moved to ${colLabel}`);
        } catch {
            setTools(prevTools);
            toast.error("Failed to move tool");
        }
    };

    const handleDelete = (id: string) => {
        setTools(prev => prev.filter(t => t.id !== id));
    };

    const activeTool = activeId ? tools.find(t => t.id === activeId) : null;

    // Filter tools by search query
    const filteredTools = searchQuery.trim()
        ? tools.filter(t =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category?.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : tools;

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
                        <div className="text-3xl font-bold font-mono mt-1">{stats.totalTools}</div>
                    </div>
                    <div className="p-4 border-b md:border-b-0 md:border-r border-black">
                        <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Avg Score</div>
                        <div className="text-3xl font-bold font-mono mt-1">
                            {stats.avgScore ?? "—"}
                            {stats.avgScore && <span className="text-sm text-neutral-400 font-normal">/10</span>}
                        </div>
                    </div>
                    <div className="p-4 border-r border-black">
                        <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Researched / Mo</div>
                        <div className="text-3xl font-bold font-mono mt-1">{stats.researchedThisMonth}</div>
                    </div>
                    <div className="p-4">
                        <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Monthly Spend</div>
                        <div className="text-3xl font-bold font-mono mt-1">
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
                            className="w-full sm:w-80 border border-black pl-9 pr-8 py-2 font-mono text-xs bg-white focus:outline-none"
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

                {/* Kanban Columns — horizontal scroll on mobile, grid on lg */}
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0 snap-x snap-mandatory">
                    {COLUMNS.map((col) => {
                        const colTools = filteredTools.filter(t => (col.statuses as readonly string[]).includes(t.status));
                        return (
                            <div key={col.id} className="flex-shrink-0 w-[240px] sm:w-[280px] lg:w-auto min-w-0 flex flex-col snap-start">
                                <DroppableColumn col={col} toolCount={colTools.length}>
                                    {colTools.map((tool) => (
                                        <DraggableCard key={tool.id} tool={tool} onDelete={handleDelete} />
                                    ))}
                                    {colTools.length === 0 && col.id === "backlog" && isEmpty ? (
                                        <div className="border border-dashed border-neutral-300 p-6 text-center space-y-4">
                                            <p className="font-serif text-xl">Submit your first tool.</p>
                                            <p className="font-mono text-xs text-neutral-500 leading-relaxed">
                                                Paste any tool URL. Our research agents will analyze it in under 2 minutes — reviews, pricing, competitors, and a scored report.
                                            </p>
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="flex items-center gap-3 text-[10px] font-mono text-neutral-400">
                                                    <span className="flex items-center gap-1"><span className="w-4 h-4 bg-black text-white flex items-center justify-center text-[8px] font-bold">1</span> Submit URL</span>
                                                    <span className="text-neutral-300">&rarr;</span>
                                                    <span className="flex items-center gap-1"><span className="w-4 h-4 bg-black text-white flex items-center justify-center text-[8px] font-bold">2</span> AI Researches</span>
                                                    <span className="text-neutral-300">&rarr;</span>
                                                    <span className="flex items-center gap-1"><span className="w-4 h-4 bg-black text-white flex items-center justify-center text-[8px] font-bold">3</span> Get Report</span>
                                                </div>
                                                <Link href="/submit" className="inline-block border border-black px-5 py-2.5 font-mono text-xs bg-black text-white hover:bg-neutral-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all">
                                                    Submit Tool →
                                                </Link>
                                            </div>
                                        </div>
                                    ) : colTools.length === 0 ? (
                                        <div className="border border-dashed border-neutral-300 p-4 text-center text-[10px] font-mono text-neutral-400">
                                            Empty
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
