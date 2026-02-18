export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { researchJobs, tools } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
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
            with: { tool: { columns: { id: true, name: true, websiteUrl: true } } },
            orderBy: [desc(researchJobs.triggeredAt)],
            limit: 50,
        }).then((all) => all.filter((j) => toolIds.includes(j.toolId)))
        : [];

    const runningCount = jobs.filter((j) => j.status === "running").length;
    const completedCount = jobs.filter((j) => j.status === "complete").length;
    const failedCount = jobs.filter((j) => j.status === "failed").length;

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-serif font-normal">Research Queue</h1>
                        <QueueAutoRefresh runningCount={runningCount} />
                    </div>
                    <p className="font-mono text-sm text-neutral-500 mt-1">Track all research runs for your workspace.</p>
                </div>
                <div className="flex gap-3">
                    <div className="border border-black px-4 py-2 text-center">
                        <div className="font-mono text-xs text-neutral-500 uppercase tracking-widest">Running</div>
                        <div className={`text-xl font-serif ${runningCount > 0 ? "text-black" : "text-neutral-400"}`}>{runningCount}</div>
                    </div>
                    <div className="border border-black px-4 py-2 text-center">
                        <div className="font-mono text-xs text-neutral-500 uppercase tracking-widest">Completed</div>
                        <div className="text-xl font-serif text-black">{completedCount}</div>
                    </div>
                    <div className="border border-black px-4 py-2 text-center">
                        <div className="font-mono text-xs text-neutral-500 uppercase tracking-widest">Failed</div>
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
                        <div key={job.id} className="flex items-center justify-between px-5 py-4 hover:bg-black/[0.02] transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-6 flex justify-center">
                                    {job.status === "running" && <Loader2 className="h-4 w-4 animate-spin text-neutral-600" />}
                                    {job.status === "queued" && <Clock className="h-4 w-4 text-neutral-400" />}
                                    {job.status === "complete" && <CheckCircle2 className="h-4 w-4 text-black" />}
                                    {job.status === "failed" && <XCircle className="h-4 w-4 text-red-500" />}
                                </div>
                                <div>
                                    <Link href={`/tools/${job.toolId}`} className="font-mono text-sm font-medium hover:underline">
                                        {job.tool.name}
                                    </Link>
                                    <div className="font-mono text-xs text-neutral-400 mt-0.5">
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
