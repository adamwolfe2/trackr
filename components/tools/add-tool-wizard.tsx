"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight, Globe, Sparkles, AlertCircle, AlertTriangle } from "lucide-react";
import { previewTool } from "@/lib/actions/preview";
import { submitTool } from "@/lib/actions/tools";
import { UpgradeModal } from "@/components/common/upgrade-modal";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/lib/utils/error-messages";

function SubmitButton({ pending }: { pending: boolean }) {
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 border border-black px-6 py-3 font-mono text-sm bg-black text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {pending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Sparkles className="w-4 h-4" />
            )}
            {pending ? "Starting Research…" : "Confirm & Start Research"}
        </button>
    );
}

interface AddToolWizardProps {
    creditBalance?: number;
    workspaceId?: string;
}

export function AddToolWizard({ creditBalance = 0, workspaceId }: AddToolWizardProps) {
    const searchParams = useSearchParams();
    const [step, setStep] = useState<1 | 2>(1);
    const [url, setUrl] = useState(searchParams.get("url") ?? "");
    const [isPreviewing, startPreview] = useTransition();
    const [isSubmitting, startSubmit] = useTransition();
    const [metadata, setMetadata] = useState<{ title: string; description: string; image: string } | null>(null);
    const [description, setDescription] = useState("");
    const [previewFailed, setPreviewFailed] = useState(false);
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        // Validate tool name
        const name = (formData.get("name") as string)?.trim();
        const newErrors: Record<string, string> = {};
        if (!name) newErrors.name = "Tool name is required";
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});

        startSubmit(async () => {
            try {
                const result = await submitTool(formData);
                // If submitTool returned an error object (vs. redirecting on success)
                if (result && "error" in result && result.error === "insufficient_credits") {
                    setUpgradeModalOpen(true);
                    return;
                }
            } catch (err) {
                // Re-throw Next.js redirect errors — they are not real errors
                if (err && typeof err === "object" && "digest" in err &&
                    typeof (err as { digest: unknown }).digest === "string" &&
                    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")) {
                    toast.success("Research started");
                    throw err;
                }
                const msg = err instanceof Error ? err.message : "";
                // Next.js obfuscates real server errors in production with a generic message
                const isGenericNextError = msg.includes("Server Components render") || msg.includes("omitted in production");
                toast.error(isGenericNextError ? "Something went wrong submitting your tool. Please try again." : (getUserFriendlyError(err) || "Failed to submit tool. Please try again."));
            }
        });
    };

    const handlePreview = () => {
        if (!url) return;
        // Basic URL validation before hitting the server
        let normalizedUrl = url.trim();
        if (!/^https?:\/\//i.test(normalizedUrl)) normalizedUrl = `https://${normalizedUrl}`;
        try { new URL(normalizedUrl); } catch {
            toast.error("Please enter a valid URL (e.g. https://example.com)");
            return;
        }
        setUrl(normalizedUrl);
        startPreview(async () => {
            const data = await previewTool(normalizedUrl);
            if ("error" in data) {
                // Preview failed — still advance so the user can fill in details manually
                setMetadata({ title: "", description: "", image: "" });
                setDescription("");
                setPreviewFailed(true);
                setStep(2);
                toast.warning("Couldn't auto-fetch details — please fill in the name and description manually.");
            } else {
                setMetadata({
                    title: data.title || "",
                    description: data.description || "",
                    image: data.image || ""
                });
                setDescription(data.description || "");
                setStep(2);
            }
        });
    };

    if (creditBalance === 0) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="font-serif text-3xl font-normal">Add a New Tool</h1>
                </div>
                <div className="border border-black bg-[#F3F3EF] px-6 py-8 space-y-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-neutral-700" />
                        <div>
                            <p className="font-mono text-sm font-semibold text-black">No research credits remaining</p>
                            <p className="font-mono text-xs text-neutral-600 mt-2 leading-relaxed">
                                You&apos;ve used all your research credits this month. Upgrade your plan or purchase a credit pack to continue adding tools.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Link
                            href="/settings/billing"
                            className="border border-black px-6 py-3 font-mono text-sm bg-black text-white hover:bg-neutral-800"
                        >
                            Manage Billing
                        </Link>
                        <Link
                            href="/tools"
                            className="border border-black px-6 py-3 font-mono text-sm bg-white hover:bg-neutral-100"
                        >
                            Back to Tools
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <UpgradeModal
                open={upgradeModalOpen}
                onClose={() => setUpgradeModalOpen(false)}
                trigger="credits_exhausted"
                workspaceId={workspaceId}
            />

            {/* Header */}
            <div className="mb-8">
                <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                    Step {step} of 2
                </p>
                <h1 className="font-serif text-3xl font-normal">
                    {step === 1 && "Add a New Tool"}
                    {step === 2 && "Review Details"}
                </h1>
                <p className="font-mono text-sm text-neutral-500 mt-1">
                    {step === 1 && "Enter the URL of the AI tool you want to track."}
                    {step === 2 && (previewFailed
                        ? "We couldn't fetch details automatically. Please enter the tool name and description."
                        : "We found some information. Please verify before adding.")}
                </p>
            </div>

            {/* Step 1 — URL Entry */}
            {step === 1 && (
                <div className="space-y-4">
                    <div>
                        <label htmlFor="url" className="block font-mono text-xs uppercase tracking-widest mb-2">
                            Website URL
                        </label>
                        <div className="flex gap-0">
                            <input
                                id="url"
                                type="url"
                                placeholder="https://example.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handlePreview()}
                                autoFocus
                                disabled={isPreviewing}
                                className="flex-1 border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none disabled:opacity-50"
                            />
                            <button
                                onClick={handlePreview}
                                disabled={isPreviewing || !url}
                                className="border border-l-0 border-black px-5 py-3 bg-black text-white font-mono text-sm hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isPreviewing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <ArrowRight className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                        <p className="font-mono text-xs text-neutral-400 mt-2">
                            We&apos;ll automatically fetch the tool&apos;s name and description.
                            <span className="ml-2 text-neutral-300">Press Enter ↵ to continue</span>
                        </p>
                    </div>
                </div>
            )}

            {/* Step 2 — Review & Submit */}
            {step === 2 && metadata && (
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    <input type="hidden" name="website_url" value={url} />

                    <div className="grid gap-4 sm:gap-6 md:grid-cols-[1fr_200px]">
                        <div className="space-y-5">
                            {/* Tool Name */}
                            <div>
                                <label htmlFor="name" className="block font-mono text-xs uppercase tracking-widest mb-2">
                                    Tool Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    defaultValue={metadata.title}
                                    required
                                    minLength={1}
                                    maxLength={200}
                                    onChange={() => errors.name && setErrors((prev) => { const { name: _, ...rest } = prev; return rest; })}
                                    className={`w-full border px-4 py-3 font-mono text-sm bg-white focus:outline-none ${errors.name ? "border-red-500" : "border-black"}`}
                                />
                                {errors.name && <p className="text-red-500 font-mono text-xs mt-1">{errors.name}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block font-mono text-xs uppercase tracking-widest mb-2">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe what this tool does..."
                                    rows={5}
                                    maxLength={2000}
                                    className="w-full border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none resize-none"
                                />
                            </div>
                        </div>

                        {/* Preview Card */}
                        <div className="hidden md:block">
                            <p className="font-mono text-xs uppercase tracking-widest mb-2">Preview</p>
                            <div className="border border-black overflow-hidden">
                                <div className="aspect-video bg-neutral-100 relative flex items-center justify-center">
                                    {metadata.image ? (
                                        <img
                                            src={metadata.image}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Globe className="w-8 h-8 text-neutral-400" />
                                    )}
                                </div>
                                <div className="p-3 border-t border-black">
                                    <div className="font-mono text-xs font-semibold truncate">{metadata.title || "No Title"}</div>
                                    <div className="font-mono text-[10px] text-neutral-400 truncate mt-1">
                                        {url.replace(/^https?:\/\//, '')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Info */}
                    <div className="border border-black/20 bg-neutral-50 px-4 py-3 flex items-start gap-3">
                        <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0 text-neutral-500" />
                        <p className="font-mono text-xs text-neutral-500 leading-relaxed">
                            Research starts immediately after submission. Our agents will map the site, pull reviews from G2, Reddit, and Trustpilot, analyze competitors, and deliver a scored report — <span className="text-black font-medium">typically under 2 minutes</span>.
                        </p>
                    </div>

                    {/* Zero-credit warning */}
                    {creditBalance === 0 && (
                        <div className="border border-red-400 bg-red-50 px-4 py-3 flex items-start gap-3">
                            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-600" />
                            <p className="font-mono text-xs text-red-700 leading-relaxed">
                                You have 0 research credits remaining. Submitting will fail.{" "}
                                <button
                                    type="button"
                                    onClick={() => setUpgradeModalOpen(true)}
                                    className="underline font-semibold hover:text-red-900"
                                >
                                    Upgrade to continue →
                                </button>
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            disabled={isSubmitting}
                            className="border border-black px-6 py-3 font-mono text-sm bg-white hover:bg-black hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Back
                        </button>
                        <SubmitButton pending={isSubmitting} />
                    </div>
                </form>
            )}
        </div>
    );
}
