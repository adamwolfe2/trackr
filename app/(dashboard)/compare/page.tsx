export const dynamic = "force-dynamic";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { tools, reports, workspaceMembers, subscriptions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { CompareClient } from "./client";
import { PlanGate } from "@/components/billing/plan-gate";
import { getPlanLimits } from "@/lib/config/subscriptions";

export default async function ComparePage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });

    if (!member) {
        return <div className="font-mono text-sm text-neutral-500 py-12 text-center">No workspace found.</div>;
    }

    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, member.workspaceId),
    });

    const limits = getPlanLimits(subscription ?? undefined);
    if (!limits.limits.deepResearch) {
        return (
            <PlanGate
                featureName="Tool Comparison"
                description="Compare tools side-by-side on score, pros, cons, pricing, and features. Available on Team and Agency plans."
            />
        );
    }

    const workspaceTools = await db.query.tools.findMany({
        where: eq(tools.workspaceId, member.workspaceId),
        orderBy: [desc(tools.submittedAt)],
    });

    // Fetch reports for each tool (latest report per tool)
    const toolsWithReports = await Promise.all(
        workspaceTools.map(async (tool) => {
            const report = await db.query.reports.findFirst({
                where: eq(reports.toolId, tool.id),
                orderBy: [desc(reports.createdAt)],
            });
            return {
                id: tool.id,
                name: tool.name,
                score: tool.overallScore ? Number(tool.overallScore) : null,
                websiteUrl: tool.websiteUrl,
                status: tool.status,
                pros: report?.pros ?? [],
                cons: report?.cons ?? [],
                pricing: (report?.pricing ?? null) as Array<{ price?: string; tier?: string; [key: string]: unknown }> | string | null,
                features: (report?.features ?? null) as string[] | { list: string[] } | null,
                summary: report?.summary ?? null,
            };
        })
    );

    return <CompareClient tools={toolsWithReports} />;
}
