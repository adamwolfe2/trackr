/**
 * Audit Scorecard Pipeline
 *
 * Called in the background after a prospect submits the /audit form.
 * 1. Firecrawl scrape of company website
 * 2. GPT-4o structured scorecard generation
 * 3. Email scorecard to callOwnerEmail (or contactEmail) + CC adamwolfe102@gmail.com
 * 4. Persist scorecard in DB
 */

import { db } from "@/lib/db";
import { auditSubmissions, workspaces, softwareSpend, architects, architectReferrals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { firecrawl } from "@/lib/services/firecrawl";
import { sendAuditScorecardEmail, sendProspectTeaserEmail } from "@/lib/email/resend";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// ── Scorecard Schema ──────────────────────────────────────────────────────────

const AuditScorecardSchema = z.object({
    companyName: z.string(),
    companyWebsite: z.string().optional(),
    contactName: z.string().optional(),
    industry: z.string().optional(),
    companySize: z.string().optional(),
    branding: z.object({
        logoUrl: z.string().optional(),
        primaryColor: z.string().optional(),
        backgroundColor: z.string().optional(),
    }),
    aiNativeScore: z.object({
        score: z.number().int().min(0).max(100),
        summary: z.string(),
    }),
    painPoints: z.array(z.object({
        area: z.string(),
        description: z.string(),
    })).min(2).max(7),
    currentStack: z.array(z.object({
        name: z.string(),
        category: z.string(),
        aiRole: z.enum(["AI-native", "AI-assisted", "Non-AI core infra"]),
        usageNotes: z.string(),
    })),
    recommendations: z.array(z.object({
        title: z.string(),
        impact: z.enum(["High", "Medium", "Low"]),
        difficulty: z.enum(["High", "Medium", "Low"]),
        description: z.string(),
    })).min(3).max(7),
    futureAINativeTarget: z.object({
        targetScore: z.number().int().min(0).max(100),
        summary: z.string(),
    }),
    talkingPoints: z.array(z.object({
        topic: z.string(),
        observation: z.string(),
        question: z.string(),
        opportunity: z.string(),
    })).min(3).max(5),
});

export type AuditScorecard = z.infer<typeof AuditScorecardSchema>;

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert AI strategy consultant generating a custom AI readiness scorecard for a business. Your output is a structured JSON object used to brief a consultant before a discovery call.

SCORING GUIDE — AI-Native Score (0–100):
• 0–20: Barely using AI; mostly experiments or none.
• 21–40: Ad-hoc usage by individuals; no process or ownership.
• 41–60: Moderate adoption in a few workflows; limited integration.
• 61–80: Structured adoption with governance and intentional stack design.
• 81–100: AI-native org; AI woven into product, ops, and decision-making.

Blend the self-reported maturity score (1–10), the count/quality of current tools, and any AI evidence from the website.

PAIN POINTS: Extract 3–7 from form responses + scraped website context. Each must include:
- Area (Sales, Ops, CS, Product, Finance, Exec)
- Friction type (tool sprawl, manual workflows, no AI ownership, etc.)
- Business impact where clear

CURRENT STACK: Classify each tool as AI-native, AI-assisted, or Non-AI core infra. Add brief usage notes.

RECOMMENDATIONS: 3–7 prioritized by ROI. Each must have title, impact, difficulty, and a 1–2 sentence description tied to their specific situation.

BRANDING: Extract logoUrl and primaryColor from website metadata if available in the scraped context. If not found, set primaryColor to "#F3F3EF" (Trackr's cream).

TALKING POINTS: Generate 3–5 call preparation talking points. Each must have: topic (short label), observation (what the data shows about their current situation), question (an opener to ask the prospect on the call), opportunity (what we can specifically help with).

STYLE: Be factual and conservative. Do not fabricate revenue numbers. If website data is sparse, focus on form responses. Keep all text concise — executives should absorb this in under 2 minutes.`;

// ── Build prompt from submission data ────────────────────────────────────────

type SubmissionRow = typeof auditSubmissions.$inferSelect;

function buildPrompt(sub: SubmissionRow, enrichment: string): string {
    const tools = (sub.currentTools ?? []).join(", ") || "None specified";
    const teams = (sub.teamsNeedingAI ?? []).join(", ") || "Not specified";

    return `Generate an AI readiness scorecard for the following company.

FORM SUBMISSION DATA:
- Company: ${sub.companyName}
- Website: ${sub.companyWebsite || "Not provided"}
- Industry: ${sub.industry || "Not specified"}
- Size: ${sub.companySize || "Not specified"}
- Contact role: ${sub.role || "Not specified"}
- Revenue: ${sub.revenue || "Not specified"}

AI READINESS:
- AI tools actively used: ${sub.aiToolCount || "Not specified"}
- % of team using AI daily: ${sub.dailyAdoptionPct || "Not specified"}
- AI/stack manager: ${sub.hasAIManager || "Not specified"}
- Monthly AI + software spend: ${sub.monthlySpend || "Not specified"}
- Biggest operational bottleneck: ${sub.biggestBottleneck || "Not specified"}
- Teams needing AI most: ${teams}
- Failed AI implementations: ${sub.failedAI || "Not specified"}
- 90-day success definition: ${sub.successDefinition || "Not specified"}

CURRENT TOOL STACK:
${tools}

TOOL FRUSTRATIONS:
${sub.toolFrustrations || "Not provided"}

MANUAL PROCESSES TO AUTOMATE:
${sub.manualProcesses || "Not provided"}

${enrichment ? `SCRAPED WEBSITE CONTEXT (from ${sub.companyWebsite}):
${enrichment}` : "WEBSITE CONTEXT: Website not scraped (URL not provided or scrape failed). Base scorecard on form data only."}`;
}

// ── Scorecard config builder ──────────────────────────────────────────────────

function buildScorecardConfig(bottleneck: string | null): Record<string, number> {
    const b = (bottleneck ?? "").toLowerCase();
    if (b.includes("sales") || b.includes("lead")) {
        return { aiSophistication: 25, coreCapability: 20, integrationDepth: 20, pricingValue: 15, easeOfUse: 10, scalability: 7, communitySupport: 3 };
    }
    if (b.includes("ops") || b.includes("operation")) {
        return { scalability: 25, integrationDepth: 20, easeOfUse: 20, coreCapability: 15, pricingValue: 12, aiSophistication: 5, communitySupport: 3 };
    }
    if (b.includes("support") || b.includes("customer")) {
        return { easeOfUse: 25, communitySupport: 20, integrationDepth: 20, coreCapability: 15, aiSophistication: 10, pricingValue: 7, scalability: 3 };
    }
    if (b.includes("content") || b.includes("marketing")) {
        return { aiSophistication: 30, coreCapability: 25, easeOfUse: 20, integrationDepth: 10, pricingValue: 8, communitySupport: 5, scalability: 2 };
    }
    if (b.includes("data") || b.includes("analytics")) {
        return { coreCapability: 25, integrationDepth: 25, scalability: 20, aiSophistication: 15, pricingValue: 10, easeOfUse: 3, communitySupport: 2 };
    }
    // default balanced
    return { coreCapability: 20, aiSophistication: 20, integrationDepth: 15, easeOfUse: 15, pricingValue: 15, scalability: 10, communitySupport: 5 };
}

// ── Workspace slug helper ─────────────────────────────────────────────────────

function slugify(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40);
}

// ── Main pipeline ─────────────────────────────────────────────────────────────

export async function processAuditSubmission(id: string): Promise<void> {
    const submission = await db.query.auditSubmissions.findFirst({
        where: eq(auditSubmissions.id, id),
    });
    if (!submission) return;

    await db.update(auditSubmissions)
        .set({ status: "processing" })
        .where(eq(auditSubmissions.id, id));

    try {
        // 1. Firecrawl enrichment
        let enrichmentContext = "";
        if (submission.companyWebsite) {
            const url = submission.companyWebsite.startsWith("http")
                ? submission.companyWebsite
                : `https://${submission.companyWebsite}`;
            const result = await firecrawl.scrapeUrl(url);
            if (result.success && result.data?.markdown) {
                enrichmentContext = result.data.markdown.slice(0, 8_000);
            }
        }

        // 2. GPT-4o scorecard generation
        const { object: scorecard } = await generateObject({
            model: openai("gpt-4o"),
            schema: AuditScorecardSchema,
            system: SYSTEM_PROMPT,
            prompt: buildPrompt(submission, enrichmentContext),
        });

        // 3. Generate share token
        const { randomUUID } = await import("crypto");
        const shareToken = randomUUID().replace(/-/g, "");

        // 4. Pre-build workspace
        const slug = slugify(submission.companyName) + "-" + randomUUID().slice(0, 4);
        const [workspace] = await db.insert(workspaces).values({
            name: submission.companyName,
            slug,
            companyContext: enrichmentContext.slice(0, 2000) || null,
            scorecardConfig: buildScorecardConfig(submission.biggestBottleneck),
            onboardingCompleted: false,
        }).returning();

        // Seed software_spend from currentTools[]
        if (submission.currentTools?.length) {
            await db.insert(softwareSpend).values(
                submission.currentTools.map(t => ({
                    workspaceId: workspace.id,
                    toolName: t,
                    status: "active" as const,
                    monthlyCost: "0",
                }))
            );
        }

        // 4b. Create architect referral if arcCode is present
        if (submission.arcCode) {
            const architect = await db.query.architects.findFirst({
                where: eq(architects.arcCode, submission.arcCode),
            });
            if (architect && architect.status === "active") {
                await db.insert(architectReferrals).values({
                    architectId: architect.id,
                    workspaceId: workspace.id,
                    auditSubmissionId: submission.id,
                    status: "lead",
                });
                // Increment total clients count
                await db.update(architects)
                    .set({ totalClients: architect.totalClients + 1 })
                    .where(eq(architects.id, architect.id));
            }
        }

        // 5. Send emails — rep gets full scorecard, prospect gets teaser
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://trytrackr.com";
        const shareUrl = `${appUrl}/audit/share/${shareToken}`;
        const adminUrl = `${appUrl}/admin/leads/${id}`;
        await sendAuditScorecardEmail({ submission, scorecard, shareUrl, adminUrl });
        await sendProspectTeaserEmail({ submission, score: scorecard.aiNativeScore.score });

        // 6. Persist
        await db.update(auditSubmissions)
            .set({
                status: "complete",
                scorecard,
                talkingPoints: scorecard.talkingPoints,
                shareToken,
                preBuiltWorkspaceId: workspace.id,
                completedAt: new Date(),
            })
            .where(eq(auditSubmissions.id, id));

    } catch (err) {
        console.error("[audit] Pipeline failed for submission", id, err);
        await db.update(auditSubmissions)
            .set({
                status: "failed",
                errorMessage: err instanceof Error ? err.message.slice(0, 500) : String(err),
            })
            .where(eq(auditSubmissions.id, id));
    }
}
