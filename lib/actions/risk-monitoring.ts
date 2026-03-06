"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { riskAssessments, tools, workspaceMembers } from "@/lib/db/schema";
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

async function requireWorkspace() {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");
    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
        columns: { workspaceId: true },
        orderBy: (wm, { asc }) => [asc(wm.joinedAt)],
    });
    if (!member) throw new Error("No workspace found");
    return member.workspaceId;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type RiskBreakdown = {
    securityPosture: number;
    complianceCerts: number;
    dataBreaches: number;
    vendorStability: number;
    privacyPolicy: number;
};

type AlertLevel = "low" | "medium" | "high" | "critical";

type Finding = {
    category: string;
    finding: string;
    severity: "low" | "medium" | "high" | "critical";
    source?: string;
};

export async function computeRiskScore(breakdown: RiskBreakdown): Promise<{
    overallRisk: number;
    alertLevel: AlertLevel;
}> {
    // Weighted average: security and data breaches weigh more
    const weights = {
        securityPosture: 0.30,
        complianceCerts: 0.15,
        dataBreaches: 0.25,
        vendorStability: 0.15,
        privacyPolicy: 0.15,
    };

    const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

    const overallRisk = clamp(
        breakdown.securityPosture * weights.securityPosture +
        breakdown.complianceCerts * weights.complianceCerts +
        breakdown.dataBreaches * weights.dataBreaches +
        breakdown.vendorStability * weights.vendorStability +
        breakdown.privacyPolicy * weights.privacyPolicy
    );

    let alertLevel: AlertLevel = "low";
    if (overallRisk >= 80) alertLevel = "critical";
    else if (overallRisk >= 60) alertLevel = "high";
    else if (overallRisk >= 30) alertLevel = "medium";

    return { overallRisk, alertLevel };
}

export async function createRiskAssessment(
    toolId: string,
    workspaceId: string,
    data: {
        overallRisk: number;
        breakdown: RiskBreakdown;
        alertLevel: AlertLevel;
        findings?: Finding[];
    }
) {
    if (!UUID_RE.test(toolId)) throw new Error("Invalid tool ID");
    if (!UUID_RE.test(workspaceId)) throw new Error("Invalid workspace ID");

    const authedWorkspaceId = await requireWorkspace();
    if (authedWorkspaceId !== workspaceId) throw new Error("Unauthorized");

    // Verify tool belongs to workspace
    const tool = await db.query.tools.findFirst({
        where: and(eq(tools.id, toolId), eq(tools.workspaceId, workspaceId)),
        columns: { id: true },
    });
    if (!tool) throw new Error("Tool not found in this workspace");

    const overallRisk = Math.max(0, Math.min(100, Math.round(data.overallRisk)));
    const validAlertLevels: AlertLevel[] = ["low", "medium", "high", "critical"];
    if (!validAlertLevels.includes(data.alertLevel)) {
        throw new Error("Invalid alert level");
    }

    const [inserted] = await db.insert(riskAssessments).values({
        toolId,
        workspaceId,
        overallRisk,
        breakdown: data.breakdown,
        alertLevel: data.alertLevel,
        findings: data.findings ?? null,
    }).returning();

    revalidatePath("/risk");
    return { success: true, assessment: inserted };
}

