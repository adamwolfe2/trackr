import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Database, ListChecks, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover-lift transition-all duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Tools Researched
                        </CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">
                            +2 from last week
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover-lift transition-all duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Avg Score
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">7.8</div>
                        <p className="text-xs text-muted-foreground">
                            +0.2 from last week
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover-lift transition-all duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Research Queue</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">
                            Run all pending
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover-lift transition-all duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Pain Points
                        </CardTitle>
                        <ListChecks className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">8</div>
                        <p className="text-xs text-muted-foreground">
                            4 high priority
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 hover-lift">
                    <CardHeader>
                        <CardTitle>Recent Tools</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                            <div className="p-3 bg-muted rounded-full">
                                <Database className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-medium">No tools researched</p>
                                <p className="text-sm text-muted-foreground">Your recent analysis will appear here.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 hover-lift">
                    <CardHeader>
                        <CardTitle>Suggested Tools</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                            <div className="p-3 bg-muted rounded-full">
                                <Zap className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-medium">Discovery Inactive</p>
                                <p className="text-sm text-muted-foreground">Enable discovery to find new tools.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
