/**
 * Design system constants for Trackr's Offset Brutalist theme.
 * Use these constants instead of hardcoding values in components.
 */

/** Standardized shadow sizes -- use only these three */
export const SHADOWS = {
    sm: "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
    md: "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    lg: "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
} as const;

/** Hover shadow transitions -- pair with shadows above */
export const SHADOW_HOVER = {
    sm: "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
    md: "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
} as const;

/** Standard background colors */
export const COLORS = {
    bg: "bg-[#F3F3EF]",
    card: "bg-white",
    hover: "hover:bg-neutral-100",
    muted: "text-neutral-500",
} as const;
