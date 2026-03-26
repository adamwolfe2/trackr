"use client";

import { useState, useTransition } from "react";
import { provisionAndInvite } from "./actions";
import { PACKAGE_LIST } from "@/lib/config/architect-packages";
import type { PackageSlug } from "@/lib/config/architect-packages";
import { CheckCircle2, Loader2, AlertTriangle, Package } from "lucide-react";

type RecommendedTool = {
    name: string;
    category?: string;
    impact?: "High" | "Medium" | "Low";
};

type ProvisionDialogProps = {
    submissionId: string;
    contactEmail: string;
    companyName: string;
    recommendedTools: RecommendedTool[];
    existingPackage: string | null;
    workspaceId: string | null;
};

function impactColor(impact: string | undefined): string {
    if (impact === "High") return "bg-red-50 text-red-700 border-red-200";
    if (impact === "Medium") return "bg-yellow-50 text-yellow-700 border-yellow-200";
    return "bg-neutral-50 text-neutral-600 border-neutral-200";
}

export function ProvisionDialog({
    submissionId,
    contactEmail,
    companyName,
    recommendedTools,
    existingPackage,
    workspaceId,
}: ProvisionDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<PackageSlug>(
        (existingPackage as PackageSlug) || "implementation"
    );
    const [checkedTools, setCheckedTools] = useState<Set<string>>(
        () => new Set(recommendedTools.map(t => t.name))
    );
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);

    function toggleTool(name: string) {
        setCheckedTools(prev => {
            const next = new Set(prev);
            if (next.has(name)) {
                next.delete(name);
            } else {
                next.add(name);
            }
            return next;
        });
    }

    function handleProvision() {
        setResult(null);
        startTransition(async () => {
            const res = await provisionAndInvite({
                submissionId,
                packageSlug: selectedPackage,
                selectedToolNames: Array.from(checkedTools),
            });
            setResult(res);
        });
    }

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                disabled={!workspaceId}
                className="font-mono text-xs uppercase tracking-widest border-2 border-black bg-black text-white px-6 py-2.5 hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
                <Package className="w-3.5 h-3.5" />
                Provision & Invite
            </button>
        );
    }

    // Success state
    if (result?.success) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
                <div className="w-full max-w-md bg-[#F3F3EF] border-2 border-black p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-black" />
                        <h2 className="font-serif text-xl font-normal">Workspace Provisioned</h2>
                    </div>
                    <p className="font-mono text-xs text-neutral-600 leading-relaxed">
                        {companyName}&apos;s workspace has been provisioned with {checkedTools.size} tools.
                        An invite email has been sent to {contactEmail}.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            setResult(null);
                        }}
                        className="font-mono text-xs uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
            <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-[#F3F3EF] border-2 border-black">
                {/* Header */}
                <div className="border-b border-black px-5 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="font-serif text-xl font-normal">Provision Workspace</h2>
                        <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mt-1">
                            {companyName} -- {contactEmail}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="font-mono text-xs text-neutral-400 hover:text-black"
                    >
                        Cancel
                    </button>
                </div>

                {!workspaceId ? (
                    <div className="p-5 flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                        <p className="font-mono text-xs text-neutral-600">
                            Workspace not ready -- still processing. Check back after scorecard completes.
                        </p>
                    </div>
                ) : (
                    <div className="p-5 space-y-6">
                        {/* Package Selection */}
                        <div>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-3">
                                Select Package
                            </p>
                            <div className="space-y-2">
                                {PACKAGE_LIST.map(pkg => (
                                    <button
                                        key={pkg.slug}
                                        type="button"
                                        onClick={() => setSelectedPackage(pkg.slug)}
                                        className={`w-full text-left border p-4 transition-colors ${
                                            selectedPackage === pkg.slug
                                                ? "border-black bg-white"
                                                : "border-neutral-200 bg-white hover:border-neutral-400"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-mono text-xs font-bold">{pkg.name}</span>
                                            <div className="flex items-center gap-2">
                                                {pkg.popular && (
                                                    <span className="font-mono text-[8px] border border-black bg-black text-white px-1.5 py-0.5 uppercase">
                                                        Popular
                                                    </span>
                                                )}
                                                <span className="font-mono text-xs font-bold">
                                                    ${pkg.price.toLocaleString()}
                                                </span>
                                                <span className="font-mono text-[10px] text-neutral-400">
                                                    {pkg.duration}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="font-mono text-[10px] text-neutral-500">{pkg.tagline}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tool Checklist */}
                        {recommendedTools.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                                        Seed Recommended Tools ({checkedTools.size}/{recommendedTools.length})
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (checkedTools.size === recommendedTools.length) {
                                                setCheckedTools(new Set());
                                            } else {
                                                setCheckedTools(new Set(recommendedTools.map(t => t.name)));
                                            }
                                        }}
                                        className="font-mono text-[10px] text-neutral-400 hover:text-black underline"
                                    >
                                        {checkedTools.size === recommendedTools.length ? "Deselect All" : "Select All"}
                                    </button>
                                </div>
                                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                    {recommendedTools.map((tool, i) => (
                                        <label
                                            key={i}
                                            className="flex items-center gap-3 p-2 hover:bg-white transition-colors cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checkedTools.has(tool.name)}
                                                onChange={() => toggleTool(tool.name)}
                                                className="accent-black w-3.5 h-3.5"
                                            />
                                            <span className="font-mono text-xs flex-1">{tool.name}</span>
                                            {tool.category && (
                                                <span className="font-mono text-[9px] text-neutral-400">
                                                    {tool.category}
                                                </span>
                                            )}
                                            {tool.impact && (
                                                <span className={`font-mono text-[8px] border px-1.5 py-0.5 ${impactColor(tool.impact)}`}>
                                                    {tool.impact}
                                                </span>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Error display */}
                        {result?.error && (
                            <div className="border border-red-200 bg-red-50 px-4 py-3">
                                <p className="font-mono text-xs text-red-700">{result.error}</p>
                            </div>
                        )}

                        {/* Action button */}
                        <button
                            type="button"
                            onClick={handleProvision}
                            disabled={isPending}
                            className="w-full font-mono text-xs uppercase tracking-widest border-2 border-black bg-black text-white px-6 py-3 hover:bg-neutral-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Provisioning...
                                </>
                            ) : (
                                "Provision & Send Invite"
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
