"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import {
    addContract,
    deleteContract,
    updateContractTerms,
    linkContractToSpend,
    type ExtractedTerms,
} from "@/lib/actions/contracts";
import {
    PlusCircle,
    Trash2,
    X,
    ChevronDown,
    ChevronUp,
    FileText,
    Link2,
    Pencil,
    Check,
    ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

type SpendEntry = {
    id: string;
    toolName: string;
};

type Contract = {
    id: string;
    workspaceId: string;
    softwareSpendId: string | null;
    fileName: string;
    fileUrl: string;
    fileSize: number | null;
    mimeType: string | null;
    extractedTerms: ExtractedTerms | unknown;
    status: string;
    uploadedBy: string;
    createdAt: Date;
    spend?: { id: string; toolName: string } | null;
};

function getTerms(raw: unknown): ExtractedTerms {
    if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw as ExtractedTerms;
    return {};
}

function statusStyle(status: string) {
    switch (status) {
        case "active":
            return "border-black bg-white text-black";
        case "processing":
            return "border-neutral-400 bg-neutral-50 text-neutral-600";
        case "expired":
            return "border-neutral-400 bg-neutral-100 text-neutral-500";
        default:
            return "border-black bg-white text-black";
    }
}

export function ContractsClient({
    initialData = [],
    spendEntries = [],
    workspaceId,
    userId,
}: {
    initialData?: Contract[];
    spendEntries?: SpendEntry[];
    workspaceId: string;
    userId: string;
}) {
    const [isPending, startTransition] = useTransition();
    const [showForm, setShowForm] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const confirmResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (confirmDeleteId) {
            if (confirmResetTimer.current) clearTimeout(confirmResetTimer.current);
            confirmResetTimer.current = setTimeout(() => setConfirmDeleteId(null), 3000);
        }
        return () => {
            if (confirmResetTimer.current) clearTimeout(confirmResetTimer.current);
        };
    }, [confirmDeleteId]);

    const [editingTermsId, setEditingTermsId] = useState<string | null>(null);
    const [linkingId, setLinkingId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<"date" | "renewal">("date");

    // Add form state
    const [fileName, setFileName] = useState("");
    const [fileUrl, setFileUrl] = useState("");
    const [linkedSpendId, setLinkedSpendId] = useState("");

    // Terms edit state
    const [editTerms, setEditTerms] = useState<ExtractedTerms>({});

    const router = useRouter();

    const sorted = [...initialData].sort((a, b) => {
        if (sortBy === "renewal") {
            const termsA = getTerms(a.extractedTerms);
            const termsB = getTerms(b.extractedTerms);
            const dateA = termsA.renewalDate ? new Date(termsA.renewalDate).getTime() : Infinity;
            const dateB = termsB.renewalDate ? new Date(termsB.renewalDate).getTime() : Infinity;
            return dateA - dateB;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const handleAdd = () => {
        if (!fileName.trim() || !fileUrl.trim()) {
            toast.error("File name and URL are required");
            return;
        }
        const data = {
            fileName: fileName.trim(),
            fileUrl: fileUrl.trim(),
            softwareSpendId: linkedSpendId || undefined,
            uploadedBy: userId,
        };
        setFileName("");
        setFileUrl("");
        setLinkedSpendId("");
        setShowForm(false);

        startTransition(async () => {
            try {
                await addContract(workspaceId, data);
                toast.success("Contract uploaded");
                router.refresh();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to upload contract");
            }
        });
    };

    const handleDelete = (id: string) => {
        setConfirmDeleteId(null);
        startTransition(async () => {
            try {
                await deleteContract(id, workspaceId);
                toast.success("Contract deleted");
                router.refresh();
            } catch {
                toast.error("Failed to delete contract");
            }
        });
    };

    const startEditTerms = (contract: Contract) => {
        const terms = getTerms(contract.extractedTerms);
        setEditTerms(terms);
        setEditingTermsId(contract.id);
    };

    const handleSaveTerms = (contractId: string) => {
        setEditingTermsId(null);
        startTransition(async () => {
            try {
                await updateContractTerms(contractId, workspaceId, editTerms);
                toast.success("Contract terms updated");
                router.refresh();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to update terms");
            }
        });
    };

    const handleLink = (contractId: string, spendId: string) => {
        setLinkingId(null);
        startTransition(async () => {
            try {
                await linkContractToSpend(contractId, workspaceId, spendId);
                toast.success("Contract linked to tool");
                router.refresh();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to link contract");
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">Workflow</p>
                    <h1 className="font-serif text-2xl font-normal">Contract Vault</h1>
                    <p className="font-mono text-xs text-neutral-500 mt-1">
                        Store contracts, track renewal dates, and manage key terms.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowForm(prev => !prev)}
                        className="flex items-center gap-2 border border-black px-4 py-2.5 font-mono text-xs bg-black text-white hover:bg-neutral-800 whitespace-nowrap"
                    >
                        {showForm ? <X className="h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
                        {showForm ? "Cancel" : "Upload Contract"}
                    </button>
                </div>
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="border border-black bg-white">
                    <div className="border-b border-black px-5 py-3">
                        <span className="font-mono text-xs uppercase tracking-widest">New Contract</span>
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-mono text-xs uppercase tracking-widest mb-2">
                                    File Name <span className="text-neutral-400">(required)</span>
                                </label>
                                <input
                                    value={fileName}
                                    onChange={(e) => setFileName(e.target.value)}
                                    maxLength={500}
                                    placeholder="e.g. Slack Enterprise Agreement 2026.pdf"
                                    className="w-full border border-black px-4 py-2.5 font-mono text-sm bg-white focus:outline-none"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block font-mono text-xs uppercase tracking-widest mb-2">
                                    File URL <span className="text-neutral-400">(required)</span>
                                </label>
                                <input
                                    value={fileUrl}
                                    onChange={(e) => setFileUrl(e.target.value)}
                                    placeholder="https://drive.google.com/... or paste document URL"
                                    className="w-full border border-black px-4 py-2.5 font-mono text-sm bg-white focus:outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block font-mono text-xs uppercase tracking-widest mb-2">
                                Link to Software <span className="text-neutral-400">(optional)</span>
                            </label>
                            <select
                                value={linkedSpendId}
                                onChange={(e) => setLinkedSpendId(e.target.value)}
                                className="w-full sm:w-1/2 border border-black px-4 py-2.5 font-mono text-sm bg-white focus:outline-none"
                            >
                                <option value="">-- No linked tool --</option>
                                {spendEntries.map((s) => (
                                    <option key={s.id} value={s.id}>{s.toolName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleAdd}
                                disabled={isPending || !fileName.trim() || !fileUrl.trim()}
                                className="border border-black px-6 py-2.5 font-mono text-xs bg-black text-white hover:bg-neutral-800 disabled:opacity-40"
                            >
                                Upload Contract
                            </button>
                            <button
                                onClick={() => { setShowForm(false); setFileName(""); setFileUrl(""); setLinkedSpendId(""); }}
                                className="border border-black px-6 py-2.5 font-mono text-xs bg-white hover:bg-neutral-100"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {initialData.length === 0 ? (
                <div className="border border-dashed border-black/30 py-16 text-center">
                    <p className="font-serif text-lg text-neutral-600 mb-1">No contracts yet</p>
                    <p className="font-mono text-xs text-neutral-400 mb-4">
                        Upload your first software contract to track terms and renewal dates.
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="border border-black px-6 py-2.5 font-mono text-xs bg-black text-white hover:bg-neutral-800"
                    >
                        Upload Your First Contract
                    </button>
                </div>
            ) : (
                <>
                    {/* Sort Controls */}
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Sort by:</span>
                        <button
                            onClick={() => setSortBy("date")}
                            className={`font-mono text-xs px-3 py-1 border ${sortBy === "date" ? "border-black bg-black text-white" : "border-neutral-300 hover:border-black"}`}
                        >
                            Upload Date
                        </button>
                        <button
                            onClick={() => setSortBy("renewal")}
                            className={`font-mono text-xs px-3 py-1 border ${sortBy === "renewal" ? "border-black bg-black text-white" : "border-neutral-300 hover:border-black"}`}
                        >
                            Renewal Date
                        </button>
                    </div>

                    {/* Contract Table */}
                    <div className="border border-black bg-white">
                        {/* Table Header */}
                        <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-black bg-neutral-50">
                            <span className="col-span-4 font-mono text-[10px] uppercase tracking-widest text-neutral-500">File Name</span>
                            <span className="col-span-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500">Linked Tool</span>
                            <span className="col-span-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500">Status</span>
                            <span className="col-span-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500">Renewal</span>
                            <span className="col-span-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500">Uploaded</span>
                        </div>

                        {/* Table Rows */}
                        <div className="divide-y divide-black">
                            {sorted.map((contract) => {
                                const terms = getTerms(contract.extractedTerms);
                                const isExpanded = expandedId === contract.id;
                                const isEditingTerms = editingTermsId === contract.id;
                                const isLinking = linkingId === contract.id;

                                return (
                                    <div key={contract.id}>
                                        {/* Row */}
                                        <div
                                            className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-5 py-4 cursor-pointer hover:bg-neutral-50 transition-colors"
                                            onClick={() => setExpandedId(isExpanded ? null : contract.id)}
                                        >
                                            <div className="sm:col-span-4 flex items-center gap-2 min-w-0">
                                                <FileText className="w-4 h-4 shrink-0 text-neutral-400" />
                                                <span className="font-mono text-sm truncate">{contract.fileName}</span>
                                                {isExpanded
                                                    ? <ChevronUp className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                                                    : <ChevronDown className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                                                }
                                            </div>
                                            <div className="sm:col-span-2 flex items-center">
                                                <span className="font-mono text-xs text-neutral-500">
                                                    {contract.spend?.toolName ?? "--"}
                                                </span>
                                            </div>
                                            <div className="sm:col-span-2 flex items-center">
                                                <span className={`font-mono text-[10px] uppercase border px-1.5 py-0.5 ${statusStyle(contract.status)}`}>
                                                    {contract.status}
                                                </span>
                                            </div>
                                            <div className="sm:col-span-2 flex items-center">
                                                <span className="font-mono text-xs text-neutral-500">
                                                    {terms.renewalDate
                                                        ? new Date(terms.renewalDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                                        : "--"
                                                    }
                                                </span>
                                            </div>
                                            <div className="sm:col-span-2 flex items-center justify-between">
                                                <span className="font-mono text-[10px] text-neutral-400">
                                                    {formatDistanceToNow(new Date(contract.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Expanded Detail */}
                                        {isExpanded && (
                                            <div className="border-t border-black bg-neutral-50 px-5 py-5 space-y-4">
                                                {/* Actions Bar */}
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <a
                                                        href={contract.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 border border-black px-3 py-1.5 font-mono text-xs hover:bg-white"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                        Open Document
                                                    </a>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); startEditTerms(contract); }}
                                                        className="flex items-center gap-1.5 border border-black px-3 py-1.5 font-mono text-xs hover:bg-white"
                                                    >
                                                        <Pencil className="w-3 h-3" />
                                                        Edit Terms
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setLinkingId(isLinking ? null : contract.id); }}
                                                        className="flex items-center gap-1.5 border border-black px-3 py-1.5 font-mono text-xs hover:bg-white"
                                                    >
                                                        <Link2 className="w-3 h-3" />
                                                        Link to Tool
                                                    </button>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (confirmDeleteId === contract.id) {
                                                                handleDelete(contract.id);
                                                            } else {
                                                                setConfirmDeleteId(contract.id);
                                                            }
                                                        }}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs ml-auto border ${
                                                            confirmDeleteId === contract.id
                                                                ? "border-black bg-black text-white hover:bg-neutral-800"
                                                                : "border-neutral-200 text-neutral-400 hover:border-black hover:text-black"
                                                        }`}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                        {confirmDeleteId === contract.id ? "Confirm?" : "Delete"}
                                                    </button>
                                                </div>

                                                {/* Link to Tool Dropdown */}
                                                {isLinking && (
                                                    <div className="border border-black bg-white p-3">
                                                        <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
                                                            Select software to link
                                                        </label>
                                                        <select
                                                            defaultValue={contract.softwareSpendId ?? ""}
                                                            onChange={(e) => {
                                                                if (e.target.value) handleLink(contract.id, e.target.value);
                                                            }}
                                                            className="border border-black px-3 py-2 font-mono text-xs bg-white focus:outline-none w-full sm:w-auto"
                                                        >
                                                            <option value="">-- Select tool --</option>
                                                            {spendEntries.map((s) => (
                                                                <option key={s.id} value={s.id}>{s.toolName}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                                {/* Terms Grid */}
                                                {isEditingTerms ? (
                                                    <div className="border border-black bg-white p-4 space-y-3">
                                                        <p className="font-mono text-xs uppercase tracking-widest font-semibold">Edit Contract Terms</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                            <div>
                                                                <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Renewal Date</label>
                                                                <input
                                                                    type="date"
                                                                    value={editTerms.renewalDate?.split("T")[0] ?? ""}
                                                                    onChange={(e) => setEditTerms({ ...editTerms, renewalDate: e.target.value || null })}
                                                                    className="w-full border border-black px-3 py-2 font-mono text-xs bg-white focus:outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Auto-Renew</label>
                                                                <select
                                                                    value={editTerms.autoRenew === true ? "yes" : editTerms.autoRenew === false ? "no" : ""}
                                                                    onChange={(e) => setEditTerms({ ...editTerms, autoRenew: e.target.value === "yes" ? true : e.target.value === "no" ? false : null })}
                                                                    className="w-full border border-black px-3 py-2 font-mono text-xs bg-white focus:outline-none"
                                                                >
                                                                    <option value="">Unknown</option>
                                                                    <option value="yes">Yes</option>
                                                                    <option value="no">No</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Notice Period (days)</label>
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    value={editTerms.noticePeriodDays ?? ""}
                                                                    onChange={(e) => setEditTerms({ ...editTerms, noticePeriodDays: e.target.value ? parseInt(e.target.value) : null })}
                                                                    className="w-full border border-black px-3 py-2 font-mono text-xs bg-white focus:outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Term Length (months)</label>
                                                                <input
                                                                    type="number"
                                                                    min={1}
                                                                    value={editTerms.termMonths ?? ""}
                                                                    onChange={(e) => setEditTerms({ ...editTerms, termMonths: e.target.value ? parseInt(e.target.value) : null })}
                                                                    className="w-full border border-black px-3 py-2 font-mono text-xs bg-white focus:outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Price Escalation</label>
                                                                <input
                                                                    type="text"
                                                                    value={editTerms.priceEscalation ?? ""}
                                                                    onChange={(e) => setEditTerms({ ...editTerms, priceEscalation: e.target.value || null })}
                                                                    placeholder="e.g. 5% annual increase"
                                                                    className="w-full border border-black px-3 py-2 font-mono text-xs bg-white focus:outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Cancellation Terms</label>
                                                                <input
                                                                    type="text"
                                                                    value={editTerms.cancellationTerms ?? ""}
                                                                    onChange={(e) => setEditTerms({ ...editTerms, cancellationTerms: e.target.value || null })}
                                                                    placeholder="e.g. 30-day written notice"
                                                                    className="w-full border border-black px-3 py-2 font-mono text-xs bg-white focus:outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 pt-1">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleSaveTerms(contract.id); }}
                                                                disabled={isPending}
                                                                className="flex items-center gap-1.5 border border-black px-4 py-2 font-mono text-xs bg-black text-white hover:bg-neutral-800 disabled:opacity-40"
                                                            >
                                                                <Check className="w-3 h-3" />
                                                                Save Terms
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setEditingTermsId(null); }}
                                                                className="border border-black px-4 py-2 font-mono text-xs bg-white hover:bg-neutral-100"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-black border border-black">
                                                        <TermCell label="Renewal Date" value={terms.renewalDate ? new Date(terms.renewalDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null} />
                                                        <TermCell label="Auto-Renew" value={terms.autoRenew === true ? "Yes" : terms.autoRenew === false ? "No" : null} />
                                                        <TermCell label="Notice Period" value={terms.noticePeriodDays ? `${terms.noticePeriodDays} days` : null} />
                                                        <TermCell label="Term Length" value={terms.termMonths ? `${terms.termMonths} months` : null} />
                                                        <TermCell label="Price Escalation" value={terms.priceEscalation ?? null} />
                                                        <TermCell label="Cancellation" value={terms.cancellationTerms ?? null} />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function TermCell({ label, value }: { label: string; value: string | null }) {
    return (
        <div className="bg-white px-3 py-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">{label}</p>
            <p className="font-mono text-xs">{value ?? "--"}</p>
        </div>
    );
}
