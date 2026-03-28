export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { db } from "@/lib/db";
import {
    workspaces,
    workspaceMembers,
    subscriptions,
    tools,
    webhookEvents,
    auditSubmissions,
    researchJobs,
} from "@/lib/db/schema";
import { sql, desc, gte, eq, and, count, isNotNull, lte } from "drizzle-orm";
import { redirect } from "next/navigation";
import { PLANS, getPlanLimits } from "@/lib/config/subscriptions";
import { rateLimit } from "@/lib/middleware/rate-limit";
import { AdminTrendChartLoader as AdminTrendChart } from "@/components/admin/admin-trend-chart-loader";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AnimatedBar } from "@/components/common/animated-bar";

export const metadata: Metadata = {
    title: "Admin Analytics -- Trackr",
    description: "Business analytics dashboard.",
    robots: { index: false },
};

async function loginAction(formData: FormData) {
    "use server";

    // Rate-limit login attempts per IP -- 5 per 5 minutes
    const { headers: getHeaders } = await import("next/headers");
    const headersList = await getHeaders();
    const ip =
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        headersList.get("x-real-ip") ??
        "unknown";
    const rl = await rateLimit(`admin-login:${ip}`, { limit: 5, windowSeconds: 300 });
    if (!rl.success) {
        redirect("/admin/analytics?error=rate_limited");
        return;
    }

    const password = formData.get("password") as string;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!password || !adminPassword) return;
    const { timingSafeEqual: tse, createHash: ch } = await import("crypto");
    const submittedHash = ch("sha256").update(password).digest("hex");
    const expectedHash = ch("sha256").update(adminPassword).digest("hex");
    const a = Buffer.from(submittedHash);
    const b = Buffer.from(expectedHash);
    if (a.length === b.length && tse(a, b)) {
        const token = expectedHash;
        const { cookies: getCookies } = await import("next/headers");
        (await getCookies()).set("trackr-admin", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 2, // 2 hours
            sameSite: "strict",
        });
    }
    redirect("/admin/analytics");
}

// -- Helpers -------------------------------------------------------------------

