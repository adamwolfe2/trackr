import { db } from "@/lib/db";
import { auditSubmissions, softwareSpend } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

type ROIMetrics = {
    projectedAnnualSavings: number;
    currentAnnualWaste: number;
    paybackMonths: number;
    recommendedTools: Array<{ name: string; adopted: boolean }>;
    adoptionRate: number;
    adjustedSavings: number;
    assumptions: string[];
};

export async function getROIForWorkspace(workspaceId: string): Promise<ROIMetrics | null> {
    // 1. Find audit submission where preBuiltWorkspaceId = workspaceId
    const submission = await db.query.auditSubmissions.findFirst({
        where: and(
            eq(auditSubmissions.preBuiltWorkspaceId, workspaceId),
            eq(auditSubmissions.status, "complete"),
        ),
        columns: { scorecard: true },
    });
    if (!submission?.scorecard) return null;

    const scorecard = submission.scorecard as Record<string, unknown>;
    const roiProjection = scorecard.roiProjection as {
        currentAnnualWaste: number;
        projectedSavings: number;
        paybackMonths: number;
        assumptions: string[];
    } | undefined;
    if (!roiProjection) return null;

    const recommendedTools = (scorecard.recommendedTools ?? []) as Array<{ name: string }>;
    if (recommendedTools.length === 0) return null;

    // 2. Get current software spend
    const spend = await db.select({ toolName: softwareSpend.toolName })
        .from(softwareSpend)
        .where(eq(softwareSpend.workspaceId, workspaceId));

    const spendNames = new Set(spend.map(s => s.toolName.toLowerCase().trim()));

    // 3. Match recommended tools against actual spend
    const toolStatus = recommendedTools.map(t => ({
        name: t.name,
        adopted: spendNames.has(t.name.toLowerCase().trim()),
    }));

    const adoptedCount = toolStatus.filter(t => t.adopted).length;
    const adoptionRate = Math.round((adoptedCount / recommendedTools.length) * 100);
    const adjustedSavings = Math.round(roiProjection.projectedSavings * (adoptionRate / 100));

    return {
        projectedAnnualSavings: roiProjection.projectedSavings,
        currentAnnualWaste: roiProjection.currentAnnualWaste,
        paybackMonths: roiProjection.paybackMonths,
        recommendedTools: toolStatus,
        adoptionRate,
        adjustedSavings,
        assumptions: roiProjection.assumptions ?? [],
    };
}
