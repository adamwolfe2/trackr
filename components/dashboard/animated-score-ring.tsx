"use client";

import { useEffect, useState } from "react";

interface AnimatedScoreRingProps {
    score: number;
    size?: number;
}

export function AnimatedScoreRing({ score, size = 160 }: AnimatedScoreRingProps) {
    const radius = size * 0.4375; // ~70 when size=160
    const circumference = 2 * Math.PI * radius;
    const color = score >= 70 ? "black" : score >= 40 ? "#737373" : "#a3a3a3";

    const [strokeDashoffset, setStrokeDashoffset] = useState(circumference);

    useEffect(() => {
        const t = setTimeout(() => {
            setStrokeDashoffset(circumference - (score / 100) * circumference);
        }, 150);
        return () => clearTimeout(t);
    }, [score, circumference]);

    return (
        <div className="relative mx-auto" style={{ width: size, height: size }}>
            <svg
                className="-rotate-90"
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#e5e5e5"
                    strokeWidth={size * 0.0375}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={size * 0.0375}
                    strokeLinecap="square"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-serif text-5xl font-normal">{score}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mt-1">
                    / 100
                </span>
            </div>
        </div>
    );
}