function fmt(n: number) {
    return n.toLocaleString();
}
function fmtUsd(cents: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

// -- Data fetching -------------------------------------------------------------

async function getAnalytics(windowDays: number) {
    const since = new Date(Date.now() - windowDays * 86400000);

    // Workspace counts
    const [{ totalWorkspaces }] = await db.select({ totalWorkspaces: count() }).from(workspaces);

    const [{ newWorkspaces }] = await db
        .select({ newWorkspaces: count() })
        .from(workspaces)
        .where(gte(workspaces.createdAt, since));

    // Subscription breakdown
    const allSubs = await db.query.subscriptions.findMany({
        limit: 10000,
    });
    const activeSubs = allSubs.filter((s) => s.status === "active" || s.status === "trialing");

    // MRR calculation
    let mrrCents = 0;
    const tierCounts: Record<string, number> = { free: 0, team: 0, startup: 0, enterprise: 0 };
    for (const sub of allSubs) {
        if (sub.status === "active") {
            const plan = getPlanLimits(sub);
            mrrCents += plan.price * 100;
            const tierKey = plan.name.toLowerCase();
            tierCounts[tierKey] = (tierCounts[tierKey] ?? 0) + 1;
        } else {
            tierCounts.free = (tierCounts.free ?? 0) + 1;
        }
    }

    // Workspaces with no subscription -> free tier
    const [{ noSubCount }] = await db.select({ noSubCount: count() }).from(workspaces);
    const freeCount = Number(noSubCount) - allSubs.length;
    tierCounts.free += Math.max(0, freeCount);

    // Total users
    const [{ totalMembers }] = await db.select({ totalMembers: count() }).from(workspaceMembers);

    const [{ newMembers }] = await db
        .select({ newMembers: count() })
        .from(workspaceMembers)
        .where(gte(workspaceMembers.joinedAt, since));

    // Total tools researched
    const [{ totalTools }] = await db.select({ totalTools: count() }).from(tools);

    const [{ newTools }] = await db
        .select({ newTools: count() })
        .from(tools)
        .where(gte(tools.submittedAt, since));

    // Churned subscriptions
    const [{ churnedSubs }] = await db
        .select({ churnedSubs: count() })
        .from(subscriptions)
        .where(and(eq(subscriptions.status, "canceled"), gte(subscriptions.updatedAt, since)));

    // Recent webhook events (last 50)
    const recentWebhooks = await db
        .select()
        .from(webhookEvents)
        .orderBy(desc(webhookEvents.processedAt))
        .limit(50);

    // Top workspaces by tool count
    const topWorkspaces = await db
        .select({
            workspaceName: workspaces.name,
            toolCount: count(tools.id),
        })
        .from(workspaces)
        .leftJoin(tools, eq(tools.workspaceId, workspaces.id))
        .groupBy(workspaces.id, workspaces.name)
        .orderBy(desc(count(tools.id)))
        .limit(10);

    // 30-day daily signup trend
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const dailySignups = await db
        .select({
            date: sql<string>`date_trunc('day', ${workspaces.createdAt})::date::text`,
            count: count(),
        })
        .from(workspaces)
        .where(gte(workspaces.createdAt, thirtyDaysAgo))
        .groupBy(sql`date_trunc('day', ${workspaces.createdAt})`)
        .orderBy(sql`date_trunc('day', ${workspaces.createdAt})`);

    // Fill gaps with 0s to get a full 30-day series
    const trendMap = new Map(dailySignups.map((r) => [r.date, Number(r.count)]));
    const trendData: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        trendData.push({ date: label, count: trendMap.get(key) ?? 0 });
    }

    // Conversion rate: paid / total workspaces
    const paidCount = (tierCounts.team ?? 0) + (tierCounts.startup ?? 0) + (tierCounts.enterprise ?? 0);
    const totalForConversion = Object.values(tierCounts).reduce((a, b) => a + b, 0);
    const conversionRate = totalForConversion > 0 ? Math.round((paidCount / totalForConversion) * 100) : 0;

    // -- Lead Funnel + Platform Health -----------------------------------------
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000);
    const thirtyOneDaysAgo = new Date(Date.now() - 31 * 86400000);

    const [
        [{ totalLeads }],
        [{ completedScorecards }],
        [{ workspacesFromLeads }],
        pipelineCounts,
        [{ avgLeadScoreResult }],
        [{ researchJobsThisWeek }],
        [{ researchJobsLastWeek }],
        [{ creditsConsumedThisMonth }],
        [{ leadsThisWeek }],
        [{ leadsLastWeek }],
        activeUsersThisWeek,
        [{ totalCreditPurchases }],
    ] = await Promise.all([
        db.select({ totalLeads: count() }).from(auditSubmissions),
        db.select({ completedScorecards: count() }).from(auditSubmissions).where(eq(auditSubmissions.status, "complete")),
        db.select({ workspacesFromLeads: count() }).from(auditSubmissions).where(isNotNull(auditSubmissions.preBuiltWorkspaceId)),
        db.select({ status: auditSubmissions.status, statusCount: count() }).from(auditSubmissions).groupBy(auditSubmissions.status),
        db.select({
            avgLeadScoreResult: sql<string>`coalesce(avg((${auditSubmissions.scorecard}->>'overallScore')::numeric), 0)`,
        }).from(auditSubmissions).where(eq(auditSubmissions.status, "complete")),
        db.select({ researchJobsThisWeek: count() }).from(researchJobs).where(gte(researchJobs.triggeredAt, sevenDaysAgo)),
        db.select({ researchJobsLastWeek: count() }).from(researchJobs).where(
            and(gte(researchJobs.triggeredAt, fourteenDaysAgo), lte(researchJobs.triggeredAt, sevenDaysAgo)),
        ),
        db.select({ creditsConsumedThisMonth: count() }).from(researchJobs).where(gte(researchJobs.triggeredAt, thirtyOneDaysAgo)),
        db.select({ leadsThisWeek: count() }).from(auditSubmissions).where(gte(auditSubmissions.createdAt, sevenDaysAgo)),
        db.select({ leadsLastWeek: count() }).from(auditSubmissions).where(
            and(gte(auditSubmissions.createdAt, fourteenDaysAgo), lte(auditSubmissions.createdAt, sevenDaysAgo)),
        ),
        db.selectDistinct({ userId: researchJobs.triggeredBy }).from(researchJobs).where(gte(researchJobs.triggeredAt, sevenDaysAgo)),
        db.select({ totalCreditPurchases: count() }).from(webhookEvents).where(eq(webhookEvents.eventType, "checkout.session.completed")),
    ]);

    const leadConversionRate =
        Number(completedScorecards) > 0 ? Math.round((Number(workspacesFromLeads) / Number(completedScorecards)) * 100) : 0;

    const pipelineMap: Record<string, number> = {};
    for (const row of pipelineCounts) {
        pipelineMap[row.status] = Number(row.statusCount);
    }

    const avgLeadScore = avgLeadScoreResult ? Math.round(Number(avgLeadScoreResult)) : 0;

    return {
        totalWorkspaces: Number(totalWorkspaces),
        newWorkspaces: Number(newWorkspaces),
        totalMembers: Number(totalMembers),
        newMembers: Number(newMembers),
        totalTools: Number(totalTools),
        newTools: Number(newTools),
        activeSubs: activeSubs.length,
        mrrCents,
        tierCounts,
        churnedSubs: Number(churnedSubs),
        recentWebhooks,
        topWorkspaces,
        trendData,
        conversionRate,
        paidCount,
        totalLeads: Number(totalLeads),
        completedScorecards: Number(completedScorecards),
        workspacesFromLeads: Number(workspacesFromLeads),
        leadConversionRate,
        totalCreditPurchases: Number(totalCreditPurchases),
        avgLeadScore,
        researchJobsThisWeek: Number(researchJobsThisWeek),
        researchJobsLastWeek: Number(researchJobsLastWeek),
        activeUsersThisWeek: activeUsersThisWeek.length,
        creditsConsumedThisMonth: Number(creditsConsumedThisMonth),
        leadsThisWeek: Number(leadsThisWeek),
        leadsLastWeek: Number(leadsLastWeek),
        pipelineMap,
    };
}

