import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workspaces, tools, reports } from "@/lib/db/schema";
import { SHOWCASE_TOOLS, type ShowcaseTool } from "@/data/showcase-seed";
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
        const body = await req.json().catch(() => ({}));
        const force = body.force === true;

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

            if (existingReport && !force) {
                results.push({
                    name: demo.name,
                    shareUrl: `/share/${demo.shareToken}`,
                    action: "skipped (already exists, use force:true to replace)",
                });
                continue;
            }

            // If force, delete the old report
            if (existingReport && force) {
                await db.delete(reports).where(eq(reports.id, existingReport.id));
            }

            // Find or create the tool
            const matchingTool = await db.query.tools.findFirst({
                where: eq(tools.name, demo.name),
            });

            let toolId: string;

            if (matchingTool && matchingTool.workspaceId === workspace.id) {
                toolId = matchingTool.id;
                // Update tool metadata on force
                if (force) {
                    await db.update(tools).set({
                        logoUrl: demo.logoUrl,
                        websiteUrl: demo.websiteUrl,
                        overallScore: demo.overallScore.toFixed(2),
                        category: demo.categories,
                    }).where(eq(tools.id, toolId));
                }
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

            // Build full sentiment data merging base + extended
            const fullSentimentData = {
                ...demo.report.sentimentData,
                ...demo.extendedSentiment,
            };

            await db.insert(reports).values({
                toolId,
                version: 1,
                summary: demo.report.summary,
                scorecardSnapshot: demo.report.scorecard,
                pros: demo.report.pros,
                cons: demo.report.cons,
                features: { list: demo.report.features },
                pricing: demo.report.pricing,
                isPricingHidden: false,
                sentimentData: fullSentimentData,
                competitors: demo.competitors,
                integrations: demo.integrations,
                shareToken: demo.shareToken,
                isPublic: true,
            });

            results.push({
                name: demo.name,
                shareUrl: `/share/${demo.shareToken}`,
                action: force && existingReport ? "replaced" : "created",
            });
        }

        return NextResponse.json({
            success: true,
            workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug },
            results,
        });
    } catch (error) {
        console.error("[seed-showcase] error:", error);
        return NextResponse.json({ error: "Seed failed" }, { status: 500 });
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
