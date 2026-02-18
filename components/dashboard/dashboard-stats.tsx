"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, FileText, Star, AlertCircle } from "lucide-react";

export function DashboardStats({
    avgScore = 0,
    activeTools = 0,
    researchReports = 0,
    activePainPoints = 0
}: {
    avgScore?: number;
    activeTools?: number;
    researchReports?: number;
    activePainPoints?: number;
}) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Tool Score</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {avgScore > 0 ? avgScore.toFixed(1) : "—"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        across all researched tools
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tools</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeTools}</div>
                    <p className="text-xs text-muted-foreground">
                        in your workspace
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Research Reports</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{researchReports}</div>
                    <p className="text-xs text-muted-foreground">
                        reports generated
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Pain Points</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activePainPoints}</div>
                    <p className="text-xs text-muted-foreground">
                        problems being tracked
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
