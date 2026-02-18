"use client";

import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/lib/actions/stripe";
import { Loader2, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function UpgradeButton({ workspaceId }: { workspaceId: string }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleUpgrade = async () => {
        setIsLoading(true);
        try {
            const { url } = await createCheckoutSession(workspaceId);
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
        <Button onClick={handleUpgrade} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Zap className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
            )}
            Upgrade to Pro
        </Button>
    );
}
