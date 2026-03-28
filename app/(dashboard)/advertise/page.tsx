export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ads, workspaceMembers } from "@/lib/db/schema";

export const metadata: Metadata = {
    title: "Advertise — Trackr",
    description: "Promote your tool to Trackr users.",
};
import { eq, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { checkFeatureAccess } from "@/lib/middleware/require-subscription";
import { PlanGate } from "@/components/billing/plan-gate";
import { PlusCircle, Eye, MousePointer2, DollarSign } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function AdvertisePage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });

    if (!member) redirect("/onboarding");

    const plan = await checkFeatureAccess(member.workspaceId, "spendTracking");
    if (!plan) {
        return (
            <PlanGate
                featureName="Ad Manager"
                description="Promote your tools across the Trackr network. Available on Team plan and above."
                requiredPlan="Team"
            />
        );
    }

    const myAds = await db.query.ads.findMany({
        where: eq(ads.workspaceId, member.workspaceId),
        with: { tool: true },
        orderBy: [desc(ads.createdAt)],
    });

    const totalImpressions = myAds.reduce((acc, ad) => acc + ad.impressions, 0);
    const totalClicks = myAds.reduce((acc, ad) => acc + ad.clicks, 0);
    const totalSpend = myAds.reduce((acc, ad) => acc + ad.spent, 0);

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h1 className="font-serif text-3xl font-normal">Ad Manager</h1>
                    <p className="font-mono text-sm text-neutral-500 mt-1">Promote your tools to the entire Trackr network.</p>
                </div>
                <Link href="/advertise/create" className="flex items-center gap-2 border border-black px-4 py-2 font-mono text-xs uppercase tracking-widest bg-black text-white hover:bg-neutral-800 whitespace-nowrap">
                    <PlusCircle className="h-3.5 w-3.5" />
                    New Campaign
                </Link>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 border border-black">
                <div className="p-5 sm:border-r border-b sm:border-b-0 border-black">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Impressions</span>
                        <Eye className="h-3.5 w-3.5 text-neutral-400" />
                    </div>
                    <div className="font-mono text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
                </div>
                <div className="p-5 sm:border-r border-b sm:border-b-0 border-black">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Clicks</span>
                        <MousePointer2 className="h-3.5 w-3.5 text-neutral-400" />
                    </div>
                    <div className="font-mono text-2xl font-bold">{totalClicks.toLocaleString()}</div>
                </div>
                <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Spend</span>
                        <DollarSign className="h-3.5 w-3.5 text-neutral-400" />
                    </div>
                    <div className="font-mono text-2xl font-bold">${(totalSpend / 100).toFixed(2)}</div>
                </div>
            </div>

            {/* Campaigns Table */}
            <div className="border border-black">
                <div className="border-b border-black px-5 py-3">
                    <h2 className="font-mono text-xs uppercase tracking-widest">Campaigns</h2>
                </div>
                {myAds.length === 0 ? (
                    <div className="py-12 text-center">
                        <p className="font-mono text-sm text-neutral-400">No campaigns yet. Start promoting your first tool!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-black">
                                    {["Tool", "Status", "Budget", "Spent", "Impressions", "Clicks", "Created", ""].map(h => (
                                        <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {myAds.map((ad) => (
                                    <tr key={ad.id} className="hover:bg-neutral-100 transition-colors">
                                        <td className="px-4 py-3 font-mono text-sm font-medium">{ad.tool.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`font-mono text-[10px] uppercase border px-2 py-0.5 ${ad.status === "active" ? "border-black bg-black text-white" : "border-neutral-300 text-neutral-400"}`}>
                                                {ad.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-sm">${(ad.budget / 100).toFixed(2)}</td>
                                        <td className="px-4 py-3 font-mono text-sm">${(ad.spent / 100).toFixed(2)}</td>
                                        <td className="px-4 py-3 font-mono text-sm">{ad.impressions.toLocaleString()}</td>
                                        <td className="px-4 py-3 font-mono text-sm">{ad.clicks.toLocaleString()}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-neutral-400">
                                            {formatDistanceToNow(new Date(ad.createdAt), { addSuffix: true })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <a href={`/api/invoices/${ad.id}`} target="_blank" rel="noopener noreferrer"
                                                className="font-mono text-[10px] uppercase tracking-widest border border-black px-2 py-1 hover:bg-black hover:text-white">
                                                Invoice
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
