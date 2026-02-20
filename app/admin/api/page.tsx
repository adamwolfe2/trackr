export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { apiLogs, workspaces } from "@/lib/db/schema";

export const metadata: Metadata = {
    title: "Admin API Dashboard — Trackr",
    description: "Monitor API usage and costs.",
    robots: { index: false },
};
import { sql, desc, eq, gte } from "drizzle-orm";

// ── Auth check ──────────────────────────────────────────────────────────────

async function getAdminCookie(): Promise<string | undefined> {
    const { cookies } = await import("next/headers");
    const cookie = (await cookies()).get("trackr-admin");
    return cookie?.value;
}

function isAuthenticated(cookieValue: string | undefined): boolean {
    if (!cookieValue || !process.env.ADMIN_PASSWORD) return false;
    const { timingSafeEqual, createHash } = require("crypto");
    const expectedToken = createHash("sha256").update(process.env.ADMIN_PASSWORD).digest("hex");
    const a = Buffer.from(cookieValue);
    const b = Buffer.from(expectedToken);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
}

// ── Server actions ──────────────────────────────────────────────────────────

async function loginAction(formData: FormData) {
    "use server";
    const password = formData.get("password") as string;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!password || !adminPassword) return;

    const { timingSafeEqual, createHash } = await import("crypto");
    const a = Buffer.from(password);
    const b = Buffer.from(adminPassword);
    if (a.length === b.length && timingSafeEqual(a, b)) {
        // Store a derived token in cookie instead of raw password
        const token = createHash("sha256").update(adminPassword).digest("hex");
        const { cookies } = await import("next/headers");
        (await cookies()).set("trackr-admin", token, {
            httpOnly: true,
            secure: true,
            maxAge: 60 * 60 * 24 * 7, // 7 days
            sameSite: "strict",
        });
        const { redirect } = await import("next/navigation");
        redirect("/admin/api");
    }
}