// -- Metric Card ---------------------------------------------------------------

function MetricCard({ value, label }: { value: string; label: string }) {
    return (
        <div className="border border-black p-4">
            <p className="font-mono text-2xl font-bold">{value}</p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-500 mt-1">{label}</p>
        </div>
    );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
    return (
        <div className="border border-black bg-white p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">{label}</p>
            <p className="font-mono text-3xl font-bold">{value}</p>
            {sub && <p className="font-mono text-xs text-neutral-400 mt-1">{sub}</p>}
        </div>
    );
}

// -- Page ----------------------------------------------------------------------

export default async function AdminAnalyticsPage({
    searchParams,
}: {
    searchParams: Promise<{ window?: string }>;
}) {
    const authed = await isAdminAuthenticated();

    if (!authed) {
        return (
            <div className="max-w-sm mx-auto mt-24">
                <h1 className="font-serif text-3xl mb-6">Admin Login</h1>
                <form action={loginAction} className="flex flex-col gap-3">
                    <input
                        type="password"
                        name="password"
                        placeholder="Admin password"
                        className="border border-black px-4 py-2 font-mono text-sm bg-white focus:outline-none"
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="border border-black bg-black text-white px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-neutral-800"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        );
    }

    const params = await searchParams;
    const windowDays = parseInt(params.window ?? "30", 10);
    const data = await getAnalytics(windowDays);

    const windowOptions = [
        { label: "7d", value: 7 },
        { label: "30d", value: 30 },
        { label: "90d", value: 90 },
    ];

    const leadsDiff = data.leadsThisWeek - data.leadsLastWeek;
    const researchDiff = data.researchJobsThisWeek - data.researchJobsLastWeek;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">Admin</p>
                    <h1 className="font-serif text-3xl font-normal">Business Analytics</h1>
                </div>
                <div className="flex items-center gap-2">
                    {windowOptions.map((o) => (
                        <a
                            key={o.value}
                            href={`/admin/analytics?window=${o.value}`}
                            className={`font-mono text-xs uppercase tracking-widest border px-3 py-1.5 ${windowDays === o.value ? "bg-black text-white border-black" : "border-black hover:bg-neutral-100"}`}
                        >
                            {o.label}
                        </a>
                    ))}
                    <a
                        href="/admin/api"
                        className="font-mono text-xs uppercase tracking-widest border border-neutral-300 text-neutral-500 px-3 py-1.5 hover:border-black hover:text-black ml-4"
                    >
                        API Dashboard
                    </a>
                </div>
            </div>

            {/* Row 1 -- Lead Funnel */}
            <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-2">Lead Funnel</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <MetricCard value={fmt(data.totalLeads)} label="Total Leads" />
                    <MetricCard value={fmt(data.completedScorecards)} label="Completed Scorecards" />
                    <MetricCard value={fmt(data.workspacesFromLeads)} label="Workspaces Created" />
                    <MetricCard value={`${data.leadConversionRate}%`} label="Conversion Rate" />
                </div>
            </div>

            {/* Row 2 -- Revenue */}
            <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-2">Revenue</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <MetricCard value={fmt(data.activeSubs)} label="Active Subscriptions" />
                    <MetricCard value={fmtUsd(data.mrrCents)} label="MRR" />
                    <MetricCard value={fmt(data.totalCreditPurchases)} label="Credit Packs Purchased" />
                    <MetricCard value={String(data.avgLeadScore)} label="Avg Lead Score" />
                </div>
            </div>

            {/* Row 3 -- Platform Health */}
            <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-2">Platform Health</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <MetricCard value={fmt(data.totalTools)} label="Total Tools Tracked" />
                    <MetricCard value={fmt(data.researchJobsThisWeek)} label="Research Jobs This Week" />
                    <MetricCard value={fmt(data.activeUsersThisWeek)} label="Active Users This Week" />
                    <MetricCard value={fmt(data.creditsConsumedThisMonth)} label="Credits Consumed This Month" />
                </div>
            </div>

            {/* This Week vs Last Week */}
            <div className="border border-black p-5">
                <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-3">This Week vs Last Week</p>
                <div className="space-y-1">
                    <p className="font-mono text-sm">
                        <span className="text-neutral-500 inline-block w-28">LEADS:</span>
                        <span className="font-bold">{data.leadsThisWeek} this week</span>
                        <span className="text-neutral-400 ml-2">
                            ({leadsDiff >= 0 ? "+" : ""}
                            {leadsDiff} vs last week)
                        </span>
                    </p>
                    <p className="font-mono text-sm">
                        <span className="text-neutral-500 inline-block w-28">RESEARCH:</span>
                        <span className="font-bold">{data.researchJobsThisWeek} this week</span>
                        <span className="text-neutral-400 ml-2">
                            ({researchDiff >= 0 ? "+" : ""}
                            {researchDiff} vs last week)
                        </span>
                    </p>
                </div>
            </div>

            {/* Lead Pipeline */}
            <div className="border border-black">
                <div className="border-b border-black px-5 py-3">
                    <h2 className="font-mono text-xs uppercase tracking-widest">Pipeline</h2>
                </div>
                <div className="p-5 space-y-2">
                    {(["pending", "processing", "complete", "failed"] as const).map((status) => {
                        const n = data.pipelineMap[status] ?? 0;
                        const label = n === 1 ? "lead" : "leads";
                        const extra = status === "complete" ? ` (avg score: ${data.avgLeadScore})` : "";
                        return (
                            <div key={status} className="flex items-center justify-between font-mono text-sm">
                                <span className="capitalize text-neutral-600">{status}:</span>
                                <span>
                                    {n} {label}
                                    {extra}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Conversion Rate + 30-day trend */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-black">
                    <div className="border-b border-black px-5 py-3">
                        <h2 className="font-mono text-xs uppercase tracking-widest">Free to Paid Conversion</h2>
                    </div>
                    <div className="p-5">
                        <div className="flex items-end gap-1 mb-2">
                            <span className="font-mono text-4xl font-bold leading-none">{data.conversionRate}%</span>
                        </div>
                        <p className="font-mono text-xs text-neutral-500 mb-4">
                            {data.paidCount} paid / {Object.values(data.tierCounts).reduce((a, b) => a + b, 0)} total workspaces
                        </p>
                        <AnimatedBar value={data.conversionRate} height="h-2" delay={200} />
                        <div className="flex justify-between mt-1">
                            <span className="font-mono text-[9px] text-neutral-400">0%</span>
                            <span className="font-mono text-[9px] text-neutral-400">Target: 8%</span>
                            <span className="font-mono text-[9px] text-neutral-400">100%</span>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 border border-black">
                    <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                        <h2 className="font-mono text-xs uppercase tracking-widest">30-Day Signup Trend</h2>
                        <span className="font-mono text-[10px] text-neutral-400">New workspaces per day</span>
                    </div>
                    <div className="p-5">
                        <AdminTrendChart data={data.trendData} />
                    </div>
                </div>
            </div>

            {/* Tools + Plan breakdown side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plan breakdown */}
                <div className="border border-black">
                    <div className="border-b border-black px-5 py-3">
                        <h2 className="font-mono text-xs uppercase tracking-widest">Subscription Tiers</h2>
                    </div>
                    <div className="p-5 space-y-3">
                        {[
                            { key: "enterprise", label: "Enterprise", price: PLANS.ENTERPRISE.price },
                            { key: "startup", label: "Startup", price: PLANS.STARTUP.price },
                            { key: "team", label: "Team", price: PLANS.TEAM.price },
                            { key: "free", label: "Free", price: 0 },
                        ].map(({ key, label, price }) => {
                            const n = data.tierCounts[key] ?? 0;
                            const total = Object.values(data.tierCounts).reduce((a, b) => a + b, 0);
                            const pct = total > 0 ? Math.round((n / total) * 100) : 0;
                            return (
                                <div key={key}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-mono text-xs">
                                            {label} {price > 0 && `($${price}/mo)`}
                                        </span>
                                        <span className="font-mono text-xs text-neutral-500">
                                            {n} ({pct}%)
                                        </span>
                                    </div>
                                    <AnimatedBar value={pct} height="h-1.5" delay={150} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tools researched */}
                <div className="border border-black">
                    <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                        <h2 className="font-mono text-xs uppercase tracking-widest">Tool Research</h2>
                        <span className="font-mono text-[10px] text-neutral-400">Total: {fmt(data.totalTools)}</span>
                    </div>
                    <div className="p-5">
                        <p className="font-mono text-4xl font-bold mb-1">+{fmt(data.newTools)}</p>
                        <p className="font-mono text-xs text-neutral-500">tools researched in the last {windowDays} days</p>
                        <div className="mt-6">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-3">
                                Top workspaces by tool count
                            </p>
                            <div className="space-y-1.5">
                                {data.topWorkspaces.slice(0, 5).map((ws) => (
                                    <div key={ws.workspaceName} className="flex items-center justify-between">
                                        <span className="font-mono text-xs truncate max-w-[200px]">{ws.workspaceName}</span>
                                        <span className="font-mono text-xs text-neutral-500">{ws.toolCount} tools</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Webhook event audit log */}
            <div className="border border-black">
                <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                    <h2 className="font-mono text-xs uppercase tracking-widest">Recent Webhook Events</h2>
                    <span className="font-mono text-[10px] text-neutral-400">Last 50</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-black">
                                <th className="text-left px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                                    Source
                                </th>
                                <th className="text-left px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                                    Type
                                </th>
                                <th className="text-left px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                                    Status
                                </th>
                                <th className="text-left px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                                    Processed At
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recentWebhooks.map((evt) => (
                                <tr key={evt.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                                    <td className="px-4 py-2 font-mono text-xs uppercase">{evt.source}</td>
                                    <td className="px-4 py-2 font-mono text-xs text-neutral-600">{evt.eventType}</td>
                                    <td className="px-4 py-2">
                                        {evt.error ? (
                                            <span className="font-mono text-[10px] uppercase tracking-widest text-red-500 border border-red-200 px-1.5 py-0.5">
                                                Error
                                            </span>
                                        ) : (
                                            <span className="font-mono text-[10px] uppercase tracking-widest text-black border border-neutral-200 px-1.5 py-0.5">
                                                OK
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 font-mono text-xs text-neutral-400">
                                        {new Date(evt.processedAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {data.recentWebhooks.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center font-mono text-xs text-neutral-400">
                                        No webhook events yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
