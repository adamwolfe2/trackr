"use client";

import { createCheckoutSession } from "@/lib/actions/stripe";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type PaidPlanSlug = "team" | "startup" | "enterprise";

const LABELS: Record<PaidPlanSlug, string> = {
    team: "Upgrade to Team",
    startup: "Upgrade to Startup",
    enterprise: "Upgrade to Enterprise",
};

export function UpgradeButton({ workspaceId, plan = "team" }: { workspaceId: string; plan?: PaidPlanSlug }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleUpgrade = async () => {
        setIsLoading(true);
        try {
            const { url } = await createCheckoutSession(workspaceId, plan);
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
