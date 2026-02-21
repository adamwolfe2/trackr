"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { createReferralCode } from "@/lib/actions/referrals";
import { toast } from "sonner";

export function GenerateReferralButton() {
    const [isPending, startTransition] = useTransition();

    const handleGenerate = () => {
        startTransition(async () => {
            try {
                const result = await createReferralCode();
                if (!result.success) {
                    toast.error(result.error ?? "Failed to generate referral code. Please try again.");
                }
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to generate referral code. Please try again.");
            }
        });
    };

    return (
        <button
            onClick={handleGenerate}
            disabled={isPending}
            className="w-full border border-black px-5 py-3 font-mono text-xs uppercase tracking-widest bg-black text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
            {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
            {isPending ? "Generating..." : "Generate Referral Link"}
        </button>
    );
}
