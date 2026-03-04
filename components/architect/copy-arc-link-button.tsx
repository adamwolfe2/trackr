"use client";

import { useState } from "react";

export function CopyArcLinkButton({ url }: { url: string }) {
    const [copied, setCopied] = useState(false);

    function handleCopy() {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    return (
        <button
            onClick={handleCopy}
            className="font-mono text-xs border border-black px-4 py-2 bg-black text-white hover:bg-neutral-800 whitespace-nowrap shrink-0"
        >
            {copied ? "Copied!" : "Copy Link"}
        </button>
    );
}
