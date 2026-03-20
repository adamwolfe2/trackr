"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { createCheckoutSession } from "@/lib/actions/stripe";
import Link from "next/link";
import type { PlanSlug } from "@/lib/config/subscriptions";

type Trigger = "credits_exhausted" | "feature_gate" | "tool_limit";

const HEADLINES: Record<Trigger, string> = {
    credits_exhausted: "You've used all your research credits",
    feature_gate: "This feature requires a higher plan",
    tool_limit: "You've reached your tool limit",
};

const PLAN_CARDS: Array<{
    slug: Exclude<PlanSlug, "free">;
    name: string;
    price: number;
    credits: number;
    members: string;
}> = [
    { slug: "team", name: "Team", price: 50, credits: 25, members: "5 members" },
    { slug: "startup", name: "Startup", price: 149, credits: 75, members: "15 members" },
    { slug: "enterprise", name: "Enterprise", price: 349, credits: 200, members: "Unlimited members" },
];

interface UpgradeModalProps {
    open: boolean;
    onClose: () => void;
    trigger: Trigger;
    workspaceId?: string;
}

export function UpgradeModal({ open, onClose, trigger, workspaceId }: UpgradeModalProps) {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    // Close on ESC
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    if (!open) return null;

    const handleUpgrade = async (planSlug: Exclude<PlanSlug, "free">) => {
        if (!workspaceId) {
            window.location.href = "/settings/billing";
            return;
        }
        setLoadingPlan(planSlug);
        try {
            const { url } = await createCheckoutSession(workspaceId, planSlug, "monthly");
            if (url) window.location.href = url;
        } catch {
            window.location.href = "/settings/billing";
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        // Overlay
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="upgrade-modal-title"
        >
            <div className="bg-[#F3F3EF] border border-black w-full max-w-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="border-b border-black px-4 sm:px-6 py-3 sm:py-4 flex items-start justify-between gap-4">
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">
                            Upgrade Required
                        </p>
                        <h2
                            id="upgrade-modal-title"
                            className="font-serif text-xl font-normal leading-snug"
                        >
                            {HEADLINES[trigger]}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 border border-black p-1.5 transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>

                {/* Plan cards */}
                <div className="p-4 sm:p-6 space-y-3">
                    {PLAN_CARDS.map((card) => (
                        <div
                            key={card.slug}
                            className="border border-black bg-white p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                        >
                            <div>
                                <div className="font-mono text-xs uppercase tracking-widest font-semibold mb-1">
                                    {card.name}
                                </div>
                                <div className="font-serif text-lg font-normal leading-none">
                                    ${card.price}
                                    <span className="font-mono text-xs text-neutral-400 ml-1">/mo</span>
                                </div>
                                <div className="font-mono text-[10px] text-neutral-500 mt-1">
                                    {card.credits} credits &middot; {card.members}
                                </div>
                            </div>
                            <button
                                onClick={() => handleUpgrade(card.slug)}
                                disabled={loadingPlan !== null}
                                className="flex items-center gap-1.5 border border-black px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0 w-full sm:w-auto justify-center sm:justify-start"
                            >
                                {loadingPlan === card.slug ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : null}
                                Start free trial
                            </button>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="border-t border-black px-4 sm:px-6 py-3 text-center">
                    <Link
                        href="/settings/billing"
                        onClick={onClose}
                        className="font-mono text-[10px] text-neutral-500 hover:text-black underline underline-offset-2 transition-colors"
                    >
                        Or purchase extra credits →
                    </Link>
                </div>
            </div>
        </div>
    );
}
