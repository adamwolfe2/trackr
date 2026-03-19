"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { addSoftwareSpend, deleteSoftwareSpend, updateSoftwareSpendStatus, updateSoftwareSpendDetails, batchAddSoftwareSpend, bulkDeleteSoftwareSpend } from "@/lib/actions/software-spend";
import { PlusCircle, Trash2, ExternalLink, DollarSign, Users, Pencil, Check, X, AlertTriangle, Sparkles, Clipboard, ChevronDown, CalendarClock, Download, Loader2, Square, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getUserFriendlyError } from "@/lib/utils/error-messages";
import type { StackInsights } from "@/lib/utils/stack-insights";
import { parseStackJson, type ParsedStackItem } from "@/lib/utils/parse-stack";

const STACK_PROMPT = `You are a software asset inventory specialist. I need you to help me document my company's complete software and SaaS stack.

Please ask me the following questions to build a comprehensive picture, or if you already know our stack, generate the full list:

1. What communication tools does your team use daily? (e.g. Slack, Teams, Zoom, Google Meet)
2. What project management or task tracking tools? (e.g. Asana, Jira, Linear, Monday, Notion)
3. What CRM or sales tools? (e.g. Salesforce, HubSpot, Close, Pipedrive)
4. What marketing tools? (e.g. Mailchimp, HubSpot, Marketo, Klaviyo, ActiveCampaign)
5. What development or engineering tools? (e.g. GitHub, GitLab, Vercel, AWS, Datadog, Sentry)
6. What design tools? (e.g. Figma, Canva, Adobe Creative Suite)
7. What HR or people management tools? (e.g. Rippling, Gusto, Lattice, Greenhouse)
8. What finance or accounting tools? (e.g. QuickBooks, Xero, Brex, Ramp, Expensify)
9. What analytics or BI tools? (e.g. Google Analytics, Mixpanel, Amplitude, Tableau, Looker)
10. What productivity or documentation tools? (e.g. Google Workspace, Microsoft 365, Confluence, Coda)
11. What customer support tools? (e.g. Intercom, Zendesk, Front, Freshdesk)
12. What security or compliance tools? (e.g. 1Password, Okta, Vanta, Drata)
13. What AI tools is the team using? (e.g. ChatGPT, Claude, Midjourney, GitHub Copilot)
14. Any other SaaS subscriptions, plugins, or services the company pays for?

For each tool you identify, please return a JSON array in this exact format (no markdown, no explanation, just the raw JSON array):

[
  {
    "toolName": "Slack",
    "category": "Communication",
    "vendorUrl": "https://slack.com",
    "estimatedSeats": 25,
    "billingCycle": "monthly",
    "monthlyCost": 187.50,
    "renewalDate": "2026-06-15",
    "contractLengthMonths": 12,
    "notes": "Primary team chat"
  },
  {
    "toolName": "Notion",
    "category": "Documentation",
    "vendorUrl": "https://notion.so",
    "estimatedSeats": 25,
    "billingCycle": "annual",
    "monthlyCost": 200,
    "renewalDate": null,
    "contractLengthMonths": null,
    "notes": ""
  }
]

Guidelines:
- estimatedSeats should be your best estimate of how many people use this tool (0 if unknown)
- billingCycle should be "monthly", "annual", or "one-time"
- category should be one of: Communication, Project Management, CRM, Marketing, Development, Design, HR, Finance, Analytics, Productivity, Support, Security, AI, Other
- monthlyCost: the MONTHLY cost as a number. If the source data shows annual cost, divide by 12. If quarterly, divide by 3. If you can estimate from per-seat pricing, do so (seats x per-seat price). Use 0 if truly unknown.
- renewalDate: ISO date string (YYYY-MM-DD) if a renewal or contract end date is mentioned or can be inferred. null if unknown.
- contractLengthMonths: integer number of months for the contract term (e.g. 12, 24, 36). null if unknown.
- If the data looks like a QuickBooks export, accounting ledger, or invoice history, extract billing amounts and dates. Convert annual costs to monthly by dividing by 12.
- Include ALL tools even if you're unsure of the price — use 0 for monthlyCost if unknown
- Return ONLY the JSON array, nothing else`;

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
    renewalDate: Date | null;
    contractLength: number | null;
    createdAt: Date;
};

