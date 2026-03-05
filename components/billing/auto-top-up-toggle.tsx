"use client";

import { useState, useTransition } from "react";
import { enableAutoTopUp, disableAutoTopUp } from "@/lib/actions/credits";
import { CREDIT_PACKS, CREDIT_PACK_PRICES, type CreditPackSize } from "@/lib/config/subscriptions";
import { toast } from "sonner";

interface AutoTopUpToggleProps {
    enabled: boolean;
    currentPack: number;
    planSlug: string;
}

export function AutoTopUpToggle({ enabled, currentPack, planSlug }: AutoTopUpToggleProps) {
    const [isEnabled, setIsEnabled] = useState(enabled);
    const [selectedPack, setSelectedPack] = useState<CreditPackSize>(
        CREDIT_PACKS.some(p => p.credits === currentPack) ? (currentPack as CreditPackSize) : 25
    );
    const [isPending, startTransition] = useTransition();
    const prices = CREDIT_PACK_PRICES[planSlug] ?? CREDIT_PACK_PRICES.free;

    function handleToggle() {
        startTransition(async () => {
            try {
                if (isEnabled) {
                    await disableAutoTopUp();
                    setIsEnabled(false);
                    toast.success("Auto-refill disabled");
                } else {
                    await enableAutoTopUp(selectedPack);
                    setIsEnabled(true);
                    toast.success("Auto-refill enabled");
                }
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to update auto-refill");
            }
        });
    }

    function handlePackChange(packSize: CreditPackSize) {
        setSelectedPack(packSize);
        if (isEnabled) {
            startTransition(async () => {
                try {
                    await enableAutoTopUp(packSize);
                    toast.success(`Auto-refill updated to ${packSize} credits`);
                } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Failed to update");
                }
            });
        }
    }

    const priceInCents = prices[selectedPack] ?? 0;
    const priceDisplay = (priceInCents / 100).toFixed(2);

    return (
        <div className="border-t border-black pt-4 mt-4 space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <span className="font-mono text-xs uppercase tracking-widest">Auto-Refill</span>
                    <p className="font-mono text-[10px] text-neutral-500 mt-0.5">
                        Automatically purchase credits when your balance hits 0
                    </p>
                </div>
                <button
                    onClick={handleToggle}
                    disabled={isPending}
                    className={`w-12 h-6 border border-black transition-colors relative ${
                        isEnabled ? "bg-black" : "bg-white"
                    }`}
                >
                    <div
                        className={`absolute top-0.5 w-4 h-4 border transition-all ${
                            isEnabled
                                ? "right-0.5 bg-white border-white"
                                : "left-0.5 bg-black border-black"
                        }`}
                    />
                </button>
            </div>

            {isEnabled && (
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-0 border border-black">
                        {CREDIT_PACKS.map((pack) => (
                            <button
                                key={pack.credits}
                                onClick={() => handlePackChange(pack.credits as CreditPackSize)}
                                disabled={isPending}
                                className={`px-3 py-1.5 font-mono text-xs transition-colors border-r last:border-r-0 border-black ${
                                    selectedPack === pack.credits
                                        ? "bg-black text-white"
                                        : "bg-white text-black hover:bg-neutral-100"
                                }`}
                            >
                                {pack.credits}
                            </button>
                        ))}
                    </div>
                    <span className="font-mono text-xs text-neutral-500">
                        {selectedPack} credits x ${priceDisplay} — auto-charged when balance hits 0
                    </span>
                </div>
            )}
        </div>
    );
}
