"use client";

import { useState, useTransition } from "react";
import { addSoftwareSpend, deleteSoftwareSpend, updateSoftwareSpendStatus, updateSoftwareSpendDetails } from "@/lib/actions/software-spend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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

export function StackClient({ initialData = [], lowScoredNames = [] }: { initialData?: SpendEntry[]; lowScoredNames?: string[] }) {
    const [isOpen, setIsOpen] = useState(false);
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

    const cancelEdit = () => setEditingId(null);

    const flaggedCount = initialData.filter(isLowScored).length;

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Software Stack</h1>
                    <p className="text-sm text-muted-foreground">
                        Track all the tools your team pays for. Understand your total software spend.
                    </p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Add Tool
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Existing Tool</DialogTitle>
                        </DialogHeader>
                        <form
                            action={async (fd) => {
                                setIsOpen(false);
                                toast.promise(addSoftwareSpend(fd), {
                                    loading: "Adding tool...",
                                    success: () => { router.refresh(); return "Tool added to stack"; },
                                    error: "Failed to add tool",
                                });
                            }}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="toolName">Tool Name *</Label>
                                <Input id="toolName" name="toolName" placeholder="e.g. Slack, Notion, Salesforce" required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Input id="category" name="category" placeholder="e.g. Communication" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="monthlyCost">Monthly Cost ($)</Label>
                                    <Input id="monthlyCost" name="monthlyCost" type="number" step="0.01" placeholder="99.00" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="seatCount">Seats / Users</Label>
                                    <Input id="seatCount" name="seatCount" type="number" placeholder="10" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="billingCycle">Billing Cycle</Label>
                                    <Select name="billingCycle" defaultValue="monthly">
                                        <SelectTrigger id="billingCycle">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="annual">Annual</SelectItem>
                                            <SelectItem value="one-time">One-time</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="vendorUrl">Vendor URL</Label>
                                <Input id="vendorUrl" name="vendorUrl" placeholder="https://example.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Input id="notes" name="notes" placeholder="Contract renewal date, notes..." />
                            </div>
                            <Button type="submit" className="w-full">Add to Stack</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 border border-black">
                <div className="p-4 border-r border-b md:border-b-0 border-black">
                    <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1">
                        <DollarSign className="h-3 w-3" /> Monthly Spend
                    </div>
                    <div className="text-3xl font-bold font-mono mt-1">
                        ${totalMonthly.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">${(totalMonthly * 12).toLocaleString("en-US", { minimumFractionDigits: 0 })}/yr</div>
                </div>
                <div className="p-4 border-b md:border-b-0 md:border-r border-black">
                    <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1">
                        <Users className="h-3 w-3" /> Total Seats
                    </div>
                    <div className="text-3xl font-bold font-mono mt-1">{totalSeats || "—"}</div>
                    <div className="text-xs text-muted-foreground font-mono">active licenses</div>
                </div>
                <div className="p-4 border-r border-black">
                    <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Active Tools</div>
                    <div className="text-3xl font-bold font-mono mt-1">{initialData.filter(e => e.status === "active").length}</div>
                    <div className="text-xs text-muted-foreground font-mono">of {initialData.length} total</div>
                </div>
                <div className="p-4">
                    <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Under Review</div>
                    <div className="text-3xl font-bold font-mono mt-1">{initialData.filter(e => e.status === "evaluating").length}</div>
                    <div className="text-xs text-muted-foreground font-mono">evaluating</div>
                </div>
            </div>

            {/* Optimization Banner */}
            {flaggedCount > 0 && (
                <div className="border border-black bg-yellow-50 p-4 flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-700 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold font-mono">
                            {flaggedCount} tool{flaggedCount > 1 ? "s" : ""} scored below 6/10 — consider replacing
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            These tools have AI scores under 6 and are costing your team money. Review the flagged rows below.
                        </p>
                    </div>
                </div>
            )}

            {/* Table */}
            {initialData.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-black font-mono text-muted-foreground">
                    <p className="text-lg font-semibold mb-1">No tools in your stack yet.</p>
                    <p className="text-sm">Add the tools your team is already paying for to track spend.</p>
                </div>
            ) : (
                <div className="border border-black overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-black bg-neutral-100">
                                <th className="text-left px-4 py-3 font-mono font-semibold text-xs uppercase">Tool</th>
                                <th className="text-left px-4 py-3 font-mono font-semibold text-xs uppercase">Category</th>
                                <th className="text-right px-4 py-3 font-mono font-semibold text-xs uppercase">Monthly Cost</th>
                                <th className="text-right px-4 py-3 font-mono font-semibold text-xs uppercase">Seats</th>
                                <th className="text-left px-4 py-3 font-mono font-semibold text-xs uppercase">Status</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {initialData.map((entry) => {
                                const flagged = isLowScored(entry);
                                const isEditing = editingId === entry.id;
                                return (
                                    <tr key={entry.id} className={`border-b border-neutral-200 transition-colors ${flagged ? "bg-yellow-50/50" : "hover:bg-neutral-50"}`}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{entry.toolName}</span>
                                                {flagged && (
                                                    <span className="text-[9px] font-mono bg-yellow-200 text-yellow-800 border border-yellow-400 px-1.5 py-0.5 uppercase tracking-wide">
                                                        Consider Replacing
                                                    </span>
                                                )}
                                            </div>
                                            {entry.vendorUrl && (() => { try { return new URL(entry.vendorUrl); } catch { return null; } })() && (
                                                <a href={entry.vendorUrl} target="_blank" rel="noopener noreferrer"
                                                    className="text-xs text-muted-foreground hover:underline flex items-center gap-1 mt-0.5">
                                                    {(() => { try { return new URL(entry.vendorUrl).hostname; } catch { return entry.vendorUrl; } })()} <ExternalLink className="h-2.5 w-2.5" />
                                                </a>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{entry.category || "—"}</td>
                                        <td className="px-4 py-3 text-right font-mono">
                                            {isEditing ? (
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={editCost}
                                                    onChange={e => setEditCost(e.target.value)}
                                                    className="w-24 h-7 text-right text-xs ml-auto"
                                                    placeholder="0.00"
                                                />
                                            ) : (
                                                parseFloat(entry.monthlyCost || "0") > 0
                                                    ? `$${parseFloat(entry.monthlyCost!).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                                                    : "—"
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono">
                                            {isEditing ? (
                                                <Input
                                                    type="number"
                                                    value={editSeats}
                                                    onChange={e => setEditSeats(e.target.value)}
                                                    className="w-16 h-7 text-right text-xs ml-auto"
                                                    placeholder="0"
                                                />
                                            ) : (
                                                entry.seatCount || "—"
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Select
                                                defaultValue={entry.status}
                                                onValueChange={(val) => {
                                                    startTransition(async () => {
                                                        await updateSoftwareSpendStatus(entry.id, val);
                                                        router.refresh();
                                                    });
                                                }}
                                            >
                                                <SelectTrigger className="h-7 w-[120px] text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="evaluating">Evaluating</SelectItem>
                                                    <SelectItem value="canceling">Canceling</SelectItem>
                                                    <SelectItem value="canceled">Canceled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 justify-end">
                                                {isEditing ? (
                                                    <>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-black" onClick={() => saveEdit(entry.id)} disabled={isPending}>
                                                            <Check className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEdit}>
                                                            <X className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-400 hover:text-black" onClick={() => startEdit(entry)}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => setToDelete(entry.id)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove from stack?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This tool and its spend data will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 text-white border-red-600 hover:bg-red-700"
                            onClick={() => {
                                if (!toDelete) return;
                                const id = toDelete;
                                setToDelete(null);
                                startTransition(async () => {
                                    await deleteSoftwareSpend(id);
                                    router.refresh();
                                });
                            }}
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
