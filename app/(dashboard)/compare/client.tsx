"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowRightLeft, Plus, ExternalLink } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

interface CompareTool {
    id: string;
    name: string;
    score: number | null;
    websiteUrl: string | null;
    status: string;
    pros: string[];
    cons: string[];
    pricing: any;
    features: any;
    summary: string | null;
}

interface CompareClientProps {
    tools: CompareTool[];
}

export function CompareClient({ tools }: CompareClientProps) {
    const [selectedToolIds, setSelectedToolIds] = useState<(string | null)[]>([null, null]);

    const handleToolSelect = (index: number, toolId: string) => {
        const newSelection = [...selectedToolIds];
        newSelection[index] = toolId;
        setSelectedToolIds(newSelection);
    };

    const selectedTools = selectedToolIds.map(id => id ? tools.find(t => t.id === id) ?? null : null);

    const getPricingText = (pricing: any): string => {
        if (!pricing) return "Unknown";
        if (typeof pricing === "string") return pricing;
        if (Array.isArray(pricing) && pricing.length > 0) {
            return pricing[0]?.price ?? pricing[0]?.tier ?? "See website";
        }
        return "See website";
    };

    const getFeaturesList = (features: any): string[] => {
        if (!features) return [];
        if (Array.isArray(features)) return features.slice(0, 5);
        if (typeof features === "object" && "list" in features && Array.isArray(features.list)) {
            return features.list.slice(0, 5);
        }
        return [];
    };

    if (tools.length === 0) {
        return (
            <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center gap-2">
                    <ArrowRightLeft className="h-6 w-6" />
                    <h1 className="text-2xl font-bold tracking-tight">Compare Tools</h1>
                </div>
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl space-y-4">
                    <div className="p-4 bg-muted rounded-full">
                        <ArrowRightLeft className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">No tools to compare</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Submit and research at least 2 tools to start comparing them side by side.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/submit">Submit a Tool</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const noneSelected = selectedTools.every(t => !t);

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <ArrowRightLeft className="h-6 w-6" />
                    Compare Tools
                </h1>
            </div>

            {noneSelected && (
                <div className="p-4 border rounded-lg bg-muted/30 text-sm text-muted-foreground text-center">
                    Select 2 tools from your workspace to compare them side by side.
                </div>
            )}

            <div className="overflow-x-auto pb-4">
                <div className="min-w-[800px] grid grid-cols-3 gap-4">
                    {/* Row Headers */}
                    <div className="space-y-4 pt-16">
                        <div className="h-10 flex items-center font-medium text-muted-foreground">Overall Score</div>
                        <div className="h-10 flex items-center font-medium text-muted-foreground">Pricing</div>
                        <div className="h-10 flex items-center font-medium text-muted-foreground">Summary</div>
                        <div className="h-auto min-h-[100px] font-medium text-muted-foreground">Pros</div>
                        <div className="h-auto min-h-[100px] font-medium text-muted-foreground">Cons</div>
                        <div className="h-auto font-medium text-muted-foreground">Features</div>
                    </div>

                    {/* Tool Columns */}
                    {[0, 1].map((index) => {
                        const tool = selectedTools[index];
                        const featuresList = tool ? getFeaturesList(tool.features) : [];

                        return (
                            <div key={index} className="space-y-4">
                                {/* Tool Selector */}
                                <Card className="border-2 border-transparent hover:border-border transition-colors">
                                    <CardContent className="p-4">
                                        <Select
                                            value={selectedToolIds[index] ?? ""}
                                            onValueChange={(val) => handleToolSelect(index, val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select tool..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tools.map(t => (
                                                    <SelectItem
                                                        key={t.id}
                                                        value={t.id}
                                                        disabled={selectedToolIds.includes(t.id) && selectedToolIds[index] !== t.id}
                                                    >
                                                        {t.name}
                                                        {t.score !== null && (
                                                            <span className="ml-2 text-muted-foreground">({t.score.toFixed(1)})</span>
                                                        )}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {tool?.websiteUrl && (
                                            <a
                                                href={tool.websiteUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:underline"
                                            >
                                                {new URL(tool.websiteUrl).hostname}
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </CardContent>
                                </Card>

                                {tool ? (
                                    <>
                                        {/* Score */}
                                        <div className="h-10 flex items-center">
                                            {tool.score !== null ? (
                                                <Badge
                                                    variant="outline"
                                                    className={`text-lg font-bold ${tool.score >= 8 ? 'bg-green-50 text-green-700 border-green-200' : tool.score >= 6 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                                                >
                                                    {tool.score.toFixed(1)}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-sm italic">No score yet</span>
                                            )}
                                        </div>

                                        {/* Pricing */}
                                        <div className="h-10 flex items-center text-sm">
                                            {getPricingText(tool.pricing)}
                                        </div>

                                        {/* Summary */}
                                        <div className="h-10 flex items-center">
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {tool.summary || <span className="italic">No summary yet</span>}
                                            </p>
                                        </div>

                                        {/* Pros */}
                                        <div className="min-h-[100px] p-4 bg-green-50/50 rounded-lg text-sm">
                                            {tool.pros.length > 0 ? (
                                                <ul className="list-disc pl-4 space-y-1">
                                                    {tool.pros.map((p, i) => <li key={i}>{p}</li>)}
                                                </ul>
                                            ) : (
                                                <p className="text-muted-foreground italic text-xs">No pros listed</p>
                                            )}
                                        </div>

                                        {/* Cons */}
                                        <div className="min-h-[100px] p-4 bg-red-50/50 rounded-lg text-sm">
                                            {tool.cons.length > 0 ? (
                                                <ul className="list-disc pl-4 space-y-1">
                                                    {tool.cons.map((c, i) => <li key={i}>{c}</li>)}
                                                </ul>
                                            ) : (
                                                <p className="text-muted-foreground italic text-xs">No cons listed</p>
                                            )}
                                        </div>

                                        {/* Features */}
                                        <div className="space-y-2">
                                            {featuresList.length > 0 ? (
                                                featuresList.map((feat, i) => (
                                                    <div key={i} className="flex justify-between items-center border-b pb-2 last:border-0">
                                                        <span className="text-sm text-muted-foreground">{feat}</span>
                                                        <Check className="h-4 w-4 text-green-600 shrink-0" />
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-muted-foreground italic text-xs">No features extracted</p>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-[340px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                                        <div className="text-center space-y-2">
                                            <Plus className="h-8 w-8 opacity-50 mx-auto" />
                                            <p className="text-xs">Select a tool above</p>
                                        </div>
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
