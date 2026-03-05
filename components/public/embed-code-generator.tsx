"use client";

import { useState } from "react";
import { Copy, Check, Code2 } from "lucide-react";
import { toast } from "sonner";

type EmbedCodeGeneratorProps = {
    slug: string;
    baseUrl?: string;
};

export function EmbedCodeGenerator({
    slug,
    baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://trytrackr.com",
}: EmbedCodeGeneratorProps) {
    const [height, setHeight] = useState(500);
    const [copied, setCopied] = useState(false);

    const embedUrl = `${baseUrl}/api/embed/${slug}`;
    const iframeCode = `<iframe src="${embedUrl}" width="100%" height="${height}" frameborder="0" style="border: 1px solid #000; background: #F3F3EF;"></iframe>`;
    const scriptCode = `<div id="trackr-widget" data-slug="${slug}" data-height="${height}"></div>\n<script src="${baseUrl}/api/embed/${slug}?format=script" async></script>`;

    function handleCopy(code: string) {
        navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="border border-black bg-white p-5 space-y-5">
            <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-neutral-500" />
                <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                    Embed Widget
                </h3>
            </div>

            {/* Height Config */}
            <div>
                <label className="font-mono text-xs uppercase tracking-widest text-neutral-500 block mb-1">
                    Widget Height (px)
                </label>
                <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Math.max(200, Math.min(1200, Number(e.target.value) || 500)))}
                    className="w-32 border border-black px-3 py-1.5 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
                    min={200}
                    max={1200}
                />
            </div>

            {/* Iframe Embed */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-neutral-500">Iframe Embed</span>
                    <button
                        onClick={() => handleCopy(iframeCode)}
                        className="flex items-center gap-1 font-mono text-xs hover:underline"
                    >
                        {copied ? (
                            <Check className="w-3 h-3" />
                        ) : (
                            <Copy className="w-3 h-3" />
                        )}
                        Copy
                    </button>
                </div>
                <pre className="border border-neutral-200 bg-neutral-50 p-3 font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all">
                    {iframeCode}
                </pre>
            </div>

            {/* Script Embed */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-neutral-500">Script Embed</span>
                    <button
                        onClick={() => handleCopy(scriptCode)}
                        className="flex items-center gap-1 font-mono text-xs hover:underline"
                    >
                        {copied ? (
                            <Check className="w-3 h-3" />
                        ) : (
                            <Copy className="w-3 h-3" />
                        )}
                        Copy
                    </button>
                </div>
                <pre className="border border-neutral-200 bg-neutral-50 p-3 font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all">
                    {scriptCode}
                </pre>
            </div>

            {/* Preview */}
            <div>
                <span className="font-mono text-xs text-neutral-500 block mb-2">Preview</span>
                <div
                    className="border border-black bg-[#F3F3EF] overflow-hidden"
                    style={{ height: Math.min(height, 300) }}
                >
                    <iframe
                        src={embedUrl}
                        width="100%"
                        height={height}
                        className="border-0 origin-top-left"
                        style={{
                            transform: `scale(${Math.min(300, height) / height})`,
                            transformOrigin: "top left",
                            width: "100%",
                            height: `${height}px`,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
