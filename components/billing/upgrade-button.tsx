"use client";

import { createCheckoutSession } from "@/lib/actions/stripe";
import type { BillingInterval } from "@/lib/config/subscriptions";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type PaidPlanSlug = "team" | "startup" | "enterprise";

const LABELS: Record<PaidPlanSlug, string> = {
    team: "Start 14-day free trial",
    startup: "Start 14-day free trial",
    enterprise: "Start 14-day free trial",
};

export function UpgradeButton({
    workspaceId,
    plan = "team",
    interval = "monthly",
}: {
    workspaceId: string;
    plan?: PaidPlanSlug;
    interval?: BillingInterval;
}) {
    const [isLoading, setIsLoading] = useState(false);

    const handleUpgrade = async () => {
        setIsLoading(true);
        try {
            const { url } = await createCheckoutSession(workspaceId, plan, interval);
            if (url) {
                window.location.href = url;
            } else {
                toast.error("Failed to start checkout");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full border border-black bg-white text-black hover:bg-black hover:text-white transition-colors px-4 py-2 font-mono text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading...
                </span>
            ) : (
                LABELS[plan]
            )}
        </button>
    );
}
