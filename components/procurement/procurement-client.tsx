"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    X,
    Loader2,
    ClipboardCheck,
    ExternalLink,
    CheckCircle2,
    XCircle,
    FlaskConical,
} from "lucide-react";
import { RequestCard, type ProcurementRequestData } from "./request-card";
import {
    submitProcurementRequest,
    updateProcurementStatus,
    startProcurementResearch,
} from "@/lib/actions/procurement";

// ── Types ────────────────────────────────────────────────────────────

interface ProcurementClientProps {
    initialRequests: ProcurementRequestData[];
    workspaceId: string;
    userId: string;
    userName: string;
}

type KanbanStatus = "pending" | "researching" | "reviewed" | "approved" | "rejected";

const COLUMNS: Array<{ key: KanbanStatus; label: string }> = [
    { key: "pending", label: "Pending" },
    { key: "researching", label: "Researching" },
    { key: "reviewed", label: "Reviewed" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
];

const URGENCY_OPTIONS = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
] as const;

// ── Component ────────────────────────────────────────────────────────

export function ProcurementClient({
    initialRequests,
    workspaceId,
    userId,
    userName,
}: ProcurementClientProps) {
    const router = useRouter();
    const [requests] = useState(initialRequests);
    const [showNewForm, setShowNewForm] = useState(false);
    const [selectedRequest, setSelectedRequest] =
        useState<ProcurementRequestData | null>(null);
    const [mobileTab, setMobileTab] = useState<KanbanStatus>("pending");

    // Group requests by status
    const grouped = useMemo(() => {
        const map: Record<KanbanStatus, ProcurementRequestData[]> = {
            pending: [],
            researching: [],
            reviewed: [],
            approved: [],
            rejected: [],
        };
        for (const req of requests) {
            const key = req.status as KanbanStatus;
            if (map[key]) {
                map[key].push(req);
            }
        }
        return map;
    }, [requests]);

    return (
        <div className="max-w-full mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="font-serif text-2xl sm:text-3xl font-normal">Procurement</h1>
                    <p className="font-mono text-xs text-neutral-500 mt-1">
                        Request, research, and approve new tools
                    </p>
                </div>
                <button
                    onClick={() => setShowNewForm(true)}
                    className="border border-black bg-black text-white px-4 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex items-center gap-2"
                >
                    <Plus className="w-3.5 h-3.5" />
                    New Request
                </button>
            </div>

            {/* Mobile tab selector */}
            <div className="flex sm:hidden border border-black mb-4">
                {COLUMNS.map((col) => (
                    <button
                        key={col.key}
                        onClick={() => setMobileTab(col.key)}
                        className={`flex-1 py-2 font-mono text-[9px] uppercase tracking-widest transition-colors ${
                            mobileTab === col.key
                                ? "bg-black text-white"
                                : "bg-white text-neutral-500 hover:bg-neutral-100"
                        }`}
                    >
                        {col.label}
                        <span className="ml-1">{grouped[col.key].length}</span>
                    </button>
                ))}
            </div>

            {/* Mobile: single column */}
            <div className="sm:hidden">
                {COLUMNS.filter(col => col.key === mobileTab).map((col) => {
                    const items = grouped[col.key];
                    return (
                        <div key={col.key}>
                            <div className="flex items-center justify-between mb-3 border border-black bg-white px-3 py-2">
                                <span className="font-mono text-xs uppercase tracking-widest">{col.label}</span>
                                <span className="font-mono text-[10px] font-bold border border-black w-5 h-5 flex items-center justify-center">{items.length}</span>
                            </div>
                            <div className="space-y-2">
                                {items.length === 0 ? (
                                    <div className="border border-dashed border-neutral-300 p-4 text-center">
                                        <span className="font-mono text-[10px] text-neutral-400">No requests</span>
                                    </div>
                                ) : (
                                    items.map((req) => (
                                        <RequestCard key={req.id} request={req} onClick={() => setSelectedRequest(req)} />
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Desktop: horizontal kanban */}
            <div className="hidden sm:flex gap-4 overflow-x-auto pb-4">
                {COLUMNS.map((col) => {
                    const items = grouped[col.key];
                    return (
                        <div
                            key={col.key}
                            className="flex-shrink-0 w-[260px] min-h-[400px]"
                        >
                            <div className="flex items-center justify-between mb-3 border border-black bg-white px-3 py-2">
                                <span className="font-mono text-xs uppercase tracking-widest">
                                    {col.label}
                                </span>
                                <span className="font-mono text-[10px] font-bold border border-black w-5 h-5 flex items-center justify-center">
                                    {items.length}
                                </span>
                            </div>
                            <div className="space-y-2">
                                {items.length === 0 ? (
                                    <div className="border border-dashed border-neutral-300 p-4 text-center">
                                        <span className="font-mono text-[10px] text-neutral-400">
                                            No requests
                                        </span>
                                    </div>
                                ) : (
                                    items.map((req) => (
                                        <RequestCard
                                            key={req.id}
                                            request={req}
                                            onClick={() => setSelectedRequest(req)}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* New Request Dialog */}
            {showNewForm && (
                <NewRequestDialog
                    workspaceId={workspaceId}
                    userId={userId}
                    userName={userName}
                    onClose={() => setShowNewForm(false)}
                    onCreated={() => {
                        setShowNewForm(false);
                        router.refresh();
                    }}
                />
            )}

            {/* Request Detail Dialog */}
            {selectedRequest && (
                <RequestDetailDialog
                    request={selectedRequest}
                    workspaceId={workspaceId}
                    userId={userId}
                    userName={userName}
                    onClose={() => setSelectedRequest(null)}
                    onUpdated={() => {
                        setSelectedRequest(null);
                        router.refresh();
                    }}
                />
            )}
        </div>
    );
}

// ── New Request Dialog ───────────────────────────────────────────────

function NewRequestDialog({
    workspaceId,
    userId,
    userName,
    onClose,
    onCreated,
}: {
    workspaceId: string;
    userId: string;
    userName: string;
    onClose: () => void;
    onCreated: () => void;
}) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [toolName, setToolName] = useState("");
    const [toolUrl, setToolUrl] = useState("");
    const [justification, setJustification] = useState("");
    const [urgency, setUrgency] = useState<"low" | "medium" | "high" | "critical">("medium");
    const [category, setCategory] = useState("");
    const [estimatedBudget, setEstimatedBudget] = useState("");

    function handleSubmit() {
        setError(null);
        if (!toolName.trim()) {
            setError("Tool name is required");
            return;
        }
        if (!justification.trim()) {
            setError("Justification is required");
            return;
        }

        startTransition(async () => {
            try {
                await submitProcurementRequest(workspaceId, {
                    requestedBy: userId,
                    requestedByName: userName,
                    toolName: toolName.trim(),
                    toolUrl: toolUrl.trim() || undefined,
                    justification: justification.trim(),
                    urgency,
                    category: category.trim() || undefined,
                    estimatedBudget: estimatedBudget.trim() || undefined,
                });
                onCreated();
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to submit request"
                );
            }
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-lg border border-black bg-white p-6 mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif text-xl font-normal">New Tool Request</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center border border-black hover:bg-neutral-100 transition-colors"
                        disabled={isPending}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Tool Name */}
                    <div>
                        <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                            Tool Name *
                        </label>
                        <input
                            type="text"
                            value={toolName}
                            onChange={(e) => setToolName(e.target.value)}
                            placeholder="e.g. Notion AI"
                            className="w-full border border-black px-3 py-2 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
                            disabled={isPending}
                        />
                    </div>

                    {/* Tool URL */}
                    <div>
                        <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                            Tool URL
                        </label>
                        <input
                            type="text"
                            value={toolUrl}
                            onChange={(e) => setToolUrl(e.target.value)}
                            placeholder="https://notion.so"
                            className="w-full border border-black px-3 py-2 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
                            disabled={isPending}
                        />
                    </div>

                    {/* Justification */}
                    <div>
                        <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                            Justification *
                        </label>
                        <textarea
                            value={justification}
                            onChange={(e) => setJustification(e.target.value)}
                            placeholder="Why does the team need this tool? What problem does it solve?"
                            rows={3}
                            className="w-full border border-black px-3 py-2 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black resize-none"
                            disabled={isPending}
                        />
                    </div>

                    {/* Urgency */}
                    <div>
                        <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                            Urgency
                        </label>
                        <div className="flex gap-2">
                            {URGENCY_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setUrgency(opt.value)}
                                    disabled={isPending}
                                    className={`flex-1 border px-2 py-1.5 font-mono text-xs transition-colors ${
                                        urgency === opt.value
                                            ? "border-black bg-black text-white"
                                            : "border-black hover:bg-neutral-50"
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                            Category
                        </label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="e.g. Productivity, Engineering, Design"
                            className="w-full border border-black px-3 py-2 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
                            disabled={isPending}
                        />
                    </div>

                    {/* Estimated Budget */}
                    <div>
                        <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                            Estimated Monthly Budget
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-neutral-400">
                                $
                            </span>
                            <input
                                type="number"
                                value={estimatedBudget}
                                onChange={(e) => setEstimatedBudget(e.target.value)}
                                placeholder="0.00"
                                className="w-full border border-black pl-7 pr-3 py-2 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
                                disabled={isPending}
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="border border-red-300 bg-red-50 p-3 mt-4">
                        <p className="font-mono text-xs text-red-600">{error}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        className="flex-1 border border-black px-4 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-neutral-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="flex-1 border border-black bg-black text-white px-4 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Request"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Request Detail Dialog ────────────────────────────────────────────

function RequestDetailDialog({
    request,
    workspaceId,
    userId,
    userName,
    onClose,
    onUpdated,
}: {
    request: ProcurementRequestData;
    workspaceId: string;
    userId: string;
    userName: string;
    onClose: () => void;
    onUpdated: () => void;
}) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [showReview, setShowReview] = useState(false);
    const [reviewAction, setReviewAction] = useState<"approved" | "rejected">("approved");
    const [reviewNotes, setReviewNotes] = useState("");
    const [approvedBudget, setApprovedBudget] = useState(
        request.estimatedBudget ?? ""
    );

    const URGENCY_COLORS: Record<string, string> = {
        low: "border-neutral-300 text-neutral-500",
        medium: "border-blue-400 text-blue-600",
        high: "border-yellow-500 text-yellow-700",
        critical: "border-red-500 text-red-600",
    };

    function handleStartResearch() {
        setError(null);
        startTransition(async () => {
            try {
                await startProcurementResearch(request.id, workspaceId);
                onUpdated();
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to start research"
                );
            }
        });
    }

    function handleReview(status: "approved" | "rejected") {
        setReviewAction(status);
        setShowReview(true);
    }

    function handleSubmitReview() {
        setError(null);
        startTransition(async () => {
            try {
                await updateProcurementStatus(request.id, workspaceId, {
                    status: reviewAction,
                    reviewedBy: userId,
                    reviewedByName: userName,
                    reviewNotes: reviewNotes.trim() || undefined,
                    approvedBudget:
                        reviewAction === "approved" && approvedBudget
                            ? approvedBudget
                            : undefined,
                });
                onUpdated();
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to update status"
                );
            }
        });
    }

    function handleSetReviewed() {
        setError(null);
        startTransition(async () => {
            try {
                await updateProcurementStatus(request.id, workspaceId, {
                    status: "reviewed",
                    reviewedBy: userId,
                    reviewedByName: userName,
                });
                onUpdated();
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to update status"
                );
            }
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-lg border border-black bg-white p-6 mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <ClipboardCheck className="w-4 h-4" strokeWidth={1.5} />
                        <h2 className="font-serif text-xl font-normal">
                            {request.toolName}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center border border-black hover:bg-neutral-100 transition-colors"
                        disabled={isPending}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Status + Urgency */}
                <div className="flex items-center gap-2 mb-4">
                    <span className="font-mono text-[10px] uppercase tracking-widest border border-black px-1.5 py-0.5">
                        {request.status}
                    </span>
                    <span
                        className={`font-mono text-[10px] uppercase tracking-widest border px-1.5 py-0.5 ${
                            URGENCY_COLORS[request.urgency] ?? "border-neutral-300 text-neutral-500"
                        }`}
                    >
                        {request.urgency}
                    </span>
                    {request.category && (
                        <span className="font-mono text-[10px] border border-neutral-300 px-1.5 py-0.5 text-neutral-500">
                            {request.category}
                        </span>
                    )}
                </div>

                {/* Details */}
                <div className="space-y-4 mb-6">
                    {request.toolUrl && (
                        <div>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
                                URL
                            </span>
                            <a
                                href={request.toolUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-xs text-black hover:underline flex items-center gap-1"
                            >
                                {request.toolUrl}
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    )}

                    <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
                            Justification
                        </span>
                        <p className="font-mono text-xs text-neutral-700 leading-relaxed">
                            {request.justification}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
                                Requested By
                            </span>
                            <span className="font-mono text-xs">
                                {request.requestedByName ?? "Team Member"}
                            </span>
                        </div>
                        <div>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
                                Date
                            </span>
                            <span className="font-mono text-xs">
                                {new Date(request.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                    </div>

                    {request.estimatedBudget && (
                        <div>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
                                Estimated Budget
                            </span>
                            <span className="font-mono text-sm font-bold">
                                ${parseFloat(request.estimatedBudget).toLocaleString()}/mo
                            </span>
                        </div>
                    )}

                    {/* Review info */}
                    {request.reviewedByName && (
                        <div className="border-t border-neutral-200 pt-4">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
                                Reviewed By
                            </span>
                            <span className="font-mono text-xs">
                                {request.reviewedByName}
                            </span>
                        </div>
                    )}
                    {request.reviewNotes && (
                        <div>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
                                Review Notes
                            </span>
                            <p className="font-mono text-xs text-neutral-700 leading-relaxed">
                                {request.reviewNotes}
                            </p>
                        </div>
                    )}
                    {request.approvedBudget && (
                        <div>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
                                Approved Budget
                            </span>
                            <span className="font-mono text-sm font-bold">
                                ${parseFloat(request.approvedBudget).toLocaleString()}/mo
                            </span>
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="border border-red-300 bg-red-50 p-3 mb-4">
                        <p className="font-mono text-xs text-red-600">{error}</p>
                    </div>
                )}

                {/* Review Form */}
                {showReview && (
                    <div className="border border-black p-4 mb-4 space-y-3">
                        <h3 className="font-mono text-xs uppercase tracking-widest">
                            {reviewAction === "approved" ? "Approve" : "Reject"} Request
                        </h3>
                        <div>
                            <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                                Notes
                            </label>
                            <textarea
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                placeholder="Optional review notes..."
                                rows={2}
                                className="w-full border border-black px-3 py-2 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black resize-none"
                                disabled={isPending}
                            />
                        </div>
                        {reviewAction === "approved" && (
                            <div>
                                <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                                    Approved Budget ($/mo)
                                </label>
                                <input
                                    type="number"
                                    value={approvedBudget}
                                    onChange={(e) => setApprovedBudget(e.target.value)}
                                    className="w-full border border-black px-3 py-2 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
                                    disabled={isPending}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        )}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowReview(false)}
                                disabled={isPending}
                                className="flex-1 border border-black px-3 py-2 font-mono text-xs uppercase tracking-widest hover:bg-neutral-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitReview}
                                disabled={isPending}
                                className="flex-1 border border-black bg-black text-white px-3 py-2 font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isPending ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    "Confirm"
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {!showReview && (
                    <div className="flex flex-wrap gap-2">
                        {request.status === "pending" && (
                            <button
                                onClick={handleStartResearch}
                                disabled={isPending}
                                className="border border-black px-3 py-2 font-mono text-xs uppercase tracking-widest hover:bg-neutral-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isPending ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <FlaskConical className="w-3 h-3" />
                                )}
                                Start Research
                            </button>
                        )}

                        {(request.status === "pending" ||
                            request.status === "researching") && (
                            <button
                                onClick={handleSetReviewed}
                                disabled={isPending}
                                className="border border-black px-3 py-2 font-mono text-xs uppercase tracking-widest hover:bg-neutral-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                Mark Reviewed
                            </button>
                        )}

                        {(request.status === "pending" ||
                            request.status === "researching" ||
                            request.status === "reviewed") && (
                            <>
                                <button
                                    onClick={() => handleReview("approved")}
                                    disabled={isPending}
                                    className="border border-black bg-black text-white px-3 py-2 font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    <CheckCircle2 className="w-3 h-3" />
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleReview("rejected")}
                                    disabled={isPending}
                                    className="border border-red-500 text-red-600 px-3 py-2 font-mono text-xs uppercase tracking-widest hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    <XCircle className="w-3 h-3" />
                                    Reject
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
