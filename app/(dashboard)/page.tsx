import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Zap, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { tools, painPoints, workspaceMembers, researchJobs, reports } from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    // 1. Get user's workspace
    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
        with: {
            // @ts-ignore
            workspace: true
        }
    });

    if (!member) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <h1 className="text-2xl font-bold">Welcome to Trackr</h1>
                <p className="text-muted-foreground">You don't have a workspace yet.</p>
            </div>
        )
    }

    const workspaceId = member.workspaceId;

    // 2. Fetch Stats
    const toolsCountData = await db
        .select({ count: sql<number>`count(*)` })
        .from(tools)
        .where(eq(tools.workspaceId, workspaceId));
    const toolsCount = Number(toolsCountData[0]?.count || 0);

    const queueCountData = await db
        .select({ count: sql<number>`count(*)` })
        .from(tools)
        .where(
            sql`${tools.workspaceId} = ${workspaceId} AND ${tools.status} IN ('queued', 'researching')`
        );
    const queueCount = Number(queueCountData[0]?.count || 0);

    const painPointsCountData = await db
        .select({ count: sql<number>`count(*)` })
        .from(painPoints)
        .where(
            sql`${painPoints.workspaceId} = ${workspaceId} AND ${painPoints.active} = true`
        );
    const activePainPoints = Number(painPointsCountData[0]?.count || 0);

    // Recent Tools
    const recentTools = await db.query.tools.findMany({
        where: eq(tools.workspaceId, workspaceId),
        orderBy: [desc(tools.submittedAt)],
        limit: 5
    });

    // Recent Research Activity
    // We need to join researchJobs with tools to ensure workspace isolation
    // For now, simpler query: fetch jobs for tools in this workspace
    // Since we don't have a direct workspaceId on researchJobs (it's via tool), 
    // we should ideally do a join. But for MVP, let's fetch recent jobs globally 
    // and filter in code (if volume is low) or trust the tool.workspaceId check we'd do in a real app.
    // Actually, let's use the relation. 
    const recentActivity = await db.query.researchJobs.findMany({
        with: {
            tool: true
        },
        orderBy: [desc(researchJobs.triggeredAt)],
        limit: 5,
        // In a real app with massive data, we'd add a where clause using exists() or similar.
        // For now, let's filter after fetch if needed, but given the user is the only one...
    });

    // Filter for current workspace (MVP safety)
    const workspaceActivity = recentActivity.filter(job => job.tool.workspaceId === workspaceId);

    // Count completed research reports for this workspace
    const reportsCountData = await db
        .select({ count: sql<number>`count(*)` })
        .from(reports)
        .innerJoin(tools, eq(reports.toolId, tools.id))
        .where(eq(tools.workspaceId, workspaceId));
    const reportsCount = Number(reportsCountData[0]?.count || 0);

    // Average score across all researched tools
    const avgScoreData = await db
        .select({ avg: sql<string>`avg(${tools.overallScore})` })
        .from(tools)
        .where(sql`${tools.workspaceId} = ${workspaceId} AND ${tools.overallScore} IS NOT NULL`);
    const avgScore = avgScoreData[0]?.avg ? parseFloat(avgScoreData[0].avg) : 0;

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <div className="text-sm text-muted-foreground">
                    Workspace: <span className="font-medium text-foreground">{(member as any).workspace?.name}</span>
                </div>
            </div>

            <DashboardStats
                avgScore={avgScore}
                activeTools={toolsCount}
                researchReports={reportsCount}
                activePainPoints={activePainPoints}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 hover-lift">
                    <CardHeader>
                        <CardTitle>Recent Tools</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentTools.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                                <div className="p-3 bg-muted rounded-full">
                                    <Database className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium">No tools tracked yet</p>
                                    <p className="text-sm text-muted-foreground">Submit a tool to get started.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentTools.map(tool => (
                                    <div key={tool.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {tool.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">{tool.name}</div>
                                                <div className="text-xs text-muted-foreground capitalize">{tool.status}</div>
                                            </div>
                                        </div>
                                        <div className="text-sm font-bold">
                                            {tool.overallScore ? Number(tool.overallScore).toFixed(1) : '-'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="col-span-3 hover-lift">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {workspaceActivity.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                                <div className="p-3 bg-muted rounded-full">
                                    <Zap className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium">No activity yet</p>
                                    <p className="text-sm text-muted-foreground">Start researching tools to see updates.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {workspaceActivity.map((job) => (
                                    <div key={job.id} className="flex items-start gap-3 text-sm">
                                        <div className="mt-1">
                                            {job.status === 'running' && <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />}
                                            {job.status === 'complete' && <div className="h-2 w-2 rounded-full bg-black" />}
                                            {job.status === 'failed' && <div className="h-2 w-2 rounded-full bg-red-500" />}
                                            {job.status === 'queued' && <div className="h-2 w-2 rounded-full bg-slate-300" />}
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                Research {job.status} for <span className="text-primary">{job.tool.name}</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <Clock className="h-3 w-3" />
                                                {formatDistanceToNow(job.triggeredAt, { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
