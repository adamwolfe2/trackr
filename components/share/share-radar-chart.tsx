"use client";

import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

export function ShareRadarChart({ snapshot }: {
    snapshot: Record<string, { score: number; justification: string }>;
}) {
    const data = Object.entries(snapshot).map(([key, value]) => ({
        dimension: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        score: value.score,
        fullMark: 10,
    }));

    return (
        <div className="mb-6 border border-black p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-3">7-Dimension Radar</p>
            <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                    <PolarGrid stroke="#e5e5e5" />
                    <PolarAngleAxis
                        dataKey="dimension"
                        tick={{ fontFamily: "monospace", fontSize: 9, fill: "#737373" }}
                    />
                    <Radar
                        name="Score"
                        dataKey="score"
                        stroke="#000000"
                        fill="#000000"
                        fillOpacity={0.12}
                        strokeWidth={1.5}
                    />
                    <Tooltip
                        contentStyle={{
                            fontFamily: "monospace",
                            fontSize: "10px",
                            border: "1px solid #000",
                            borderRadius: 0,
                            background: "#fff",
                        }}
                        formatter={(value: number | undefined) => [`${value ?? 0}/10`, "Score"]}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
