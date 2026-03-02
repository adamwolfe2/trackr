"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface TrendDataPoint {
    date: string;
    count: number;
}

interface AdminTrendChartProps {
    data: TrendDataPoint[];
}

export function AdminTrendChart({ data }: AdminTrendChartProps) {
    return (
        <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#e5e5e5" vertical={false} />
                <XAxis
                    dataKey="date"
                    tick={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 9, fill: "#a3a3a3" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                />
                <YAxis
                    tick={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 9, fill: "#a3a3a3" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                />
                <Tooltip
                    contentStyle={{
                        fontFamily: "var(--font-geist-mono, monospace)",
                        fontSize: "10px",
                        border: "1px solid #000",
                        borderRadius: 0,
                        background: "#fff",
                    }}
                    labelFormatter={(label) => label}
                    formatter={(value: number | undefined) => [value ?? 0, "new workspaces"]}
                />
                <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#000000"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3, fill: "#000" }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
