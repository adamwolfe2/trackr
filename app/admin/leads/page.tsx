export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { auditSubmissions } from "@/lib/db/schema";
import { desc, eq, or, count } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { rateLimit } from "@/lib/middleware/rate-limit";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { CopyShareUrlButton } from "@/components/admin/copy-share-url-button";
import { computeLeadScore } from "@/lib/utils/lead-scoring";

const PAGE_SIZE = 50;

export const metadata: Metadata = {
    title: "Admin Leads — Trackr",
    description: "Sales rep CRM for audit submissions.",
    robots: { index: false },
};

async function loginAction(formData: FormData) {
    "use server";

    const { headers: getHeaders } = await import("next/headers");
    const headersList = await getHeaders();
    const ip =
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        headersList.get("x-real-ip") ??
        "unknown";
    const rl = await rateLimit(`admin-login:${ip}`, { limit: 5, windowSeconds: 300 });
    if (!rl.success) {
        redirect("/admin/leads?error=rate_limited");
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
            maxAge: 60 * 60 * 2,
            sameSite: "strict",
        });
    }
    redirect("/admin/leads");
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(date: Date): string {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function statusColor(status: string): string {
    switch (status) {
        case "complete": return "text-black border-neutral-200";
        case "processing": return "text-yellow-700 border-yellow-200";
        case "failed": return "text-red-700 border-red-200";
        default: return "text-neutral-500 border-neutral-200";
    }
}

function scoreColor(score: number | null): string {
    if (score === null) return "text-neutral-400";
    if (score >= 61) return "text-black";
    if (score >= 41) return "text-yellow-700";
    return "text-red-700";
}

function tierBadge(tier: "hot" | "warm" | "cold"): string {
    switch (tier) {
        case "hot": return "bg-black text-white";
        case "warm": return "border border-yellow-500 text-yellow-700";
        case "cold": return "border border-neutral-300 text-neutral-500";
    }
}

function paginationHref(page: number, status?: string): string {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `/admin/leads?${qs}` : "/admin/leads";
}

function buildPageNumbers(current: number, total: number): (number | "...")[] {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (current > 3) pages.push("...");
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }
    if (current < total - 2) pages.push("...");
    pages.push(total);
    return pages;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminLeadsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; status?: string }>;
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

    const { status: statusFilter, page: pageParam } = await searchParams;
    const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
    const offset = (currentPage - 1) * PAGE_SIZE;

    // Build WHERE clause at DB level instead of filtering in JS
    const statusWhere = statusFilter === "processing"
        ? or(eq(auditSubmissions.status, "processing"), eq(auditSubmissions.status, "pending"))
        : statusFilter
            ? eq(auditSubmissions.status, statusFilter)
            : undefined;

    // Fetch paginated results + total count in parallel
    // Fetch all matching rows for scoring, then sort by lead score DESC, then paginate in JS
    const [allSubmissions, [{ totalCount }], [{ totalAll }], [{ completeCount }], [{ processingCount }], [{ failedCount }]] = await Promise.all([
        db.select().from(auditSubmissions)
            .where(statusWhere)
            .orderBy(desc(auditSubmissions.createdAt)),
        db.select({ totalCount: count() }).from(auditSubmissions).where(statusWhere),
        db.select({ totalAll: count() }).from(auditSubmissions),
        db.select({ completeCount: count() }).from(auditSubmissions).where(eq(auditSubmissions.status, "complete")),
        db.select({ processingCount: count() }).from(auditSubmissions).where(
            or(eq(auditSubmissions.status, "processing"), eq(auditSubmissions.status, "pending"))
        ),
        db.select({ failedCount: count() }).from(auditSubmissions).where(eq(auditSubmissions.status, "failed")),
    ]);

    // Compute lead scores and sort by score DESC
    const scoredSubmissions = allSubmissions.map(sub => ({
        ...sub,
        leadScore: computeLeadScore({
            revenue: sub.revenue,
            employeeCount: sub.employeeCount,
            monthlySpend: sub.monthlySpend,
            currentTools: sub.currentTools,
            dailyAdoptionPct: sub.dailyAdoptionPct,
            hasAIManager: sub.hasAIManager,
            scorecard: sub.scorecard as Record<string, unknown> | null,
            shareViewedAt: sub.shareViewedAt,
        }),
    }));
    scoredSubmissions.sort((a, b) => b.leadScore.score - a.leadScore.score);

    // Paginate in JS after sorting
    const submissions = scoredSubmissions.slice(offset, offset + PAGE_SIZE);

    const totalPages = Math.max(1, Math.ceil(Number(totalCount) / PAGE_SIZE));
    const rangeStart = offset + 1;
    const rangeEnd = Math.min(offset + PAGE_SIZE, Number(totalCount));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">Admin</p>
                    <h1 className="font-serif text-3xl font-normal">Sales Leads</h1>
                </div>
                <div className="flex items-center gap-2">
                    <a href="/admin/analytics" className="font-mono text-xs uppercase tracking-widest border border-neutral-300 text-neutral-500 px-3 py-1.5 hover:border-black hover:text-black">
                        Analytics
                    </a>
                    <a href="/admin/api" className="font-mono text-xs uppercase tracking-widest border border-neutral-300 text-neutral-500 px-3 py-1.5 hover:border-black hover:text-black">
                        API Dashboard
                    </a>
                </div>
            </div>

            {/* Summary bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px border border-black bg-black">
                {[
                    { label: "Total Leads", value: Number(totalAll) },
                    { label: "Complete", value: Number(completeCount) },
                    { label: "Processing", value: Number(processingCount) },
                    { label: "Failed", value: Number(failedCount) },
                ].map(({ label, value }) => (
                    <div key={label} className="bg-[#F3F3EF] p-5">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">{label}</p>
                        <p className="font-mono text-3xl font-bold">{value}</p>
                    </div>
                ))}
            </div>

            {/* Status filter tabs */}
            <div className="flex items-center gap-1">
                {[
                    { label: "All", value: undefined },
                    { label: "Complete", value: "complete" },
                    { label: "Processing", value: "processing" },
                    { label: "Failed", value: "failed" },
                ].map(({ label, value }) => {
                    const isActive = statusFilter === value;
                    const href = value ? `/admin/leads?status=${value}` : "/admin/leads";
                    return (
                        <a
                            key={label}
                            href={href}
                            className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-colors ${
                                isActive
                                    ? "border-black bg-black text-white"
                                    : "border-neutral-300 text-neutral-500 hover:border-black hover:text-black"
                            }`}
                        >
                            {label}
                        </a>
                    );
                })}
                <span className="font-mono text-xs text-neutral-400 ml-2">
                    {Number(totalCount)} result{Number(totalCount) !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Leads table */}
            <div className="border border-black overflow-x-auto">
                <table className="w-full min-w-[600px]">
                    <thead>
                        <tr className="border-b border-black">
                            <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500">Lead</th>
                            <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500">Company</th>
                            <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500">Contact</th>
                            <th className="hidden sm:table-cell text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500">Revenue</th>
                            <th className="hidden sm:table-cell text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500">Spend/mo</th>
                            <th className="hidden sm:table-cell text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500">Tools</th>
                            <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500">Status</th>
                            <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500">AI Score</th>
                            <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500">Submitted</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.map((sub) => {
                            const scorecard = sub.scorecard as { aiNativeScore?: { score: number } } | null;
                            const score = scorecard?.aiNativeScore?.score ?? null;
                            const domain = sub.companyWebsite
                                ? sub.companyWebsite.replace(/^https?:\/\//, "").replace(/\/$/, "").split("/")[0]
                                : null;
                            const ls = sub.leadScore;

                            return (
                                <tr key={sub.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm font-black">{ls.score}</span>
                                            <span className={`font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.5 ${tierBadge(ls.tier)}`}>
                                                {ls.tier}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-mono text-sm font-bold">{sub.companyName}</p>
                                        {domain && <p className="font-mono text-[10px] text-neutral-400">{domain}</p>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-mono text-xs">{sub.contactName || "—"}</p>
                                        <p className="font-mono text-[10px] text-neutral-400">{sub.contactEmail}</p>
                                        {sub.role && <p className="font-mono text-[10px] text-neutral-400">{sub.role}</p>}
                                    </td>
                                    <td className="hidden sm:table-cell px-4 py-3 font-mono text-xs text-neutral-600">{sub.revenue || "—"}</td>
                                    <td className="hidden sm:table-cell px-4 py-3 font-mono text-xs text-neutral-600">{sub.monthlySpend || "—"}</td>
                                    <td className="hidden sm:table-cell px-4 py-3 font-mono text-xs text-neutral-600">
                                        {sub.currentTools?.length ?? 0}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`font-mono text-[10px] uppercase tracking-widest border px-1.5 py-0.5 ${statusColor(sub.status)}`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {score !== null ? (
                                            <span className={`font-mono text-sm font-bold ${scoreColor(score)}`}>{score}</span>
                                        ) : (
                                            <span className="font-mono text-xs text-neutral-300">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-neutral-400">
                                        {relativeTime(new Date(sub.createdAt))}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <a
                                                href={`/admin/leads/${sub.id}`}
                                                className="font-mono text-xs uppercase tracking-widest border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
                                            >
                                                View →
                                            </a>
                                            {sub.shareToken && (
                                                <CopyShareUrlButton token={sub.shareToken} />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {submissions.length === 0 && (
                            <tr>
                                <td colSpan={10} className="px-4 py-12 text-center font-mono text-xs text-neutral-400">
                                    No audit submissions yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="font-mono text-xs">
                        Showing {rangeStart}-{rangeEnd} of {Number(totalCount)} leads
                    </p>
                    <div className="flex items-center gap-1">
                        {currentPage <= 1 ? (
                            <span className="font-mono text-xs border border-black px-3 py-1.5 opacity-40 cursor-not-allowed select-none">
                                &lt; Prev
                            </span>
                        ) : (
                            <Link
                                href={paginationHref(currentPage - 1, statusFilter)}
                                className="font-mono text-xs border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors"
                            >
                                &lt; Prev
                            </Link>
                        )}
                        {buildPageNumbers(currentPage, totalPages).map((p, i) =>
                            p === "..." ? (
                                <span key={`ellipsis-${i}`} className="font-mono text-xs px-2 py-1.5 select-none">
                                    ...
                                </span>
                            ) : p === currentPage ? (
                                <span
                                    key={p}
                                    className="font-mono text-xs border border-black px-3 py-1.5 bg-black text-white"
                                >
                                    {p}
                                </span>
                            ) : (
                                <Link
                                    key={p}
                                    href={paginationHref(p, statusFilter)}
                                    className="font-mono text-xs border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors"
                                >
                                    {p}
                                </Link>
                            )
                        )}
                        {currentPage >= totalPages ? (
                            <span className="font-mono text-xs border border-black px-3 py-1.5 opacity-40 cursor-not-allowed select-none">
                                Next &gt;
                            </span>
                        ) : (
                            <Link
                                href={paginationHref(currentPage + 1, statusFilter)}
                                className="font-mono text-xs border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors"
                            >
                                Next &gt;
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
