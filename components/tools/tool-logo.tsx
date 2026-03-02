"use client";

import { useState } from "react";

interface ToolLogoProps {
    name: string;
    logoUrl?: string | null;
    websiteUrl?: string | null;
    size?: "sm" | "md" | "lg";
}

const SIZE = {
    sm: { box: "h-6 w-6", img: "w-4 h-4", text: "text-[10px]" },
    md: { box: "h-7 w-7", img: "w-5 h-5", text: "text-xs" },
    lg: { box: "h-9 w-9", img: "w-6 h-6", text: "text-sm" },
};

export function ToolLogo({ name, logoUrl, websiteUrl, size = "md" }: ToolLogoProps) {
    const [hasError, setHasError] = useState(false);

    const domain = websiteUrl
        ? (() => { try { return new URL(websiteUrl).hostname; } catch { return null; } })()
        : null;

    const src = (!hasError && logoUrl)
        ? logoUrl
        : domain
            ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
            : null;

    const s = SIZE[size];

    return (
        <div className={`${s.box} border border-black flex items-center justify-center flex-shrink-0 overflow-hidden bg-white`}>
            {src ? (
                <img
                    src={src}
                    alt={name}
                    className={`${s.img} object-contain`}
                    onError={() => setHasError(true)}
                />
            ) : (
                <span className={`font-mono font-bold ${s.text} text-neutral-600`}>
                    {name.charAt(0).toUpperCase()}
                </span>
            )}
        </div>
    );
}
