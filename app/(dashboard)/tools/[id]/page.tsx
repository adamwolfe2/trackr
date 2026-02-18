import { db } from "@/lib/db";
import { tools, reports, researchJobs, notes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ExternalLink, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ResearchStream } from "@/components/tools/research-stream";
import { ResearchButton } from "@/components/tools/research-button";
import { ExportButton } from "@/components/common/export-button";
import { ToolDetailTabs } from "@/components/tools/tool-detail-tabs";

export const dynamic = "force-dynamic";

export default async function ToolDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const tool = await db.query.tools.findFirst({
        where: eq(tools.id, id),
    });

    if (!tool) return notFound();

    const report = await db.query.reports.findFirst({
        where: eq(reports.toolId, id),
        orderBy: [desc(reports.createdAt)],
    });

    const workspaceTools = await db.query.tools.findMany({
        where: eq(tools.workspaceId, tool.workspaceId),
        columns: { id: true, name: true, status: true },
    });

    const jobs = await db.query.researchJobs.findMany({
        where: eq(researchJobs.toolId, id),
        orderBy: [desc(researchJobs.triggeredAt)],
    });

    const allReports = await db.query.reports.findMany({
        where: eq(reports.toolId, id),
        orderBy: [desc(reports.createdAt)],
    });

    const toolNotes = await db.query.notes.findMany({
        where: eq(notes.toolId, id),
        orderBy: [desc(notes.createdAt)],
    });

    const isResearching = tool.status === "researching";

    // Extract features + pricing from report for tab component
    const featuresList = report?.features && typeof report.features === "object" && "list" in report.features
        // @ts-ignore
        ? (report.features.list as string[])
        : [];
    // @ts-ignore
    const pricingTiers = (report?.pricing as Array<{ tier: string; price: string }>) ?? [];

    // Serialize history items (merge jobs + reports into timeline)
    const historyItems = [
        ...jobs.map(j => ({
            id: j.id,
            type: "job" as const,
            status: j.status,
            triggeredAt: j.triggeredAt.toISOString(),
        })),
        ...allReports.map(r => ({
            id: r.id,
            type: "report" as const,
            status: "saved",
            triggeredAt: r.createdAt.toISOString(),
            version: r.version ?? 1,
        })),
    ].sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime());

    // Serialize report for client tabs
    const serializedReport = report ? {
        id: report.id,
        summary: report.summary,
        scorecardSnapshot: report.scorecardSnapshot as Record<string, { score: number; justification: string }> | null,
        pros: report.pros as string[] | null,
        cons: report.cons as string[] | null,
        featuresList,
        pricingTiers,
        sentimentData: report.sentimentData as {
            reviewAnswer?: string;
            redditAnswer?: string;
            competitorAnalysis?: string;
            reviewSources?: Array<{ title: string; url: string; score: number }>;
        } | null,
    } : null;

    const serializedNotes = toolNotes.map(n => ({
        id: n.id,
        content: n.content,
        noteType: n.noteType ?? "general",
        createdAt: n.createdAt.toISOString(),
        workspaceMemberId: n.workspaceMemberId,
    }));

    const statusColors: Record<string, string> = {
        active: "bg-black text-white border-black",
        researching: "border-blue-600 text-blue-600",
        failed: "border-red-600 text-red-600",
    };

    return (
        <div className="space-y-6">
            {/* Back link */}
            <Link href="/tools" className="font-mono text-sm flex items-center gap-1 text-neutral-500 hover:text-black">
                <ChevronLeft className="h-3 w-3" /> Back to Tools
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1 min-w-0">
                    <h1 className="font-serif text-3xl font-normal flex items-center gap-3 flex-wrap">
                        {tool.logoUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={tool.logoUrl} alt={tool.name} className="w-8 h-8 object-contain flex-shrink-0" />
                        )}
                        {tool.name}
                        <span className={`font-mono text-xs border px-2 py-0.5 uppercase tracking-widest ${statusColors[tool.status] ?? "border-neutral-300 text-neutral-500"}`}>
                            {tool.status}
                        </span>
                    </h1>
                    <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
                        {tool.websiteUrl && (
                            <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:text-black flex items-center gap-1">
                                {new URL(tool.websiteUrl).hostname} <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                        )}
                        {tool.websiteUrl && <span>·</span>}
                        <span>Last updated {tool.lastResearchedAt ? formatDistanceToNow(new Date(tool.lastResearchedAt), { addSuffix: true }) : "Never"}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    <ExportButton />
                    <ResearchButton
                        toolId={tool.id}
                        isResearching={isResearching}
                        hasReport={!!report}
                        isFailed={tool.status === "failed"}
                    />
                    <div className="text-right">
                        <div className="font-mono text-3xl font-bold">
                            {Number(tool.overallScore || 0).toFixed(1)}
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Score</div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column (2/3) */}
                <div className="md:col-span-2 space-y-5">
                    {isResearching && <ResearchStream toolId={tool.id} />}

                    {/* Executive Summary */}
                    <div className="border border-black p-5">
                        <h2 className="font-mono text-xs uppercase tracking-widest mb-3">Executive Summary</h2>
                        <p className="font-mono text-sm text-neutral-600 leading-relaxed">
                            {report?.summary ?? "No analysis available yet. Run deep research to generate a report."}
                        </p>
                    </div>

                    {/* Tabs */}
                    <ToolDetailTabs
                        toolId={tool.id}
                        report={serializedReport}
                        historyItems={historyItems}
                        notes={serializedNotes}
                        workspaceTools={workspaceTools}
                        competitors={report?.competitors as string[] ?? []}
                    />
                </div>

                {/* Right Column (1/3) */}
                <div className="space-y-5">
                    {/* Information */}
                    <div className="border border-black p-4 space-y-4">
                        <h3 className="font-mono text-xs uppercase tracking-widest">Information</h3>
                        <div>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">Categories</span>
                            <div className="flex gap-1 flex-wrap">
                                {tool.category?.map((c: string) => (
                                    <span key={c} className="font-mono text-[10px] border border-black px-1.5 py-0.5">{c}</span>
                                ))}
                                {!tool.category?.length && <span className="font-mono text-xs text-neutral-400">None</span>}
                            </div>
                        </div>
                        <div>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">Submitted By</span>
                            <span className="font-mono text-xs truncate block max-w-[150px]">{tool.submittedBy || "Unknown"}</span>
                        </div>
                    </div>

                    {/* Competitors */}
                    {report?.competitors && (report.competitors as string[]).length > 0 && (
                        <div className="border border-black p-4">
                            <h3 className="font-mono text-xs uppercase tracking-widest mb-3">Competitors</h3>
                            <div className="space-y-1.5">
                                {(report.competitors as string[]).map((comp, i) => {
                                    const match = workspaceTools.find(t => t.name.toLowerCase() === comp.toLowerCase());
                                    return (
                                        <div key={i} className="flex items-center justify-between p-2 border border-neutral-200 hover:border-black transition-colors">
                                            <span className="font-mono text-xs">{comp}</span>
                                            {match ? (
                                                <Link href={`/tools/${match.id}`} className="font-mono text-[10px] border border-black px-1.5 py-0.5 hover:bg-black hover:text-white flex items-center gap-1">
                                                    View <ExternalLink className="h-2.5 w-2.5" />
                                                </Link>
                                            ) : (
                                                <span className="font-mono text-[10px] text-neutral-400 border border-neutral-200 px-1.5 py-0.5">External</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
