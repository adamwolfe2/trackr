"use client";

import { useState, useEffect } from "react";
import { Copy, Check, RefreshCw, Key, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { regenerateApiKey } from "@/lib/actions/workspace";

function maskApiKey(key: string): string {
    if (key.length <= 8) return key;
    return key.slice(0, 4) + "\u2022".repeat(key.length - 8) + key.slice(-4);
}

export function ApiKeySection({
    currentApiKey,
    isOwnerOrAdmin,
}: {
    currentApiKey: string | null;
    isOwnerOrAdmin: boolean;
}) {
    const [apiKey, setApiKey] = useState<string | null>(currentApiKey);
    const [revealed, setRevealed] = useState(false);
    const [copied, setCopied] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [justGenerated, setJustGenerated] = useState(false);
    const [hideCountdown, setHideCountdown] = useState<number | null>(null);

    // Countdown timer for auto-hiding the revealed key
    useEffect(() => {
        if (hideCountdown === null) return;
        if (hideCountdown <= 0) {
            setRevealed(false);
            setJustGenerated(false);
            setHideCountdown(null);
            return;
        }
        const t = setTimeout(() => setHideCountdown(c => (c !== null ? c - 1 : null)), 1000);
        return () => clearTimeout(t);
    }, [hideCountdown]);

    const handleCopy = async () => {
        if (!apiKey) return;
        try {
            await navigator.clipboard.writeText(apiKey);
            setCopied(true);
            toast.success("API key copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy. Please copy the key manually.");
        }
    };

    const handleGenerate = async () => {
        const confirmed = apiKey
            ? window.confirm(
                  "This will invalidate your current API key. Any Chrome Extension using the old key will stop working. Continue?"
              )
            : true;

        if (!confirmed) return;

        setGenerating(true);
        try {
            const newKey = await regenerateApiKey();
            setApiKey(newKey);
            setRevealed(true);
            setJustGenerated(true);
            setHideCountdown(60);
            toast.success("New API key generated. Copy it now — it will be hidden in 60 seconds.");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to generate API key";
            toast.error(message);
        } finally {
            setGenerating(false);
        }
    };

    const displayValue = apiKey
        ? revealed
            ? apiKey
            : maskApiKey(apiKey)
        : "No API key generated yet";

    return (
        <div className="border border-black">
            <div className="border-b border-black px-5 py-3 flex items-center gap-2">
                <Key className="h-3.5 w-3.5" />
                <h2 className="font-mono text-xs uppercase tracking-widest">
                    API Key & Integrations
                </h2>
            </div>
            <div className="p-5 space-y-4">
                <p className="font-mono text-xs text-neutral-500 leading-relaxed">
                    Use this key in the Trackr Chrome Extension to submit tools for research
                    and check your stack while browsing.
                </p>

                {/* API Key display + actions */}
                <div className="space-y-3">
                    <label className="font-mono text-xs uppercase tracking-widest block">
                        API Key
                    </label>
                    <div className="flex gap-0">
                        <div className="flex-1 border border-black px-4 py-2.5 font-mono text-sm bg-neutral-50 min-w-0 flex items-center overflow-hidden">
                            <span className={`truncate ${!apiKey ? "text-neutral-400" : ""}`}>
                                {displayValue}
                            </span>
                        </div>
                        {apiKey && (
                            <>
                                <button
                                    onClick={() => setRevealed(!revealed)}
                                    className="border border-l-0 border-black px-3 py-2.5 bg-white hover:bg-black hover:text-white transition-colors flex items-center"
                                    title={revealed ? "Hide key" : "Reveal key"}
                                >
                                    {revealed ? (
                                        <EyeOff className="h-3.5 w-3.5" />
                                    ) : (
                                        <Eye className="h-3.5 w-3.5" />
                                    )}
                                </button>
                                <button
                                    onClick={handleCopy}
                                    className="border border-l-0 border-black px-4 py-2.5 bg-white hover:bg-black hover:text-white transition-colors flex items-center gap-2 font-mono text-xs"
                                >
                                    {copied ? (
                                        <Check className="h-3.5 w-3.5" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                    )}
                                    {copied ? "Copied" : "Copy"}
                                </button>
                            </>
                        )}
                    </div>

                    {justGenerated && (
                        <p className="font-mono text-[10px] text-amber-600">
                            Copy this key now. It will be hidden automatically
                            {hideCountdown !== null ? ` in ${hideCountdown}s` : " after you leave this page"}.
                        </p>
                    )}
                </div>

                {/* Generate / Regenerate button */}
                {isOwnerOrAdmin && (
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="border border-black px-5 py-2 font-mono text-xs uppercase tracking-widest bg-white hover:bg-black hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <RefreshCw
                            className={`h-3 w-3 ${generating ? "animate-spin" : ""}`}
                        />
                        {generating
                            ? "Generating..."
                            : apiKey
                            ? "Regenerate Key"
                            : "Generate New Key"}
                    </button>
                )}

                {/* Instructions */}
                <div className="border border-neutral-200 px-4 py-3 mt-2">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">
                        Setup Instructions
                    </p>
                    <ol className="font-mono text-xs text-neutral-600 space-y-1.5 list-decimal list-inside leading-relaxed">
                        <li>Install the Trackr Chrome Extension</li>
                        <li>Click the extension icon and open Settings</li>
                        <li>Paste your API key above</li>
                        <li>
                            Browse any SaaS tool site — the extension will show if it&apos;s in
                            your stack and let you submit it for research
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
