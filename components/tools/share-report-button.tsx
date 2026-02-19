"use client";

import { useState } from "react";
import { Share2, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ShareReportButton({ reportId }: { reportId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/reports/share", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reportId }),
            });
            if (!res.ok) throw new Error("Failed to generate share link");
            const data = await res.json();
            setShareUrl(data.url);
            await navigator.clipboard.writeText(data.url);
            setCopied(true);
            toast.success("Share link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to generate share link.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!shareUrl) return;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success("Link copied!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy.");
        }
    };

    if (shareUrl) {
        return (
            <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-2 border border-black font-mono text-xs hover:bg-neutral-50 transition-colors"
            >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy Link"}
            </button>
        );
    }

    return (
        <button
            onClick={handleShare}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 border border-black font-mono text-xs hover:bg-neutral-50 disabled:opacity-50 transition-colors"
        >
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Share2 className="h-3 w-3" />}
            Share
        </button>
    );
}
