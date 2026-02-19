"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export function CopyLinkButton({ referralUrl }: { referralUrl: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(referralUrl);
            setCopied(true);
            toast.success("Referral link copied!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy. Please copy the link manually.");
        }
    };

    return (
        <div className="flex gap-0">
            <input
                readOnly
                value={referralUrl}
                className="flex-1 border border-black px-4 py-2.5 font-mono text-sm bg-neutral-50 focus:outline-none min-w-0"
            />
            <button
                onClick={handleCopy}
                className="border border-l-0 border-black px-4 py-2.5 bg-white hover:bg-black hover:text-white transition-colors flex items-center gap-2 font-mono text-xs"
            >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
            </button>
        </div>
    );
}