async function logoutAction() {
    "use server";
    const { cookies } = await import("next/headers");
    (await cookies()).delete("trackr-admin");
    const { redirect } = await import("next/navigation");
    redirect("/admin/api");
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCost(value: string | number | null): string {
    const num = Number(value ?? 0);
    return `$${num.toFixed(2)}`;
}

function formatCostPrecise(value: string | number | null): string {
    const num = Number(value ?? 0);
    return `$${num.toFixed(4)}`;
}

function formatNumber(value: string | number | null): string {
    return Number(value ?? 0).toLocaleString();
}

function formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTimestamp(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

// ── Types ───────────────────────────────────────────────────────────────────

interface TotalStats {
    totalCalls: string;
    totalCost: string;
    avgCost: string;
    callsToday: string;
    costToday: string;
}

interface ServiceBreakdown {
    service: string;
    count: string;
    totalCost: string;
    avgDuration: string;
}

interface DailyTrend {
    date: string;
    totalCalls: string;
    totalCost: string;
    topService: string;
}

interface WorkspaceBreakdown {
    workspaceId: string | null;
    workspaceName: string | null;
    count: string;
    totalCost: string;
}

interface RecentCall {
    createdAt: Date;
    service: string;
    endpoint: string;
    durationMs: number | null;
    estimatedCost: string | null;
    workspaceName: string | null;
}

// ── Data fetching ───────────────────────────────────────────────────────────

async function fetchDashboardData() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // A) Total stats (last 30 days)
    const totalStatsResult = await db
        .select({
            totalCalls: sql<string>`count(*)`,
            totalCost: sql<string>`coalesce(sum(${apiLogs.estimatedCost}), 0)`,
            avgCost: sql<string>`coalesce(avg(${apiLogs.estimatedCost}), 0)`,
        })
        .from(apiLogs)
        .where(gte(apiLogs.createdAt, thirtyDaysAgo));

    const todayResult = await db
        .select({
            callsToday: sql<string>`count(*)`,
            costToday: sql<string>`coalesce(sum(${apiLogs.estimatedCost}), 0)`,
        })
        .from(apiLogs)
        .where(gte(apiLogs.createdAt, todayStart));

    const totalStats: TotalStats = {
        totalCalls: totalStatsResult[0]?.totalCalls ?? "0",
        totalCost: totalStatsResult[0]?.totalCost ?? "0",
        avgCost: totalStatsResult[0]?.avgCost ?? "0",
        callsToday: todayResult[0]?.callsToday ?? "0",
        costToday: todayResult[0]?.costToday ?? "0",
    };

    // B) Per-service breakdown (last 30 days)
    const serviceBreakdown: ServiceBreakdown[] = await db
        .select({
            service: apiLogs.service,
            count: sql<string>`count(*)`,
            totalCost: sql<string>`coalesce(sum(${apiLogs.estimatedCost}), 0)`,
            avgDuration: sql<string>`coalesce(avg(${apiLogs.durationMs}), 0)`,
        })
        .from(apiLogs)
        .where(gte(apiLogs.createdAt, thirtyDaysAgo))
        .groupBy(apiLogs.service)
        .orderBy(sql`count(*) desc`);

    // C) Daily trend (last 14 days)
    const dailyRaw = await db
        .select({
            date: sql<string>`date(${apiLogs.createdAt})`,
            service: apiLogs.service,
            count: sql<string>`count(*)`,
            cost: sql<string>`coalesce(sum(${apiLogs.estimatedCost}), 0)`,
        })
        .from(apiLogs)
        .where(gte(apiLogs.createdAt, fourteenDaysAgo))
        .groupBy(sql`date(${apiLogs.createdAt})`, apiLogs.service)
        .orderBy(sql`date(${apiLogs.createdAt}) desc`);

    // Aggregate daily data: per-date totals + top service
    const dailyMap = new Map<string, { totalCalls: number; totalCost: number; serviceCounts: Map<string, number> }>();
    for (const row of dailyRaw) {
        const existing = dailyMap.get(row.date) ?? { totalCalls: 0, totalCost: 0, serviceCounts: new Map() };
        const count = Number(row.count);
        existing.totalCalls += count;
        existing.totalCost += Number(row.cost);
        existing.serviceCounts.set(row.service, (existing.serviceCounts.get(row.service) ?? 0) + count);
        dailyMap.set(row.date, existing);
    }

    const dailyTrend: DailyTrend[] = Array.from(dailyMap.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([date, data]) => {
            let topService = "";
            let topCount = 0;
            for (const [svc, cnt] of data.serviceCounts) {
                if (cnt > topCount) {
                    topService = svc;
                    topCount = cnt;
                }
            }
            return {
                date,
                totalCalls: String(data.totalCalls),
                totalCost: String(data.totalCost),
                topService,
            };
        });

    // D) Per-workspace breakdown (last 30 days, top 10)
    const workspaceBreakdown: WorkspaceBreakdown[] = await db
        .select({
            workspaceId: apiLogs.workspaceId,
            workspaceName: workspaces.name,
            count: sql<string>`count(*)`,
            totalCost: sql<string>`coalesce(sum(${apiLogs.estimatedCost}), 0)`,
        })
        .from(apiLogs)
        .leftJoin(workspaces, eq(apiLogs.workspaceId, workspaces.id))
        .where(gte(apiLogs.createdAt, thirtyDaysAgo))
        .groupBy(apiLogs.workspaceId, workspaces.name)
        .orderBy(sql`count(*) desc`)
        .limit(10);

    // E) Recent calls (last 50)
    const recentCalls: RecentCall[] = await db
        .select({
            createdAt: apiLogs.createdAt,
            service: apiLogs.service,
            endpoint: apiLogs.endpoint,
            durationMs: apiLogs.durationMs,
            estimatedCost: apiLogs.estimatedCost,
            workspaceName: workspaces.name,
        })
        .from(apiLogs)
        .leftJoin(workspaces, eq(apiLogs.workspaceId, workspaces.id))
        .orderBy(desc(apiLogs.createdAt))
        .limit(50);

    return { totalStats, serviceBreakdown, dailyTrend, workspaceBreakdown, recentCalls };
}

// ── Login form component ────────────────────────────────────────────────────

function LoginForm() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="border-2 border-black bg-white p-8 w-full max-w-sm">
                <h1 className="font-mono text-xs uppercase tracking-widest mb-6">
                    TRACKR ADMIN
                </h1>
                <form action={loginAction}>
                    <label
                        htmlFor="password"
                        className="font-mono text-xs uppercase tracking-widest block mb-2"
                    >
                        Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        required
                        autoFocus
                        className="w-full border-2 border-black bg-[#F3F3EF] px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <button
                        type="submit"
                        className="mt-4 w-full border-2 border-black bg-black text-white font-mono text-xs uppercase tracking-widest py-2 hover:bg-white hover:text-black transition-colors"
                    >
                        Enter
                    </button>
                </form>
            </div>
        </div>
    );
}

