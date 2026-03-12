export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { architectPayouts, architects, architectCommissions } from "@/lib/db/schema";
import { desc, eq, count, sum, sql } from "drizzle-orm";

export const metadata: Metadata = {
    title: "Admin Payouts — Trackr",
    description: "Manage architect commission payouts.",
    robots: { index: false },
};

function statusColor(status: string): string {
    switch (status) {
        case "paid": return "text-green-700 border-green-200";
        case "failed": return "text-red-700 border-red-200";
        case "pending": return "text-yellow-700 border-yellow-200";
        case "processing": return "text-blue-700 border-blue-200";
        default: return "text-neutral-500 border-neutral-200";
    }
}

export default async function AdminPayoutsPage() {
    // Fetch summary stats in parallel
    const [[totalPayouts], [pendingPayouts], [paidPayouts], [pendingCommissions]] = await Promise.all([
        db.select({ count: count(), total: sum(architectPayouts.amount) }).from(architectPayouts),
        db.select({ count: count(), total: sum(architectPayouts.amount) }).from(architectPayouts).where(eq(architectPayouts.status, "pending")),
        db.select({ count: count(), total: sum(architectPayouts.amount) }).from(architectPayouts).where(eq(architectPayouts.status, "paid")),
        db.select({ count: count(), total: sum(architectCommissions.commissionAmount) }).from(architectCommissions).where(eq(architectCommissions.status, "pending")),
    ]);

    // Fetch pending payouts with architect details
    const pendingPayoutsList = await db
        .select({
            payout: architectPayouts,
            architectName: sql<string>`${architects.firstName} || ' ' || ${architects.lastName}`,
            architectEmail: architects.email,
            arcCode: architects.arcCode,
            stripeConnectComplete: architects.stripeOnboardingComplete,
        })
        .from(architectPayouts)
        .innerJoin(architects, eq(architectPayouts.architectId, architects.id))
        .where(eq(architectPayouts.status, "pending"))
        .orderBy(desc(architectPayouts.createdAt))
        .limit(100);

    // Fetch recent paid/failed payouts
    const recentPayouts = await db
        .select({
            payout: architectPayouts,
            architectName: sql<string>`${architects.firstName} || ' ' || ${architects.lastName}`,
            architectEmail: architects.email,
        })
        .from(architectPayouts)
        .innerJoin(architects, eq(architectPayouts.architectId, architects.id))
        .where(sql`${architectPayouts.status} IN ('paid', 'failed', 'processing')`)
        .orderBy(desc(architectPayouts.createdAt))
        .limit(50);

    // Fetch pending commissions not yet batched into payouts
    const unbatchedCommissions = await db
        .select({
            architectId: architectCommissions.architectId,
            architectName: sql<string>`${architects.firstName} || ' ' || ${architects.lastName}`,
            architectEmail: architects.email,
            commissionCount: count(),
            totalAmount: sum(architectCommissions.commissionAmount),
            stripeConnectComplete: architects.stripeOnboardingComplete,
        })
        .from(architectCommissions)
        .innerJoin(architects, eq(architectCommissions.architectId, architects.id))
        .where(eq(architectCommissions.status, "pending"))
        .groupBy(architectCommissions.architectId, architects.firstName, architects.lastName, architects.email, architects.stripeOnboardingComplete)
        .orderBy(desc(sum(architectCommissions.commissionAmount)))
        .limit(50);

    return (
        <div className="space-y-8">
            <div>
                <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">Admin</p>
                <h1 className="font-serif text-3xl font-normal">Commission Payouts</h1>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px border border-black bg-black">
                {[
                    { label: "Pending Commissions", value: `$${((Number(pendingCommissions.total) || 0) / 100).toFixed(2)}`, sub: `${pendingCommissions.count} commissions` },
                    { label: "Pending Payouts", value: `$${((Number(pendingPayouts.total) || 0) / 100).toFixed(2)}`, sub: `${pendingPayouts.count} payouts` },
                    { label: "Total Paid Out", value: `$${((Number(paidPayouts.total) || 0) / 100).toFixed(2)}`, sub: `${paidPayouts.count} payouts` },
                    { label: "All-Time Payouts", value: String(totalPayouts.count), sub: `$${((Number(totalPayouts.total) || 0) / 100).toFixed(2)} total` },
                ].map((stat) => (
                    <div key={stat.label} className="bg-[#F3F3EF] p-5">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">{stat.label}</p>
                        <p className="font-serif text-2xl font-normal">{stat.value}</p>
                        <p className="font-mono text-[10px] text-neutral-400 mt-0.5">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Unbatched Pending Commissions */}
            {unbatchedCommissions.length > 0 && (
                <div className="border border-black">
                    <div className="border-b border-black p-5 flex items-center justify-between">
                        <div>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Pending Commissions (Unbatched)</p>
                            <p className="font-mono text-[10px] text-neutral-400 mt-0.5">
                                These commissions will be processed by the monthly payout cron, or immediately via Stripe Connect
                            </p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-black">
                                    <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Architect</th>
                                    <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Email</th>
                                    <th className="text-right font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Commissions</th>
                                    <th className="text-right font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Total Owed</th>
                                    <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Stripe Connect</th>
                                </tr>
                            </thead>
                            <tbody>
                                {unbatchedCommissions.map((row) => (
                                    <tr key={row.architectId} className="border-b border-neutral-200 last:border-0 hover:bg-white transition-colors">
                                        <td className="p-3 font-mono text-sm">{row.architectName}</td>
                                        <td className="p-3 font-mono text-xs text-neutral-600">{row.architectEmail}</td>
                                        <td className="p-3 font-mono text-xs text-right">{row.commissionCount}</td>
                                        <td className="p-3 font-mono text-sm text-right font-medium">
                                            ${((Number(row.totalAmount) || 0) / 100).toFixed(2)}
                                        </td>
                                        <td className="p-3">
                                            <span className={`font-mono text-[10px] uppercase tracking-widest border px-1.5 py-0.5 ${
                                                row.stripeConnectComplete
                                                    ? "text-green-700 border-green-200"
                                                    : "text-red-700 border-red-200"
                                            }`}>
                                                {row.stripeConnectComplete ? "Connected" : "Not Connected"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pending Payouts (need manual action) */}
            {pendingPayoutsList.length > 0 && (
                <div className="border-2 border-yellow-500">
                    <div className="border-b border-yellow-500 bg-yellow-50 p-5">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-yellow-700">Action Required — Pending Payouts</p>
                        <p className="font-mono text-[10px] text-yellow-600 mt-0.5">
                            These architects don&apos;t have Stripe Connect set up. Pay manually and update status.
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-300">
                                    <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Architect</th>
                                    <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Email</th>
                                    <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Arc Code</th>
                                    <th className="text-right font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Amount</th>
                                    <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Period</th>
                                    <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Status</th>
                                    <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingPayoutsList.map((row) => (
                                    <tr key={row.payout.id} className="border-b border-neutral-200 last:border-0 hover:bg-white transition-colors">
                                        <td className="p-3 font-mono text-sm">{row.architectName}</td>
                                        <td className="p-3 font-mono text-xs text-neutral-600">{row.architectEmail}</td>
                                        <td className="p-3 font-mono text-xs">{row.arcCode}</td>
                                        <td className="p-3 font-mono text-sm text-right font-medium">
                                            ${(row.payout.amount / 100).toFixed(2)}
                                        </td>
                                        <td className="p-3 font-mono text-xs text-neutral-500">
                                            {new Date(row.payout.periodStart).toLocaleDateString()} — {new Date(row.payout.periodEnd).toLocaleDateString()}
                                        </td>
                                        <td className="p-3">
                                            <span className={`font-mono text-[10px] uppercase tracking-widest border px-1.5 py-0.5 ${statusColor(row.payout.status)}`}>
                                                {row.payout.status}
                                            </span>
                                        </td>
                                        <td className="p-3 font-mono text-xs text-neutral-500">
                                            {new Date(row.payout.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Recent Payouts History */}
            <div className="border border-black">
                <div className="border-b border-black p-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Payout History</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-black">
                                <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Architect</th>
                                <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Email</th>
                                <th className="text-right font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Amount</th>
                                <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Status</th>
                                <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Stripe Transfer</th>
                                <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentPayouts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center font-mono text-sm text-neutral-400">
                                        No payouts processed yet.
                                    </td>
                                </tr>
                            )}
                            {recentPayouts.map((row) => (
                                <tr key={row.payout.id} className="border-b border-neutral-200 last:border-0 hover:bg-white transition-colors">
                                    <td className="p-3 font-mono text-sm">{row.architectName}</td>
                                    <td className="p-3 font-mono text-xs text-neutral-600">{row.architectEmail}</td>
                                    <td className="p-3 font-mono text-sm text-right">${(row.payout.amount / 100).toFixed(2)}</td>
                                    <td className="p-3">
                                        <span className={`font-mono text-[10px] uppercase tracking-widest border px-1.5 py-0.5 ${statusColor(row.payout.status)}`}>
                                            {row.payout.status}
                                        </span>
                                    </td>
                                    <td className="p-3 font-mono text-xs text-neutral-500">
                                        {row.payout.stripePayoutId
                                            ? `${row.payout.stripePayoutId.slice(0, 18)}...`
                                            : "—"}
                                    </td>
                                    <td className="p-3 font-mono text-xs text-neutral-500">
                                        {new Date(row.payout.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
