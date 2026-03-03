export const dynamic = "force-dynamic";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { architects, architectReferrals, architectCommissions } from "@/lib/db/schema";
import { eq, desc, sum, count, and } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { CopyLinkButton } from "@/components/referrals/copy-link-button";

export default async function ArchitectDashboardPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const architect = await db.query.architects.findFirst({
        where: eq(architects.userId, user.id),
    });
    if (!architect) redirect("/apply");

    // Stats
    const referrals = await db
        .select()
        .from(architectReferrals)
        .where(eq(architectReferrals.architectId, architect.id));

    const activeClients = referrals.filter((r) => r.status === "active").length;
    const totalClients = referrals.length;

    const [earningsResult] = await db
        .select({ total: sum(architectCommissions.commissionAmount) })
        .from(architectCommissions)
        .where(and(
            eq(architectCommissions.architectId, architect.id),
            eq(architectCommissions.status, "paid"),
        ));

    const [pendingResult] = await db
        .select({ total: sum(architectCommissions.commissionAmount) })
        .from(architectCommissions)
        .where(and(
            eq(architectCommissions.architectId, architect.id),
            eq(architectCommissions.status, "pending"),
        ));

    const lifetimeEarnings = Number(earningsResult?.total ?? 0);
    const pendingCommissions = Number(pendingResult?.total ?? 0);

    // Recent activity
    const recentReferrals = await db
        .select()
        .from(architectReferrals)
        .where(eq(architectReferrals.architectId, architect.id))
        .orderBy(desc(architectReferrals.attributedAt))
        .limit(5);

    const recentCommissions = await db
        .select()
        .from(architectCommissions)
        .where(eq(architectCommissions.architectId, architect.id))
        .orderBy(desc(architectCommissions.createdAt))
        .limit(5);

    const referralUrl = `https://trytrackr.com/audit?arc=${architect.arcCode}`;

    return (
        <div className="space-y-8">
            <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Dashboard</p>
                <h1 className="font-serif text-3xl font-normal">Welcome back, {architect.firstName}.</h1>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px border border-black bg-black">
                {[
                    { label: "Total Referrals", value: totalClients },
                    { label: "Active Clients", value: activeClients },
                    { label: "Lifetime Earnings", value: `$${(lifetimeEarnings / 100).toFixed(2)}` },
                    { label: "Pending Commissions", value: `$${(pendingCommissions / 100).toFixed(2)}` },
                ].map((stat) => (
                    <div key={stat.label} className="bg-[#F3F3EF] p-5">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">{stat.label}</p>
                        <p className="font-serif text-3xl font-normal">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Referral link */}
            <div className="border border-black p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Your Referral Link</p>
                <CopyLinkButton referralUrl={referralUrl} />
                <p className="font-mono text-[10px] text-neutral-400 mt-2">Arc Code: {architect.arcCode}</p>
            </div>

            {/* Stripe Connect status */}
            {!architect.stripeOnboardingComplete && (
                <div className="border border-black bg-white p-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Stripe Connect</p>
                    <p className="font-mono text-sm text-neutral-700 mb-3">
                        Complete your Stripe setup to start receiving commission payouts.
                    </p>
                    <Link
                        href="/api/architect/stripe-connect"
                        className="inline-flex items-center gap-2 border border-black bg-black text-white px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                    >
                        <ExternalLink className="w-3 h-3" />
                        Complete Stripe Setup
                    </Link>
                </div>
            )}

            {/* Recent referrals */}
            <div className="border border-black">
                <div className="border-b border-black p-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Recent Referrals</p>
                </div>
                {recentReferrals.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="font-mono text-sm text-neutral-400">No referrals yet. Share your referral link to get started.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-200">
                        {recentReferrals.map((ref) => (
                            <div key={ref.id} className="flex items-center justify-between p-4">
                                <div>
                                    <p className="font-mono text-xs">{ref.workspaceId || "Pending workspace"}</p>
                                    <p className="font-mono text-[10px] text-neutral-400">
                                        {new Date(ref.attributedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`font-mono text-[10px] uppercase tracking-widest border px-1.5 py-0.5 ${
                                    ref.status === "active" ? "text-green-700 border-green-200" :
                                    ref.status === "churned" ? "text-red-700 border-red-200" :
                                    "text-yellow-700 border-yellow-200"
                                }`}>
                                    {ref.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent commissions */}
            {recentCommissions.length > 0 && (
                <div className="border border-black">
                    <div className="border-b border-black p-5">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Recent Commissions</p>
                    </div>
                    <div className="divide-y divide-neutral-200">
                        {recentCommissions.map((comm) => (
                            <div key={comm.id} className="flex items-center justify-between p-4">
                                <div>
                                    <p className="font-mono text-xs">
                                        ${(comm.commissionAmount / 100).toFixed(2)} commission on ${(comm.invoiceAmount / 100).toFixed(2)} invoice
                                    </p>
                                    <p className="font-mono text-[10px] text-neutral-400">
                                        {new Date(comm.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`font-mono text-[10px] uppercase tracking-widest border px-1.5 py-0.5 ${
                                    comm.status === "paid" ? "text-green-700 border-green-200" :
                                    comm.status === "failed" ? "text-red-700 border-red-200" :
                                    "text-yellow-700 border-yellow-200"
                                }`}>
                                    {comm.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
