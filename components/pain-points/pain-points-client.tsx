"use client";

import { useState, useTransition } from "react";
import { addPainPoint, batchAddPainPoints, deletePainPoint, togglePainPointActive, updatePainPoint } from "@/lib/actions/pain-points";
import { PlusCircle, Trash2, X, Sparkles, Copy, Check, ChevronUp, Pencil, Download } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

type PainPoint = {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    active: boolean;
    createdAt: Date;
};

type WorkspaceTool = {
    id: string;
    name: string;
    overallScore: string | null;
    category: string[] | null;
    status: string;
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
    Sales: ["crm", "sales", "outbound", "email", "lead", "pipeline", "revenue"],
    Engineering: ["dev", "code", "api", "testing", "engineering", "development", "github", "deployment"],
    Marketing: ["content", "seo", "social", "marketing", "ads", "email", "analytics", "campaign"],
    Operations: ["ops", "automation", "workflow", "process", "operations", "productivity", "hr", "finance"],
    Support: ["support", "customer", "helpdesk", "ticket", "chat", "service"],
    Product: ["product", "roadmap", "design", "ux", "feedback", "analytics"],
    Finance: ["finance", "accounting", "payment", "billing", "expense"],
};

function getMatchedTools(painPointCategory: string | null, workspaceTools: WorkspaceTool[]): WorkspaceTool[] {
    if (!painPointCategory) return [];
    const catLower = painPointCategory.toLowerCase();
    const keywords = Object.entries(CATEGORY_KEYWORDS).find(([cat]) =>
        cat.toLowerCase() === catLower
    )?.[1] ?? [catLower];

    return workspaceTools.filter(tool => {
        const toolCategories = (tool.category ?? []).map(c => c.toLowerCase());
        return keywords.some(kw => toolCategories.some(tc => tc.includes(kw)));
    }).slice(0, 5);
}

type ParsedPainPoint = { title: string; category: string; description: string };

const PAIN_POINTS_PROMPT = `I'm using Trackr to document our team's operational pain points. These will be used by AI research agents to proactively discover and recommend tools that solve our real problems.

Since you know our company and workflows well, please identify our most significant pain points — the real ones, not generic platitudes. Think hard about:

• Where does our team lose the most time each week? (Be specific — not "meetings are long" but "stand-ups have no async alternative and block 30 min of deep work every morning")
• What manual processes are being done that should be automated?
• Where do things fall through the cracks between tools, teams, or handoffs?
• What are people complaining about in Slack, in 1:1s, or in retros?
• Where are we using the wrong tool for the job? (e.g. spreadsheets as a CRM, Notion as a project manager, email as a support ticket system)
• Where are there bottlenecks slowing down revenue, delivery, or customer success?
• What would a new hire be frustrated by in their first 30 days?
• What does our team do manually that our direct competitors have likely automated?
• Where is our current software stack creating friction instead of removing it?
• What would we fix first if we had an unlimited software budget?
• Where is context or knowledge getting lost between tools or people?
• What reporting, analytics, or visibility does leadership wish they had but don't?
• Where is customer data, sales data, or operational data siloed?
• What integrations are missing that cause manual re-entry of data?
• Where is our team doing copy-paste work between systems?

Be specific and concrete. Bad example: "Communication is slow." Good example: "Creative feedback on video assets requires 3+ email threads because no one watches Loom videos fully and comments are scattered across email, Slack, and Google Docs with no single source of truth."

Identify 8–15 pain points across all departments (Sales, Engineering, Marketing, Ops, Finance, Customer Success, Product, HR — whatever applies).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Respond ONLY with this JSON array (no intro text, no explanation — just valid JSON):

[
  {
    "title": "One-sentence problem statement (specific, concrete, action-oriented)",
    "category": "Department name (e.g. Sales, Engineering, Marketing, Ops, Finance, Customer Success, Product)",
    "description": "2–3 sentences: what is the impact, what is the current workaround, and why does existing tooling fail to solve it"
  }
]`;

