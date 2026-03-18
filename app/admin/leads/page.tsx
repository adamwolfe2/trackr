export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { auditSubmissions } from "@/lib/db/schema";
import { desc, eq, or } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, timingSafeEqual } from "crypto";
import { rateLimit } from "@/lib/middleware/rate-limit";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { CopyShareUrlButton } from "@/components/admin/copy-share-url-button";

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
    const a = Buffer.from(password);
    const b = Buffer.from(adminPassword);
    if (a.length === b.length && tse(a, b)) {
        const token = ch("sha256").update(adminPassword).digest("hex");
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminLeadsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string }>;
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

    const { status: statusFilter } = await searchParams;

    // Build WHERE clause at DB level instead of filtering in JS
    const statusWhere = statusFilter === "processing"
        ? or(eq(auditSubmissions.status, "processing"), eq(auditSubmissions.status, "pending"))
        : statusFilter
            ? eq(auditSubmissions.status, statusFilter)
            : undefined;

    const allSubmissions = await db.select().from(auditSubmissions)
        .where(statusWhere)
        .orderBy(desc(auditSubmissions.createdAt))
        .limit(200);

    // For summary counts, fetch all statuses (only when showing all)
    const allForCounts = statusFilter
        ? await db.select().from(auditSubmissions).orderBy(desc(auditSubmissions.createdAt)).limit(200)
        : allSubmissions;
    const submissions = allSubmissions;

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
                    { label: "Total Leads", value: allForCounts.length },
                    { label: "Complete", value: allForCounts.filter(s => s.status === "complete").length },
                    { label: "Processing", value: allForCounts.filter(s => s.status === "processing" || s.status === "pending").length },
                    { label: "Failed", value: allForCounts.filter(s => s.status === "failed").length },
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
                    {submissions.length} result{submissions.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Leads table */}
            <div className="border border-black overflow-x-auto">
                <table className="w-full min-w-[600px]">
                    <thead>
                        <tr className="border-b border-black">
                            <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500">Company</th>
                            <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500">Contact</th>
                            <th className="hidden sm:table-cell text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500">Revenue</th>
                            <th className="hidden sm:table-cell text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500">Spend/mo</th>
                            <th className="hidden sm:table-cell text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500">Tools</th>
                            <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500">Status</th>
                            <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500">Score</th>
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

                            return (
                                <tr key={sub.id} className="border-b border-neutral-100 hover:bg-neutral-50">
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
                                <td colSpan={9} className="px-4 py-12 text-center font-mono text-xs text-neutral-400">
                                    No audit submissions yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
