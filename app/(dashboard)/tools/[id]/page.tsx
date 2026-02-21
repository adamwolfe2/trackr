import { db } from "@/lib/db";
import { tools, reports, researchJobs, notes, workspaceMembers, subscriptions } from "@/lib/db/schema";
import { eq, desc, inArray, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { ExternalLink, ChevronLeft, GitCompare, RefreshCw, Share2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ResearchStream } from "@/components/tools/research-stream";
import { ResearchButton } from "@/components/tools/research-button";
import { ExportButton } from "@/components/common/export-button";
import { ShareReportButton } from "@/components/tools/share-report-button";
import { PublishButton } from "@/components/tools/publish-button";
import { ToolDetailTabs } from "@/components/tools/tool-detail-tabs";
import { clerkClient } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { getPlanLimits, hasFeature } from "@/lib/config/subscriptions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const tool = await db.query.tools.findFirst({
        where: eq(tools.id, id),
        columns: { name: true },
    });
    if (!tool) return { title: "Tool Not Found — Trackr" };
    return {
        title: `${tool.name} — Trackr`,
        description: `Research report and analysis for ${tool.name}.`,
    };
}

export default async function ToolDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });
    if (!member) redirect("/onboarding");

    // Fetch tool AND verify it belongs to the user's workspace
    const tool = await db.query.tools.findFirst({
        where: and(eq(tools.id, id), eq(tools.workspaceId, member.workspaceId)),
    });

    if (!tool) return notFound();

    const report = await db.query.reports.findFirst({
        where: eq(reports.toolId, id),
        orderBy: [desc(reports.createdAt)],
    });

    // Plan check for feature gating
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, tool.workspaceId),
    });
    const plan = getPlanLimits(subscription);
    const canExport = hasFeature(plan, "reportExport");

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

    // Resolve workspace member names for notes
    const noteMemberIds = [...new Set(toolNotes.map(n => n.workspaceMemberId).filter(Boolean))] as string[];
    const noteMembers = noteMemberIds.length > 0
        ? await db.query.workspaceMembers.findMany({
            where: inArray(workspaceMembers.id, noteMemberIds),
            columns: { id: true, userId: true },
        })
        : [];
    const clerkUserIds = noteMembers.map(m => m.userId);
    const clerkUsers = clerkUserIds.length > 0
        ? await (await clerkClient()).users.getUserList({ userId: clerkUserIds, limit: 100 })
        : { data: [] };
    const memberIdToName = new Map<string, string>();
    for (const member of noteMembers) {
        const clerkUser = clerkUsers.data.find(u => u.id === member.userId);
        if (clerkUser) {
            const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.emailAddresses[0]?.emailAddress || "Team Member";
            memberIdToName.set(member.id, name);
        }
    }

    const isResearching = tool.status === "researching";

    const toolHostname = (() => {
        if (!tool.websiteUrl) return null;
        try { return new URL(tool.websiteUrl).hostname; } catch { return tool.websiteUrl; }
    })();

    // Extract features + pricing from report for tab component
    const featuresList = report?.features && typeof report.features === "object" && "list" in report.features
        ? ((report.features as Record<string, unknown>).list as string[])
        : [];
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
            trustSources?: Array<{ title: string; url: string; score: number }>;
            trustAnswer?: string;
            redditThreads?: Array<{ title: string; url: string; subreddit: string; snippet: string }>;
            sentimentConsensus?: {
                overall: "very_positive" | "positive" | "mixed" | "negative" | "very_negative";
                confidence: number;
                sourceAgreement: string;
            };
            marketIntel?: {
                founded?: string;
                headquarters?: string;
                employeeCount?: string;
                funding?: string;
                recentNews?: string[];
            };
            dataSources?: number;
            pagesScraped?: number;
        } | null,
    } : null;

    const serializedNotes = toolNotes.map(n => ({
        id: n.id,
        content: n.content,
        noteType: n.noteType ?? "general",
        createdAt: n.createdAt.toISOString(),
        workspaceMemberId: n.workspaceMemberId,
        userName: (n.workspaceMemberId ? memberIdToName.get(n.workspaceMemberId) : undefined) ?? "Team Member",
    }));

    const statusColors: Record<string, string> = {
        active: "bg-black text-white border-black",
        researching: "border-black text-black animate-pulse",
        failed: "border-neutral-400 text-neutral-500",
    };

    const sentimentConsensus = serializedReport?.sentimentData?.sentimentConsensus;
    const sentimentLabel: Record<string, string> = {
        very_positive: "Very Positive",
        positive: "Positive",
        mixed: "Mixed",
        negative: "Negative",
        very_negative: "Very Negative",
    };
    const sentimentColors: Record<string, string> = {
        very_positive: "bg-black text-white",
        positive: "border-black text-black",
        mixed: "border-neutral-400 text-neutral-500",
        negative: "border-red-400 text-red-600",
        very_negative: "bg-red-600 text-white border-red-600",
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
                    <div className="flex items-center gap-2 font-mono text-xs text-neutral-400 flex-wrap">
                        {toolHostname && (
                            <a href={tool.websiteUrl!} target="_blank" rel="noopener noreferrer" className="hover:text-black flex items-center gap-1">
                                {toolHostname} <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                        )}
                        {toolHostname && <span>·</span>}
                        <span>Last updated {tool.lastResearchedAt ? formatDistanceToNow(new Date(tool.lastResearchedAt), { addSuffix: true }) : "Never"}</span>
                        {sentimentConsensus && (
                            <>
                                <span>·</span>
                                <span className={`border px-1.5 py-0.5 text-[10px] uppercase tracking-widest ${sentimentColors[sentimentConsensus.overall] ?? "border-neutral-300 text-neutral-500"}`}>
                                    {sentimentLabel[sentimentConsensus.overall] ?? sentimentConsensus.overall}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    {report && (
                        <PublishButton
                            reportId={report.id}
                            isPublic={report.isPublic ?? false}
                            publicSlug={tool.publicSlug ?? null}
                        />
                    )}
                    {report && <ShareReportButton reportId={report.id} />}
                    {canExport && (
                        <ExportButton
                            toolName={tool.name}
                            report={serializedReport ? {
                                summary: serializedReport.summary,
                                scorecardSnapshot: serializedReport.scorecardSnapshot ?? undefined,
                                pros: serializedReport.pros ?? undefined,
                                cons: serializedReport.cons ?? undefined,
                                pricingTiers: serializedReport.pricingTiers,
                            } : null}
                        />
                    )}
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
                        {serializedReport?.sentimentData && (
                            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-neutral-200 flex-wrap">
                                {serializedReport.sentimentData.dataSources && (
                                    <span className="font-mono text-[10px] border border-neutral-300 px-2 py-0.5 text-neutral-500">
                                        {serializedReport.sentimentData.dataSources} sources
                                    </span>
                                )}
                                {serializedReport.sentimentData.pagesScraped && (
                                    <span className="font-mono text-[10px] border border-neutral-300 px-2 py-0.5 text-neutral-500">
                                        {serializedReport.sentimentData.pagesScraped} pages scraped
                                    </span>
                                )}
                                {serializedReport.sentimentData.redditThreads && serializedReport.sentimentData.redditThreads.length > 0 && (
                                    <span className="font-mono text-[10px] border border-neutral-300 px-2 py-0.5 text-neutral-500">
                                        {serializedReport.sentimentData.redditThreads.length} Reddit threads
                                    </span>
                                )}
                                {serializedReport.sentimentData.reviewSources && serializedReport.sentimentData.reviewSources.length > 0 && (
                                    <span className="font-mono text-[10px] border border-neutral-300 px-2 py-0.5 text-neutral-500">
                                        {serializedReport.sentimentData.reviewSources.length} review sites
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <ToolDetailTabs
                        toolId={tool.id}
                        toolStatus={tool.status}
                        report={serializedReport}
                        historyItems={historyItems}
                        notes={serializedNotes}
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

                    {/* Next Steps */}
                    {report && (
                        <div className="border border-black p-4">
                            <h3 className="font-mono text-xs uppercase tracking-widest mb-3">Next Steps</h3>
                            <div className="space-y-2">
                                <Link
                                    href={`/compare?tools=${tool.id}`}
                                    className="flex items-center gap-2.5 p-2.5 border border-neutral-200 hover:border-black transition-colors group"
                                >
                                    <GitCompare className="h-3.5 w-3.5 text-neutral-400 group-hover:text-black shrink-0" strokeWidth={1.5} />
                                    <div className="flex-1 min-w-0">
                                        <span className="font-mono text-xs block">Compare with another tool</span>
                                        <span className="font-mono text-[10px] text-neutral-400">Side-by-side analysis</span>
                                    </div>
                                    <ArrowRight className="h-3 w-3 text-neutral-300 group-hover:text-black shrink-0" />
                                </Link>
                                <Link
                                    href="/submit"
                                    className="flex items-center gap-2.5 p-2.5 border border-neutral-200 hover:border-black transition-colors group"
                                >
                                    <Share2 className="h-3.5 w-3.5 text-neutral-400 group-hover:text-black shrink-0" strokeWidth={1.5} />
                                    <div className="flex-1 min-w-0">
                                        <span className="font-mono text-xs block">Research a competitor</span>
                                        <span className="font-mono text-[10px] text-neutral-400">Submit their URL for analysis</span>
                                    </div>
                                    <ArrowRight className="h-3 w-3 text-neutral-300 group-hover:text-black shrink-0" />
                                </Link>
                                {!isResearching && (
                                    <div className="flex items-center gap-2.5 p-2.5 border border-neutral-200 hover:border-black transition-colors group cursor-default">
                                        <RefreshCw className="h-3.5 w-3.5 text-neutral-400 shrink-0" strokeWidth={1.5} />
                                        <div className="flex-1 min-w-0">
                                            <span className="font-mono text-xs block">Re-run research</span>
                                            <span className="font-mono text-[10px] text-neutral-400">Use the button above to refresh data</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