export function PainPointsClient({ initialData = [], workspaceTools = [] }: { initialData?: PainPoint[]; workspaceTools?: WorkspaceTool[] }) {
    const [isPending, startTransition] = useTransition();
    const [showForm, setShowForm] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showPaste, setShowPaste] = useState(false);
    const [pasteText, setPasteText] = useState("");
    const [parseError, setParseError] = useState("");
    const [parsedItems, setParsedItems] = useState<ParsedPainPoint[] | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const router = useRouter();

    const startEdit = (point: PainPoint) => {
        setEditingId(point.id);
        setEditTitle(point.title);
        setEditDescription(point.description || "");
        setEditCategory(point.category || "");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle("");
        setEditDescription("");
        setEditCategory("");
    };

    const handleUpdate = (id: string) => {
        if (!editTitle.trim()) {
            toast.error("Title is required");
            return;
        }
        cancelEdit();
        startTransition(async () => {
            try {
                await updatePainPoint(id, {
                    title: editTitle.trim(),
                    description: editDescription.trim() || undefined,
                    category: editCategory.trim() || undefined,
                });
                toast.success("Pain point updated");
                router.refresh();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to update");
            }
        });
    };

    const handleAddSubmit = async (formData: FormData) => {
        setShowForm(false);
        toast.promise(addPainPoint(formData), {
            loading: "Adding pain point...",
            success: () => {
                router.refresh();
                return "Pain point added";
            },
            error: "Failed to add pain point",
        });
    };

    const handleToggle = (id: string, currentActive: boolean) => {
        startTransition(async () => {
            try {
                await togglePainPointActive(id, currentActive);
                router.refresh();
            } catch {
                toast.error("Failed to update pain point");
            }
        });
    };

    const handleDelete = (id: string) => {
        setConfirmDeleteId(null);
        startTransition(async () => {
            try {
                await deletePainPoint(id);
                router.refresh();
                toast.success("Pain point deleted");
            } catch {
                toast.error("Failed to delete pain point");
            }
        });
    };

    const handleCopyPrompt = async () => {
        try {
            await navigator.clipboard.writeText(PAIN_POINTS_PROMPT);
            setCopied(true);
            setShowPaste(true);
            setParsedItems(null);
            setTimeout(() => setCopied(false), 2000);
            toast.success("Prompt copied — paste it into Claude, ChatGPT, or any AI model.");
        } catch {
            toast.error("Couldn't copy to clipboard. Please copy the prompt manually.");
        }
    };

    const handleExportCsv = () => {
        const headers = ["Title", "Category", "Description", "Status", "Created"];
        const rows = initialData.map(p => [
            p.title,
            p.category ?? "",
            p.description ?? "",
            p.active ? "Active" : "Inactive",
            new Date(p.createdAt).toISOString().slice(0, 10),
        ]);
        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `pain-points-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleParseResponse = () => {
        setParseError("");
        setParsedItems(null);
        try {
            const cleaned = pasteText.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
            const parsed = JSON.parse(cleaned);
            if (!Array.isArray(parsed)) throw new Error("Expected a JSON array");
            const items: ParsedPainPoint[] = parsed
                .filter((i: Record<string, string>) => typeof i.title === "string" && i.title.trim())
                .map((i: Record<string, string>) => ({
                    title: i.title.trim(),
                    category: typeof i.category === "string" ? i.category.trim() : "General",
                    description: typeof i.description === "string" ? i.description.trim() : "",
                }));
            if (items.length === 0) throw new Error("No valid pain points found in response");
            setParsedItems(items);
        } catch {
            setParseError("Couldn't parse that response. Make sure you copied the full JSON array from your AI model.");
        }
    };

    const handleBatchAdd = () => {
        if (!parsedItems) return;
        startTransition(async () => {
            try {
                const result = await batchAddPainPoints(parsedItems);
                toast.success(`Added ${result.count} pain point${result.count === 1 ? "" : "s"} from AI response.`);
                setParsedItems(null);
                setPasteText("");
                setShowPaste(false);
                router.refresh();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to add pain points");
            }
        });
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">Discovery Engine</p>
                    <h1 className="font-serif text-2xl font-normal">Pain Points</h1>
                    <p className="font-mono text-xs text-neutral-500 mt-1">
                        Document internal problems to trigger AI tool discovery.
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={handleCopyPrompt}
                        className="flex items-center gap-2 border border-black px-4 py-2.5 font-mono text-xs uppercase tracking-wide bg-white hover:bg-neutral-100 transition-colors"
                    >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                        {copied ? "Copied!" : "Ask AI to Fill This"}
                    </button>
                    {initialData.length > 0 && (
                        <button
                            onClick={handleExportCsv}
                            className="flex items-center gap-2 border border-black px-4 py-2.5 font-mono text-xs bg-white hover:bg-neutral-100 whitespace-nowrap"
                        >
                            <Download className="h-3.5 w-3.5" />
                            Export CSV
                        </button>
                    )}
                    <button
                        onClick={() => setShowForm(prev => !prev)}
                        className="flex items-center gap-2 border border-black px-4 py-2.5 font-mono text-xs bg-black text-white hover:bg-neutral-800 whitespace-nowrap"
                    >
                        {showForm ? <X className="h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
                        {showForm ? "Cancel" : "Add Pain Point"}
                    </button>
                </div>
            </div>

            {/* AI Paste Panel */}
            {showPaste && (
                <div className="border border-black bg-white">
                    <div className="border-b border-black px-4 py-3 flex items-center justify-between bg-neutral-50">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            <span className="font-mono text-sm font-semibold uppercase tracking-wide">Paste AI Response</span>
                        </div>
                        <button onClick={() => { setShowPaste(false); setPasteText(""); setParseError(""); setParsedItems(null); }} className="font-mono text-xs text-neutral-500 hover:text-black">
                            <ChevronUp className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="p-4 space-y-3">
                        {!parsedItems ? (
                            <>
                                <p className="font-mono text-xs text-neutral-500 leading-relaxed">
                                    1. Paste the prompt into Claude, ChatGPT, or your AI model of choice.<br />
                                    2. Copy the full JSON response it returns.<br />
                                    3. Paste it below and click <strong>Preview Pain Points</strong>.
                                </p>
                                <textarea
                                    value={pasteText}
                                    onChange={(e) => { setPasteText(e.target.value); setParseError(""); }}
                                    rows={6}
                                    placeholder="Paste the JSON array response from your AI here..."
                                    className="w-full border border-black px-4 py-3 font-mono text-xs bg-white focus:outline-none resize-none"
                                />
                                {parseError && (
                                    <p className="font-mono text-xs text-red-600">{parseError}</p>
                                )}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleParseResponse}
                                        disabled={!pasteText.trim()}
                                        className="flex items-center gap-2 bg-black text-white px-5 py-2.5 font-mono text-xs uppercase tracking-wide border border-black disabled:opacity-40"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        Preview Pain Points
                                    </button>
                                    <button
                                        onClick={handleCopyPrompt}
                                        className="flex items-center gap-2 border border-black px-4 py-2.5 font-mono text-xs uppercase tracking-wide hover:bg-neutral-100"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                        {copied ? "Copied!" : "Re-copy Prompt"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="font-mono text-xs text-neutral-500">
                                    <strong>{parsedItems.length} pain points</strong> parsed from AI response. Review and add all at once.
                                </p>
                                <div className="border border-black divide-y divide-black max-h-64 overflow-y-auto">
                                    {parsedItems.map((item, i) => (
                                        <div key={i} className="px-4 py-3">
                                            <div className="flex items-start gap-3">
                                                <span className="font-mono text-[10px] border border-black px-1.5 py-0.5 text-neutral-500 shrink-0 mt-0.5">{item.category}</span>
                                                <div className="min-w-0">
                                                    <p className="font-mono text-xs font-semibold leading-snug">{item.title}</p>
                                                    {item.description && (
                                                        <p className="font-mono text-[10px] text-neutral-500 mt-1 leading-relaxed">{item.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleBatchAdd}
                                        disabled={isPending}
                                        className="flex items-center gap-2 bg-black text-white px-5 py-2.5 font-mono text-xs uppercase tracking-wide border border-black disabled:opacity-40"
                                    >
                                        {isPending ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                        Add All {parsedItems.length} Pain Points
                                    </button>
                                    <button
                                        onClick={() => { setParsedItems(null); setPasteText(""); }}
                                        className="border border-black px-4 py-2.5 font-mono text-xs hover:bg-neutral-100"
                                    >
                                        Back
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Add Form (inline) */}
            {showForm && (
                <form action={handleAddSubmit} className="border border-black bg-white">
                    <div className="border-b border-black px-5 py-3">
                        <span className="font-mono text-xs uppercase tracking-widest">New Pain Point</span>
                    </div>
                    <div className="p-5 space-y-4">
                        <div>
                            <label htmlFor="title" className="block font-mono text-xs uppercase tracking-widest mb-2">
                                Problem Statement <span className="text-neutral-400">(required)</span>
                            </label>
                            <input
                                id="title"
                                name="title"
                                required
                                autoFocus
                                maxLength={200}
                                placeholder="e.g. Video editing takes too long"
                                className="w-full border border-black px-4 py-2.5 font-mono text-sm bg-white focus:outline-none"
                            />
                        </div>
                        <div>
                            <label htmlFor="category" className="block font-mono text-xs uppercase tracking-widest mb-2">
                                Category
                            </label>
                            <input
                                id="category"
                                name="category"
                                maxLength={100}
                                placeholder="e.g. Marketing, Engineering, Ops"
                                className="w-full border border-black px-4 py-2.5 font-mono text-sm bg-white focus:outline-none"
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block font-mono text-xs uppercase tracking-widest mb-2">
                                Context <span className="text-neutral-400">(optional)</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={3}
                                maxLength={2000}
                                placeholder="Describe the impact and current workarounds..."
                                className="w-full border border-black px-4 py-2.5 font-mono text-sm bg-white focus:outline-none resize-none"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="border border-black px-6 py-2.5 font-mono text-xs bg-black text-white hover:bg-neutral-800"
                            >
                                Save Pain Point
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="border border-black px-6 py-2.5 font-mono text-xs bg-white hover:bg-neutral-100"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Pain Points List */}
            {initialData.length === 0 ? (
                <div className="border border-dashed border-black/30 py-16 text-center">
                    <p className="font-serif text-lg text-neutral-600 mb-1">No pain points yet</p>
                    <p className="font-mono text-xs text-neutral-400 mb-4">
                        Add pain points your team is facing to trigger AI tool discovery.
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="border border-black px-6 py-2.5 font-mono text-xs bg-black text-white hover:bg-neutral-800"
                    >
                        Add Your First Pain Point
                    </button>
                </div>
            ) : (
                <div className="border border-black divide-y divide-black">
                    <div className="px-5 py-3 bg-neutral-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                        <span className="font-mono text-xs text-neutral-500">
                            {initialData.filter(p => p.active).length} of {initialData.length} active
                        </span>
                        <span className="font-mono text-[10px] sm:text-xs text-neutral-400">
                            Toggle to include/exclude from suggestions
                        </span>
                    </div>

                    {initialData.map((point) => (
                        <div
                            key={point.id}
                            className={`p-5 ${!point.active ? "opacity-50" : ""}`}
                        >
                            {editingId === point.id ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Problem Statement</label>
                                        <input
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            maxLength={200}
                                            autoFocus
                                            className="w-full border border-black px-3 py-2 font-mono text-sm bg-white focus:outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="sm:col-span-1">
                                            <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Category</label>
                                            <input
                                                value={editCategory}
                                                onChange={(e) => setEditCategory(e.target.value)}
                                                maxLength={100}
                                                placeholder="General"
                                                className="w-full border border-black px-3 py-2 font-mono text-sm bg-white focus:outline-none"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Context</label>
                                            <textarea
                                                value={editDescription}
                                                onChange={(e) => setEditDescription(e.target.value)}
                                                maxLength={2000}
                                                rows={2}
                                                className="w-full border border-black px-3 py-2 font-mono text-sm bg-white focus:outline-none resize-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdate(point.id)}
                                            disabled={isPending}
                                            className="border border-black px-4 py-1.5 font-mono text-xs bg-black text-white hover:bg-neutral-800 disabled:opacity-40"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className="border border-black px-4 py-1.5 font-mono text-xs bg-white hover:bg-neutral-100"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-4">
                                    <button
                                        onClick={() => handleToggle(point.id, point.active)}
                                        disabled={isPending}
                                        className={`mt-1 w-10 h-5 border border-black shrink-0 relative transition-colors ${point.active ? "bg-black" : "bg-white"}`}
                                        aria-label={point.active ? "Deactivate pain point" : "Activate pain point"}
                                        role="switch"
                                        aria-checked={point.active}
                                    >
                                        <span className={`absolute top-0.5 w-3.5 h-3.5 border border-black bg-white transition-all ${point.active ? "left-5" : "left-0.5"}`} />
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-3 flex-wrap mb-1">
                                            <h3 className="font-serif text-base leading-snug">{point.title}</h3>
                                            {point.category && (
                                                <span className="font-mono text-[10px] border border-black px-1.5 py-0.5 text-neutral-500 shrink-0">
                                                    {point.category}
                                                </span>
                                            )}
                                            {point.active && (
                                                <span className="font-mono text-[10px] border border-black bg-black text-white px-1.5 py-0.5 shrink-0">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        {point.description && (
                                            <p className="font-mono text-xs text-neutral-500 leading-relaxed mb-2">
                                                {point.description}
                                            </p>
                                        )}
                                        <span className="font-mono text-[10px] text-neutral-400">
                                            Added {formatDistanceToNow(new Date(point.createdAt), { addSuffix: true })}
                                        </span>
                                        {/* Matching tools in stack */}
                                        {(() => {
                                            const matched = getMatchedTools(point.category, workspaceTools);
                                            if (matched.length === 0) return null;
                                            return (
                                                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">In your stack:</span>
                                                    {matched.map(t => (
                                                        <a
                                                            key={t.id}
                                                            href={`/tools/${t.id}`}
                                                            className="font-mono text-[10px] border border-black px-1.5 py-0.5 hover:bg-black hover:text-white transition-colors"
                                                        >
                                                            {t.name}{t.overallScore ? ` ${Number(t.overallScore).toFixed(1)}` : ""}
                                                        </a>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    <div className="shrink-0 flex items-center gap-1">
                                        {confirmDeleteId === point.id ? (
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs text-neutral-500">Delete?</span>
                                                <button
                                                    onClick={() => handleDelete(point.id)}
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
                                            <>
                                                <button
                                                    onClick={() => startEdit(point)}
                                                    className="border border-neutral-200 p-2 hover:border-black hover:text-black text-neutral-400 transition-colors"
                                                    aria-label="Edit pain point"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDeleteId(point.id)}
                                                    className="border border-neutral-200 p-2 hover:border-black hover:text-black text-neutral-400 transition-colors"
                                                    aria-label="Delete pain point"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