// ── Dashboard component ─────────────────────────────────────────────────────

async function Dashboard() {
    const { totalStats, serviceBreakdown, dailyTrend, workspaceBreakdown, recentCalls } =
        await fetchDashboardData();

    const hasData = Number(totalStats.totalCalls) > 0;
    const dailyCost = Number(totalStats.costToday);

    if (!hasData) {
        return (
            <div>
                <Header />
                <div className="border-2 border-black bg-white p-12 text-center">
                    <p className="font-mono text-sm text-black/50">
                        No API logs yet. Logs will appear here once API calls are tracked.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header />

            {/* ── Alert Banner (client-side threshold check) ──── */}
            <AlertBanner dailyCost={dailyCost} />

            {/* ── Total Stats ────────────────────────────────── */}
            <section className="mb-8">
                <h2 className="font-mono text-xs uppercase tracking-widest mb-4">
                    Last 30 Days
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-0">
                    <StatCard label="Calls" value={formatNumber(totalStats.totalCalls)} />
                    <StatCard label="Cost" value={formatCost(totalStats.totalCost)} />
                    <StatCard label="Avg / Call" value={formatCostPrecise(totalStats.avgCost)} />
                    <StatCard label="Today" value={formatNumber(totalStats.callsToday)} />
                    <StatCard label="Today Cost" value={formatCost(totalStats.costToday)} highlight={dailyCost > 0} />
                </div>
            </section>

            {/* ── Daily Spend Indicator ───────────────────────── */}
            <DailySpendIndicator dailyCost={dailyCost} />

            {/* ── Alerts Configuration ───────────────────────── */}
            <AlertsConfig />

            {/* ── By Service ─────────────────────────────────── */}
            <section className="mb-8">
                <h2 className="font-mono text-xs uppercase tracking-widest mb-4">
                    By Service
                </h2>
                <div className="border-2 border-black bg-white overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-black">
                                <th className="font-mono text-xs uppercase tracking-widest text-left px-4 py-3">
                                    Service
                                </th>
                                <th className="font-mono text-xs uppercase tracking-widest text-right px-4 py-3">
                                    Calls
                                </th>
                                <th className="font-mono text-xs uppercase tracking-widest text-right px-4 py-3">
                                    Cost
                                </th>
                                <th className="font-mono text-xs uppercase tracking-widest text-right px-4 py-3">
                                    Avg ms
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {serviceBreakdown.map((row) => (
                                <tr key={row.service} className="border-b border-black/20 last:border-b-0">
                                    <td className="font-mono text-sm px-4 py-3">{row.service}</td>
                                    <td className="font-mono text-sm text-right px-4 py-3">
                                        {formatNumber(row.count)}
                                    </td>
                                    <td className="font-mono text-sm text-right px-4 py-3">
                                        {formatCost(row.totalCost)}
                                    </td>
                                    <td className="font-mono text-sm text-right px-4 py-3">
                                        {formatNumber(Math.round(Number(row.avgDuration)))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ── Daily Trend ────────────────────────────────── */}
            <section className="mb-8">
                <h2 className="font-mono text-xs uppercase tracking-widest mb-4">
                    Daily Trend (14 days)
                </h2>
                <div className="border-2 border-black bg-white overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-black">
                                <th className="font-mono text-xs uppercase tracking-widest text-left px-4 py-3">
                                    Date
                                </th>
                                <th className="font-mono text-xs uppercase tracking-widest text-right px-4 py-3">
                                    Calls
                                </th>
                                <th className="font-mono text-xs uppercase tracking-widest text-right px-4 py-3">
                                    Cost
                                </th>
                                <th className="font-mono text-xs uppercase tracking-widest text-left px-4 py-3">
                                    Top Svc
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {dailyTrend.map((row) => (
                                <tr key={row.date} className="border-b border-black/20 last:border-b-0">
                                    <td className="font-mono text-sm px-4 py-3">
                                        {formatDate(row.date)}
                                    </td>
                                    <td className="font-mono text-sm text-right px-4 py-3">
                                        {formatNumber(row.totalCalls)}
                                    </td>
                                    <td className="font-mono text-sm text-right px-4 py-3">
                                        {formatCost(row.totalCost)}
                                    </td>
                                    <td className="font-mono text-sm px-4 py-3">{row.topService}</td>
                                </tr>
                            ))}
                            {dailyTrend.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="font-mono text-sm text-black/50 px-4 py-6 text-center">
                                        No data for the last 14 days
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ── Top Workspaces ──────────────────────────────── */}
            <section className="mb-8">
                <h2 className="font-mono text-xs uppercase tracking-widest mb-4">
                    Top Workspaces
                </h2>
                <div className="border-2 border-black bg-white overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-black">
                                <th className="font-mono text-xs uppercase tracking-widest text-left px-4 py-3">
                                    Workspace
                                </th>
                                <th className="font-mono text-xs uppercase tracking-widest text-right px-4 py-3">
                                    Calls
                                </th>
                                <th className="font-mono text-xs uppercase tracking-widest text-right px-4 py-3">
                                    Cost
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {workspaceBreakdown.map((row) => (
                                <tr
                                    key={row.workspaceId ?? "no-workspace"}
                                    className="border-b border-black/20 last:border-b-0"
                                >
                                    <td className="font-mono text-sm px-4 py-3">
                                        {row.workspaceName ?? row.workspaceId ?? "\u2014"}
                                    </td>
                                    <td className="font-mono text-sm text-right px-4 py-3">
                                        {formatNumber(row.count)}
                                    </td>
                                    <td className="font-mono text-sm text-right px-4 py-3">
                                        {formatCost(row.totalCost)}
                                    </td>
                                </tr>
                            ))}
                            {workspaceBreakdown.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="font-mono text-sm text-black/50 px-4 py-6 text-center">
                                        No workspace data
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ── Recent Calls ────────────────────────────────── */}
            <section className="mb-8">
                <h2 className="font-mono text-xs uppercase tracking-widest mb-4">
                    Recent Calls
                </h2>
                <div className="border-2 border-black bg-white overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-black">
                                <th className="font-mono text-xs uppercase tracking-widest text-left px-4 py-3">
                                    Time
                                </th>
                                <th className="font-mono text-xs uppercase tracking-widest text-left px-4 py-3">
                                    Service
                                </th>
                                <th className="font-mono text-xs uppercase tracking-widest text-left px-4 py-3">
                                    Endpoint
                                </th>
                                <th className="font-mono text-xs uppercase tracking-widest text-right px-4 py-3">
                                    ms
                                </th>
                                <th className="font-mono text-xs uppercase tracking-widest text-right px-4 py-3">
                                    Cost
                                </th>
                                <th className="font-mono text-xs uppercase tracking-widest text-left px-4 py-3">
                                    Workspace
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentCalls.map((row, i) => (
                                <tr key={i} className="border-b border-black/20 last:border-b-0">
                                    <td className="font-mono text-xs px-4 py-2 whitespace-nowrap">
                                        {formatTimestamp(row.createdAt)}
                                    </td>
                                    <td className="font-mono text-xs px-4 py-2">{row.service}</td>
                                    <td className="font-mono text-xs px-4 py-2 max-w-[200px] truncate">
                                        {row.endpoint}
                                    </td>
                                    <td className="font-mono text-xs text-right px-4 py-2">
                                        {row.durationMs != null ? formatNumber(row.durationMs) : "\u2014"}
                                    </td>
                                    <td className="font-mono text-xs text-right px-4 py-2">
                                        {row.estimatedCost != null ? formatCostPrecise(row.estimatedCost) : "\u2014"}
                                    </td>
                                    <td className="font-mono text-xs px-4 py-2 max-w-[150px] truncate">
                                        {row.workspaceName ?? "\u2014"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Header() {
    return (
        <div className="flex items-center justify-between mb-8 border-b-2 border-black pb-4">
            <h1 className="font-mono text-xs uppercase tracking-widest">
                Trackr Admin &mdash; API Monitoring
            </h1>
            <form action={logoutAction}>
                <button
                    type="submit"
                    className="border-2 border-black bg-white px-4 py-1 font-mono text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                >
                    Logout
                </button>
            </form>
        </div>
    );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className={`border-2 border-black bg-white p-4 -ml-[2px] first:ml-0 -mt-[2px] first:mt-0 md:mt-0 ${highlight ? "bg-neutral-50" : ""}`}>
            <p className="font-mono text-xs uppercase tracking-widest text-black/50 mb-1">
                {label}
            </p>
            <p className="font-serif text-3xl md:text-4xl">{value}</p>
        </div>
    );
}

// ── Alert Banner (client component) ─────────────────────────────────────────

function AlertBanner({ dailyCost }: { dailyCost: number }) {
    // This is rendered server-side but reads threshold from the client component
    // The actual threshold comparison happens in the client-side AlertsConfig component
    // We pass dailyCost as a data attribute for the client script to read
    return (
        <div
            id="alert-banner"
            data-daily-cost={dailyCost.toFixed(4)}
            className="hidden mb-6 border-2 border-[#C0392B] bg-[#C0392B]/5 p-4"
        >
            <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
                    <path d="M10 2L18 17H2L10 2Z" stroke="#C0392B" strokeWidth="2" fill="none" />
                    <path d="M10 8V12" stroke="#C0392B" strokeWidth="2" strokeLinecap="square" />
                    <circle cx="10" cy="14.5" r="1" fill="#C0392B" />
                </svg>
                <div>
                    <p className="font-mono text-sm font-bold text-[#C0392B]">
                        Daily Spend Alert
                    </p>
                    <p id="alert-message" className="font-mono text-xs text-[#C0392B]/80 mt-0.5">
                        Daily spend of ${dailyCost.toFixed(2)} has exceeded your threshold.
                    </p>
                </div>
            </div>
        </div>
    );
}

// ── Daily Spend Indicator ───────────────────────────────────────────────────

function DailySpendIndicator({ dailyCost }: { dailyCost: number }) {
    return (
        <section className="mb-8" id="daily-spend-section">
            <h2 className="font-mono text-xs uppercase tracking-widest mb-4">
                Daily Spend
            </h2>
            <div className="border-2 border-black bg-white p-6">
                <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs uppercase tracking-widest text-black/50">
                        Today&apos;s Total
                    </span>
                    <span id="daily-threshold-label" className="font-mono text-xs text-black/50">
                        {/* Threshold shown via client JS */}
                    </span>
                </div>
                <div className="flex items-baseline gap-3 mb-3">
                    <span className="font-serif text-4xl">${dailyCost.toFixed(2)}</span>
                    <span id="threshold-display" className="font-mono text-sm text-black/40">
                        {/* Filled in via client JS: "/ $X.XX threshold" */}
                    </span>
                </div>
                {/* Progress bar - filled via client JS */}
                <div className="h-3 border border-black/20 bg-neutral-100 overflow-hidden">
                    <div
                        id="daily-spend-bar"
                        className="h-full bg-black transition-all"
                        style={{ width: "0%" }}
                        data-cost={dailyCost.toFixed(4)}
                    />
                </div>
                <div id="spend-pct-label" className="font-mono text-xs text-black/40 mt-1 text-right" />
            </div>
        </section>
    );
}

// ── Alerts Configuration (uses localStorage for threshold) ──────────────────

function AlertsConfig() {
    return (
        <section className="mb-8">
            <h2 className="font-mono text-xs uppercase tracking-widest mb-4">
                Alerts
            </h2>
            <div className="border-2 border-black bg-white p-6">
                <p className="font-mono text-xs text-black/50 mb-4">
                    Set a daily spend threshold. A red alert banner will appear when the threshold is exceeded.
                </p>
                <div className="flex items-end gap-3">
                    <div className="flex-1">
                        <label
                            htmlFor="threshold-input"
                            className="font-mono text-xs uppercase tracking-widest block mb-2"
                        >
                            Daily Spend Threshold ($)
                        </label>
                        <input
                            type="number"
                            id="threshold-input"
                            min="0"
                            step="0.01"
                            placeholder="10.00"
                            className="w-full border-2 border-black bg-[#F3F3EF] px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>
                    <button
                        id="save-threshold-btn"
                        type="button"
                        className="border-2 border-black bg-black text-white px-6 py-2 font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors whitespace-nowrap"
                    >
                        Save
                    </button>
                </div>
                <div id="threshold-saved-msg" className="font-mono text-xs text-black/50 mt-2 hidden">
                    Threshold saved.
                </div>
            </div>

            {/* Client-side script for threshold management */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                    (function() {
                        var STORAGE_KEY = "trackr-admin-daily-threshold";

                        // Load saved threshold
                        var saved = localStorage.getItem(STORAGE_KEY);
                        var threshold = saved ? parseFloat(saved) : null;
                        var input = document.getElementById("threshold-input");
                        var saveBtn = document.getElementById("save-threshold-btn");
                        var savedMsg = document.getElementById("threshold-saved-msg");
                        var alertBanner = document.getElementById("alert-banner");
                        var alertMessage = document.getElementById("alert-message");
                        var thresholdDisplay = document.getElementById("threshold-display");
                        var spendBar = document.getElementById("daily-spend-bar");
                        var spendPctLabel = document.getElementById("spend-pct-label");

                        if (input && saved) {
                            input.value = saved;
                        }

                        function updateUI() {
                            var dailyCost = parseFloat(spendBar ? spendBar.getAttribute("data-cost") : "0");

                            if (threshold !== null && threshold > 0) {
                                // Update threshold display
                                if (thresholdDisplay) {
                                    thresholdDisplay.textContent = "/ $" + threshold.toFixed(2) + " threshold";
                                }

                                // Update progress bar
                                var pct = Math.min(100, (dailyCost / threshold) * 100);
                                if (spendBar) {
                                    spendBar.style.width = pct.toFixed(1) + "%";
                                    if (pct >= 100) {
                                        spendBar.style.backgroundColor = "#C0392B";
                                    } else if (pct >= 80) {
                                        spendBar.style.backgroundColor = "#666";
                                    } else {
                                        spendBar.style.backgroundColor = "#000";
                                    }
                                }
                                if (spendPctLabel) {
                                    spendPctLabel.textContent = pct.toFixed(0) + "% of daily threshold";
                                }

                                // Show/hide alert banner
                                if (dailyCost > threshold && alertBanner) {
                                    alertBanner.classList.remove("hidden");
                                    if (alertMessage) {
                                        alertMessage.textContent = "Daily spend of $" + dailyCost.toFixed(2) + " has exceeded your $" + threshold.toFixed(2) + " threshold.";
                                    }
                                } else if (alertBanner) {
                                    alertBanner.classList.add("hidden");
                                }
                            } else {
                                if (thresholdDisplay) thresholdDisplay.textContent = "";
                                if (spendBar) spendBar.style.width = "0%";
                                if (spendPctLabel) spendPctLabel.textContent = "No threshold set";
                                if (alertBanner) alertBanner.classList.add("hidden");
                            }
                        }

                        // Save threshold
                        if (saveBtn) {
                            saveBtn.addEventListener("click", function() {
                                var val = input ? input.value.trim() : "";
                                if (val && !isNaN(parseFloat(val)) && parseFloat(val) > 0) {
                                    threshold = parseFloat(val);
                                    localStorage.setItem(STORAGE_KEY, String(threshold));
                                    if (savedMsg) {
                                        savedMsg.classList.remove("hidden");
                                        setTimeout(function() { savedMsg.classList.add("hidden"); }, 2000);
                                    }
                                } else {
                                    threshold = null;
                                    localStorage.removeItem(STORAGE_KEY);
                                    if (savedMsg) {
                                        savedMsg.textContent = "Threshold cleared.";
                                        savedMsg.classList.remove("hidden");
                                        setTimeout(function() {
                                            savedMsg.textContent = "Threshold saved.";
                                            savedMsg.classList.add("hidden");
                                        }, 2000);
                                    }
                                }
                                updateUI();
                            });
                        }

                        // Allow Enter key to save
                        if (input) {
                            input.addEventListener("keydown", function(e) {
                                if (e.key === "Enter" && saveBtn) saveBtn.click();
                            });
                        }

                        // Initial UI update
                        updateUI();
                    })();
                    `,
                }}
            />
        </section>
    );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default async function AdminApiPage() {
    const cookieValue = await getAdminCookie();

    if (!isAuthenticated(cookieValue)) {
        return <LoginForm />;
    }

    return <Dashboard />;
}
