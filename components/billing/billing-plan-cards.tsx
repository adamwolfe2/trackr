"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { Plan, BillingInterval } from "@/lib/config/subscriptions";
import { UpgradeButton } from "@/components/billing/upgrade-button";
import { ManageSubscriptionButton } from "@/components/billing/manage-subscription-button";

type BillingPlanCard = {
    key: string;
    plan: Plan;
    description: string;
    highlights: string[];
    isCurrent: boolean;
};

export function BillingPlanCards({
    planCards,
    workspaceId,
    stripeCustomerId,
}: {
    planCards: BillingPlanCard[];
    workspaceId: string;
    stripeCustomerId: string | null;
}) {
    const [interval, setInterval] = useState<BillingInterval>("monthly");

    return (
        <div className="space-y-4">
            {/* Monthly/Annual toggle */}
            <div className="flex items-center justify-center gap-0 border border-black w-fit mx-auto">
                <button
                    onClick={() => setInterval("monthly")}
                    className={`px-5 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
                        interval === "monthly"
                            ? "bg-black text-white"
                            : "bg-white text-black hover:bg-neutral-100"
                    }`}
                >
                    Monthly
                </button>
                <button
                    onClick={() => setInterval("annual")}
                    className={`px-5 py-2 font-mono text-xs uppercase tracking-widest transition-colors border-l border-black ${
                        interval === "annual"
                            ? "bg-black text-white"
                            : "bg-white text-black hover:bg-neutral-100"
                    }`}
                >
                    Annual — Save 20%
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-black">
                {planCards.map((card, i) => {
                    const displayPrice = card.plan.slug === "free"
                        ? 0
                        : interval === "annual"
                            ? card.plan.annualPrice
                            : card.plan.price;
                    const periodLabel = card.plan.slug === "free"
                        ? "/mo"
                        : interval === "annual"
                            ? "/yr"
                            : "/mo";

                    return (
                        <div
                            key={card.key}
                            className={`p-4 sm:p-5 ${i < planCards.length - 1 ? "border-b lg:border-b-0 lg:border-r border-black" : ""} ${card.isCurrent ? "bg-black text-white" : "bg-white"}`}
                        >
                            <div className="mb-1">
                                <span className={`font-mono text-[10px] uppercase tracking-widest ${card.isCurrent ? "text-neutral-400" : "text-neutral-500"}`}>
                                    {card.isCurrent ? "Current Plan" : card.plan.name}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-2xl sm:text-3xl font-serif">
                                    ${interval === "annual" && card.plan.slug !== "free"
                                        ? displayPrice.toLocaleString("en-US", { minimumFractionDigits: displayPrice % 1 !== 0 ? 2 : 0 })
                                        : displayPrice}
                                </span>
                                <span className={`font-mono text-xs ${card.isCurrent ? "text-neutral-400" : "text-neutral-500"}`}>
                                    {periodLabel}
                                </span>
                            </div>
                            {interval === "annual" && card.plan.slug !== "free" && (
                                <p className={`font-mono text-[10px] ${card.isCurrent ? "text-neutral-400" : "text-neutral-500"}`}>
                                    ${Math.round(displayPrice / 12)}/mo equivalent
                                </p>
                            )}
                            <p className={`font-mono text-[10px] mb-5 leading-relaxed ${card.isCurrent ? "text-neutral-300" : "text-neutral-500"}`}>
                                {card.description}
                            </p>
                            <ul className="space-y-1.5 mb-6">
                                {card.highlights.map((feature) => (
                                    <li key={feature} className={`flex items-center gap-2 font-mono text-[11px] ${card.isCurrent ? "text-neutral-200" : "text-neutral-700"}`}>
                                        <Check className="w-3 h-3 flex-shrink-0" strokeWidth={2.5} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <div>
                                {card.isCurrent && stripeCustomerId ? (
                                    <ManageSubscriptionButton workspaceId={workspaceId} />
                                ) : card.isCurrent ? (
                                    <div className={`border px-4 py-2 text-center font-mono text-xs uppercase tracking-widest ${card.isCurrent ? "border-neutral-600 text-neutral-400" : "border-black text-black"}`}>
                                        Active
                                    </div>
                                ) : card.plan.slug !== "free" ? (
                                    <UpgradeButton workspaceId={workspaceId} plan={card.plan.slug} interval={interval} />
                                ) : null}
                            </div>
                            {card.plan.slug !== "free" && !card.isCurrent && (
                                <p className={`font-mono text-[10px] text-center mt-2 ${card.isCurrent ? "text-neutral-400" : "text-neutral-500"}`}>
                                    14-day free trial included
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
