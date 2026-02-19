export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { db } from "@/lib/db";

export const metadata: Metadata = {
    title: "Research Queue — Trackr",
    description: "Track active and pending tool research jobs.",
};
import { researchJobs, tools } from "@/lib/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkspaceId } from "@/lib/actions/tools";
import Link from "next/link";
import { QueueAutoRefresh } from "@/components/queue/queue-auto-refresh";

export default async function QueuePage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) redirect("/onboarding");

    // Get tools for this workspace, join with research jobs
    const workspaceTools = await db.query.tools.findMany({
        where: eq(tools.workspaceId, workspaceId),
        columns: { id: true },
    });
    const toolIds = workspaceTools.map((t) => t.id);

    const jobs = toolIds.length > 0
        ? await db.query.researchJobs.findMany({
            where: inArray(researchJobs.toolId, toolIds),
            with: { tool: { columns: { id: true, name: true, websiteUrl: true } } },
            orderBy: [desc(researchJobs.triggeredAt)],
            limit: 50,
        })
        : [];

    const runningCount = jobs.filter((j) => j.status === "running").length;
    const completedCount = jobs.filter((j) => j.status === "complete").length;
    const failedCount = jobs.filter((j) => j.status === "failed").length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-serif font-normal">Research Queue</h1>
                        <QueueAutoRefresh runningCount={runningCount} />
                    </div>
                    <p className="font-mono text-sm text-neutral-500 mt-1">Track all research runs for your workspace.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="border border-black px-4 py-2 text-center flex-1 sm:flex-initial">
                        <div className="font-mono text-[10px] sm:text-xs text-neutral-500 uppercase tracking-widest">Running</div>
                        <div className={`text-xl font-serif ${runningCount > 0 ? "text-black" : "text-neutral-400"}`}>{runningCount}</div>
                    </div>
                    <div className="border border-black px-4 py-2 text-center flex-1 sm:flex-initial">
                        <div className="font-mono text-[10px] sm:text-xs text-neutral-500 uppercase tracking-widest">Done</div>
                        <div className="text-xl font-serif text-black">{completedCount}</div>
                    </div>
                    <div className="border border-black px-4 py-2 text-center flex-1 sm:flex-initial">
                        <div className="font-mono text-[10px] sm:text-xs text-neutral-500 uppercase tracking-widest">Failed</div>
                        <div className={`text-xl font-serif ${failedCount > 0 ? "text-red-600" : "text-neutral-400"}`}>{failedCount}</div>
                    </div>
                </div>
            </div>

            <div className="border border-black divide-y divide-black/10">
                {jobs.length === 0 ? (
                    <div className="py-16 text-center">
                        <Clock className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
                        <p className="font-mono text-sm text-neutral-500">No research jobs yet.</p>
                        <p className="font-mono text-xs text-neutral-400 mt-1">
                            Submit a tool from{" "}
                            <Link href="/submit" className="underline hover:text-black">
                                /submit
                            </Link>{" "}
                            to start a research run.
                        </p>
                    </div>
                ) : (
                    jobs.map((job) => (
                        <div key={job.id} className="flex items-center justify-between px-4 sm:px-5 py-4 hover:bg-black/[0.02] transition-colors gap-3">
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                <div className="w-6 flex justify-center">
                                    {job.status === "running" && <Loader2 className="h-4 w-4 animate-spin text-neutral-600" />}
                                    {job.status === "queued" && <Clock className="h-4 w-4 text-neutral-400" />}
                                    {job.status === "complete" && <CheckCircle2 className="h-4 w-4 text-black" />}
                                    {job.status === "failed" && <XCircle className="h-4 w-4 text-red-500" />}
                                </div>
                                <div className="min-w-0">
                                    <Link href={`/tools/${job.toolId}`} className="font-mono text-sm font-medium hover:underline truncate block">
                                        {job.tool.name}
                                    </Link>
                                    <div className="font-mono text-xs text-neutral-400 mt-0.5 truncate">
                                        {formatDistanceToNow(job.triggeredAt, { addSuffix: true })}
                                        {job.completedAt && job.status === "complete" && (
                                            <> · {Math.round((job.completedAt.getTime() - job.triggeredAt.getTime()) / 1000)}s</>
                                        )}
                                    </div>
                                    {job.errorMessage && (
                                        <div className="font-mono text-xs text-red-500 mt-0.5 max-w-md truncate">{job.errorMessage}</div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <span className={`font-mono text-xs uppercase tracking-widest px-2 py-1 border ${
                                    job.status === "running" ? "border-neutral-400 text-neutral-600 bg-neutral-50" :
                                    job.status === "complete" ? "border-black text-black" :
                                    job.status === "failed" ? "border-red-300 text-red-600" :
                                    "border-neutral-200 text-neutral-400"
                                }`}>
                                    {job.status === "complete" ? "Done" : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
