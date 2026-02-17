"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

// Mock data
const initialPainPoints = [
    { id: "1", title: "Automate outbound sales", category: "Revenue", active: true },
    { id: "2", title: "Monitor brand mentions on Reddit", category: "Marketing", active: true },
    { id: "3", title: "Reduce AWS costs using AI", category: "Engineering", active: false },
];

export function PainPointsClient() {
    const [painPoints, setPainPoints] = useState(initialPainPoints);
    const [newPoint, setNewPoint] = useState("");

    const handleAdd = () => {
        if (!newPoint.trim()) return;
        setPainPoints([...painPoints, {
            id: Math.random().toString(),
            title: newPoint,
            category: "General",
            active: true
        }]);
        setNewPoint("");
    };

    const toggleActive = (id: string) => {
        setPainPoints(painPoints.map(p => p.id === id ? { ...p, active: !p.active } : p));
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Pain Points</h1>
                <p className="text-sm text-muted-foreground">Define what problems you are looking to solve.</p>
                {/* Export button removed for simplicity or added later */}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Pain Points</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add a new pain point (e.g., 'Automate invoice processing')..."
                            value={newPoint}
                            onChange={(e) => setNewPoint(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        />
                        <Button onClick={handleAdd}><Plus className="h-4 w-4 mr-2" /> Add</Button>
                    </div>

                    <div className="grid gap-3">
                        {painPoints.map((point) => (
                            <div key={point.id} className={`p-4 rounded-lg border flex items-center justify-between transition-all ${point.active ? 'bg-card' : 'bg-muted/50 opacity-60'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${point.active ? 'bg-green-500' : 'bg-slate-300'}`} />
                                    <span className="font-medium">{point.title}</span>
                                    <Badge variant="outline" className="text-xs font-normal">{point.category}</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => toggleActive(point.id)}>
                                        {point.active ? 'Deactivate' : 'Activate'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
