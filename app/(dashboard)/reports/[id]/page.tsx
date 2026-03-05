export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getWorkspaceId } from "@/lib/db/queries";
import { checkFeatureAccess } from "@/lib/middleware/require-subscription";
import { PlanGate } from "@/components/billing/plan-gate";
import { getBoardReport } from "@/lib/actions/board-reports";
import { BoardReportView } from "@/components/reports/board-report-view";

export const metadata: Metadata = {
    title: "Board Report -- Trackr",
    description: "Executive board report for your AI tool stack.",
};

export default async function ReportDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) redirect("/onboarding");

    const plan = await checkFeatureAccess(workspaceId, "boardReports");
    if (!plan) {
        return (
            <PlanGate
                featureName="Board Reports"
                description="Generate executive-ready reports with health scores, spend overviews, and AI nativeness metrics."
                requiredPlan="Startup"
            />
        );
    }

    const report = await getBoardReport(id, workspaceId);
    if (!report) return notFound();

    return (
        <BoardReportView
            report={{
                id: report.id,
                title: report.title,
                period: report.period,
                createdAt: report.createdAt.toISOString(),
                shareToken: report.shareToken,
                data: report.data as Record<string, unknown>,
            }}
            isPublic={false}
        />
    );
}
