"use client";

import { useState, useTransition } from "react";
import { purchaseCredits } from "@/lib/actions/credits";
import { CREDIT_PACKS, CREDIT_PACK_PRICES, type CreditPackSize } from "@/lib/config/subscriptions";
import { toast } from "sonner";

export function CreditPackSelector({ planSlug }: { planSlug: string }) {
    const [isPending, startTransition] = useTransition();
    const [loadingPack, setLoadingPack] = useState<number | null>(null);
    const prices = CREDIT_PACK_PRICES[planSlug] ?? CREDIT_PACK_PRICES.free;

    function handleBuy(packSize: CreditPackSize) {
        setLoadingPack(packSize);
        startTransition(async () => {
            try {
                const result = await purchaseCredits(packSize);
                if (result.url) {
                    window.location.href = result.url;
                } else {
                    toast.error("Checkout session could not be created.");
                }
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to start checkout");
            } finally {
                setLoadingPack(null);
            }
        });
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CREDIT_PACKS.map((pack, i) => {
                const priceInCents = prices[pack.credits] ?? 0;
                const priceDisplay = (priceInCents / 100).toFixed(0);
                const perCredit = (priceInCents / pack.credits / 100).toFixed(2);
                const isLargest = i === CREDIT_PACKS.length - 1;

                return (
                    <div
                        key={pack.credits}
                        className={`border border-black p-4 flex flex-col ${isLargest ? "bg-black text-white" : "bg-white"}`}
                    >
                        {isLargest && (
                            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">
                                Best Value
                            </span>
                        )}
                        <span className="font-mono text-lg font-bold">{pack.credits}</span>
                        <span className={`font-mono text-xs ${isLargest ? "text-neutral-400" : "text-neutral-500"} mb-3`}>
                            credits · ${perCredit}/each
                        </span>
                        <button
                            onClick={() => handleBuy(pack.credits as CreditPackSize)}
                            disabled={isPending}
                            className={`mt-auto px-4 py-2 font-mono text-xs uppercase tracking-widest border transition-colors disabled:opacity-50 ${
                                isLargest
                                    ? "border-white text-white hover:bg-white hover:text-black"
                                    : "border-black bg-white hover:bg-black hover:text-white"
                            }`}
                        >
                            {loadingPack === pack.credits ? "Loading..." : `Buy — $${priceDisplay}`}
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
