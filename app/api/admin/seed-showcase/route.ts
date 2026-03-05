import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workspaces, tools, reports } from "@/lib/db/schema";
import { SHOWCASE_TOOLS } from "@/data/showcase-seed";
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

const WORKSPACE_NAME = "Trackr Showcase";
const WORKSPACE_SLUG = "trackr-showcase";

export async function POST(req: NextRequest) {
    if (!checkAuth(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Find or create the showcase workspace
        let workspace = await db.query.workspaces.findFirst({
            where: eq(workspaces.slug, WORKSPACE_SLUG),
        });

        if (!workspace) {
            const [created] = await db.insert(workspaces).values({
                name: WORKSPACE_NAME,
                slug: WORKSPACE_SLUG,
                onboardingCompleted: true,
                companyContext: "Trackr Showcase workspace for featured weekly tool evaluations displayed on the homepage.",
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
            workspace = created;
        }

        const results: { name: string; shareUrl: string; action: string }[] = [];

        for (const demo of SHOWCASE_TOOLS) {
            // Check if a report with this share token already exists
            const existingReport = await db.query.reports.findFirst({
                where: eq(reports.shareToken, demo.shareToken),
            });

            if (existingReport) {
                results.push({
                    name: demo.name,
                    shareUrl: `/share/${demo.shareToken}`,
                    action: "skipped (already exists)",
                });
                continue;
            }

            // Upsert the tool — find existing by name + workspace, or insert
            let tool = await db.query.tools.findFirst({
                where: eq(tools.workspaceId, workspace.id),
                columns: { id: true, name: true },
            });

            // Check if this specific tool exists
            const existingTools = await db
                .select({ id: tools.id })
                .from(tools)
                .where(eq(tools.workspaceId, workspace.id));

            const matchingTool = existingTools.length > 0
                ? await db.query.tools.findFirst({
                    where: eq(tools.name, demo.name),
                })
                : null;

            let toolId: string;

            if (matchingTool && matchingTool.workspaceId === workspace.id) {
                toolId = matchingTool.id;
            } else {
                const [newTool] = await db.insert(tools).values({
                    workspaceId: workspace.id,
                    name: demo.name,
                    websiteUrl: demo.websiteUrl,
                    logoUrl: demo.logoUrl,
                    status: "active",
                    overallScore: demo.overallScore.toFixed(2),
                    category: demo.categories,
                    submittedBy: "showcase-seed",
                    lastResearchedAt: new Date(),
                    researchInterval: "manual",
                }).returning();
                toolId = newTool.id;
            }

            // Insert report with share token
            const featuresData = demo.report.features.map(f => ({ name: f }));
            const pricingData = demo.report.pricing.map(p => ({ tier: p.tier, price: p.price }));

            await db.insert(reports).values({
                toolId,
                version: 1,
                summary: demo.report.summary,
                scorecardSnapshot: demo.report.scorecard,
                pros: demo.report.pros,
                cons: demo.report.cons,
                features: featuresData,
                pricing: pricingData,
                isPricingHidden: false,
                sentimentData: demo.report.sentimentData,
                competitors: [],
                integrations: [],
                shareToken: demo.shareToken,
                isPublic: true,
            });

            results.push({
                name: demo.name,
                shareUrl: `/share/${demo.shareToken}`,
                action: "created",
            });
        }

        return NextResponse.json({
            success: true,
            workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug },
            results,
        });
    } catch (error) {
        console.error("[seed-showcase] error:", error);
        return NextResponse.json(
            { error: "Seed failed", detail: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    if (!checkAuth(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({
        ok: true,
        description: "POST to seed showcase tools with share tokens",
        tools: SHOWCASE_TOOLS.map(t => ({ name: t.name, token: t.shareToken })),
    });
}
