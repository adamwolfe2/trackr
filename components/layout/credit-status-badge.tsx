"use client";

import { useState } from "react";
import Link from "next/link";
import { UpgradeModal } from "@/components/common/upgrade-modal";

interface CreditStatusBadgeProps {
    creditBalance: number;
    planName: string;
    workspaceId: string;
}

export function CreditStatusBadge({ creditBalance, planName, workspaceId }: CreditStatusBadgeProps) {
    const [modalOpen, setModalOpen] = useState(false);

    const colorClass =
        creditBalance === 0
            ? "border-red-500 text-red-700"
            : creditBalance <= 3
            ? "border-amber-400 text-amber-700"
            : "border-black text-neutral-600";

    if (creditBalance === 0) {
        return (
            <>
                <button
                    onClick={() => setModalOpen(true)}
                    className={`font-mono text-[10px] uppercase tracking-widest border px-2.5 py-1 transition-colors hover:bg-red-50 ${colorClass}`}
                    title="No credits remaining — click to upgrade"
                >
                    0 credits
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
            title={`${creditBalance} research credits remaining on ${planName} plan`}
        >
            {creditBalance} {creditBalance === 1 ? "credit" : "credits"}
        </Link>
    );
}
