

export const dynamic = "force-dynamic";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Mock queue data
const queue = [
    { id: 1, tool: "Linear", status: "running", startedAt: new Date(Date.now() - 1000 * 30) },
    { id: 2, tool: "Attio", status: "queued", startedAt: new Date(Date.now() - 1000 * 60) },
    { id: 3, tool: "Clay", status: "completed", startedAt: new Date(Date.now() - 1000 * 60 * 5) },
    { id: 4, tool: "Instantly.ai", status: "failed", startedAt: new Date(Date.now() - 1000 * 60 * 60) },
];

export default function QueuePage() {
    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Research Queue</h1>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Running 1 job
                </Badge>
            </div>

            <div className="grid gap-4">
                {queue.map((job) => (
                    <Card key={job.id} className="hover:bg-muted/50 transition-colors">
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-8 flex justify-center">
                                    {job.status === 'running' && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
                                    {job.status === 'queued' && <div className="h-3 w-3 rounded-full bg-slate-300" />}
                                    {job.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                                    {job.status === 'failed' && <XCircle className="h-5 w-5 text-red-600" />}
                                </div>
                                <div>
                                    <div className="font-medium">{job.tool}</div>
                                    <div className="text-xs text-muted-foreground capitalize">
                                        {job.status} • Started {formatDistanceToNow(job.startedAt, { addSuffix: true })}
                                    </div>
                                </div>
                            </div>
                            <div>
                                {job.status === 'completed' && <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">Success</Badge>}
                                {job.status === 'failed' && <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200">Error</Badge>}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
