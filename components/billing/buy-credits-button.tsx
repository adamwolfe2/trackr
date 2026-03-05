"use client";

import { useState, useTransition } from "react";
import { purchaseCredits } from "@/lib/actions/credits";
import type { CreditPackSize } from "@/lib/config/subscriptions";
import { toast } from "sonner";

const CREDIT_PACKS = [5, 10, 25] as const;

/** @deprecated Use CreditPackSelector instead */
export function BuyCreditsButton({ pricePerCredit }: { pricePerCredit: number }) {
    const [isPending, startTransition] = useTransition();
    const [selectedPack, setSelectedPack] = useState<number>(10);

    function handlePurchase() {
        startTransition(async () => {
            try {
                const result = await purchaseCredits(selectedPack as CreditPackSize);
                if (result.url) {
                    window.location.href = result.url;
                } else {
                    toast.error("Checkout session could not be created. Please try again.");
                }
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to start checkout");
            }
        });
    }

    return (
        <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-0 border border-black">
                {CREDIT_PACKS.map((pack) => (
                    <button
                        key={pack}
                        onClick={() => setSelectedPack(pack)}
                        className={`px-3 py-1.5 font-mono text-xs transition-colors border-r last:border-r-0 border-black ${
                            selectedPack === pack
                                ? "bg-black text-white"
                                : "bg-white text-black hover:bg-neutral-100"
                        }`}
                    >
                        {pack}
                    </button>
                ))}
            </div>
            <button
                onClick={handlePurchase}
                disabled={isPending}
                className="px-4 py-1.5 font-mono text-xs uppercase tracking-widest border border-black bg-white hover:bg-black hover:text-white transition-colors disabled:opacity-50"
            >
                {isPending ? "Loading..." : `Buy ${selectedPack} credits — $${(selectedPack * pricePerCredit).toFixed(2)}`}
            </button>
        </div>
    );
}
