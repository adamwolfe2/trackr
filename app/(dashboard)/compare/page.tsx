export const dynamic = "force-dynamic";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { tools, reports, workspaceMembers } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { CompareClient } from "./client";

export default async function ComparePage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });

    if (!member) {
        return <div className="text-center py-12 text-muted-foreground">No workspace found.</div>;
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
                pricing: report?.pricing,
                features: report?.features,
                summary: report?.summary ?? null,
            };
        })
    );

    return <CompareClient tools={toolsWithReports} />;
}
