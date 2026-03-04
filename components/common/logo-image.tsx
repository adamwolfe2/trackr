"use client";

import { useState } from "react";

interface LogoImageProps {
    src: string;
    alt: string;
    fallbackChar: string;
    className?: string;
    fallbackClassName?: string;
}

/**
 * Renders an <img> that gracefully degrades to an initial-letter fallback
 * when the image URL fails to load (404, CORS, etc.).
 * Needed because onError is a client-side event — can't rely on it in server components.
 */
export function LogoImage({ src, alt, fallbackChar, className = "", fallbackClassName = "" }: LogoImageProps) {
    const [failed, setFailed] = useState(false);

    if (failed) {
        return (
            <div className={`flex items-center justify-center font-mono font-bold text-neutral-500 bg-neutral-100 border border-neutral-200 ${fallbackClassName || className}`}>
                {fallbackChar.charAt(0).toUpperCase()}
            </div>
        );
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt}
            className={`object-contain ${className}`}
            onError={() => setFailed(true)}
        />
    );
}
