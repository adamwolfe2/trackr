export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { tools, reports, workspaceMembers, subscriptions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { CompareClient } from "./client";
import { PlanGate } from "@/components/billing/plan-gate";
import { getPlanLimits } from "@/lib/config/subscriptions";

export const metadata: Metadata = {
    title: "Compare Tools — Trackr",
    description: "Side-by-side comparison of researched AI tools.",
};

interface ComparePageProps {
    searchParams: Promise<{ tools?: string }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });

    if (!member) redirect("/onboarding");

    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, member.workspaceId),
    });

    const plan = getPlanLimits(subscription ?? undefined);
    if (!plan.features.compareTools) {
        return (
            <PlanGate
                featureName="Unlimited Tool Comparison"
                description="Compare unlimited tools side-by-side on score, pros, cons, pricing, and features. Upgrade to Team to unlock."
                requiredPlan="Team"
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
                logoUrl: tool.logoUrl,
                websiteUrl: tool.websiteUrl,
                status: tool.status,
                pros: report?.pros ?? [],
                cons: report?.cons ?? [],
                pricing: (report?.pricing ?? null) as Array<{ price?: string; tier?: string; [key: string]: unknown }> | string | null,
                features: (report?.features ?? null) as string[] | { list: string[] } | null,
                summary: report?.summary ?? null,
                integrations: report?.integrations ?? [],
                competitors: report?.competitors ?? [],
            };
        })
    );

    // Read pre-selected tool IDs from searchParams
    const params = await searchParams;
    const preSelectedIds = params.tools
        ? params.tools.split(",").filter(Boolean).slice(0, 3)
        : [];

    const isLimitedCompare = plan.features.compareTools === "limited";

    return <CompareClient tools={toolsWithReports} preSelectedIds={preSelectedIds} isLimitedCompare={isLimitedCompare} />;
}
