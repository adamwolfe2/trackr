export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
    architects,
    architectReferrals,
    architectCommissions,
    auditSubmissions,
    workspaces,
} from "@/lib/db/schema";
import { eq, desc, count, sum } from "drizzle-orm";
import { CopyArcLinkButton } from "@/components/architect/copy-arc-link-button";
import { StripeConnectButton } from "@/components/architect/stripe-connect-button";

export const metadata: Metadata = {
    title: "Architect Dashboard — Trackr",
    description: "Your referral earnings and leads.",
};

function statusBadge(status: string) {
    const styles: Record<string, string> = {
        lead: "text-blue-700 border-blue-200",
        active: "text-green-700 border-green-200",
        churned: "text-neutral-400 border-neutral-200",
        pending: "text-yellow-700 border-yellow-200",
        paid: "text-green-700 border-green-200",
        failed: "text-red-700 border-red-200",
    };
    return styles[status] ?? "text-neutral-500 border-neutral-200";
}

export default async function ArchitectDashboardPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const architect = await db.query.architects.findFirst({
        where: eq(architects.userId, user.id),
    });
    if (!architect) redirect("/dashboard");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://trytrackr.com";
    const referralUrl = `${appUrl}/audit?arc=${architect.arcCode}`;

    // Referrals with submission/workspace info
    const referralRows = await db
        .select({
            id: architectReferrals.id,
            status: architectReferrals.status,
            attributedAt: architectReferrals.attributedAt,
            companyName: auditSubmissions.companyName,
            contactEmail: auditSubmissions.contactEmail,
            workspaceName: workspaces.name,
        })
        .from(architectReferrals)
        .leftJoin(auditSubmissions, eq(architectReferrals.auditSubmissionId, auditSubmissions.id))
        .leftJoin(workspaces, eq(architectReferrals.workspaceId, workspaces.id))
        .where(eq(architectReferrals.architectId, architect.id))
        .orderBy(desc(architectReferrals.attributedAt));

    // Commissions
    const commissionRows = await db
        .select()
        .from(architectCommissions)
        .where(eq(architectCommissions.architectId, architect.id))
        .orderBy(desc(architectCommissions.createdAt));

    // Stats
    const [leadCount] = await db
        .select({ count: count() })
        .from(architectReferrals)
        .where(eq(architectReferrals.architectId, architect.id));

    const [activeCount] = await db
        .select({ count: count() })
        .from(architectReferrals)
        .where(eq(architectReferrals.architectId, architect.id));

    const [pendingEarnings] = await db
        .select({ total: sum(architectCommissions.commissionAmount) })
        .from(architectCommissions)
        .where(eq(architectCommissions.architectId, architect.id));

    const activeClients = referralRows.filter((r) => r.status === "active").length;
    const totalLeads = referralRows.length;
    const pendingCents = Number(pendingEarnings?.total ?? 0);

    return (
        <div className="space-y-8">
            {/* Page header */}
            <div>
                <h1 className="font-serif text-3xl font-normal">
                    Welcome back, {architect.firstName}.
                </h1>
                <p className="font-mono text-xs text-neutral-500 mt-1">
                    Your referral program overview and earnings.
                </p>
            </div>

            {/* Stripe Connect CTA */}
            {!architect.stripeOnboardingComplete && (
                <div className="border border-black bg-white p-5 flex items-start justify-between gap-4">
                    <div>
                        <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">Action Required</p>
                        <h2 className="font-serif text-lg font-normal mb-1">Connect your Stripe account to receive payouts</h2>
                        <p className="font-mono text-xs text-neutral-500 leading-relaxed">
                            Commissions are held until you complete Stripe Connect onboarding.
                            Setup takes about 5 minutes.
                        </p>
                    </div>
                    <StripeConnectButton architectId={architect.id} />
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px border border-black bg-black">
                <div className="bg-[#F3F3EF] p-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Lifetime Earnings</p>
                    <p className="font-serif text-2xl font-normal">${(architect.totalEarnings / 100).toFixed(2)}</p>
                </div>
                <div className="bg-[#F3F3EF] p-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Active Clients</p>
                    <p className="font-serif text-2xl font-normal">{activeClients}</p>
                </div>
                <div className="bg-[#F3F3EF] p-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Total Leads</p>
                    <p className="font-serif text-2xl font-normal">{totalLeads}</p>
                </div>
                <div className="bg-[#F3F3EF] p-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Commission Rate</p>
                    <p className="font-serif text-2xl font-normal">20%</p>
                    <p className="font-mono text-[10px] text-neutral-400">recurring, forever</p>
                </div>
            </div>

            {/* Referral link */}
            <div className="border border-black bg-white">
                <div className="border-b border-black px-5 py-3">
                    <h2 className="font-mono text-xs uppercase tracking-widest">Your Referral Link</h2>
                </div>
                <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                        <code className="flex-1 font-mono text-xs bg-[#F3F3EF] border border-neutral-200 px-3 py-2 truncate">
                            {referralUrl}
                        </code>
                        <CopyArcLinkButton url={referralUrl} />
                    </div>
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-0.5">Your Arc Code</p>
                            <p className="font-mono text-sm font-bold tracking-widest">{architect.arcCode}</p>
                        </div>
                        {architect.calendarUrl && (
                            <div>
                                <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-0.5">Book a Call</p>
                                <a
                                    href={architect.calendarUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-xs underline"
                                >
                                    {architect.calendarUrl}
                                </a>
                            </div>
                        )}
                    </div>
                    <p className="font-mono text-[10px] text-neutral-400 leading-relaxed">
                        Share this link with potential clients. When they complete the AI Readiness Audit and convert to a paid plan, you earn 20% of their monthly subscription — automatically, every month.
                    </p>
                </div>
            </div>

            {/* Referrals table */}
            <div className="border border-black bg-white">
                <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                    <h2 className="font-mono text-xs uppercase tracking-widest">Leads & Clients</h2>
                    <span className="font-mono text-xs text-neutral-400">{totalLeads} total</span>
                </div>
                {referralRows.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="font-mono text-xs text-neutral-400">
                            No referrals yet. Share your link to get started.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-100">
                                    <th className="px-5 py-2 text-left font-mono text-[10px] uppercase tracking-widest text-neutral-400">Company</th>
                                    <th className="px-5 py-2 text-left font-mono text-[10px] uppercase tracking-widest text-neutral-400">Contact</th>
                                    <th className="px-5 py-2 text-left font-mono text-[10px] uppercase tracking-widest text-neutral-400">Status</th>
                                    <th className="px-5 py-2 text-left font-mono text-[10px] uppercase tracking-widest text-neutral-400">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {referralRows.map((r) => (
                                    <tr key={r.id} className="border-b border-neutral-100 last:border-0">
                                        <td className="px-5 py-3 font-mono text-xs">
                                            {r.workspaceName ?? r.companyName ?? "—"}
                                        </td>
                                        <td className="px-5 py-3 font-mono text-xs text-neutral-500">
                                            {r.contactEmail ?? "—"}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`font-mono text-[10px] border px-2 py-0.5 uppercase tracking-widest ${statusBadge(r.status)}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 font-mono text-xs text-neutral-400">
                                            {r.attributedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Commissions table */}
            {commissionRows.length > 0 && (
                <div className="border border-black bg-white">
                    <div className="border-b border-black px-5 py-3">
                        <h2 className="font-mono text-xs uppercase tracking-widest">Commission History</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-100">
                                    <th className="px-5 py-2 text-left font-mono text-[10px] uppercase tracking-widest text-neutral-400">Invoice Amount</th>
                                    <th className="px-5 py-2 text-left font-mono text-[10px] uppercase tracking-widest text-neutral-400">Commission</th>
                                    <th className="px-5 py-2 text-left font-mono text-[10px] uppercase tracking-widest text-neutral-400">Status</th>
                                    <th className="px-5 py-2 text-left font-mono text-[10px] uppercase tracking-widest text-neutral-400">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {commissionRows.map((c) => (
                                    <tr key={c.id} className="border-b border-neutral-100 last:border-0">
                                        <td className="px-5 py-3 font-mono text-xs">${(c.invoiceAmount / 100).toFixed(2)}</td>
                                        <td className="px-5 py-3 font-mono text-xs font-bold">${(c.commissionAmount / 100).toFixed(2)}</td>
                                        <td className="px-5 py-3">
                                            <span className={`font-mono text-[10px] border px-2 py-0.5 uppercase tracking-widest ${statusBadge(c.status)}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 font-mono text-xs text-neutral-400">
                                            {c.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