export async function getRiskDashboard(workspaceId: string) {
    if (!UUID_RE.test(workspaceId)) throw new Error("Invalid workspace ID");

    const authedWorkspaceId = await requireWorkspace();
    if (authedWorkspaceId !== workspaceId) throw new Error("Unauthorized");

    // Get all workspace tools
    const workspaceTools = await db.query.tools.findMany({
        where: eq(tools.workspaceId, workspaceId),
        columns: { id: true, name: true, logoUrl: true, status: true, websiteUrl: true },
    });

    if (workspaceTools.length === 0) {
        return { tools: [], stats: { totalMonitored: 0, avgRisk: 0, highCriticalCount: 0 } };
    }

    const toolIds = workspaceTools.map(t => t.id);

    // Get all risk assessments for these tools, latest first
    const allAssessments = await db.query.riskAssessments.findMany({
        where: and(
            eq(riskAssessments.workspaceId, workspaceId),
            inArray(riskAssessments.toolId, toolIds)
        ),
        orderBy: [desc(riskAssessments.assessedAt)],
    });

    // Build map: toolId -> latest assessment
    const latestByTool = new Map<string, typeof allAssessments[0]>();
    for (const a of allAssessments) {
        if (!latestByTool.has(a.toolId)) {
            latestByTool.set(a.toolId, a);
        }
    }

    // Combine tools with their latest risk assessment
    const toolsWithRisk = workspaceTools
        .filter(t => latestByTool.has(t.id))
        .map(t => {
            const assessment = latestByTool.get(t.id)!;
            return {
                toolId: t.id,
                toolName: t.name,
                logoUrl: t.logoUrl,
                status: t.status,
                websiteUrl: t.websiteUrl,
                overallRisk: assessment.overallRisk,
                alertLevel: assessment.alertLevel,
                breakdown: assessment.breakdown as RiskBreakdown,
                findings: assessment.findings as Finding[] | null,
                assessedAt: assessment.assessedAt,
            };
        })
        .sort((a, b) => b.overallRisk - a.overallRisk);

    const totalMonitored = toolsWithRisk.length;
    const avgRisk = totalMonitored > 0
        ? Math.round(toolsWithRisk.reduce((sum, t) => sum + t.overallRisk, 0) / totalMonitored)
        : 0;
    const highCriticalCount = toolsWithRisk.filter(
        t => t.alertLevel === "high" || t.alertLevel === "critical"
    ).length;

    return {
        tools: toolsWithRisk,
        stats: { totalMonitored, avgRisk, highCriticalCount },
    };
}

export async function getToolRiskHistory(toolId: string, workspaceId: string) {
    if (!UUID_RE.test(toolId)) throw new Error("Invalid tool ID");
    if (!UUID_RE.test(workspaceId)) throw new Error("Invalid workspace ID");

    const authedWorkspaceId = await requireWorkspace();
    if (authedWorkspaceId !== workspaceId) throw new Error("Unauthorized");

    return db.query.riskAssessments.findMany({
        where: and(
            eq(riskAssessments.toolId, toolId),
            eq(riskAssessments.workspaceId, workspaceId)
        ),
        orderBy: [desc(riskAssessments.assessedAt)],
    });
}

export async function getRiskAlerts(workspaceId: string) {
    if (!UUID_RE.test(workspaceId)) throw new Error("Invalid workspace ID");

    const authedWorkspaceId = await requireWorkspace();
    if (authedWorkspaceId !== workspaceId) throw new Error("Unauthorized");

    // Get tool IDs for this workspace
    const workspaceTools = await db.query.tools.findMany({
        where: eq(tools.workspaceId, workspaceId),
        columns: { id: true, name: true },
    });

    if (workspaceTools.length === 0) return [];

    const toolIds = workspaceTools.map(t => t.id);
    const toolNameMap = new Map(workspaceTools.map(t => [t.id, t.name]));

    // Get all assessments, latest per tool
    const allAssessments = await db.query.riskAssessments.findMany({
        where: and(
            eq(riskAssessments.workspaceId, workspaceId),
            inArray(riskAssessments.toolId, toolIds)
        ),
        orderBy: [desc(riskAssessments.assessedAt)],
    });

    const latestByTool = new Map<string, typeof allAssessments[0]>();
    for (const a of allAssessments) {
        if (!latestByTool.has(a.toolId)) {
            latestByTool.set(a.toolId, a);
        }
    }

    return Array.from(latestByTool.values())
        .filter(a => a.alertLevel === "high" || a.alertLevel === "critical")
        .map(a => ({
            ...a,
            toolName: toolNameMap.get(a.toolId) ?? "Unknown",
        }))
        .sort((a, b) => {
            const order = { critical: 0, high: 1, medium: 2, low: 3 };
            return (order[a.alertLevel as keyof typeof order] ?? 3) - (order[b.alertLevel as keyof typeof order] ?? 3);
        });
}
