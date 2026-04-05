"use client";

import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

type ScorecardSnapshot = Record<string, { score: number; justification: string }>;

export default function ScoreRadar({ scorecardSnapshot }: { scorecardSnapshot: ScorecardSnapshot }) {
    const data = Object.entries(scorecardSnapshot).map(([key, value]) => ({
        dimension: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        score: value.score,
        fullMark: 10,
    }));

    return (
        <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#e5e5e5" />
                <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 9, fill: "#737373" }}
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
                        fontFamily: "var(--font-geist-mono, monospace)",
                        fontSize: "10px",
                        border: "1px solid #000",
                        borderRadius: 0,
                        background: "#fff",
                    }}
                    formatter={(value: number | undefined) => [`${value ?? 0}/10`, "Score"]}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
}
