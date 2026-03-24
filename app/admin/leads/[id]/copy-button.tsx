"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback: do nothing
        }
    }

    return (
        <button
            type="button"
            onClick={handleCopy}
            className="font-mono text-[10px] uppercase tracking-widest border border-neutral-300 px-2 py-1 hover:border-black hover:text-black transition-colors flex items-center gap-1.5 text-neutral-500"
            title="Copy share URL"
        >
            <Copy className="w-3 h-3" />
            {copied ? "Copied" : "Copy"}
        </button>
    );
}
