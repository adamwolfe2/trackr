import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workspaces, workspaceMembers, tools, reports, researchJobs } from "@/lib/db/schema";
import { DEMO_TOOLS } from "@/data/demo-workspace-seed";
import { eq } from "drizzle-orm";
import { timingSafeEqual } from "crypto";

function checkAuth(req: NextRequest): boolean {
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ") || !process.env.ADMIN_PASSWORD) return false;
    const provided = auth.slice(7);
    const expected = process.env.ADMIN_PASSWORD;
    try {
        const a = Buffer.from(provided);
        const b = Buffer.from(expected);
        if (a.length !== b.length) return false;
        return timingSafeEqual(a, b);
    } catch {
        return false;
    }
}

export async function POST(req: NextRequest) {
    if (!checkAuth(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json().catch(() => ({}));
        const userId: string | undefined = body.userId;
        const workspaceName: string = body.workspaceName ?? "Acme Demo Workspace";

        // Create a slug from the workspace name
        const slug = workspaceName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
            + "-" + Date.now().toString(36);

        // Create the workspace
        const [workspace] = await db.insert(workspaces).values({
            name: workspaceName,
            slug,
            onboardingCompleted: true,
            companyContext: "Acme Corp is a 150-person Series B SaaS company. We run a modern cloud-native tech stack and evaluate 15-20 new tools per year across the engineering, ops, and marketing orgs.",
            scorecardConfig: {
                weights: {
                    features: 0.20,
                    pricing_value: 0.15,
                    ease_of_use: 0.15,
                    integration_depth: 0.15,
                    support_quality: 0.10,
                    security: 0.10,
                    ai_capabilities: 0.15,
                },
            },
        }).returning();

        // Attach a workspace member if userId provided
        if (userId) {
            await db.insert(workspaceMembers).values({
                workspaceId: workspace.id,
                userId,
                role: "owner",
            }).onConflictDoNothing();
        }

        // Create tools with reports
        const createdTools: { id: string; name: string; overallScore: string }[] = [];

        for (const demo of DEMO_TOOLS) {
            // Insert tool
            const [tool] = await db.insert(tools).values({
                workspaceId: workspace.id,
                name: demo.name,
                websiteUrl: demo.websiteUrl,
                logoUrl: demo.logoUrl,
                status: "active",
                overallScore: demo.overallScore.toFixed(2),
                category: demo.categories,
                submittedBy: userId ?? "demo-seed",
                lastResearchedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // random within last 7 days
                researchInterval: "manual",
            }).returning();

            // Build report data
            const scorecardSnapshot: Record<string, { score: number; justification: string }> = demo.report.scorecard;
            const featuresData = demo.report.features.map(f => ({ name: f }));
            const pricingData = demo.report.pricing.map(p => ({ tier: p.tier, price: p.price }));

            // Insert report
            await db.insert(reports).values({
                toolId: tool.id,
                version: 1,
                summary: demo.report.summary,
                scorecardSnapshot,
                pros: demo.report.pros,
                cons: demo.report.cons,
                features: featuresData,
                pricing: pricingData,
                isPricingHidden: false,
                sentimentData: demo.report.sentimentData,
                competitors: [],
                integrations: [],
            });

            createdTools.push({ id: tool.id, name: tool.name, overallScore: tool.overallScore ?? "0" });
        }

        // Create research job history (5 completed jobs)
        const toolIds = createdTools.map(t => t.id);
        const jobHistory = toolIds.slice(0, 5).map((toolId, i) => ({
            toolId,
            status: "complete" as const,
            triggeredBy: userId ?? "demo-seed",
            completedAt: new Date(Date.now() - (i + 1) * 12 * 60 * 60 * 1000), // staggered over last 2.5 days
        }));

        for (const job of jobHistory) {
            await db.insert(researchJobs).values(job);
        }

        return NextResponse.json({
            success: true,
            workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug },
            toolsCreated: createdTools.length,
            tools: createdTools,
            message: userId
                ? `Demo workspace seeded and attached to user ${userId}. Visit /dashboard to see it.`
                : `Demo workspace seeded (no user attached). Workspace ID: ${workspace.id}`,
        });
    } catch (error) {
        console.error("[seed-demo] error:", error);
        return NextResponse.json({ error: "Seed failed" }, { status: 500 });
    }
}

// Also support GET to check if the endpoint is alive
export async function GET(req: NextRequest) {
    if (!checkAuth(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({
        ok: true,
        description: "POST to this endpoint to seed a demo workspace",
        body: {
            userId: "optional — Clerk user ID to attach workspace to",
            workspaceName: "optional — defaults to 'Acme Demo Workspace'",
        },
        auth: "Bearer $ADMIN_PASSWORD header required",
    });
}
