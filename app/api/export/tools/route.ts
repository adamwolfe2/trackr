import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { tools, reports, workspaceMembers } from "@/lib/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { rateLimit, getRateLimitHeaders } from "@/lib/middleware/rate-limit";
import { toCSV } from "@/lib/utils/csv";

export async function GET(_req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate limit: 5 exports per minute per user
        const rl = await rateLimit(`export-tools:${user.id}`, { limit: 5, windowSeconds: 60 });
        if (!rl.success) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429, headers: getRateLimitHeaders(rl) }
            );
        }

        const member = await db.query.workspaceMembers.findFirst({
            where: eq(workspaceMembers.userId, user.id),
        });
        if (!member) {
            return NextResponse.json({ error: "No workspace" }, { status: 403 });
        }

        const workspaceId = member.workspaceId;

        const allTools = await db.query.tools.findMany({
            where: eq(tools.workspaceId, workspaceId),
            columns: {
                id: true, name: true, websiteUrl: true, status: true,
                category: true, overallScore: true, lastResearchedAt: true,
            },
            orderBy: [desc(tools.overallScore)],
            limit: 500,
        });

        const toolIds = allTools.map(t => t.id);
        const latestReportMap = new Map<string, {
            summary: string | null;
            pros: string[] | null;
            cons: string[] | null;
            scorecardSnapshot: unknown;
        }>();

        if (toolIds.length > 0) {
            // Fetch latest report per tool using DISTINCT ON to avoid loading all historical reports
            const allReports = await db
                .select({
                    toolId: reports.toolId,
                    summary: reports.summary,
                    pros: reports.pros,
                    cons: reports.cons,
                    scorecardSnapshot: reports.scorecardSnapshot,
                })
                .from(reports)
                .where(inArray(reports.toolId, toolIds))
                .orderBy(desc(reports.createdAt))
                .limit(toolIds.length * 2); // Safety: at most 2 reports per tool to find latest

            for (const r of allReports) {
                if (!latestReportMap.has(r.toolId)) {
                    latestReportMap.set(r.toolId, r);
                }
            }
        }

        // Build CSV
        const headers = [
            "Tool Name",
            "URL",
            "Status",
            "Categories",
            "Overall Score",
            "Last Researched",
            "Features Score",
            "Pricing Score",
            "Ease of Use",
            "Integrations",
            "Support",
            "Security",
            "AI Score",
            "Summary",
            "Top Pro",
            "Top Con",
        ];

        const rows = allTools.map(tool => {
            const report = latestReportMap.get(tool.id);
            const snapshot = report?.scorecardSnapshot as Record<string, { score: number }> | null;

            const getDim = (key: string) => {
                const s = snapshot?.[key];
                return s ? String(s.score) : "";
            };

            return [
                tool.name,
                tool.websiteUrl ?? "",
                tool.status,
                (tool.category ?? []).join("; "),
                tool.overallScore ? String(Number(tool.overallScore).toFixed(1)) : "",
                tool.lastResearchedAt ? new Date(tool.lastResearchedAt).toISOString().slice(0, 10) : "",
                getDim("features"),
                getDim("pricing_value"),
                getDim("ease_of_use"),
                getDim("integration_depth"),
                getDim("support_quality"),
                getDim("security"),
                getDim("ai_capabilities"),
                (report?.summary ?? "").slice(0, 200).replace(/\n/g, " "),
                (report?.pros ?? [])[0] ?? "",
                (report?.cons ?? [])[0] ?? "",
            ];
        });

        const csv = toCSV(headers, rows);

        const today = new Date().toISOString().slice(0, 10);

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="trackr-stack-${today}.csv"`,
                ...getRateLimitHeaders(rl),
            },
        });
    } catch (err) {
        console.error("[export-tools] Error:", err);
        return NextResponse.json({ error: "Export failed" }, { status: 500 });
    }
}
