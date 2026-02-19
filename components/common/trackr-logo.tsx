/**
 * Trackr logo mark — three diagonal slashes.
 * Usage: <TrackrLogo size={24} /> or <TrackrLogo size={16} inverted />
 */
export function TrackrLogo({
    size = 24,
    inverted = false,
    className = "",
}: {
    size?: number;
    inverted?: boolean;
    className?: string;
}) {
    const fill = inverted ? "#F3F3EF" : "#000000";

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path d="M8 28L14 4H18L12 28H8Z" fill={fill} />
            <path d="M14 28L20 4H24L18 28H14Z" fill={fill} />
            <path d="M20 28L26 4H30L24 28H20Z" fill={fill} />
        </svg>
    );
}

/**
 * Full Trackr wordmark with logo icon + text.
 * Usage: <TrackrWordmark /> or <TrackrWordmark size="lg" />
 */
export function TrackrWordmark({
    size = "md",
    className = "",
}: {
    size?: "sm" | "md" | "lg";
    className?: string;
}) {
    const config = {
        sm: { icon: 16, text: "text-base", gap: "gap-1.5" },
        md: { icon: 20, text: "text-xl", gap: "gap-2" },
        lg: { icon: 28, text: "text-3xl", gap: "gap-2.5" },
    }[size];

    return (
        <span className={`flex items-center ${config.gap} ${className}`}>
            <span className="w-7 h-7 bg-black flex items-center justify-center flex-shrink-0">
                <TrackrLogo size={config.icon} inverted />
            </span>
            <span className={`font-serif font-medium ${config.text}`}>Trackr</span>
        </span>
    );
}
