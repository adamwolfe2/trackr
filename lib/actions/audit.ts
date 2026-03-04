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
import { eq, and } from "drizzle-orm";
import { firecrawl } from "@/lib/services/firecrawl";
import { sendAuditScorecardEmail, sendProspectTeaserEmail } from "@/lib/email/resend";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// ── Scorecard Schema ──────────────────────────────────────────────────────────

const AuditScorecardSchema = z.object({
    companyName: z.string(),
    companyWebsite: z.string().nullable(),
    contactName: z.string().nullable(),
    industry: z.string().nullable(),
    companySize: z.string().nullable(),
    branding: z.object({
        logoUrl: z.string().nullable(),
        primaryColor: z.string().nullable(),
        backgroundColor: z.string().nullable(),
    }),
    aiNativeScore: z.object({
        score: z.number().int().min(0).max(100),
        summary: z.string(),
    }),
    executiveSummary: z.string().nullable(),
    painPoints: z.array(z.object({
        area: z.string(),
        description: z.string(),
        annualCostEstimate: z.string().nullable(), // e.g. "$40K–$80K/year"
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
        estimatedROI: z.string().nullable(), // e.g. "2–3x return within 6 months"
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
    recommendedTools: z.array(z.object({
        name: z.string(),
        websiteDomain: z.string().nullable(),
        category: z.string(),
        reason: z.string(),
        estimatedCostPerUser: z.string().nullable(),
        impact: z.enum(["High", "Medium", "Low"]),
    })).min(2).max(5),
});

export type AuditScorecard = z.infer<typeof AuditScorecardSchema>;

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a senior AI strategy consultant preparing a bespoke briefing document for a discovery call with a prospective client. You have deep knowledge of enterprise software, AI tooling, and how companies at different maturity levels actually operate. Your output is used live on a sales call — it must be sharp, specific, and immediately useful.

CRITICAL RULE: Never write generic statements. Every observation, question, and recommendation must reference specifics from their form data (their actual tools, their stated bottleneck, their role, their industry, their revenue band, their team size). A rep reading this brief should feel like you already know this company.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI-NATIVE SCORE (0–100)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Blend: self-reported tool count, daily adoption %, AI manager presence, failed AI history, and website evidence of AI usage.
• 0–20: No meaningful AI — experiments at best
• 21–40: Ad-hoc individual usage, no process or ownership
• 41–60: Moderate adoption in a few workflows, fragmented
• 61–80: Structured adoption, governance emerging, intentional stack design
• 81–100: AI-native — AI woven into product, ops, and decisions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXECUTIVE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write a 2–3 sentence executive brief in 'executiveSummary'. Lead with what was found (X tools analyzed, Y critical gaps identified). Then state the business consequence in dollar terms if possible. Then the call to action. Write for a CEO who has 15 seconds. Reference their actual company name and industry.

Example: "This assessment analyzed [Company]'s 25-tool stack across 5 departments and identified 4 critical gaps that are costing an estimated $80K–$140K annually in lost productivity and redundant spend. At a score of 55/100, [Company] is operating at 61% of its AI potential — leaving significant competitive ground to its peers in the Agency/Consultancy sector. The 90-day roadmap below outlines the highest-ROI interventions to close this gap."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAIN POINTS (3–7)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Extract from form responses + website. Each must name:
- The specific area (Sales, Ops, CS, Product, Finance, Exec, Engineering)
- The exact friction observed (reference their tools, their bottleneck, their industry)
- The business consequence (lost time, missed revenue, increased cost, risk)
- annualCostEstimate: a specific dollar range for the annual cost of inaction (e.g., "$40K–$80K/year"). Calculate from employee count × weekly hours wasted × $75/hr blended rate, or from monthly spend waste. Show your reasoning in the estimate — e.g., "15 employees × 5 hrs/wk × $75/hr × 52 weeks = ~$293K." Round to a sensible range. If employee count is unknown, use company size to estimate headcount. Set null only if truly impossible to estimate.

MANDATORY: Every pain point description MUST name at least one specific tool from their CURRENT TOOL STACK. Connect the tool to the friction directly.

BAD: "Sales processes are inefficient."
BAD: "The team lacks AI tooling for lead generation." (no tool reference)
GOOD: "Using Google Ads for acquisition but routing leads into Notion manually — no CRM or enrichment layer means pipeline data is fragmented across spreadsheets, costing an estimated 6–8 hrs/week per sales rep in manual qualification." annualCostEstimate: "$60K–$90K/year"
GOOD: "Zapier automations are handling data movement between tools but without AI-native triggers, the team is still manually reviewing outputs before the next step fires — a bottleneck in the ops workflow that costs approximately 3–5 hrs/week per ops person." annualCostEstimate: "$40K–$70K/year"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURRENT STACK — CRITICAL COMPLETENESS RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY: Generate a currentStack entry for EVERY SINGLE tool listed in CURRENT TOOL STACK below. Do not skip, summarize, or omit any tool. If there are 40 tools listed, currentStack must have 40 entries. If there are 5, it must have 5. A CEO opening this report will immediately see if their tools are missing — incomplete coverage destroys credibility.

For each tool:
- aiRole: "AI-native" if the tool has AI at its core (LLMs, generative AI, AI agents), "AI-assisted" if AI is a significant but secondary feature, "Non-AI core infra" for everything else
- usageNotes: 1 sentence — how this specific company likely uses this tool given their industry, size, bottleneck, and stated workflows. Reference their actual context, not generic descriptions.

EXAMPLES:
- Zapier at an agency with manual reporting: "Likely handling cross-platform data syncs between their project tools, but without AI-assisted zaps the automation ceiling is low."
- Notion at a 25-person team with no AI manager: "Central knowledge base and project tracking, but operating as static docs rather than an AI-queryable workspace."
- OpenAI at a team with 10–30% daily adoption: "Individual employees using ChatGPT ad-hoc for drafting and research, but not embedded in any structured workflow or process."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDATIONS (3–7)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Prioritize by ROI for this company specifically. Reference their actual situation in every description — their bottleneck, their team, their existing tools.
- estimatedROI: a specific return estimate tied to their situation (e.g., "2–3x return within 6 months", "$120K/year in time savings for a 50-person team at 5 hrs/week recaptured per person"). Always tie to their employee count or revenue band. Set null only if truly impossible to estimate.

BAD: "Implement AI in sales workflows."
GOOD: "Layer Clay or Apollo AI on top of their existing outreach to auto-enrich leads — their stated bottleneck of manual prospecting + a 25+ tool count with no AI enrichment layer is a $40–80K/yr efficiency gap at their revenue size." estimatedROI: "4–6x ROI within 4 months — recapturing 6 hrs/week per sales rep"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TALKING POINTS (3–5) — THE MOST IMPORTANT SECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
These are the consultant's cheat sheet for the call. Each point must:
1. OBSERVATION: State a specific, insight-rich finding about this company. Reference their actual tools, role, stated bottleneck, revenue, or website content. Make the rep feel like they already know the prospect.
2. QUESTION: A precise, open-ended opener tied to that observation. Should feel informed, not scripted — like you've done research. Avoid yes/no questions.
3. OPPORTUNITY: The specific Trackr or AI tooling value prop for this exact situation.

QUALITY BAR — observation examples:
- "They're running 25+ tools including [X], [Y], [Z] but only 10–30% of the team uses AI daily — classic 'tool sprawl without AI leverage' pattern"
- "No AI manager exists despite being a $25M+ agency — decisions about AI are likely fragmented across department heads with no consolidation"
- "They've had at least one failed AI implementation — this creates both skepticism to overcome AND an opening to position structured governance as the fix"
- "Their 90-day success metric is [exact quote from form] — this is the anchor for every ROI conversation on the call"

QUALITY BAR — question examples:
- "You're running [Tool A] and [Tool B] side by side — are those integrated, or are people manually copying between them?"
- "You mentioned [exact bottleneck] — is that a process you own, or is it distributed across teams without a clear owner?"
- "When you said [90-day success definition], what would 'done' actually look like — headcount reduction, pipeline increase, or something else?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDED TOOLS (2–5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tools to actively pitch on this call. Must directly address their stated pain points or fill a clear gap in their current stack.
- name: exact tool name as commonly known
- websiteDomain: root domain only (e.g. "clay.com", "notion.so") for logo display — null if unsure
- category: short type label (e.g. "Sales Intelligence", "AI Writing", "Workflow Automation")
- reason: 2 sentences — sentence 1 ties to their specific situation/stack/bottleneck, sentence 2 states the concrete outcome
- estimatedCostPerUser: typical monthly per-seat range (e.g. "$15–30/user/month") or null if free/variable
- impact: High/Medium/Low based on fit with their top pain points

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BRANDING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Extract logoUrl and primaryColor from scraped website if present. If not found, set primaryColor to "#F3F3EF".

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL STYLE RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Every field should feel like it was written by someone who spent 20 minutes researching this specific company. If website data is sparse, lean harder on form responses. Do not use filler phrases like "leverage synergies", "drive growth", or "optimize workflows" — be direct and specific. A senior consultant should be able to walk into the call using only this document.`;

// ── Build prompt from submission data ────────────────────────────────────────

type SubmissionRow = typeof auditSubmissions.$inferSelect;

function buildPrompt(sub: SubmissionRow, enrichment: string): string {
    const toolList = (sub.currentTools ?? []) as string[];
    const tools = toolList.length > 0
        ? toolList.map((t, i) => `${i + 1}. ${t}`).join("\n")
        : "None specified";
    const teams = (sub.teamsNeedingAI ?? []).join(", ") || "Not specified";

    return `Generate an AI readiness scorecard for the following company.

FORM SUBMISSION DATA:
- Company: ${sub.companyName}
- Website: ${sub.companyWebsite || "Not provided"}
- Industry: ${sub.industry || "Not specified"}
- Size: ${sub.companySize || "Not specified"}
- Employee count (for seat-based cost projections): ${sub.employeeCount || "Not specified"}
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
        // Guard: only create ONE referral per unique contactEmail per architect
        if (submission.arcCode) {
            const architect = await db.query.architects.findFirst({
                where: eq(architects.arcCode, submission.arcCode),
            });
            if (architect && architect.status === "active") {
                // Check if this email already has a referral for this architect
                const [existingReferral] = await db
                    .select({ id: architectReferrals.id })
                    .from(architectReferrals)
                    .innerJoin(
                        auditSubmissions,
                        eq(architectReferrals.auditSubmissionId, auditSubmissions.id),
                    )
                    .where(and(
                        eq(architectReferrals.architectId, architect.id),
                        eq(auditSubmissions.contactEmail, submission.contactEmail),
                    ))
                    .limit(1);

                if (!existingReferral) {
                    await db.insert(architectReferrals).values({
                        architectId: architect.id,
                        workspaceId: workspace.id,
                        auditSubmissionId: submission.id,
                        status: "lead",
                    });
                    // Only increment totalClients for first-time referrals
                    await db.update(architects)
                        .set({ totalClients: architect.totalClients + 1 })
                        .where(eq(architects.id, architect.id));
                }
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
