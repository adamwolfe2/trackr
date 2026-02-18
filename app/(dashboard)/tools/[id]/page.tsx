import { db } from "@/lib/db";
import { tools, reports, researchJobs, notes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { NotesSection } from "@/components/tools/notes-section";
import { ExportButton } from "@/components/common/export-button";
import { ResearchStream } from "@/components/tools/research-stream";
import { ResearchButton } from "@/components/tools/research-button";

export const dynamic = "force-dynamic";

export default async function ToolDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;

    const tool = await db.query.tools.findFirst({
        where: eq(tools.id, id),
    });

    if (!tool) return notFound();

    const report = await db.query.reports.findFirst({
        where: eq(reports.toolId, id),
        orderBy: [desc(reports.createdAt)],
    });

    // Fetch all tools in workspace for cross-reference
    const workspaceTools = await db.query.tools.findMany({
        where: eq(tools.workspaceId, tool.workspaceId),
        columns: { id: true, name: true, status: true }
    });

    const isResearching = tool.status === "researching";

    // Format features/pricing safely
    const featuresList = report?.features && typeof report.features === 'object' && 'list' in report.features
        // @ts-ignore
        ? report.features.list as string[]
        : [];

    // @ts-ignore
    const pricingTiers = report?.pricing as any[] || [];

    // Fetch history data
    const jobs = await db.query.researchJobs.findMany({
        where: eq(researchJobs.toolId, id),
        orderBy: [desc(researchJobs.triggeredAt)]
    });

    const allReports = await db.query.reports.findMany({
        where: eq(reports.toolId, id),
        orderBy: [desc(reports.createdAt)]
    });

    // Fetch notes
    const toolNotes = await db.query.notes.findMany({
        where: eq(notes.toolId, id),
        orderBy: [desc(notes.createdAt)],
    });

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link href="/tools" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <ChevronLeft className="h-4 w-4" /> Back to Tools
                </Link>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            {tool.name}
                            <Badge variant={tool.status === 'active' ? 'default' : 'outline'} className="text-sm font-normal capitalize">
                                {tool.status}
                            </Badge>
                        </h1>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            {tool.websiteUrl && (
                                <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                                    {new URL(tool.websiteUrl).hostname} <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                            <span>•</span>
                            <span>Last updated {tool.lastResearchedAt ? formatDistanceToNow(new Date(tool.lastResearchedAt), { addSuffix: true }) : 'Never'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* <ExportButton /> */}
                        <ResearchButton
                            toolId={tool.id}
                            isResearching={isResearching}
                            hasReport={!!report}
                        />
                        <div className="flex flex-col items-end min-w-[100px]">
                            <span className="text-3xl font-bold text-foreground">
                                {Number(tool.overallScore || 0).toFixed(1)}
                            </span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Overall Score</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column (2/3) */}
                <div className="md:col-span-2 space-y-6">
                    {isResearching && <ResearchStream toolId={tool.id} />}

                    <Card>
                        <CardHeader>
                            <CardTitle>Executive Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="leading-relaxed text-muted-foreground">
                                {String(report?.summary || "No analysis available yet. Run deep research to generate a report.")}
                            </p>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="report" className="w-full">
                        <TabsList>
                            <TabsTrigger value="report">Analysis</TabsTrigger>
                            <TabsTrigger value="features">Features & Pricing</TabsTrigger>
                            <TabsTrigger value="history">History</TabsTrigger>
                            <TabsTrigger value="notes">Team Notes</TabsTrigger>
                        </TabsList>

                        <TabsContent value="report" className="space-y-4 mt-4">
                            {report ? (
                                <>
                                    <Card>
                                        <CardHeader><CardTitle>Score Breakdown</CardTitle></CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {!!report.scorecardSnapshot && Object.entries(report.scorecardSnapshot as Record<string, { score: number; justification: string }>).map(([key, value]) => (
                                                    <div key={key} className="space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                                                            <span className="font-bold">{value.score}/10</span>
                                                        </div>
                                                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                            <div className="h-full bg-primary" style={{ width: `${(value.score / 10) * 100}%` }} />
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{value.justification}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card className="bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-800">
                                            <CardHeader><CardTitle className="text-green-700 dark:text-green-400">Pros</CardTitle></CardHeader>
                                            <CardContent>
                                                <ul className="list-disc pl-4 space-y-1 text-sm text-green-800 dark:text-green-300">
                                                    {report.pros?.map((pro: string, i: number) => (
                                                        <li key={i}>{pro}</li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-800">
                                            <CardHeader><CardTitle className="text-red-700 dark:text-red-400">Cons</CardTitle></CardHeader>
                                            <CardContent>
                                                <ul className="list-disc pl-4 space-y-1 text-sm text-red-800 dark:text-red-300">
                                                    {report.cons?.map((con: string, i: number) => (
                                                        <li key={i}>{con}</li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    No report generated yet.
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="features" className="space-y-4 mt-4">
                            {report ? (
                                <>
                                    <Card>
                                        <CardHeader><CardTitle>Extracted Features</CardTitle></CardHeader>
                                        <CardContent>
                                            <ul className="list-disc pl-4 space-y-2">
                                                {featuresList.map((feature, i) => (
                                                    <li key={i} className="text-sm">{feature}</li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader><CardTitle>Pricing Structure</CardTitle></CardHeader>
                                        <CardContent>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                {pricingTiers.map((tier, i) => (
                                                    <div key={i} className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                                                        <h4 className="font-semibold text-lg">{tier.tier}</h4>
                                                        <p className="text-2xl font-bold mt-2">{tier.price}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    No data available.
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="history" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Research & Update History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative border-l ml-3 pl-6 space-y-6">
                                        {[
                                            ...jobs.map(job => ({
                                                type: 'job' as const,
                                                date: job.triggeredAt,
                                                status: job.status,
                                                id: job.id,
                                                version: undefined
                                            })),
                                            ...allReports.map(rep => ({
                                                type: 'report' as const,
                                                date: rep.createdAt,
                                                version: rep.version,
                                                id: rep.id,
                                                status: undefined
                                            }))
                                        ]
                                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                            .map((item) => (
                                                <div key={`${item.type}-${item.id}`} className="relative">
                                                    <div className="absolute -left-[31px] bg-background">
                                                        {item.type === 'job' ? (
                                                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-background" />
                                                        ) : (
                                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 ring-4 ring-background" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">
                                                            {item.type === 'job' ? `Research Job: ${item.status}` : `Report Generated (v${item.version})`}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDistanceToNow(item.date, { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                    {jobs.length === 0 && allReports.length === 0 && (
                                        <div className="text-center py-4 text-muted-foreground text-sm">
                                            No history recorded yet.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="notes" className="space-y-4 mt-4">
                            <NotesSection toolId={tool.id} notes={toolNotes} />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column (1/3) - Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <span className="text-sm text-muted-foreground block">Categories</span>
                                <div className="flex gap-1 flex-wrap mt-1">
                                    {tool.category?.map((c: string) => (
                                        <Badge key={c} variant="secondary">{c}</Badge>
                                    ))}
                                    {!tool.category?.length && <span className="text-sm italic text-muted-foreground">None</span>}
                                </div>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground block">Submitted By</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-6 h-6 rounded-full bg-slate-200" />
                                    <span className="text-sm truncate max-w-[150px]">{tool.submittedBy || 'Unknown'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {report?.competitors && report.competitors.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle>Competitors</CardTitle></CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {report.competitors.map((comp: string, i: number) => {
                                        const match = workspaceTools.find(t => t.name.toLowerCase() === comp.toLowerCase());
                                        return (
                                            <div key={i} className="p-2 rounded hover:bg-muted transition-colors flex justify-between items-center bg-muted/30">
                                                <span className="text-sm font-medium">{comp}</span>
                                                {match ? (
                                                    <Link href={`/tools/${match.id}`}>
                                                        <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground cursor-pointer gap-1">
                                                            View <ExternalLink className="h-3 w-3" />
                                                        </Badge>
                                                    </Link>
                                                ) : (
                                                    <Badge variant="secondary" className="opacity-50 font-normal">External</Badge>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

            </div>
        </div>
    );
}
