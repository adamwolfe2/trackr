"use client";

import { useState } from "react";

interface LogoImageProps {
    src: string;
    fallbackSrc?: string; // Secondary URL to try (e.g. Google favicon) before showing text
    alt: string;
    fallbackChar: string;
    className?: string;
    fallbackClassName?: string;
}

/**
 * Renders an <img> with a two-stage fallback:
 * 1. Try `src` (e.g. Clearbit logo)
 * 2. If that fails, try `fallbackSrc` (e.g. Google favicon service)
 * 3. If that also fails (or no fallbackSrc), show a styled initial-letter div
 *
 * Needed because onError is a client-side event — can't rely on it in server components.
 */
export function LogoImage({
    src,
    fallbackSrc,
    alt,
    fallbackChar,
    className = "",
    fallbackClassName = "",
}: LogoImageProps) {
    const [stage, setStage] = useState<"primary" | "fallback" | "text">(
        () => (src ? "primary" : fallbackSrc ? "fallback" : "text")
    );

    if (stage === "text") {
        return (
            <div
                className={`flex items-center justify-center font-mono font-bold text-neutral-500 bg-neutral-100 border border-neutral-200 ${fallbackClassName || className}`}
            >
                {fallbackChar.charAt(0).toUpperCase()}
            </div>
        );
    }

    const activeSrc = stage === "primary" ? src : fallbackSrc!;

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={activeSrc}
            alt={alt}
            className={`object-contain ${className}`}
            onError={() => {
                if (stage === "primary" && fallbackSrc) {
                    setStage("fallback");
                } else {
                    setStage("text");
                }
            }}
        />
    );
}
