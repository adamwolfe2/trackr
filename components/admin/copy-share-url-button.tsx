"use client";

import { useState } from "react";

interface CopyShareUrlButtonProps {
    token: string;
}

export function CopyShareUrlButton({ token }: CopyShareUrlButtonProps) {
    const [copied, setCopied] = useState(false);

    function handleCopy() {
        const url = `${window.location.origin}/audit/share/${token}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    return (
        <button
            onClick={handleCopy}
            className="font-mono text-xs uppercase tracking-widest border border-neutral-300 px-2 py-1 hover:border-black hover:text-black text-neutral-500 transition-colors"
            title="Copy share URL"
        >
            {copied ? "Copied!" : "Share"}
        </button>
    );
}
