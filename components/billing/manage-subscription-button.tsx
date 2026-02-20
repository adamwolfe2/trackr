"use client";

import { createCustomerPortalSession } from "@/lib/actions/stripe";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ManageSubscriptionButton({ workspaceId }: { workspaceId: string }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleManage = async () => {
        setIsLoading(true);
        try {
            const { url } = await createCustomerPortalSession(workspaceId);
            if (url) {
                window.location.href = url;
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleManage}
            disabled={isLoading}
            className="w-full border border-neutral-600 text-neutral-300 hover:border-white hover:text-white transition-colors px-4 py-2 font-mono text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading...
                </span>
            ) : (
                "Manage Subscription"
            )}
        </button>
    );
}
