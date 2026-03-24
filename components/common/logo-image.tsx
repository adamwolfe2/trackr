"use client";

import { useState, useRef, useEffect, useCallback } from "react";

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
 * Handles SSR hydration: if an image fails during streaming, onError won't
 * re-fire after hydration. The useEffect checks img.complete + naturalWidth
 * to catch these missed failures.
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
    const imgRef = useRef<HTMLImageElement>(null);

    const advance = useCallback(() => {
        setStage((prev) => {
            if (prev === "primary" && fallbackSrc) return "fallback";
            return "text";
        });
    }, [fallbackSrc]);

    // After hydration, check if the image already failed (onError won't re-fire)
    useEffect(() => {
        const img = imgRef.current;
        if (!img) return;
        // complete=true + naturalWidth=0 means the image failed to load
        if (img.complete && img.naturalWidth === 0) {
            advance();
        }
    }, [stage, advance]);

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
            ref={imgRef}
            src={activeSrc}
            alt={alt}
            className={`object-contain ${className}`}
            onError={advance}
        />
    );
}
