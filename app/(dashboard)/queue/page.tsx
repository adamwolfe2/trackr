import { db } from "@/lib/db";
import { researchJobs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const jobs = await db.query.researchJobs.findMany({
        with: {
            tool: true
        },
        orderBy: [desc(researchJobs.triggeredAt)],
        limit: 50
    });

    const runningCount = jobs.filter(j => j.status === 'running').length;

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Research Queue</h1>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
                    {runningCount > 0 ? (
                        <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Running {runningCount} job{runningCount !== 1 ? 's' : ''}
                        </>
                    ) : (
                        "Idle"
                    )}
                </Badge>
            </div>

            <div className="grid gap-4">
                {jobs.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                        No research jobs found. Start a research task from the Tools page.
                    </div>
                ) : (
                    jobs.map((job) => (
                        <Card key={job.id} className="hover:bg-muted/50 transition-colors group">
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 flex justify-center">
                                        {job.status === 'running' && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
                                        {job.status === 'queued' && <Clock className="h-5 w-5 text-slate-400" />}
                                        {job.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                                        {job.status === 'failed' && <XCircle className="h-5 w-5 text-red-600" />}
                                    </div>
                                    <div>
                                        <div className="font-medium">{job.tool.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)} • {formatDistanceToNow(job.triggeredAt, { addSuffix: true })}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    {job.status === 'completed' && <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">Success</Badge>}
                                    {job.status === 'failed' && <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200">Error</Badge>}
                                    {job.status === 'running' && <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 animate-pulse">Processing</Badge>}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
