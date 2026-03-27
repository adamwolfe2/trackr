"use client";

import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getUserFriendlyError } from "@/lib/utils/error-messages";

export function RetryResearchButton({ toolId }: { toolId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleRetry() {
        setIsLoading(true);
        const toastId = toast.loading("Re-running research...");

        try {
            const res = await fetch("/api/research/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ toolId }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({ error: "Research failed" }));
                throw new Error(data.error ?? "Research failed");
            }

            toast.success("Research restarted -- check back in 1-2 minutes.", {
                id: toastId,
            });
            router.refresh();
        } catch (error: unknown) {
            toast.error(getUserFriendlyError(error), { id: toastId });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <button
            onClick={handleRetry}
            disabled={isLoading}
            className="flex items-center gap-1.5 border border-black bg-white hover:bg-black hover:text-white px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
            {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
                <RefreshCw className="h-3 w-3" />
            )}
            Retry
        </button>
    );
}
