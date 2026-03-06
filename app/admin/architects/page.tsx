export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { architectApplications, architects, architectReferrals } from "@/lib/db/schema";
import { desc, eq, count, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, timingSafeEqual } from "crypto";
import { rateLimit } from "@/lib/middleware/rate-limit";
import { ARCHITECT_ROLES } from "@/lib/config/architect-roles";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const metadata: Metadata = {
    title: "Admin Architects — Trackr",
    description: "Architect application pipeline.",
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
        redirect("/admin/architects?error=rate_limited");
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
    redirect("/admin/architects");
}

function statusColor(status: string): string {
    switch (status) {
        case "approved": return "text-green-700 border-green-200";
        case "rejected": return "text-red-700 border-red-200";
        case "pending": return "text-yellow-700 border-yellow-200";
        default: return "text-neutral-500 border-neutral-200";
    }
}

function getRoleTitle(slug: string): string {
    return ARCHITECT_ROLES.find((r) => r.slug === slug)?.title ?? slug;
}

export default async function AdminArchitectsPage({
    searchParams,
}: {
    searchParams: Promise<{ filter?: string }>;
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

    const { filter } = await searchParams;

    // Fetch stats — batched into 2 parallel queries instead of 4 sequential
    const [[totalApps], [pendingApps], [approvedApps], [activeArchitects]] = await Promise.all([
        db.select({ count: count() }).from(architectApplications),
        db.select({ count: count() }).from(architectApplications).where(eq(architectApplications.status, "pending")),
        db.select({ count: count() }).from(architectApplications).where(eq(architectApplications.status, "approved")),
        db.select({ count: count() }).from(architects).where(eq(architects.status, "active")),
    ]);

    // Fetch top architects for leaderboard
    const topArchitects = activeArchitects.count > 0
        ? await db
            .select()
            .from(architects)
            .where(eq(architects.status, "active"))
            .orderBy(desc(architects.totalEarnings))
            .limit(10)
        : [];

    // For each top architect, get referral counts (with error resilience)
    const leaderboard = await Promise.all(
        topArchitects.map(async (arch) => {
            try {
                const [[totalRef], [activeRef]] = await Promise.all([
                    db.select({ count: count() }).from(architectReferrals).where(eq(architectReferrals.architectId, arch.id)),
                    db.select({ count: count() }).from(architectReferrals).where(and(eq(architectReferrals.architectId, arch.id), eq(architectReferrals.status, "active"))),
                ]);
                const total = totalRef?.count ?? 0;
                const active = activeRef?.count ?? 0;
                return {
                    ...arch,
                    referralCount: total,
                    activeCount: active,
                    conversionRate: total > 0 ? ((active / total) * 100).toFixed(0) : "N/A",
                };
            } catch {
                return { ...arch, referralCount: 0, activeCount: 0, conversionRate: "N/A" as string };
            }
        })
    );

    // Fetch applications with optional filter
    const whereClause = filter && ["pending", "approved", "rejected"].includes(filter)
        ? eq(architectApplications.status, filter)
        : undefined;

    const applications = await db
        .select()
        .from(architectApplications)
        .where(whereClause)
        .orderBy(desc(architectApplications.createdAt))
        .limit(100);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">Admin</p>
                <h1 className="font-serif text-3xl font-normal">AI Architects</h1>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px border border-black bg-black">
                {[
                    { label: "Total Applications", value: totalApps.count },
                    { label: "Pending", value: pendingApps.count },
                    { label: "Approved", value: approvedApps.count },
                    { label: "Active Architects", value: activeArchitects.count },
                ].map((stat) => (
                    <div key={stat.label} className="bg-[#F3F3EF] p-5">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">{stat.label}</p>
                        <p className="font-serif text-3xl font-normal">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
                <div className="border border-black">
                    <div className="border-b border-black p-5">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Top Architects</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-black">
                                    <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Rank</th>
                                    <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Name</th>
                                    <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Role</th>
                                    <th className="text-right font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Referrals</th>
                                    <th className="text-right font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Active</th>
                                    <th className="text-right font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Conv. Rate</th>
                                    <th className="text-right font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Earnings</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((arch, i) => (
                                    <tr key={arch.id} className="border-b border-neutral-200 last:border-0 hover:bg-white transition-colors">
                                        <td className="p-3 font-mono text-xs text-neutral-400">{i + 1}</td>
                                        <td className="p-3 font-mono text-sm">{arch.firstName} {arch.lastName}</td>
                                        <td className="p-3 font-mono text-xs text-neutral-600">{getRoleTitle(arch.role)}</td>
                                        <td className="p-3 font-mono text-xs text-right">{arch.referralCount}</td>
                                        <td className="p-3 font-mono text-xs text-right">{arch.activeCount}</td>
                                        <td className="p-3 font-mono text-xs text-right">{arch.conversionRate === "N/A" ? "N/A" : `${arch.conversionRate}%`}</td>
                                        <td className="p-3 font-mono text-xs text-right">${(arch.totalEarnings / 100).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Filter tabs */}
            <div className="flex gap-1">
                {[
                    { label: "All", value: undefined },
                    { label: "Pending", value: "pending" },
                    { label: "Approved", value: "approved" },
                    { label: "Rejected", value: "rejected" },
                ].map((tab) => (
                    <Link
                        key={tab.label}
                        href={tab.value ? `/admin/architects?filter=${tab.value}` : "/admin/architects"}
                        className={`font-mono text-[10px] uppercase tracking-widest border px-3 py-1.5 transition-colors ${
                            filter === tab.value || (!filter && !tab.value)
                                ? "border-black bg-black text-white"
                                : "border-transparent hover:border-black"
                        }`}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>

            {/* Table */}
            <div className="border border-black overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-black">
                            <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Name</th>
                            <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Email</th>
                            <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Role</th>
                            <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Status</th>
                            <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Applied</th>
                            <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center font-mono text-sm text-neutral-400">
                                    No applications yet.
                                </td>
                            </tr>
                        )}
                        {applications.map((app) => (
                            <tr key={app.id} className="border-b border-neutral-200 last:border-0 hover:bg-white transition-colors">
                                <td className="p-3 font-mono text-sm">{app.firstName} {app.lastName}</td>
                                <td className="p-3 font-mono text-xs text-neutral-600">{app.email}</td>
                                <td className="p-3 font-mono text-xs text-neutral-600">{getRoleTitle(app.roleSlug)}</td>
                                <td className="p-3">
                                    <span className={`font-mono text-[10px] uppercase tracking-widest border px-1.5 py-0.5 ${statusColor(app.status)}`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td className="p-3 font-mono text-xs text-neutral-500">
                                    {new Date(app.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-3">
                                    <Link
                                        href={`/admin/architects/${app.id}`}
                                        className="font-mono text-[10px] uppercase tracking-widest border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
                                    >
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
