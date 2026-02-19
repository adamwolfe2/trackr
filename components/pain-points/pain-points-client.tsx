"use client";

import { useState, useTransition } from "react";
import { addPainPoint, deletePainPoint, togglePainPointActive } from "@/lib/actions/pain-points";
import { PlusCircle, Trash2, X } from "lucide-react";
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

export function PainPointsClient({ initialData = [] }: { initialData?: PainPoint[] }) {
    const [isPending, startTransition] = useTransition();
    const [showForm, setShowForm] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const router = useRouter();

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
            await togglePainPointActive(id, currentActive);
            router.refresh();
        });
    };

    const handleDelete = (id: string) => {
        setConfirmDeleteId(null);
        startTransition(async () => {
            await deletePainPoint(id);
            router.refresh();
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">Discovery Engine</p>
                    <h1 className="font-serif text-2xl font-normal">Pain Points</h1>
                    <p className="font-mono text-xs text-neutral-500 mt-1">
                        Document internal problems to trigger AI tool discovery.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(prev => !prev)}
                    className="flex items-center gap-2 border border-black px-4 py-2.5 font-mono text-xs bg-black text-white hover:bg-neutral-800 whitespace-nowrap"
                >
                    {showForm ? <X className="h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
                    {showForm ? "Cancel" : "Add Pain Point"}
                </button>
            </div>

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
                    {/* Active count */}
                    <div className="px-5 py-3 bg-neutral-50 flex items-center justify-between">
                        <span className="font-mono text-xs text-neutral-500">
                            {initialData.filter(p => p.active).length} of {initialData.length} active — influencing AI discovery
                        </span>
                        <span className="font-mono text-xs text-neutral-400">
                            Toggle to include/exclude from suggestions
                        </span>
                    </div>

                    {initialData.map((point) => (
                        <div
                            key={point.id}
                            className={`p-5 flex items-start gap-4 ${!point.active ? "opacity-50" : ""}`}
                        >
                            {/* Toggle */}
                            <button
                                onClick={() => handleToggle(point.id, point.active)}
                                disabled={isPending}
                                className={`mt-1 w-10 h-5 border border-black shrink-0 relative transition-colors ${
                                    point.active ? "bg-black" : "bg-white"
                                }`}
                                title={point.active ? "Deactivate" : "Activate"}
                            >
                                <span
                                    className={`absolute top-0.5 w-3.5 h-3.5 border border-black bg-white transition-all ${
                                        point.active ? "left-5" : "left-0.5"
                                    }`}
                                />
                            </button>

                            {/* Content */}
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
                            </div>

                            {/* Delete */}
                            <div className="shrink-0">
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
                                    <button
                                        onClick={() => setConfirmDeleteId(point.id)}
                                        className="border border-neutral-200 p-2 hover:border-black hover:text-black text-neutral-400 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
