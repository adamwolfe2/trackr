import { Clock } from "lucide-react";
import { db } from "@/lib/db";
import { tools, painPoints, workspaceMembers, workspaces, researchJobs, reports } from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import type { Metadata } from "next";

type MemberWithWorkspace = InferSelectModel<typeof workspaceMembers> & {
    workspace: InferSelectModel<typeof workspaces>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Dashboard — Trackr",
    description: "Your AI tool research overview and workspace activity.",
};

export default async function DashboardPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
        with: { workspace: true },
    }) as MemberWithWorkspace | undefined;

    if (!member) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <h1 className="font-serif text-3xl">Welcome to Trackr</h1>
                <p className="font-mono text-sm text-neutral-500">You don&apos;t have a workspace yet.</p>
            </div>
        );
    }

    const workspaceId = member.workspaceId;

    const toolsCountData = await db
        .select({ count: sql<number>`count(*)` })
        .from(tools)
        .where(eq(tools.workspaceId, workspaceId));
    const toolsCount = Number(toolsCountData[0]?.count || 0);

    const painPointsCountData = await db
        .select({ count: sql<number>`count(*)` })
        .from(painPoints)
        .where(sql`${painPoints.workspaceId} = ${workspaceId} AND ${painPoints.active} = true`);
    const activePainPoints = Number(painPointsCountData[0]?.count || 0);

    const recentTools = await db.query.tools.findMany({
        where: eq(tools.workspaceId, workspaceId),
        orderBy: [desc(tools.submittedAt)],
        limit: 5,
    });

    const recentActivity = await db.query.researchJobs.findMany({
        with: { tool: true },
        orderBy: [desc(researchJobs.triggeredAt)],
        limit: 10,
    });
    const workspaceActivity = recentActivity.filter(job => job.tool.workspaceId === workspaceId).slice(0, 5);

    const reportsCountData = await db
        .select({ count: sql<number>`count(*)` })
        .from(reports)
        .innerJoin(tools, eq(reports.toolId, tools.id))
        .where(eq(tools.workspaceId, workspaceId));
    const reportsCount = Number(reportsCountData[0]?.count || 0);

    const avgScoreData = await db
        .select({ avg: sql<string>`avg(${tools.overallScore})` })
        .from(tools)
        .where(sql`${tools.workspaceId} = ${workspaceId} AND ${tools.overallScore} IS NOT NULL`);
    const avgScore = avgScoreData[0]?.avg ? parseFloat(avgScoreData[0].avg) : 0;

    const statusLabel = (status: string) => {
        const map: Record<string, string> = {
            complete: "DONE",
            running: "RUNNING",
            failed: "FAILED",
            queued: "QUEUED",
        };
        return map[status] ?? status.toUpperCase();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="font-serif text-3xl font-normal">Dashboard</h1>
                <span className="font-mono text-xs text-neutral-400">
                    {member.workspace.name}
                </span>
            </div>

            <DashboardStats
                avgScore={avgScore}
                activeTools={toolsCount}
                researchReports={reportsCount}
                activePainPoints={activePainPoints}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Tools */}
                <div className="col-span-4 border border-black">
                    <div className="border-b border-black px-5 py-3">
                        <h2 className="font-mono text-xs uppercase tracking-widest">Recent Tools</h2>
                    </div>
                    <div className="p-4">
                        {recentTools.length === 0 ? (
                            <div className="py-10 text-center">
                                <p className="font-mono text-sm text-neutral-400">No tools tracked yet.</p>
                                <Link href="/submit" className="font-mono text-xs text-black underline mt-1 inline-block">Submit a tool →</Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-neutral-100">
                                {recentTools.map(tool => (
                                    <Link key={tool.id} href={`/tools/${tool.id}`} className="flex items-center justify-between py-3 hover:bg-[#F8F8F5] -mx-2 px-2 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-7 w-7 border border-black flex items-center justify-center font-mono text-xs font-bold flex-shrink-0">
                                                {tool.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-mono text-sm font-medium">{tool.name}</div>
                                                <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">{tool.status}</div>
                                            </div>
                                        </div>
                                        <div className="font-mono text-sm font-bold text-neutral-700">
                                            {tool.overallScore ? Number(tool.overallScore).toFixed(1) : "—"}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="col-span-3 border border-black">
                    <div className="border-b border-black px-5 py-3">
                        <h2 className="font-mono text-xs uppercase tracking-widest">Recent Activity</h2>
                    </div>
                    <div className="p-4">
                        {workspaceActivity.length === 0 ? (
                            <div className="py-10 text-center">
                                <p className="font-mono text-sm text-neutral-400">No activity yet.</p>
                                <p className="font-mono text-[10px] text-neutral-400 mt-1">Research a tool to see updates here.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {workspaceActivity.map((job) => (
                                    <div key={job.id} className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="font-mono text-xs">
                                                <Link href={`/tools/${job.toolId}`} className="font-medium hover:underline">{job.tool.name}</Link>
                                            </div>
                                            <div className="font-mono text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                                                <Clock className="h-2.5 w-2.5" />
                                                {formatDistanceToNow(job.triggeredAt, { addSuffix: true })}
                                            </div>
                                        </div>
                                        <span className={`font-mono text-[10px] uppercase border px-1.5 py-0.5 flex-shrink-0 ${
                                            job.status === "complete" ? "border-black text-black" :
                                            job.status === "running" ? "border-neutral-400 text-neutral-600" :
                                            job.status === "failed" ? "border-red-500 text-red-500" :
                                            "border-neutral-200 text-neutral-400"
                                        }`}>
                                            {statusLabel(job.status)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
