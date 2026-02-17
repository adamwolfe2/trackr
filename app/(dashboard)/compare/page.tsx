"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowRightLeft, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data for comparison
const tools = [
    {
        id: "1",
        name: "Linear",
        score: 9.2,
        pricing: "$10/user/mo",
        pros: ["Fast UI", "Keyboard shortcuts", "Git integration"],
        cons: ["Steep learning curve", "Limited customization"],
        features: { "API": true, "Mobile App": true, "Sso": true }
    },
    {
        id: "2",
        name: "Jira",
        score: 7.5,
        pricing: "$7.50/user/mo",
        pros: ["Infinite customization", "Enterprise scale", "Huge marketplace"],
        cons: ["Slow", "Cluttered UI", "Complex config"],
        features: { "API": true, "Mobile App": true, "Sso": true }
    },
    {
        id: "3",
        name: "ClickUp",
        score: 8.0,
        pricing: "$7/user/mo",
        pros: ["All-in-one", "Flexible", "Good docs"],
        cons: ["Buggy", "Overwhelming features"],
        features: { "API": true, "Mobile App": true, "Sso": false }
    }
];

export default function ComparePage() {
    const [selectedToolIds, setSelectedToolIds] = useState<string[]>(["1", "2"]);

    const handleToolSelect = (index: number, toolId: string) => {
        const newSelection = [...selectedToolIds];
        newSelection[index] = toolId;
        setSelectedToolIds(newSelection);
    };

    const selectedTools = selectedToolIds.map(id => tools.find(t => t.id === id)).filter(Boolean);

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <ArrowRightLeft className="h-6 w-6" />
                    Compare Tools
                </h1>
            </div>

            <div className="overflow-x-auto pb-4">
                <div className="min-w-[800px] grid grid-cols-3 gap-4">
                    {/* Row Headers */}
                    <div className="space-y-4 pt-16">
                        <div className="h-10 flex items-center font-medium text-muted-foreground">Overall Score</div>
                        <div className="h-10 flex items-center font-medium text-muted-foreground">Pricing</div>
                        <div className="h-auto min-h-[100px] font-medium text-muted-foreground">Pros</div>
                        <div className="h-auto min-h-[100px] font-medium text-muted-foreground">Cons</div>
                        <div className="h-auto font-medium text-muted-foreground">Features</div>
                    </div>

                    {/* Tool Columns */}
                    {[0, 1].map((index) => {
                        const tool = selectedTools[index];
                        return (
                            <div key={index} className="space-y-4">
                                {/* Tool Selector */}
                                <Card className="border-2 border-transparent hover:border-border transition-colors">
                                    <CardContent className="p-4">
                                        <Select value={selectedToolIds[index]} onValueChange={(val) => handleToolSelect(index, val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select tool" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tools.map(t => (
                                                    <SelectItem key={t.id} value={t.id} disabled={selectedToolIds.includes(t.id) && selectedToolIds[index] !== t.id}>
                                                        {t.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </CardContent>
                                </Card>

                                {tool ? (
                                    <>
                                        <div className="h-10 flex items-center">
                                            <Badge variant="outline" className={`text-lg font-bold ${tool.score > 8 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                                {tool.score}
                                            </Badge>
                                        </div>
                                        <div className="h-10 flex items-center">
                                            {tool.pricing}
                                        </div>
                                        <div className="min-h-[100px] p-4 bg-green-50/50 rounded-lg text-sm">
                                            <ul className="list-disc pl-4 space-y-1">
                                                {tool.pros.map(p => <li key={p}>{p}</li>)}
                                            </ul>
                                        </div>
                                        <div className="min-h-[100px] p-4 bg-red-50/50 rounded-lg text-sm">
                                            <ul className="list-disc pl-4 space-y-1">
                                                {tool.cons.map(c => <li key={c}>{c}</li>)}
                                            </ul>
                                        </div>
                                        <div className="space-y-2">
                                            {Object.entries(tool.features).map(([key, has]) => (
                                                <div key={key} className="flex justify-between items-center border-b pb-2 last:border-0">
                                                    <span className="text-sm text-muted-foreground">{key}</span>
                                                    {has ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-600" />}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                                        <Plus className="h-8 w-8 opacity-50" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
