import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { BulkResearchButton } from "@/components/research/bulk-research-modal";
import { db } from "@/lib/db";
import { tools, reports, workspaceMembers, softwareSpend, subscriptions } from "@/lib/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ToolsView } from "@/components/tools/tools-view";
import { getPlanLimits, hasFeature } from "@/lib/config/subscriptions";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // allow after() in triggerResearch/triggerResearchBatch to complete

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

    // Score delta map: compare current score to second-latest report
    const scoreDeltaMap: Record<string, number> = {};
    const toolIdsWithScores = toolsList.filter(t => t.overallScore !== null).map(t => t.id);
    if (toolIdsWithScores.length > 0) {
        const allReportsList = await db
            .select({ toolId: reports.toolId, scorecardSnapshot: reports.scorecardSnapshot })
            .from(reports)
            .where(inArray(reports.toolId, toolIdsWithScores))
            .orderBy(desc(reports.createdAt));
        const reportsByTool = new Map<string, typeof allReportsList>();
        for (const r of allReportsList) {
            if (!reportsByTool.has(r.toolId)) reportsByTool.set(r.toolId, []);
            reportsByTool.get(r.toolId)!.push(r);
        }
        for (const tool of toolsList) {
            if (!tool.overallScore) continue;
            const toolReports = reportsByTool.get(tool.id) ?? [];
            if (toolReports.length < 2) continue;
            const prevSnapshot = toolReports[1].scorecardSnapshot as Record<string, { score: number }> | null;
            if (!prevSnapshot) continue;
            const prevScores = Object.values(prevSnapshot).filter(v => typeof (v as { score?: number })?.score === "number").map(v => (v as { score: number }).score);
            if (prevScores.length === 0) continue;
            const prevAvg = prevScores.reduce((a, b) => a + b, 0) / prevScores.length;
            const delta = parseFloat((Number(tool.overallScore) - prevAvg).toFixed(1));
            if (Math.abs(delta) >= 0.05) scoreDeltaMap[tool.id] = delta;
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h1 className="font-serif text-2xl sm:text-3xl font-normal">AI Tools Portfolio</h1>
                    <p className="font-mono text-sm text-neutral-500 mt-1">Your team&apos;s AI tool intelligence at a glance.</p>
                </div>
                <div className="flex items-center gap-2">
                    <BulkResearchButton />
                    {toolsList.length > 0 && (
                        <a
                            href="/api/export/tools"
                            download="trackr-stack.csv"
                            className="flex items-center gap-2 border border-black px-4 py-2 font-mono text-sm bg-white hover:bg-neutral-100 whitespace-nowrap"
                        >
                            Export CSV
                        </a>
                    )}
                    <Link href="/submit" className="flex items-center gap-2 border border-black px-4 py-2 font-mono text-sm bg-black text-white hover:bg-neutral-800 whitespace-nowrap">
                        <PlusCircle className="h-4 w-4" />
                        Add Tool
                    </Link>
                </div>
            </div>

            <ToolsView tools={toolsList} stats={stats} isEmpty={toolsList.length === 0} canSchedule={canSchedule} scoreDeltaMap={scoreDeltaMap} />
        </div>
    );
}
