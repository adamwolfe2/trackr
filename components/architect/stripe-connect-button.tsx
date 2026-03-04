"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function StripeConnectButton({ architectId }: { architectId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleClick() {
        setLoading(true);
        try {
            const res = await fetch("/api/architect/stripe-connect");
            const data = await res.json() as { url?: string; error?: string };
            if (data.url) {
                router.push(data.url);
            } else {
                setLoading(false);
            }
        } catch {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className="font-mono text-xs border border-black px-4 py-2 bg-black text-white hover:bg-neutral-800 disabled:opacity-50 whitespace-nowrap shrink-0"
        >
            {loading ? "Redirecting..." : "Set Up Payouts"}
        </button>
    );
}
