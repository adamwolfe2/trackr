import { Clock, ArrowRight, PlusCircle, DollarSign, AlertTriangle, CalendarClock, Sparkles, RefreshCw, Flame } from "lucide-react";
import { db } from "@/lib/db";
import { tools, painPoints, workspaceMembers, workspaces, researchJobs, reports, softwareSpend, toolSuggestions, subscriptions } from "@/lib/db/schema";
import { eq, sql, desc, inArray, gte, and, ne, isNotNull, lte } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { ToolLogo } from "@/components/tools/tool-logo";
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

    if (!member) redirect("/onboarding");

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

    // Resolve triggeredBy Clerk user IDs to names
    const triggeredByIds = [...new Set(workspaceActivity.map(j => j.triggeredBy).filter(Boolean))] as string[];
    const triggeredByNames = new Map<string, string>();
    if (triggeredByIds.length > 0) {
        try {
            const clerkUsers = await (await clerkClient()).users.getUserList({ userId: triggeredByIds, limit: 50 });
            for (const u of clerkUsers.data) {
                const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.emailAddresses[0]?.emailAddress || "Team Member";
                triggeredByNames.set(u.id, name);
            }
        } catch {
            // Clerk unavailable — degrade gracefully
        }
    }

    // Tools with upcoming scheduled research (next 7 days)
    const now = new Date();
    const sevenDaysAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const scheduledTools = await db.query.tools.findMany({
        where: and(
            eq(tools.workspaceId, workspaceId),
            ne(tools.researchInterval, "manual"),
            isNotNull(tools.nextResearchAt),
            lte(tools.nextResearchAt, sevenDaysAhead),
        ),
        columns: { id: true, name: true, researchInterval: true, nextResearchAt: true },
        orderBy: [tools.nextResearchAt],
        limit: 5,
    });

    // Top performers and needs attention
    const topPerformers = await db.query.tools.findMany({
        where: and(eq(tools.workspaceId, workspaceId), isNotNull(tools.overallScore), eq(tools.status, "active")),
        orderBy: [desc(tools.overallScore)],
        limit: 3,
        columns: { id: true, name: true, overallScore: true, category: true, logoUrl: true, websiteUrl: true },
    });
    const needsAttention = await db.query.tools.findMany({
        where: and(eq(tools.workspaceId, workspaceId), eq(tools.status, "active"), isNotNull(tools.overallScore)),
        orderBy: [tools.overallScore],
        limit: 3,
        columns: { id: true, name: true, overallScore: true, category: true, logoUrl: true, websiteUrl: true },
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
    const parsedAvg = avgScoreData[0]?.avg ? parseFloat(avgScoreData[0].avg) : 0;
    const avgScore = Number.isFinite(parsedAvg) ? parsedAvg : 0;

    // This-week deltas
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [toolsThisWeekData, reportsThisWeekData] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(tools)
            .where(and(eq(tools.workspaceId, workspaceId), gte(tools.submittedAt, oneWeekAgo))),
        db.select({ count: sql<number>`count(*)` }).from(reports)
            .innerJoin(tools, eq(reports.toolId, tools.id))
            .where(and(eq(tools.workspaceId, workspaceId), gte(reports.createdAt, oneWeekAgo))),
    ]);
    const toolsThisWeek = Number(toolsThisWeekData[0]?.count || 0);
    const reportsThisWeek = Number(reportsThisWeekData[0]?.count || 0);

    // Quick actions context
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const [missingCostCount, upcomingRenewalCount, newSuggestionCount, failedToolCount, staleToolCount] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(softwareSpend)
            .where(sql`${softwareSpend.workspaceId} = ${workspaceId} AND ${softwareSpend.status} = 'active' AND (${softwareSpend.monthlyCost} IS NULL OR ${softwareSpend.monthlyCost}::numeric = 0)`),
        db.select({ count: sql<number>`count(*)` }).from(softwareSpend)
            .where(sql`${softwareSpend.workspaceId} = ${workspaceId} AND ${softwareSpend.status} = 'active' AND ${softwareSpend.renewalDate} IS NOT NULL AND ${softwareSpend.renewalDate} >= ${now} AND ${softwareSpend.renewalDate} <= ${sevenDaysFromNow}`),
        db.select({ count: sql<number>`count(*)` }).from(toolSuggestions)
            .where(sql`${toolSuggestions.workspaceId} = ${workspaceId} AND ${toolSuggestions.status} = 'new'`),
        db.select({ count: sql<number>`count(*)` }).from(tools)
            .where(sql`${tools.workspaceId} = ${workspaceId} AND ${tools.status} = 'failed'`),
        // Active tools with no schedule that haven't been researched in 60+ days
        db.select({ count: sql<number>`count(*)` }).from(tools)
            .where(sql`${tools.workspaceId} = ${workspaceId} AND ${tools.status} = 'active' AND ${tools.researchInterval} = 'manual' AND ${tools.lastResearchedAt} < ${sixtyDaysAgo}`),
    ]);

    type QuickAction = { icon: typeof ArrowRight; label: string; href: string; badge?: string };
    const quickActions: QuickAction[] = [];

    const failedCount = Number(failedToolCount[0]?.count || 0);
    if (failedCount > 0) {
        quickActions.push({ icon: AlertTriangle, label: `${failedCount} failed research job${failedCount > 1 ? "s" : ""} — retry`, href: "/tools", badge: "Action" });
    }

    const renewalCount = Number(upcomingRenewalCount[0]?.count || 0);
    if (renewalCount > 0) {
        quickActions.push({ icon: CalendarClock, label: `${renewalCount} renewal${renewalCount > 1 ? "s" : ""} in next 7 days`, href: "/stack", badge: "Renewal" });
    }

    const suggestionCount = Number(newSuggestionCount[0]?.count || 0);
    if (suggestionCount > 0) {
        quickActions.push({ icon: Sparkles, label: `${suggestionCount} new tool suggestion${suggestionCount > 1 ? "s" : ""}`, href: "/feed", badge: "Feed" });
    }

    const missingCount = Number(missingCostCount[0]?.count || 0);
    if (missingCount > 0) {
        quickActions.push({ icon: DollarSign, label: `${missingCount} tool${missingCount > 1 ? "s" : ""} missing cost data`, href: "/stack", badge: "Stack" });
    }

    if (toolsCount === 0) {
        quickActions.push({ icon: PlusCircle, label: "Submit your first tool for research", href: "/submit", badge: "Start" });
    }

    if (activePainPoints === 0 && toolsCount > 0) {
        quickActions.push({ icon: PlusCircle, label: "Add pain points to get AI recommendations", href: "/pain-points", badge: "Setup" });
    }

    const staleCount = Number(staleToolCount[0]?.count || 0);
    if (staleCount > 0) {
        quickActions.push({ icon: RefreshCw, label: `${staleCount} tool${staleCount > 1 ? "s" : ""} not researched in 60+ days — set a schedule`, href: "/tools", badge: "Stale" });
    }

    // Onboarding checklist data
    const hasActiveResearch = recentTools.some(t => t.status === "active");
    const teamMembersCountData = await db
        .select({ count: sql<number>`count(*)` })
        .from(workspaceMembers)
        .where(eq(workspaceMembers.workspaceId, workspaceId));
    const teamMembersCount = Number(teamMembersCountData[0]?.count || 1);
    const showChecklist = toolsCount < 3 || !hasActiveResearch;

    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, workspaceId),
        columns: { status: true },
    });
    const isPaidPlan = subscription?.status === "active" || subscription?.status === "trialing";

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
                <h1 className="font-serif text-2xl sm:text-3xl font-normal">Dashboard</h1>
                <div className="flex items-center gap-3">
                    {(member.workspace as { currentStreak?: number }).currentStreak != null && (member.workspace as { currentStreak?: number }).currentStreak! > 0 && (
                        <span className="flex items-center gap-1 font-mono text-xs border border-black px-2 py-0.5" title={`${(member.workspace as { currentStreak?: number }).currentStreak}-week activity streak`}>
                            <Flame className="h-3 w-3" />
                            {(member.workspace as { currentStreak?: number }).currentStreak}w streak
                        </span>
                    )}
                    <span className="font-mono text-xs text-neutral-400">
                        {member.workspace.name}
                    </span>
                </div>
            </div>

            <DashboardStats
                avgScore={avgScore}
                activeTools={toolsCount}
                researchReports={reportsCount}
                activePainPoints={activePainPoints}
                toolsThisWeek={toolsThisWeek}
                reportsThisWeek={reportsThisWeek}
            />

            {/* Onboarding checklist — shown until workspace has 3+ tools + active research */}
            {showChecklist && (
                <OnboardingChecklist
                    toolsCount={toolsCount}
                    hasActiveResearch={hasActiveResearch}
                    teamMembersCount={teamMembersCount}
                    isPaidPlan={isPaidPlan}
                />
            )}

            {/* Quick Actions */}
            {quickActions.length > 0 && (
                <div className="border border-black bg-white">
                    <div className="border-b border-black px-5 py-3">
                        <h2 className="font-mono text-xs uppercase tracking-widest">Quick Actions</h2>
                    </div>
                    <div className="divide-y divide-neutral-100">
                        {quickActions.map((action, i) => (
                            <Link key={i} href={action.href} className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-100 transition-colors group">
                                <action.icon className="h-4 w-4 text-neutral-400 group-hover:text-black shrink-0" strokeWidth={1.5} />
                                <span className="font-mono text-sm flex-1">{action.label}</span>
                                <span className="font-mono text-[9px] border border-neutral-300 px-1.5 py-0.5 text-neutral-400 uppercase tracking-wide">{action.badge}</span>
                                <ArrowRight className="h-3 w-3 text-neutral-300 group-hover:text-black shrink-0" />
                            </Link>
                        ))}
                    </div>
                </div>
            )}

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
                    <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2">
                        <div className="flex items-end gap-1">
                            <span className="font-serif text-3xl sm:text-4xl font-normal leading-none">{stackInsights.score}</span>
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

            {/* Top Performers + Needs Attention */}
            {topPerformers.length >= 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Top Performers */}
                    <div className="border border-black">
                        <div className="border-b border-black px-5 py-3">
                            <h2 className="font-mono text-xs uppercase tracking-widest">Your Best Tools</h2>
                        </div>
                        <div className="divide-y divide-neutral-100">
                            {topPerformers.map(tool => (
                                <Link key={tool.id} href={`/tools/${tool.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-100 transition-colors group">
                                    <ToolLogo name={tool.name} logoUrl={tool.logoUrl} websiteUrl={tool.websiteUrl} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-mono text-sm truncate">{tool.name}</div>
                                        {tool.category && tool.category.length > 0 && (
                                            <div className="font-mono text-[10px] text-neutral-400 uppercase">{tool.category[0]}</div>
                                        )}
                                    </div>
                                    <span className="font-mono text-sm font-bold border border-black bg-black text-white px-2 py-0.5 flex-shrink-0">
                                        {Number(tool.overallScore).toFixed(1)}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Needs Attention */}
                    <div className="border border-black">
                        <div className="border-b border-black px-5 py-3">
                            <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500">Review These</h2>
                        </div>
                        <div className="divide-y divide-neutral-100">
                            {needsAttention.map(tool => (
                                <div key={tool.id} className="flex items-center gap-3 px-5 py-3">
                                    <ToolLogo name={tool.name} logoUrl={tool.logoUrl} websiteUrl={tool.websiteUrl} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-mono text-sm truncate">{tool.name}</div>
                                        {tool.category && tool.category.length > 0 && (
                                            <div className="font-mono text-[10px] text-neutral-400 uppercase">{tool.category[0]}</div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-mono text-sm border px-2 py-0.5 ${Number(tool.overallScore) < 5 ? "border-neutral-400 text-neutral-500" : "border-black text-black"}`}>
                                            {Number(tool.overallScore).toFixed(1)}
                                        </span>
                                        <Link href={`/tools/${tool.id}`} className="font-mono text-[10px] border border-black px-2 py-0.5 hover:bg-black hover:text-white transition-colors whitespace-nowrap">
                                            Re-research
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ROI Summary Card */}
            {stackEntries.length > 0 && stackInsights.timeSavedPerMonth > 0 && (
                <div className="border border-black p-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Estimated ROI from AI Stack</p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <span className="font-mono text-sm">
                            ~{Math.round(stackInsights.timeSavedPerMonth)} hrs/mo saved
                        </span>
                        <span className="font-mono text-sm">
                            ~${stackInsights.dollarValueSaved >= 1000
                                ? `${Math.round(stackInsights.dollarValueSaved / 1000)}k`
                                : Math.round(stackInsights.dollarValueSaved)}/yr value
                        </span>
                        <span className="font-mono text-xs text-neutral-500">
                            AI Nativeness: {stackInsights.score}/100
                        </span>
                        <Link href="/stack/report" className="font-mono text-xs underline hover:text-neutral-600">
                            View Full Report →
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
                            <div className="py-10 text-center space-y-3">
                                <p className="font-mono text-sm text-neutral-400">No tools tracked yet.</p>
                                <p className="font-mono text-[11px] text-neutral-400 max-w-xs mx-auto">Try researching a tool your team uses — scores arrive in under 2 minutes.</p>
                                <div className="flex flex-wrap gap-2 justify-center pt-1">
                                    {["linear.app", "notion.so", "slack.com", "figma.com"].map(domain => (
                                        <Link key={domain} href={`/submit?url=https://${domain}`}
                                            className="font-mono text-[10px] border border-neutral-300 px-2 py-1 hover:border-black hover:text-black text-neutral-500 transition-colors">
                                            {domain}
                                        </Link>
                                    ))}
                                </div>
                                <Link href="/submit" className="font-mono text-xs text-black underline mt-1 inline-block">Submit any tool →</Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-neutral-100">
                                {recentTools.map(tool => (
                                    <Link key={tool.id} href={`/tools/${tool.id}`} className="flex items-center justify-between py-3 hover:bg-neutral-100 -mx-2 px-2 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <ToolLogo name={tool.name} logoUrl={tool.logoUrl} websiteUrl={tool.websiteUrl} size="md" />
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
                            <Link href="/workspace/activity" className="font-mono text-[10px] text-neutral-400 hover:text-black transition-colors">
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
                                                <Link href={`/tools/${job.toolId}`} className="font-medium hover:underline truncate block">{job.tool.name}</Link>
                                            </div>
                                            <div className="font-mono text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                                                <Clock className="h-2.5 w-2.5" />
                                                {formatDistanceToNow(job.triggeredAt, { addSuffix: true })}
                                                {job.triggeredBy && triggeredByNames.get(job.triggeredBy) && (
                                                    <> · {triggeredByNames.get(job.triggeredBy)}</>
                                                )}
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

            {/* Upcoming Scheduled Research */}
            {scheduledTools.length > 0 && (
                <div className="border border-black">
                    <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                        <h2 className="font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                            <RefreshCw className="h-3 w-3" />
                            Upcoming Scheduled Research
                        </h2>
                        <Link href="/tools" className="font-mono text-[10px] text-neutral-400 hover:text-black transition-colors">
                            Manage →
                        </Link>
                    </div>
                    <div className="divide-y divide-neutral-100">
                        {scheduledTools.map((tool) => {
                            const nextDate = tool.nextResearchAt ? new Date(tool.nextResearchAt) : null;
                            const isOverdue = nextDate && nextDate < now;
                            return (
                                <div key={tool.id} className="flex items-center justify-between px-5 py-3">
                                    <Link href={`/tools/${tool.id}`} className="font-mono text-xs font-medium hover:underline">
                                        {tool.name}
                                    </Link>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
                                            {tool.researchInterval}
                                        </span>
                                        <span className={`font-mono text-[10px] border px-1.5 py-0.5 ${isOverdue ? "border-black bg-black text-white" : "border-neutral-300 text-neutral-500"}`}>
                                            {isOverdue ? "Due now" : nextDate ? nextDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
