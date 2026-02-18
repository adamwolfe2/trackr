"use client";

import { useState, useTransition } from "react";
import { addSoftwareSpend, deleteSoftwareSpend, updateSoftwareSpendStatus } from "@/lib/actions/software-spend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, Trash2, ExternalLink, DollarSign, Users } from "lucide-react";
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

const STATUS_COLORS: Record<string, string> = {
    active: "bg-black text-white",
    evaluating: "bg-yellow-100 text-yellow-900 border-yellow-400",
    canceling: "bg-red-100 text-red-900 border-red-400",
    canceled: "bg-neutral-100 text-neutral-500",
};

export function StackClient({ initialData = [] }: { initialData?: SpendEntry[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [toDelete, setToDelete] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const totalMonthly = initialData
        .filter(e => e.status === "active")
        .reduce((sum, e) => sum + parseFloat(e.monthlyCost || "0"), 0);

    const totalSeats = initialData
        .filter(e => e.status === "active")
        .reduce((sum, e) => sum + (e.seatCount || 0), 0);

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

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono uppercase mb-1">
                            <DollarSign className="h-3 w-3" /> Monthly Spend
                        </div>
                        <div className="text-2xl font-bold">${totalMonthly.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                        <div className="text-xs text-muted-foreground">${(totalMonthly * 12).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/yr</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono uppercase mb-1">
                            <Users className="h-3 w-3" /> Total Seats
                        </div>
                        <div className="text-2xl font-bold">{totalSeats || "—"}</div>
                        <div className="text-xs text-muted-foreground">active licenses</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-muted-foreground text-xs font-mono uppercase mb-1">Active Tools</div>
                        <div className="text-2xl font-bold">{initialData.filter(e => e.status === "active").length}</div>
                        <div className="text-xs text-muted-foreground">of {initialData.length} total</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-muted-foreground text-xs font-mono uppercase mb-1">Evaluating</div>
                        <div className="text-2xl font-bold">{initialData.filter(e => e.status === "evaluating").length}</div>
                        <div className="text-xs text-muted-foreground">under review</div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            {initialData.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-black font-mono text-muted-foreground">
                    <p className="text-lg font-semibold mb-1">No tools in your stack yet.</p>
                    <p className="text-sm">Add the tools your team is already paying for to track spend.</p>
                </div>
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-black bg-neutral-50">
                                    <th className="text-left px-4 py-3 font-mono font-semibold text-xs uppercase">Tool</th>
                                    <th className="text-left px-4 py-3 font-mono font-semibold text-xs uppercase">Category</th>
                                    <th className="text-right px-4 py-3 font-mono font-semibold text-xs uppercase">Monthly Cost</th>
                                    <th className="text-right px-4 py-3 font-mono font-semibold text-xs uppercase">Seats</th>
                                    <th className="text-left px-4 py-3 font-mono font-semibold text-xs uppercase">Status</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {initialData.map((entry) => (
                                    <tr key={entry.id} className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{entry.toolName}</div>
                                            {entry.vendorUrl && (
                                                <a href={entry.vendorUrl} target="_blank" rel="noopener noreferrer"
                                                    className="text-xs text-muted-foreground hover:underline flex items-center gap-1 mt-0.5">
                                                    {new URL(entry.vendorUrl).hostname} <ExternalLink className="h-2.5 w-2.5" />
                                                </a>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{entry.category || "—"}</td>
                                        <td className="px-4 py-3 text-right font-mono">
                                            {parseFloat(entry.monthlyCost || "0") > 0
                                                ? `$${parseFloat(entry.monthlyCost!).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono">{entry.seatCount || "—"}</td>
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
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => setToDelete(entry.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
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
