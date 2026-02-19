"use client";

import { useState, useTransition } from "react";
import { addSoftwareSpend, deleteSoftwareSpend, updateSoftwareSpendStatus, updateSoftwareSpendDetails } from "@/lib/actions/software-spend";
import { PlusCircle, Trash2, ExternalLink, DollarSign, Users, Pencil, Check, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type SpendEntry = {
    id: string;
    toolName: string;
    category: string | null;
    vendorUrl: string | null;
    monthlyCost: string | null;
    seatCount: number | null;
    billingCycle: string | null;
    status: string;
    notes: string | null;
    createdAt: Date;
};

const STATUS_OPTIONS = ["active", "evaluating", "canceling", "canceled"] as const;

export function StackClient({ initialData = [], lowScoredNames = [] }: { initialData?: SpendEntry[]; lowScoredNames?: string[] }) {
    const [showForm, setShowForm] = useState(false);
    const [toDelete, setToDelete] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editCost, setEditCost] = useState("");
    const [editSeats, setEditSeats] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const totalMonthly = initialData
        .filter(e => e.status === "active")
        .reduce((sum, e) => sum + parseFloat(e.monthlyCost || "0"), 0);

    const totalSeats = initialData
        .filter(e => e.status === "active")
        .reduce((sum, e) => sum + (e.seatCount || 0), 0);

    const lowScoredSet = new Set(lowScoredNames);
    const isLowScored = (entry: SpendEntry) =>
        lowScoredSet.has(entry.toolName.toLowerCase()) && parseFloat(entry.monthlyCost || "0") > 0;

    const startEdit = (entry: SpendEntry) => {
        setEditingId(entry.id);
        setEditCost(entry.monthlyCost ? parseFloat(entry.monthlyCost).toString() : "");
        setEditSeats(entry.seatCount?.toString() ?? "");
    };

    const saveEdit = (id: string) => {
        startTransition(async () => {
            try {
                await updateSoftwareSpendDetails(id, editCost || "0", editSeats ? parseInt(editSeats, 10) : null);
                setEditingId(null);
                toast.success("Updated");
                router.refresh();
            } catch {
                toast.error("Failed to save");
            }
        });
    };

    const flaggedCount = initialData.filter(isLowScored).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">Spend Intelligence</p>
                    <h1 className="font-serif text-2xl font-normal">Software Stack</h1>
                    <p className="font-mono text-xs text-neutral-500 mt-1">
                        Track all tools your team pays for. Understand your total software spend.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(prev => !prev)}
                    className="flex items-center gap-2 border border-black px-4 py-2.5 font-mono text-xs bg-black text-white hover:bg-neutral-800 whitespace-nowrap"
                >
                    {showForm ? <X className="h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
                    {showForm ? "Cancel" : "Add Tool"}
                </button>
            </div>

            {/* Add Form (inline) */}
            {showForm && (
                <form
                    action={async (fd) => {
                        setShowForm(false);
                        toast.promise(addSoftwareSpend(fd), {
                            loading: "Adding tool...",
                            success: () => { router.refresh(); return "Tool added to stack"; },
                            error: "Failed to add tool",
                        });
                    }}
                    className="border border-black bg-white"
                >
                    <div className="border-b border-black px-5 py-3">
                        <span className="font-mono text-xs uppercase tracking-widest">Add Existing Tool</span>
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-mono text-xs uppercase tracking-widest mb-2">
                                    Tool Name <span className="text-neutral-400">(required)</span>
                                </label>
                                <input
                                    name="toolName"
                                    required
                                    autoFocus
                                    placeholder="e.g. Slack, Notion, Salesforce"
                                    className="w-full border border-black px-4 py-2.5 font-mono text-sm bg-white focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block font-mono text-xs uppercase tracking-widest mb-2">Category</label>
                                <input
                                    name="category"
                                    placeholder="e.g. Communication"
                                    className="w-full border border-black px-4 py-2.5 font-mono text-sm bg-white focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="block font-mono text-xs uppercase tracking-widest mb-2">Monthly Cost ($)</label>
                                <input
                                    name="monthlyCost"
                                    type="number"
                                    step="0.01"
                                    placeholder="99.00"
                                    className="w-full border border-black px-4 py-2.5 font-mono text-sm bg-white focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block font-mono text-xs uppercase tracking-widest mb-2">Seats / Users</label>
                                <input
                                    name="seatCount"
                                    type="number"
                                    placeholder="10"
                                    className="w-full border border-black px-4 py-2.5 font-mono text-sm bg-white focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block font-mono text-xs uppercase tracking-widest mb-2">Billing Cycle</label>
                                <select
                                    name="billingCycle"
                                    defaultValue="monthly"
                                    className="w-full border border-black px-4 py-2.5 font-mono text-sm bg-white focus:outline-none"
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="annual">Annual</option>
                                    <option value="one-time">One-time</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block font-mono text-xs uppercase tracking-widest mb-2">Vendor URL</label>
                            <input
                                name="vendorUrl"
                                placeholder="https://example.com"
                                className="w-full border border-black px-4 py-2.5 font-mono text-sm bg-white focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block font-mono text-xs uppercase tracking-widest mb-2">Notes</label>
                            <input
                                name="notes"
                                placeholder="Contract renewal date, notes..."
                                className="w-full border border-black px-4 py-2.5 font-mono text-sm bg-white focus:outline-none"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" className="border border-black px-6 py-2.5 font-mono text-xs bg-black text-white hover:bg-neutral-800">
                                Add to Stack
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="border border-black px-6 py-2.5 font-mono text-xs bg-white hover:bg-neutral-100">
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 border border-black">
                <div className="p-4 border-r border-b md:border-b-0 border-black">
                    <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest flex items-center gap-1 mb-1">
                        <DollarSign className="h-3 w-3" /> Monthly Spend
                    </div>
                    <div className="text-3xl font-serif">
                        ${totalMonthly.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                    <div className="font-mono text-xs text-neutral-400">
                        ${(totalMonthly * 12).toLocaleString("en-US", { minimumFractionDigits: 0 })}/yr
                    </div>
                </div>
                <div className="p-4 border-b md:border-b-0 md:border-r border-black">
                    <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest flex items-center gap-1 mb-1">
                        <Users className="h-3 w-3" /> Total Seats
                    </div>
                    <div className="text-3xl font-serif">{totalSeats || "—"}</div>
                    <div className="font-mono text-xs text-neutral-400">active licenses</div>
                </div>
                <div className="p-4 border-r border-black">
                    <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Active Tools</div>
                    <div className="text-3xl font-serif">{initialData.filter(e => e.status === "active").length}</div>
                    <div className="font-mono text-xs text-neutral-400">of {initialData.length} total</div>
                </div>
                <div className="p-4">
                    <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Under Review</div>
                    <div className="text-3xl font-serif">{initialData.filter(e => e.status === "evaluating").length}</div>
                    <div className="font-mono text-xs text-neutral-400">evaluating</div>
                </div>
            </div>

            {/* Optimization Banner */}
            {flaggedCount > 0 && (
                <div className="border border-black p-4 flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.5} />
                    <div>
                        <p className="font-mono text-sm font-semibold">
                            {flaggedCount} tool{flaggedCount > 1 ? "s" : ""} scored below 6/10 — consider replacing
                        </p>
                        <p className="font-mono text-xs text-neutral-500 mt-0.5">
                            These tools have AI scores under 6 and are costing your team money. Review the flagged rows below.
                        </p>
                    </div>
                </div>
            )}

            {/* Table */}
            {initialData.length === 0 ? (
                <div className="border border-dashed border-black/30 py-16 text-center">
                    <p className="font-serif text-lg text-neutral-600 mb-1">No tools in your stack yet.</p>
                    <p className="font-mono text-xs text-neutral-500">Add the tools your team is already paying for.</p>
                </div>
            ) : (
                <div className="border border-black overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-black bg-neutral-50">
                                <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-widest">Tool</th>
                                <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-widest">Category</th>
                                <th className="text-right px-4 py-3 font-mono text-xs uppercase tracking-widest">Monthly</th>
                                <th className="text-right px-4 py-3 font-mono text-xs uppercase tracking-widest">Seats</th>
                                <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-widest">Status</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {initialData.map((entry) => {
                                const flagged = isLowScored(entry);
                                const isEditing = editingId === entry.id;
                                return (
                                    <tr
                                        key={entry.id}
                                        className={`border-b border-neutral-100 ${flagged ? "bg-neutral-50" : "hover:bg-neutral-50/50"}`}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono text-sm">{entry.toolName}</span>
                                                {flagged && (
                                                    <span className="font-mono text-[9px] border border-black px-1.5 py-0.5 uppercase tracking-wide">
                                                        Consider Replacing
                                                    </span>
                                                )}
                                            </div>
                                            {entry.vendorUrl && (() => { try { return new URL(entry.vendorUrl); } catch { return null; } })() && (
                                                <a
                                                    href={entry.vendorUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-mono text-[10px] text-neutral-400 hover:text-black flex items-center gap-1 mt-0.5"
                                                >
                                                    {(() => { try { return new URL(entry.vendorUrl).hostname; } catch { return entry.vendorUrl; } })()}
                                                    <ExternalLink className="h-2.5 w-2.5" />
                                                </a>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-neutral-500">{entry.category || "—"}</td>
                                        <td className="px-4 py-3 text-right font-mono text-sm">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editCost}
                                                    onChange={e => setEditCost(e.target.value)}
                                                    className="w-24 border border-black px-2 py-1 text-right text-xs font-mono focus:outline-none ml-auto block"
                                                    placeholder="0.00"
                                                />
                                            ) : (
                                                parseFloat(entry.monthlyCost || "0") > 0
                                                    ? `$${parseFloat(entry.monthlyCost!).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                                                    : "—"
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-sm">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={editSeats}
                                                    onChange={e => setEditSeats(e.target.value)}
                                                    className="w-16 border border-black px-2 py-1 text-right text-xs font-mono focus:outline-none ml-auto block"
                                                    placeholder="0"
                                                />
                                            ) : (
                                                entry.seatCount || "—"
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                defaultValue={entry.status}
                                                onChange={(e) => {
                                                    startTransition(async () => {
                                                        await updateSoftwareSpendStatus(entry.id, e.target.value);
                                                        router.refresh();
                                                    });
                                                }}
                                                className="border border-black px-2 py-1 font-mono text-xs bg-white focus:outline-none"
                                            >
                                                {STATUS_OPTIONS.map(s => (
                                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 justify-end">
                                                {isEditing ? (
                                                    <>
                                                        <button
                                                            onClick={() => saveEdit(entry.id)}
                                                            disabled={isPending}
                                                            className="border border-black p-1.5 hover:bg-black hover:text-white transition-colors disabled:opacity-40"
                                                        >
                                                            <Check className="h-3 w-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="border border-black p-1.5 hover:bg-black hover:text-white transition-colors"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => startEdit(entry)}
                                                        className="border border-neutral-200 p-1.5 hover:border-black text-neutral-400 hover:text-black transition-colors"
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                    </button>
                                                )}

                                                {toDelete === entry.id ? (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => {
                                                                const id = toDelete;
                                                                setToDelete(null);
                                                                startTransition(async () => {
                                                                    await deleteSoftwareSpend(id);
                                                                    router.refresh();
                                                                });
                                                            }}
                                                            className="border border-black px-2 py-1 font-mono text-[10px] bg-black text-white hover:bg-neutral-800"
                                                        >
                                                            Delete
                                                        </button>
                                                        <button
                                                            onClick={() => setToDelete(null)}
                                                            className="border border-black px-2 py-1 font-mono text-[10px] hover:bg-neutral-100"
                                                        >
                                                            No
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setToDelete(entry.id)}
                                                        className="border border-neutral-200 p-1.5 hover:border-black text-neutral-400 hover:text-black transition-colors"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
