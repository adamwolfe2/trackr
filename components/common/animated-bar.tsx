"use client";

import { useEffect, useState } from "react";

interface AnimatedBarProps {
    value: number; // 0-100
    color?: string;
    height?: string;
    className?: string;
    delay?: number;
}

export function AnimatedBar({
    value,
    color = "#171717",
    height = "h-2",
    className = "",
    delay = 120,
}: AnimatedBarProps) {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const t = setTimeout(() => setWidth(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);

    return (
        <div className={`bg-neutral-100 border border-neutral-200 ${height} ${className}`}>
            <div
                className={height}
                style={{
                    width: `${width}%`,
                    background: color,
                    transition: "width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }}
            />
        </div>
    );
}

interface ScoreBarProps {
    score: number;
    delay?: number;
}

function scoreColor(score: number): string {
    if (score <= 40) return "#DC2626";
    if (score <= 65) return "#D97706";
    if (score <= 85) return "#525252";
    return "#171717";
}

export function AnimatedScoreBar({ score, delay = 120 }: ScoreBarProps) {
    return (
        <AnimatedBar value={score} color={scoreColor(score)} delay={delay} />
    );
}
