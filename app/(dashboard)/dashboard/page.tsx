import { Clock } from "lucide-react";
import { db } from "@/lib/db";
import { tools, painPoints, workspaceMembers, workspaces, researchJobs, reports, softwareSpend } from "@/lib/db/schema";
import { eq, sql, desc, inArray } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { computeStackInsights } from "@/lib/utils/stack-insights";
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

    const stackEntries = await db.query.softwareSpend.findMany({
        where: eq(softwareSpend.workspaceId, workspaceId),
    });
    const stackInsights = computeStackInsights(stackEntries);

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

    // Use JOIN to get recent activity scoped to workspace (avoids N+1)
    const workspaceActivity = await db.query.researchJobs.findMany({
        with: { tool: { columns: { name: true, id: true } } },
        where: inArray(
            researchJobs.toolId,
            db.select({ id: tools.id }).from(tools).where(eq(tools.workspaceId, workspaceId))
        ),
        orderBy: [desc(researchJobs.triggeredAt)],
        limit: 5,
    });

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

            {/* AI Nativeness Score Card */}
            {stackEntries.length === 0 ? (
                <div className="border border-black p-5 flex items-center justify-between gap-4">
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">AI Nativeness Score</p>
                        <p className="font-mono text-sm text-neutral-600">
                            Import your stack to see your AI Intelligence score →{" "}
                            <Link href="/stack" className="underline hover:text-black">Add Stack</Link>
                        </p>
                    </div>
                </div>
            ) : (
                <div className="border border-black p-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-3">AI Nativeness Score</p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                        <div className="flex items-end gap-1">
                            <span className="font-serif text-4xl font-normal leading-none">{stackInsights.score}</span>
                            <span className="font-mono text-sm text-neutral-400 mb-0.5">/100</span>
                        </div>
                        <div>
                            <span className="font-mono text-sm font-semibold uppercase tracking-wide">{stackInsights.label}</span>
                            <span className="font-mono text-xs text-neutral-400 ml-2">·</span>
                            <span className="font-mono text-xs text-neutral-500 ml-2">{stackInsights.benchmarkText}</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2">
                        {stackInsights.timeSavedPerMonth > 0 && (
                            <span className="font-mono text-xs text-neutral-500">
                                ~{Math.round(stackInsights.timeSavedPerMonth)} hrs/mo saved
                            </span>
                        )}
                        {stackInsights.dollarValueSaved > 0 && (
                            <span className="font-mono text-xs text-neutral-500">
                                ${stackInsights.dollarValueSaved >= 1000
                                    ? `${Math.round(stackInsights.dollarValueSaved / 1000)}k`
                                    : Math.round(stackInsights.dollarValueSaved)} annual value
                            </span>
                        )}
                        {stackInsights.opportunities.length > 0 && (
                            <span className="font-mono text-xs text-neutral-500">
                                {stackInsights.opportunities.length} opportunit{stackInsights.opportunities.length === 1 ? "y" : "ies"} to improve your AI stack
                            </span>
                        )}
                        <Link href="/stack" className="font-mono text-xs underline hover:text-neutral-600">
                            View Stack →
                        </Link>
                    </div>
                </div>
            )}

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                {/* Recent Tools */}
                <div className="lg:col-span-4 border border-black">
                    <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                        <h2 className="font-mono text-xs uppercase tracking-widest">Recent Tools</h2>
                        {recentTools.length > 0 && (
                            <Link href="/tools" className="font-mono text-[10px] text-neutral-400 hover:text-black transition-colors">
                                View all →
                            </Link>
                        )}
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
                <div className="lg:col-span-3 border border-black">
                    <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                        <h2 className="font-mono text-xs uppercase tracking-widest">Recent Activity</h2>
                        {workspaceActivity.length > 0 && (
                            <Link href="/queue" className="font-mono text-[10px] text-neutral-400 hover:text-black transition-colors">
                                View all →
                            </Link>
                        )}
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
