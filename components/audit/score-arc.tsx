"use client";

import { useEffect, useState } from "react";

interface ScoreArcProps {
    score: number;
    size?: number;
}

export function ScoreArc({ score, size = 200 }: ScoreArcProps) {
    const [animatedFill, setAnimatedFill] = useState(0);

    const r = size * 0.39;
    const cx = size / 2;
    const cy = size / 2;
    const circumference = 2 * Math.PI * r;
    const totalArcDeg = 270;
    const arcLength = (totalArcDeg / 360) * circumference;
    const targetFill = (score / 100) * arcLength;
    const sw = size * 0.07; // stroke width

    useEffect(() => {
        const t = setTimeout(() => setAnimatedFill(targetFill), 120);
        return () => clearTimeout(t);
    }, [targetFill]);

    const color =
        score <= 40 ? "#EF4444" :
        score <= 65 ? "#D97706" :
        score <= 85 ? "#2563EB" : "#171717";

    const statusLabel =
        score <= 40 ? "CRITICAL GAP" :
        score <= 65 ? "DEVELOPING" :
        score <= 85 ? "ADVANCING" : "AI-NATIVE";

    // Arc endpoints sit at y = cy + r*sin(45°) ≈ cy + 0.276*size.
    // With strokeWidth sw = 0.07*size, arc bottom edge = cy + 0.311*size.
    // Status label is placed at cy + 0.44*size (baseline) — well below the arc.
    // SVG height is extended to size * 1.20 to contain the label without clipping.
    const svgHeight = size * 1.20;

    return (
        <svg
            width={size}
            height={svgHeight}
            viewBox={`0 0 ${size} ${svgHeight}`}
            aria-label={`AI Readiness Score: ${score} out of 100`}
        >
            {/* Track */}
            <circle
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke="rgba(0,0,0,0.08)"
                strokeWidth={sw}
                strokeDasharray={`${arcLength} ${circumference - arcLength}`}
                strokeLinecap="round"
                transform={`rotate(135, ${cx}, ${cy})`}
            />
            {/* Filled arc */}
            <circle
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={color}
                strokeWidth={sw}
                strokeDasharray={`${animatedFill} ${circumference - animatedFill}`}
                strokeLinecap="round"
                transform={`rotate(135, ${cx}, ${cy})`}
                style={{ transition: "stroke-dasharray 1.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}
            />
            {/* Score number */}
            <text
                x={cx} y={cy + size * 0.07}
                textAnchor="middle"
                fill="black"
                fontSize={size * 0.26}
                fontWeight="900"
                fontFamily="ui-monospace, 'SF Mono', monospace"
                style={{ letterSpacing: "-1px" }}
            >
                {score}
            </text>
            {/* /100 */}
            <text
                x={cx} y={cy + size * 0.20}
                textAnchor="middle"
                fill="rgba(0,0,0,0.35)"
                fontSize={size * 0.07}
                fontFamily="ui-monospace, monospace"
            >
                /100
            </text>
            {/* Status label — below the arc endpoints with clear padding */}
            <text
                x={cx} y={cy + size * 0.44}
                textAnchor="middle"
                fill={color}
                fontSize={size * 0.05}
                fontFamily="ui-monospace, monospace"
                fontWeight="700"
                letterSpacing="3"
            >
                {statusLabel}
            </text>
        </svg>
    );
}
