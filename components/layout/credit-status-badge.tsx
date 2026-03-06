"use client";

import { useState } from "react";
import Link from "next/link";
import { UpgradeModal } from "@/components/common/upgrade-modal";

interface CreditStatusBadgeProps {
    runsRemaining: number;
    monthlyLimit: number;
    planName: string;
    workspaceId: string;
}

export function CreditStatusBadge({ runsRemaining, monthlyLimit, planName, workspaceId }: CreditStatusBadgeProps) {
    const [modalOpen, setModalOpen] = useState(false);

    const pct = monthlyLimit > 0 ? runsRemaining / monthlyLimit : 1;
    const colorClass =
        runsRemaining === 0
            ? "border-red-500 text-red-700"
            : pct <= 0.2
            ? "border-amber-400 text-amber-700"
            : "border-black text-neutral-600";

    const label = `${runsRemaining}/${monthlyLimit} runs`;

    if (runsRemaining === 0) {
        return (
            <>
                <button
                    onClick={() => setModalOpen(true)}
                    className={`font-mono text-[10px] uppercase tracking-widest border px-2.5 py-1 transition-colors hover:bg-red-50 ${colorClass}`}
                    title="No research runs remaining — click to upgrade"
                >
                    {label}
                </button>
                <UpgradeModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    trigger="credits_exhausted"
                    workspaceId={workspaceId}
                />
            </>
        );
    }

    return (
        <Link
            href="/settings/billing"
            className={`font-mono text-[10px] uppercase tracking-widest border px-2.5 py-1 transition-colors hover:opacity-70 ${colorClass}`}
            title={`${runsRemaining} of ${monthlyLimit} research runs remaining on ${planName} plan`}
        >
            {label}
        </Link>
    );
}