const STATUS_OPTIONS = ["active", "evaluating", "canceling", "canceled"] as const;

export function StackClient({ initialData = [], lowScoredNames = [], insights }: { initialData?: SpendEntry[]; lowScoredNames?: string[]; insights?: StackInsights }) {
    const [showForm, setShowForm] = useState(false);
    const [toDelete, setToDelete] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editCost, setEditCost] = useState("");
    const [editSeats, setEditSeats] = useState("");
    const [editRenewalDate, setEditRenewalDate] = useState("");
    const [editContractLength, setEditContractLength] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // AI bulk import state
    const [copied, setCopied] = useState(false);
    const [showPaste, setShowPaste] = useState(false);
    const [pasteText, setPasteText] = useState("");
    const [parseError, setParseError] = useState<string | null>(null);
    const [parsedItems, setParsedItems] = useState<ParsedStackItem[] | null>(null);
    const [isImporting, startImportTransition] = useTransition();
    const [showOptBanner, setShowOptBanner] = useState(true);

    // Bulk delete state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isBulkDeleting, startBulkDeleteTransition] = useTransition();

    // AI cost estimate state
    const [estimatingId, setEstimatingId] = useState<string | null>(null);
    const [isEstimatingAll, setIsEstimatingAll] = useState(false);
    const [editFocusField, setEditFocusField] = useState<"cost" | "seats" | null>(null);

    const copyPrompt = async () => {
        await navigator.clipboard.writeText(STACK_PROMPT);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handleExportCsv = () => {
        // Use the server-side export endpoint (auth + rate-limited + formula-injection safe)
        window.location.href = "/api/export/spend";
    };

    const handleParseStack = () => {
        setParseError(null);
        setParsedItems(null);
        const result = parseStackJson(pasteText);
        if ("error" in result && result.error) {
            setParseError(result.error);
        } else if ("items" in result && result.items) {
            setParsedItems(result.items);
        }
    };

    const importAll = () => {
        if (!parsedItems || parsedItems.length === 0) return;
        startImportTransition(async () => {
            try {
                const result = await batchAddSoftwareSpend(
                    parsedItems.map(i => ({
                        toolName: i.toolName,
                        category: i.category,
                        vendorUrl: i.vendorUrl,
                        monthlyCost: i.monthlyCost != null && i.monthlyCost > 0 ? i.monthlyCost.toFixed(2) : null,
                        seatCount: i.estimatedSeats,
                        billingCycle: i.billingCycle,
                        notes: i.notes,
                        renewalDate: i.renewalDate,
                        contractLengthMonths: i.contractLengthMonths,
                    }))
                );
                const skippedMsg = result.skipped ? ` (${result.skipped} duplicate${result.skipped === 1 ? "" : "s"} skipped)` : "";
                toast.success(`Imported ${result.count} tool${result.count === 1 ? "" : "s"} to your stack${skippedMsg}`);
                setShowPaste(false);
                setPasteText("");
                setParsedItems(null);
                router.refresh();
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Import failed");
            }
        });
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === initialData.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(initialData.map(e => e.id)));
        }
    };

    const handleBulkDelete = () => {
        startBulkDeleteTransition(async () => {
            try {
                const ids = Array.from(selectedIds);
                const result = await bulkDeleteSoftwareSpend(ids);
                toast.success(`Deleted ${result.count} tool${result.count === 1 ? "" : "s"}`);
                setSelectedIds(new Set());
                setShowDeleteConfirm(false);
                router.refresh();
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed to delete");
            }
        });
    };

    const handleEstimateCost = async (entry: SpendEntry) => {
        setEstimatingId(entry.id);
        try {
            const res = await fetch("/api/stack/estimate-cost", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ toolName: entry.toolName, seats: entry.seatCount || 1 }),
            });
            if (!res.ok) throw new Error("Estimate failed");
            const data = await res.json();
            // Enter edit mode with the estimated cost pre-filled
            setEditingId(entry.id);
            setEditCost(data.totalMonthlyCost?.toString() ?? "0");
            setEditSeats(entry.seatCount?.toString() ?? "");
            setEditRenewalDate(entry.renewalDate ? new Date(entry.renewalDate).toISOString().slice(0, 10) : "");
            setEditContractLength(entry.contractLength?.toString() ?? "");
            const confLabel = data.confidence === "high" ? "High" : data.confidence === "medium" ? "Medium" : "Low";
            toast.success(`Estimated $${data.totalMonthlyCost}/mo (${confLabel} confidence)${data.source ? ` — ${data.source}` : ""}`);
        } catch (err) {
            toast.error(getUserFriendlyError(err));
        } finally {
            setEstimatingId(null);
        }
    };

    const totalMonthly = initialData
        .filter(e => e.status === "active")
        .reduce((sum, e) => sum + (parseFloat(e.monthlyCost || "0") || 0), 0);

    const totalSeats = initialData
        .filter(e => e.status === "active")
        .reduce((sum, e) => sum + (e.seatCount || 0), 0);

    const lowScoredSet = new Set(lowScoredNames);
    const isLowScored = (entry: SpendEntry) =>
        lowScoredSet.has(entry.toolName.toLowerCase()) && (parseFloat(entry.monthlyCost || "0") || 0) > 0;

    // Build a lookup map from insights enrichedTools: id → classification
    const classificationMap = new Map<string, string>(
        (insights?.enrichedTools ?? []).map(t => [t.id, t.classification])
    );

    const startEdit = (entry: SpendEntry, focus: "cost" | "seats" = "cost") => {
        setEditFocusField(focus);
        setEditingId(entry.id);
        setEditCost(entry.monthlyCost ? parseFloat(entry.monthlyCost).toString() : "");
        setEditSeats(entry.seatCount?.toString() ?? "");
        setEditRenewalDate(entry.renewalDate ? new Date(entry.renewalDate).toISOString().slice(0, 10) : "");
        setEditContractLength(entry.contractLength?.toString() ?? "");
    };

    const saveEdit = (id: string) => {
        startTransition(async () => {
            try {
                await updateSoftwareSpendDetails(
                    id,
                    editCost || "0",
                    editSeats ? parseInt(editSeats, 10) : null,
                    editRenewalDate || null,
                    editContractLength ? parseInt(editContractLength, 10) : null
                );
                setEditingId(null);
                setEditFocusField(null);
                toast.success("Updated");
                router.refresh();
            } catch {
                toast.error("Failed to save");
            }
        });
    };

    const handleEstimateAllCosts = async () => {
        setIsEstimatingAll(true);
        const entries = initialData.filter(e => e.status !== "canceled");
        let updated = 0;
        let failed = 0;
        for (const entry of entries) {
            try {
                const seats = entry.seatCount || 1;
                const res = await fetch("/api/stack/estimate-cost", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ toolName: entry.toolName, seats }),
                });
                if (!res.ok) { failed++; continue; }
                const data = await res.json();
                if (typeof data.totalMonthlyCost === "number" && data.totalMonthlyCost >= 0) {
                    await updateSoftwareSpendDetails(
                        entry.id,
                        data.totalMonthlyCost.toString(),
                        entry.seatCount,
                        entry.renewalDate ? new Date(entry.renewalDate).toISOString().slice(0, 10) : null,
                        entry.contractLength
                    );
                    updated++;
                } else {
                    failed++;
                }
            } catch {
                failed++;
            }
        }
        setIsEstimatingAll(false);
        if (updated > 0) {
            toast.success(`Updated pricing for ${updated} tool${updated === 1 ? "" : "s"}${failed > 0 ? ` (${failed} failed)` : ""}`);
            router.refresh();
        } else if (failed > 0) {
            toast.error("Could not estimate pricing for any tools");
        } else {
            toast.info("No tools to estimate");
        }
    };

    const flaggedCount = initialData.filter(isLowScored).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">Spend Intelligence</p>
                    <h1 className="font-serif text-2xl font-normal">Software Stack</h1>
                    <p className="font-mono text-xs text-neutral-500 mt-1">
                        Track all tools your team pays for. Understand your total software spend.
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {initialData.length > 0 && (
                        <button
                            onClick={handleEstimateAllCosts}
                            disabled={isEstimatingAll}
                            className="flex items-center gap-2 border border-black px-4 py-2.5 font-mono text-xs bg-black text-white hover:bg-neutral-800 whitespace-nowrap disabled:opacity-50"
                        >
                            {isEstimatingAll
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <Sparkles className="h-3.5 w-3.5" />}
                            {isEstimatingAll ? "Fetching Prices..." : "AI Price Lookup"}
                        </button>
                    )}
                    <button
                        onClick={() => { setShowPaste(prev => !prev); setShowForm(false); }}
                        className="flex items-center gap-2 border border-black px-4 py-2.5 font-mono text-xs bg-white hover:bg-neutral-100 whitespace-nowrap"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        Bulk Import via AI
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
                    <Link
                        href="/stack/report"
                        className="flex items-center gap-2 border border-black px-4 py-2.5 font-mono text-xs bg-white hover:bg-neutral-100 whitespace-nowrap"
                    >
                        Generate Report
                    </Link>
                    <button
                        onClick={() => { setShowForm(prev => !prev); setShowPaste(false); }}
                        className="flex items-center gap-2 border border-black px-4 py-2.5 font-mono text-xs bg-black text-white hover:bg-neutral-800 whitespace-nowrap"
                    >
                        {showForm ? <X className="h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
                        {showForm ? "Cancel" : "Add Tool"}
                    </button>
                </div>
            </div>

            {/* AI Bulk Import Panel */}
            {showPaste && (
                <div className="border border-black bg-white">
                    <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                        <span className="font-mono text-xs uppercase tracking-widest">Bulk Import via AI</span>
                        <button onClick={() => { setShowPaste(false); setPasteText(""); setParsedItems(null); setParseError(null); }} className="text-neutral-400 hover:text-black">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="bg-[#F3F3EF] border border-black/10 p-4 space-y-2">
                            <p className="font-mono text-xs font-semibold">Step 1 — Copy the AI prompt</p>
                            <p className="font-mono text-xs text-neutral-600">
                                Click the button below to copy a detailed prompt. Paste it into ChatGPT, Claude, or any AI and tell it about your company&apos;s software stack. The AI will return a JSON list of all your tools.
                            </p>
                            <button
                                onClick={copyPrompt}
                                className="flex items-center gap-2 border border-black px-4 py-2 font-mono text-xs bg-black text-white hover:bg-neutral-800 mt-1"
                            >
                                <Clipboard className="h-3.5 w-3.5" />
                                {copied ? "Copied!" : "Copy AI Prompt"}
                            </button>
                        </div>

                        <div className="space-y-2">
                            <p className="font-mono text-xs font-semibold">Step 2 — Paste the AI&apos;s JSON response</p>
                            <p className="font-mono text-xs text-neutral-500">The AI should return a JSON array. Paste the full response here — we&apos;ll strip any extra formatting automatically.</p>
                            <textarea
                                value={pasteText}
                                onChange={e => { setPasteText(e.target.value); setParsedItems(null); setParseError(null); }}
                                rows={8}
                                placeholder={'[\n  {\n    "toolName": "Slack",\n    "category": "Communication",\n    "vendorUrl": "https://slack.com",\n    "estimatedSeats": 25,\n    "billingCycle": "monthly",\n    "notes": ""\n  }\n]'}
                                className="w-full border border-black px-4 py-3 font-mono text-xs bg-white focus:outline-none resize-y"
                            />
                            {parseError && (
                                <p className="font-mono text-xs text-red-600 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" /> {parseError}
                                </p>
                            )}
                            <button
                                onClick={handleParseStack}
                                disabled={!pasteText.trim()}
                                className="border border-black px-4 py-2 font-mono text-xs hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <ChevronDown className="h-3.5 w-3.5" />
                                Preview Tools
                            </button>
                        </div>

                        {parsedItems && parsedItems.length > 0 && (() => {
                            const hasCosts = parsedItems.some(i => i.monthlyCost != null && i.monthlyCost > 0);
                            const hasRenewals = parsedItems.some(i => i.renewalDate);
                            return (
                            <div className="space-y-3">
                                <p className="font-mono text-xs font-semibold">Step 3 — Review and import</p>
                                <div className="border border-black divide-y divide-neutral-100 max-h-64 overflow-y-auto">
                                    {parsedItems.map((item, i) => (
                                        <div key={i} className="px-4 py-2.5 flex items-center justify-between gap-4 text-xs">
                                            <div>
                                                <span className="font-mono font-semibold">{item.toolName}</span>
                                                {item.category && <span className="font-mono text-neutral-400 ml-2">{item.category}</span>}
                                                {item.vendorUrl && (
                                                    <span className="font-mono text-neutral-300 ml-2">
                                                        {(() => { try { return new URL(item.vendorUrl!).hostname; } catch { return item.vendorUrl; } })()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0 text-neutral-400 font-mono">
                                                {hasCosts && (
                                                    <span className={item.monthlyCost && item.monthlyCost > 0 ? "text-black" : ""}>
                                                        {item.monthlyCost && item.monthlyCost > 0
                                                            ? `$${item.monthlyCost.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}/mo`
                                                            : "—"}
                                                    </span>
                                                )}
                                                {hasRenewals && item.renewalDate && (
                                                    <span>{item.renewalDate}</span>
                                                )}
                                                {item.estimatedSeats ? <span>{item.estimatedSeats} seats</span> : null}
                                                {item.billingCycle && <span>{item.billingCycle}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={importAll}
                                    disabled={isImporting}
                                    className="flex items-center gap-2 border border-black px-6 py-2.5 font-mono text-xs bg-black text-white hover:bg-neutral-800 disabled:opacity-60"
                                >
                                    <PlusCircle className="h-3.5 w-3.5" />
                                    {isImporting ? "Importing..." : `Import All ${parsedItems.length} Tool${parsedItems.length === 1 ? "" : "s"}`}
                                </button>
                                {!hasCosts && (
                                    <p className="font-mono text-[10px] text-neutral-400">
                                        Costs will be $0 initially — edit each row to add your actual monthly spend.
                                    </p>
                                )}
                            </div>
                            );
                        })()}
                    </div>
                </div>
            )}

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
                                    maxLength={200}
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
                                    min="0"
                                    placeholder="99.00"
                                    className="w-full border border-black px-4 py-2.5 font-mono text-sm bg-white focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block font-mono text-xs uppercase tracking-widest mb-2">Seats / Users</label>
                                <input
                                    name="seatCount"
                                    type="number"
                                    min="1"
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
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-mono text-xs uppercase tracking-widest mb-2">Vendor URL</label>
                                <input
                                    name="vendorUrl"
                                    placeholder="https://example.com"
                                    className="w-full border border-black px-4 py-2.5 font-mono text-sm bg-white focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block font-mono text-xs uppercase tracking-widest mb-2">Renewal Date</label>
                                <input
                                    name="renewalDate"
                                    type="date"
                                    className="w-full border border-black px-4 py-2.5 font-mono text-sm bg-white focus:outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block font-mono text-xs uppercase tracking-widest mb-2">Notes</label>
                            <input
                                name="notes"
                                placeholder="Contract details, notes..."
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

            {/* AI Intelligence Panel */}
            {initialData.length === 0 ? (
                <div className="border border-black p-5 flex items-center justify-between gap-4 bg-[#F3F3EF]">
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">AI Nativeness Intelligence</p>
                        <p className="font-mono text-sm text-neutral-600">Add your software stack to see your AI nativeness score →</p>
                    </div>
                </div>
            ) : insights && (
                <div className="border border-black bg-white">
                    <div className="border-b border-black px-5 py-3 bg-[#F3F3EF]">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">AI Nativeness Intelligence</p>
                    </div>
                    {/* Score grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 border-b border-black">
                        {/* Score */}
                        <div className="p-4 border-r border-black">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Score</p>
                            <div className="flex items-end gap-1">
                                <span className="font-serif text-4xl font-normal leading-none">{insights.score}</span>
                                <span className="font-mono text-sm text-neutral-400 mb-0.5">/100</span>
                            </div>
                            <p className="font-mono text-xs font-semibold mt-1 uppercase tracking-wide">{insights.label}</p>
                        </div>
                        {/* Time Saved */}
                        <div className="p-4 border-r border-black">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Time Saved</p>
                            <div className="font-serif text-2xl font-normal leading-snug">
                                ~{insights.timeSavedPerMonth < 1000
                                    ? Math.round(insights.timeSavedPerMonth)
                                    : `${(insights.timeSavedPerMonth / 1000).toFixed(1)}k`} hrs/mo
                            </div>
                            <p className="font-mono text-xs text-neutral-400 mt-0.5">
                                ~${insights.dollarValueSaved >= 1000
                                    ? `${Math.round(insights.dollarValueSaved / 1000)}k`
                                    : Math.round(insights.dollarValueSaved)}/yr value
                            </p>
                        </div>
                        {/* Stack Breakdown */}
                        <div className="p-4 border-r border-black">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Stack Breakdown</p>
                            <div className="space-y-1 mt-1">
                                <div className="flex items-center gap-2 font-mono text-xs">
                                    <span className="inline-block w-2.5 h-2.5 bg-black shrink-0" />
                                    <span>{insights.aiNativeCount} AI-native</span>
                                </div>
                                <div className="flex items-center gap-2 font-mono text-xs">
                                    <span className="inline-block w-2.5 h-2.5 bg-neutral-300 shrink-0" />
                                    <span>{insights.aiEnabledCount} AI-enabled</span>
                                </div>
                                <div className="flex items-center gap-2 font-mono text-xs text-neutral-500">
                                    <span className="inline-block w-2.5 h-2.5 bg-neutral-200 border border-neutral-300 shrink-0" />
                                    <span>{insights.traditionalCount} traditional</span>
                                </div>
                                {insights.unknownCount > 0 && (
                                    <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
                                        <span className="inline-block w-2.5 h-2.5 bg-neutral-100 border border-neutral-200 shrink-0" />
                                        <span>{insights.unknownCount} unknown</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Benchmark */}
                        <div className="p-4">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Benchmark</p>
                            <p className="font-mono text-sm font-semibold leading-snug">{insights.benchmarkText}</p>
                        </div>
                    </div>
                    {/* Opportunities */}
                    {insights.opportunities.length > 0 && (
                        <div className="p-4 space-y-2">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Opportunities</p>
                            {insights.opportunities.map((opp, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <span className={`font-mono text-[10px] border px-1.5 py-0.5 shrink-0 mt-0.5 ${
                                        opp.priority === "high"
                                            ? "border-black bg-black text-white"
                                            : opp.priority === "medium"
                                            ? "border-black text-black"
                                            : "border-neutral-300 text-neutral-500"
                                    }`}>
                                        {opp.priority.toUpperCase()}
                                    </span>
                                    <p className="font-mono text-xs text-neutral-700">{opp.title}{opp.description ? ` — ${opp.description}` : ""}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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
            {flaggedCount > 0 && showOptBanner && (
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
                    <button onClick={() => setShowOptBanner(false)} className="ml-auto p-1 hover:bg-neutral-100" aria-label="Dismiss">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Upcoming Renewals */}
            {(() => {
                const now = new Date();
                const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                const upcoming = initialData.filter(e =>
                    e.renewalDate && e.status === "active" && new Date(e.renewalDate) <= thirtyDays && new Date(e.renewalDate) >= now
                ).sort((a, b) => new Date(a.renewalDate!).getTime() - new Date(b.renewalDate!).getTime());
                if (upcoming.length === 0) return null;
                return (
                    <div className="border border-black bg-white">
                        <div className="border-b border-black px-4 py-3 flex items-center gap-2 bg-[#F3F3EF]">
                            <CalendarClock className="h-3.5 w-3.5" />
                            <span className="font-mono text-[10px] uppercase tracking-widest">
                                Upcoming Renewals ({upcoming.length})
                            </span>
                        </div>
                        <div className="divide-y divide-neutral-100">
                            {upcoming.map(e => {
                                const daysUntil = Math.ceil((new Date(e.renewalDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                const cost = parseFloat(e.monthlyCost || "0");
                                const annualCost = e.billingCycle === "annual" ? cost * 12 : cost;
                                return (
                                    <div key={e.id} className="px-4 py-3 flex items-center justify-between gap-4">
                                        <div>
                                            <span className="font-mono text-sm font-semibold">{e.toolName}</span>
                                            {e.contractLength && (
                                                <span className="font-mono text-[10px] text-neutral-400 ml-2">{e.contractLength}mo contract</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            {annualCost > 0 && (
                                                <span className="font-mono text-xs text-neutral-500">
                                                    ${annualCost.toLocaleString("en-US", { minimumFractionDigits: 0 })}/yr
                                                </span>
                                            )}
                                            <a
                                                href={`/submit?category=${encodeURIComponent(e.category || e.toolName)}`}
                                                className="font-mono text-[10px] border border-black px-2 py-0.5 hover:bg-black hover:text-white transition-colors whitespace-nowrap hidden sm:inline-block"
                                            >
                                                Research Alt
                                            </a>
                                            <span className={`font-mono text-xs border px-2 py-0.5 ${
                                                daysUntil <= 7
                                                    ? "border-black bg-black text-white"
                                                    : daysUntil <= 14
                                                    ? "border-black text-black"
                                                    : "border-neutral-300 text-neutral-500"
                                            }`}>
                                                {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days`}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

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
                                {!editingId && (
                                    <th className="w-10 px-3 py-3">
                                        <button onClick={toggleSelectAll} className="text-neutral-400 hover:text-black">
                                            {selectedIds.size === initialData.length && initialData.length > 0
                                                ? <CheckSquare className="h-4 w-4" />
                                                : <Square className="h-4 w-4" />}
                                        </button>
                                    </th>
                                )}
                                <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-widest">Tool</th>
                                <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-widest hidden md:table-cell">Category</th>
                                <th className="text-right px-4 py-3 font-mono text-xs uppercase tracking-widest">Monthly</th>
                                <th className="text-right px-4 py-3 font-mono text-xs uppercase tracking-widest hidden sm:table-cell">Seats</th>
                                <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-widest hidden md:table-cell">Renewal</th>
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
                                        className={`border-b border-neutral-100 ${flagged ? "bg-neutral-50" : "hover:bg-neutral-100/50"}`}
                                    >
                                        {!editingId && (
                                            <td className="w-10 px-3 py-3">
                                                <button onClick={() => toggleSelect(entry.id)} className="text-neutral-400 hover:text-black">
                                                    {selectedIds.has(entry.id)
                                                        ? <CheckSquare className="h-4 w-4" />
                                                        : <Square className="h-4 w-4" />}
                                                </button>
                                            </td>
                                        )}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {/* AI classification dot */}
                                                {(() => {
                                                    const cls = classificationMap.get(entry.id);
                                                    if (cls === "ai-native") return <span title="AI-native" className="inline-block w-2 h-2 bg-black shrink-0" />;
                                                    if (cls === "ai-enabled") return <span title="AI-enabled" className="inline-block w-2 h-2 bg-neutral-300 shrink-0" />;
                                                    if (cls === "traditional") return <span title="Traditional" className="inline-block w-2 h-2 bg-neutral-200 border border-neutral-300 shrink-0" />;
                                                    return <span title="Unknown" className="inline-block w-2 h-2 bg-neutral-100 border border-neutral-200 shrink-0" />;
                                                })()}
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
                                        <td className="px-4 py-3 font-mono text-xs text-neutral-500 hidden md:table-cell">{entry.category || "—"}</td>
                                        <td className="px-4 py-3 text-right font-mono text-sm">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={editCost}
                                                    onChange={e => setEditCost(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === "Enter") saveEdit(entry.id);
                                                        if (e.key === "Escape") { setEditingId(null); setEditFocusField(null); }
                                                    }}
                                                    autoFocus={editFocusField === "cost"}
                                                    className="w-24 border border-black px-2 py-1 text-right text-xs font-mono focus:outline-none ml-auto block"
                                                    placeholder="0.00"
                                                />
                                            ) : parseFloat(entry.monthlyCost || "0") > 0 ? (
                                                <button
                                                    onClick={() => startEdit(entry, "cost")}
                                                    title="Click to edit"
                                                    className="hover:underline underline-offset-2 cursor-pointer"
                                                >
                                                    ${parseFloat(entry.monthlyCost!).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                </button>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 justify-end">
                                                    <button
                                                        onClick={() => startEdit(entry, "cost")}
                                                        title="Click to edit"
                                                        className="hover:underline underline-offset-2 cursor-pointer text-neutral-400 hover:text-black"
                                                    >
                                                        —
                                                    </button>
                                                    <button
                                                        onClick={() => handleEstimateCost(entry)}
                                                        disabled={estimatingId === entry.id}
                                                        title="AI cost estimate"
                                                        className="border border-neutral-200 p-1 hover:border-black text-neutral-400 hover:text-black transition-colors disabled:opacity-50"
                                                    >
                                                        {estimatingId === entry.id
                                                            ? <Loader2 className="h-3 w-3 animate-spin" />
                                                            : <Sparkles className="h-3 w-3" />}
                                                    </button>
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-sm hidden sm:table-cell">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={editSeats}
                                                    onChange={e => setEditSeats(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === "Enter") saveEdit(entry.id);
                                                        if (e.key === "Escape") { setEditingId(null); setEditFocusField(null); }
                                                    }}
                                                    autoFocus={editFocusField === "seats"}
                                                    className="w-16 border border-black px-2 py-1 text-right text-xs font-mono focus:outline-none ml-auto block"
                                                    placeholder="0"
                                                />
                                            ) : entry.seatCount ? (
                                                <button
                                                    onClick={() => startEdit(entry, "seats")}
                                                    title="Click to edit"
                                                    className="hover:underline underline-offset-2 cursor-pointer"
                                                >
                                                    {entry.seatCount}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => startEdit(entry, "seats")}
                                                    title="Click to edit"
                                                    className="text-neutral-300 hover:text-black cursor-pointer"
                                                >
                                                    —
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            {isEditing ? (
                                                <div className="flex flex-col gap-1">
                                                    <input
                                                        type="date"
                                                        value={editRenewalDate}
                                                        onChange={e => setEditRenewalDate(e.target.value)}
                                                        className="w-36 border border-black px-2 py-1 text-xs font-mono focus:outline-none"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={editContractLength}
                                                        onChange={e => setEditContractLength(e.target.value)}
                                                        placeholder="months"
                                                        className="w-36 border border-black px-2 py-1 text-xs font-mono focus:outline-none"
                                                    />
                                                </div>
                                            ) : entry.renewalDate ? (
                                                <div>
                                                    <span className="font-mono text-xs">
                                                        {new Date(entry.renewalDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                    </span>
                                                    {entry.contractLength && (
                                                        <span className="font-mono text-[10px] text-neutral-400 block">{entry.contractLength}mo</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="font-mono text-xs text-neutral-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                defaultValue={entry.status}
                                                disabled={isPending}
                                                onChange={(e) => {
                                                    const newStatus = e.target.value;
                                                    startTransition(async () => {
                                                        try {
                                                            await updateSoftwareSpendStatus(entry.id, newStatus);
                                                            toast.success("Saved");
                                                            router.refresh();
                                                        } catch (err) {
                                                            toast.error(err instanceof Error ? err.message : "Failed to update status");
                                                            router.refresh(); // revert UI to server state
                                                        }
                                                    });
                                                }}
                                                className={`border border-black px-2 py-1 font-mono text-xs bg-white focus:outline-none transition-opacity ${isPending ? "opacity-50 cursor-wait" : ""}`}
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
                                                            onClick={() => { setEditingId(null); setEditFocusField(null); }}
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
                                                                    try {
                                                                        await deleteSoftwareSpend(id);
                                                                        toast.success("Deleted");
                                                                        router.refresh();
                                                                    } catch (err) {
                                                                        toast.error(err instanceof Error ? err.message : "Failed to delete");
                                                                        setToDelete(id);
                                                                    }
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

            {/* Bulk Delete Floating Bar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 border border-black bg-white px-5 py-3 flex items-center gap-4 shadow-lg">
                    <span className="font-mono text-xs font-semibold">{selectedIds.size} selected</span>
                    {showDeleteConfirm ? (
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-neutral-500">Confirm delete?</span>
                            <button
                                onClick={handleBulkDelete}
                                disabled={isBulkDeleting}
                                className="border border-black px-3 py-1.5 font-mono text-xs bg-black text-white hover:bg-neutral-800 disabled:opacity-60"
                            >
                                {isBulkDeleting ? "Deleting..." : "Yes, Delete"}
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="border border-black px-3 py-1.5 font-mono text-xs hover:bg-neutral-100"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex items-center gap-1.5 border border-black px-3 py-1.5 font-mono text-xs text-red-600 hover:bg-red-50"
                            >
                                <Trash2 className="h-3 w-3" />
                                Delete Selected
                            </button>
                            <button
                                onClick={() => setSelectedIds(new Set())}
                                className="border border-black px-3 py-1.5 font-mono text-xs hover:bg-neutral-100"
                            >
                                Clear
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
