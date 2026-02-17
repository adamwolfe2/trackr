"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Default weights
const initialWeights = {
    featureFit: 25,
    easeOfUse: 15,
    integrationDepth: 20,
    pricingValue: 15,
    companyMaturity: 10,
    aiAutomationDepth: 10,
    communitySignal: 5,
};

const COLORS = ["#000000", "#333333", "#555555", "#777777", "#999999", "#bbbbbb", "#dddddd"];

export function ScorecardClient() {
    const [weights, setWeights] = useState(initialWeights);
    const [total, setTotal] = useState(100);

    useEffect(() => {
        const sum = Object.values(weights).reduce((a, b) => a + b, 0);
        setTotal(sum);
    }, [weights]);

    const handleSliderChange = (key: string, value: number[]) => {
        setWeights(prev => ({ ...prev, [key]: value[0] }));
    };

    const chartData = Object.entries(weights).map(([key, value]) => ({
        name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        value
    }));

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Scorecard Configuration</h1>
                    <p className="text-sm text-muted-foreground">Adjust how the AI agent scores tools for your workspace.</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className={`text-sm font-medium ${total !== 100 ? 'text-red-500' : 'text-green-600'}`}>
                        Total Weight: {total}%
                    </span>
                    <Button disabled={total !== 100}>Save Changes</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Scoring Dimensions</CardTitle>
                        <CardDescription>Drag sliders to adjust importance.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {Object.entries(weights).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                                <div className="flex justify-between">
                                    <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                                    <span className="text-sm font-medium">{value}%</span>
                                </div>
                                <Slider
                                    defaultValue={[value]}
                                    max={50}
                                    step={5}
                                    onValueChange={(val) => handleSliderChange(key, val)}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
