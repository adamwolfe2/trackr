import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { BulkResearchButton } from "@/components/research/bulk-research-modal";
import { db } from "@/lib/db";
import { tools, workspaceMembers, softwareSpend, subscriptions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ToolsView } from "@/components/tools/tools-view";
import { getPlanLimits, hasFeature } from "@/lib/config/subscriptions";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Tool Database — Trackr",
    description: "Browse and manage your researched AI tools.",
};

export default async function ToolsPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });

    if (!member) {
        redirect("/onboarding");
    }

    const [toolsList, spendEntries, subscription] = await Promise.all([
        db.query.tools.findMany({
            where: eq(tools.workspaceId, member.workspaceId),
            orderBy: [desc(tools.submittedAt)],
        }),
        db.query.softwareSpend.findMany({
            where: eq(softwareSpend.workspaceId, member.workspaceId),
        }),
        db.query.subscriptions.findFirst({
            where: eq(subscriptions.workspaceId, member.workspaceId),
        }),
    ]);

    const plan = getPlanLimits(subscription ?? undefined);
    const canSchedule = hasFeature(plan, "scheduledResearch");

    // Stats
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const scored = toolsList.filter(t => t.overallScore !== null);
    const avgScore = scored.length > 0
        ? (scored.reduce((sum, t) => sum + parseFloat(t.overallScore!), 0) / scored.length).toFixed(1)
        : null;

    const researchedThisMonth = toolsList.filter(t =>
        t.lastResearchedAt && new Date(t.lastResearchedAt) >= firstOfMonth
    ).length;

    const monthlySpend = spendEntries
        .filter(e => e.status === "active")
        .reduce((sum, e) => sum + parseFloat(e.monthlyCost || "0"), 0);

    const stats = { totalTools: toolsList.length, avgScore, researchedThisMonth, monthlySpend };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h1 className="font-serif text-2xl sm:text-3xl font-normal">AI Tools Portfolio</h1>
                    <p className="font-mono text-sm text-neutral-500 mt-1">Your team&apos;s AI tool intelligence at a glance.</p>
                </div>
                <div className="flex items-center gap-2">
                    <BulkResearchButton />
                    <Link href="/submit" className="flex items-center gap-2 border border-black px-4 py-2 font-mono text-sm bg-black text-white hover:bg-neutral-800 whitespace-nowrap">
                        <PlusCircle className="h-4 w-4" />
                        Add Tool
                    </Link>
                </div>
            </div>

            <ToolsView tools={toolsList} stats={stats} isEmpty={toolsList.length === 0} canSchedule={canSchedule} />
        </div>
    );
}
