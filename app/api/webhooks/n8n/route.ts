import { db } from "@/lib/db";
import { tools, reports, researchJobs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Function to handle POST from n8n
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { tool_id, report_data, n8n_execution_id, status } = body;

        // Verify secret if needed (TODO)

        if (!tool_id) {
            return NextResponse.json({ error: "Missing tool_id" }, { status: 400 });
        }

        // 1. Update Tool Status
        await db
            .update(tools)
            .set({
                status: status === "success" ? "researched" : "failed",
                lastResearchedAt: new Date(),
                overallScore: report_data?.overall_score ? String(report_data.overall_score) : undefined
            })
            .where(eq(tools.id, tool_id));

        // 2. Save Report
        if (status === "success" && report_data) {
            await db.insert(reports).values({
                toolId: tool_id,
                summary: report_data.summary,
                features: report_data.features, // JSONB
                pricing: report_data.pricing,   // JSONB
                pros: report_data.pros,
                cons: report_data.cons,
                scorecardSnapshot: report_data.scorecard,
                rawScrapedData: report_data.raw_data,
            });
        }

        // 3. Update Job Status
        // (Assuming job ID or finding active job for this tool)
        // await db.update(researchJobs)...

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
