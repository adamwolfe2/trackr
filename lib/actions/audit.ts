/**
 * Audit Scorecard Pipeline
 *
 * Called in the background after a prospect submits the /audit form.
 * 1. Firecrawl scrape of company website
 * 2. GPT-4o structured scorecard generation
 * 3. Email scorecard to callOwnerEmail (or contactEmail) + CC adamwolfe102@gmail.com
 * 4. Persist scorecard in DB
 */

import * as Sentry from "@sentry/nextjs";
import { db } from "@/lib/db";
import { auditSubmissions, workspaces, softwareSpend, architects, architectReferrals } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { firecrawl } from "@/lib/services/firecrawl";
import { tavily } from "@/lib/services/tavily";
import { sendAuditScorecardEmail, sendProspectTeaserEmail, sendArchitectNewLead } from "@/lib/email/resend";
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
        implementationSteps: z.array(z.string()).min(2).max(4), // 2-4 concrete steps
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
        whatItDoes: z.string(),
        problemItSolves: z.string(),
        painPointLink: z.string().nullable(),
        reason: z.string(),
        estimatedCostPerUser: z.string().nullable(),
        impact: z.enum(["High", "Medium", "Low"]),
        implementationSteps: z.array(z.string()).min(2).max(3), // Specific setup steps
        integrationTarget: z.string().nullable(), // Which existing tool it connects to
    })).min(2).max(5),
    workflowGaps: z.array(z.object({
        workflowName: z.string(), // e.g. "Lead Generation → Qualification → Close"
        stages: z.array(z.object({
            name: z.string(),
            tool: z.string().nullable(), // tool handling this stage, null = gap
            status: z.enum(["covered", "partial", "gap"]),
        })),
        bottleneck: z.string(), // where the chain breaks
        fixDescription: z.string(),
    })).min(2).max(5),
    industryBenchmark: z.object({
        peerAvgScore: z.number().int().min(0).max(100),
        peerLabel: z.string(), // e.g. "B2B SaaS companies with 25-50 employees"
        percentile: z.number().int().min(0).max(100), // where this company lands
        insight: z.string(), // 1-2 sentences on what this means
        competitiveContext: z.string(), // 2-3 sentences about what top competitors are doing with AI
    }),
    roiProjection: z.object({
        currentAnnualWaste: z.number(), // estimated $ wasted annually
        projectedSavings: z.number(), // $ savings after implementing recommendations
        paybackMonths: z.number().int().min(1).max(36),
        assumptions: z.array(z.string()).min(2).max(5), // the math behind the numbers
    }),
    quickWins: z.array(z.object({
        action: z.string(), // "Turn on HubSpot AI email scoring"
        tool: z.string(), // Tool they already have
        timeToValue: z.string(), // "< 1 hour", "1 day", "1 week"
        expectedOutcome: z.string(), // "Reduce manual lead qualification by 40%"
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

- implementationSteps: 2-4 concrete steps to execute this recommendation. Each step should name a specific action, tool, or configuration. Write as if you're giving instructions to a junior ops manager. Example:
  - "1. Export lead list from current Google Sheets tracker"
  - "2. Create Clay workspace and import via CSV"
  - "3. Configure enrichment columns: company size, tech stack, LinkedIn"
  - "4. Set up Zapier trigger to push enriched leads to HubSpot"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUICK WINS (2-5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Things this company can do THIS WEEK with tools they ALREADY HAVE. This is the credibility section — it proves you've done homework, not just generated a list of tools to buy. A rep who can say "Did you know your existing HubSpot plan includes AI lead scoring? Turn it on in Settings > Lead Score > AI" wins instant trust.

- action: The exact action. Be specific enough that someone could Google it and do it in 30 minutes. Not "Explore AI features in Slack" — instead "Enable Slack AI search in admin.slack.com > Settings > AI > Turn on Search. Free for Business+ plans."
- tool: A tool from their CURRENT stack (not a new purchase)
- timeToValue: How fast they'll see results — "< 1 hour", "1 day", "1 week"
- expectedOutcome: The specific outcome. "Reduce meeting scheduling overhead by ~2 hrs/week" not "Improve productivity"

These MUST reference their actual tools and their actual bottleneck. Generic quick wins destroy credibility.

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
RECOMMENDED TOOLS (2–5) — THE PITCH TOOLKIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tools to actively pitch on this call. These must be tools the sales rep can confidently recommend without the prospect dismissing them as impractical.

CRITICAL RULES — READ BEFORE GENERATING:

1. NEVER recommend tools that compete with their existing stack. If they use Microsoft 365, do NOT recommend Google Workspace or Notion as a replacement. If they use Salesforce, do NOT recommend HubSpot CRM. Recommend tools that LAYER ON TOP of what they already have.

2. NEVER recommend enterprise BI tools (Tableau, Looker, Power BI) unless the company has zero reporting capability AND has the budget/team for it. These are expensive, complex, and low-adoption for most companies.

3. FAVOR scrappy, high-impact AI-native tools that add intelligence to existing workflows without requiring migration. Think: tools that plug INTO their current stack, not replace it. Examples of good recommendations:
   - For Microsoft-heavy orgs: Microsoft Copilot, Otter.ai, Fireflies.ai, Loom AI, Gamma (for presentations)
   - For sales teams: Clay, Apollo AI, Instantly, Lavender (email AI), Gong
   - For ops/automation: Bardeen, Tango, Scribe, Magical, Zapier AI
   - For content/marketing: Jasper, Writer, Descript, ElevenLabs, Canva AI
   - For customer support: Intercom Fin, Ada, Forethought
   - For dev teams: Cursor, GitHub Copilot, Codeium, Devin
   - For document/knowledge: Glean, Guru AI, Notion AI (as an add-on, not a migration)

4. CONSIDER ADOPTION DIFFICULTY. For enterprise, government, and education:
   - Security compliance matters — avoid tools without SOC 2 / FERPA / HIPAA if relevant
   - Avoid tools requiring admin-level deployment unless they have an AI manager
   - Prefer tools with SSO/SAML and admin controls
   - Prefer tools with gradual adoption paths (individual → team → org)
   - Prefer tools that integrate with their existing identity provider (Microsoft Entra, Google Workspace, Okta)

5. CONSIDER BUDGET. Match tool pricing to their company size and monthly spend:
   - If monthly AI spend is <$500, don't recommend $50/seat/mo tools for a 100-person team
   - Free tiers and low-cost tools are perfectly valid for low-maturity companies
   - Enterprise pricing should only be recommended for companies with clear budget signals

6. Each tool MUST connect to a specific pain point or gap. Generic "this is a good AI tool" is not a recommendation — it's noise.

Per tool:
- name: exact tool name as commonly known
- websiteDomain: root domain only (e.g. "clay.com", "otter.ai") for logo display — null if unsure
- category: short type label (e.g. "Sales Intelligence", "AI Meeting Notes", "Workflow Automation")
- whatItDoes: 1 sentence in plain language — what this tool does. Write for someone who has never heard of it. Example: "Clay automatically enriches lead lists with company data, tech stack, and contact info from 75+ data sources."
- problemItSolves: 1 sentence — what specific problem this solves for THIS company. Reference their actual pain points, tools, or bottleneck. Example: "Eliminates the 6-8 hrs/week your sales team spends manually researching leads in Google Sheets before outreach."
- painPointLink: the area name from painPoints that this tool most directly addresses (e.g. "Sales", "Ops", "Engineering"). Set null if it doesn't map cleanly to a single pain point.
- reason: 2 sentences — sentence 1 ties to their specific situation/stack/bottleneck, sentence 2 states the concrete outcome. MUST reference at least one tool from their current stack.
- estimatedCostPerUser: typical monthly per-seat range (e.g. "$15–30/user/month") or null if free/variable
- impact: High/Medium/Low based on fit with their top pain points
- implementationSteps: 2-3 specific setup steps. Name exact integrations, settings pages, or APIs.
  Example: ["Create account + connect to existing Salesforce via OAuth", "Map lead fields to Clay enrichment columns", "Set up weekly auto-enrichment schedule"]
- integrationTarget: Which tool in their CURRENT stack this connects to. e.g. "HubSpot", "Salesforce", "Google Sheets". Null only if standalone.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW GAP ANALYSIS (2–5 workflows)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Map their tools into the business workflows that matter most for their industry and bottleneck. For each workflow:
- workflowName: A clear chain like "Lead Capture → Enrichment → Outreach → Close" or "Content Idea → Draft → Edit → Publish → Measure"
- stages: 3–6 stages per workflow. For each stage, identify the tool handling it (or null if nothing covers it). Status: "covered" if a tool fully handles this, "partial" if a tool exists but doesn't do AI-native work here, "gap" if no tool addresses this stage at all.
- bottleneck: Which stage is the weakest link, and why (reference their stated frustrations or bottleneck)
- fixDescription: What specific tool or AI capability would plug this gap — reference tools from recommendedTools where possible

CRITICAL: Base workflows on their ACTUAL bottleneck and industry. A SaaS company gets "Lead → Qualify → Demo → Close → Onboard". An agency gets "Brief → Research → Create → Review → Deliver → Report". A D2C brand gets "Acquire → Convert → Fulfill → Support → Retain".

Use the per-tool intelligence provided to know what each tool actually does and where it falls short.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INDUSTRY BENCHMARK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Position this company relative to their peers:
- peerAvgScore: The average AI-Native Score for companies in their industry/size bracket. If benchmark data is provided, use it. If not, estimate based on your knowledge of AI adoption rates (be realistic — most SMBs in 2025 score 25–45).
- peerLabel: e.g. "B2B SaaS companies with 25-50 employees" — specific to THEIR context
- percentile: Where they land. If their score is 35 and average is 40, they're around 40th percentile.
- insight: 1-2 sentences. What does their position mean strategically? Reference competitive pressure in their industry.
- competitiveContext: 2-3 sentences about what top-performing companies in their specific industry are doing with AI RIGHT NOW. Name specific tools and outcomes if possible. This is the "your competitors are already doing X" pressure point. Example: "Leading agencies in the $20-50M range are deploying Clay + Apollo for automated outbound — seeing 3x pipeline velocity. Three of the top 10 firms in your space have dedicated AI managers as of Q4 2024."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROI PROJECTION — SHOW YOUR MATH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Build a concrete ROI case using their actual numbers:
- currentAnnualWaste: Total estimated annual cost of inaction. Sum up pain point costs + redundant tool spend + manual process labor. Express in whole dollars (e.g. 85000, not "$85K").
- projectedSavings: What they'd save annually by implementing the top 3 recommendations. Be conservative — 40-60% of waste captured is realistic. Whole dollars.
- paybackMonths: Months until investment breaks even. Factor in implementation cost (typically 1-3 months of subscription fees + 20-40 hours of setup per major tool).
- assumptions: 2-5 bullet points showing your work. Use their employee count, revenue band, and monthly spend. Example:
  - "Employee count: 50 × avg 4 hrs/week manual work × $75/hr blended rate = $780K/year in automatable labor"
  - "Redundant tools identified: 3 overlapping project management tools at ~$15/user/month = $27K/year consolidation opportunity"
  - "Conservative 50% capture rate applied to total $807K waste = $403K projected savings"
  - "Implementation: ~$45K (3 months setup + training) → 1.3 month payback"

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

function buildPrompt(
    sub: SubmissionRow,
    enrichment: { websiteContext: string; toolIntel: string; companyIntel: string },
    benchmark: { avgScore: number; count: number } | null,
): string {
    const toolList = (sub.currentTools ?? []) as string[];
    const tools = toolList.length > 0
        ? toolList.map((t, i) => `${i + 1}. ${t}`).join("\n")
        : "None specified";
    const teams = (sub.teamsNeedingAI ?? []).join(", ") || "Not specified";

    let benchmarkSection = "";
    if (benchmark) {
        benchmarkSection = `\nINDUSTRY BENCHMARK DATA (from ${benchmark.count} completed audits):
- Average AI-Native Score for "${sub.industry}" companies: ${benchmark.avgScore}/100
- Use this to calculate the percentile and write a meaningful industryBenchmark.insight.`;
    } else {
        benchmarkSection = `\nINDUSTRY BENCHMARK DATA:
No prior audits for this industry yet. Estimate peerAvgScore based on your knowledge of AI adoption in ${sub.industry || "this sector"} for companies of size ${sub.companySize || "this size"}. Set percentile based on your estimate.`;
    }

    return `Generate a DEEP AI readiness scorecard for the following company. You have been provided with extensive research — website content, per-tool intelligence, and company background. Use ALL of it.

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
${benchmarkSection}
${enrichment.websiteContext ? `\n━━━ SCRAPED WEBSITE CONTEXT (multi-page, from ${sub.companyWebsite}) ━━━\n${enrichment.websiteContext}` : "\nWEBSITE CONTEXT: No website data available."}
${enrichment.toolIntel ? `\n━━━ PER-TOOL INTELLIGENCE (live research on each tool in their stack) ━━━\n${enrichment.toolIntel}` : ""}
${enrichment.companyIntel ? `\n━━━ COMPANY & INDUSTRY RESEARCH ━━━\n${enrichment.companyIntel}` : ""}`;
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

// ── Deep enrichment pipeline ─────────────────────────────────────────────────

async function deepEnrich(
    companyWebsite: string | null,
    companyName: string,
    currentTools: string[],
    industry: string | null,
): Promise<{ websiteContext: string; toolIntel: string; companyIntel: string }> {
    const url = companyWebsite
        ? (companyWebsite.startsWith("http") ? companyWebsite : `https://${companyWebsite}`)
        : null;

    // Phase 1: Multi-page website scrape + company research (parallel)
    const [homeScrape, sitemapResult, companySearch, industrySearch] = await Promise.all([
        url ? firecrawl.scrapeUrl(url) : Promise.resolve({ success: false } as const),
        url ? firecrawl.mapSite(url, { limit: 20 }) : Promise.resolve({ success: false, data: [] } as const),
        tavily.search(`"${companyName}" company overview AI tools technology stack`, {
            searchDepth: "advanced",
            maxResults: 5,
            includeAnswer: true,
        }),
        industry ? tavily.search(`${industry} companies AI adoption benchmark 2025 2026`, {
            searchDepth: "basic",
            maxResults: 3,
            includeAnswer: true,
        }) : Promise.resolve({ answer: "", results: [] }),
    ]);

    // Scrape key subpages (about, pricing, team, blog — up to 4)
    const subpageContent: string[] = [];
    if (sitemapResult.success && sitemapResult.data) {
        const priorityPaths = ["/about", "/team", "/pricing", "/blog", "/product", "/solutions", "/services", "/features"];
        const subpages = sitemapResult.data
            .filter(link => priorityPaths.some(p => link.toLowerCase().includes(p)))
            .slice(0, 4);

        const subScrapes = await Promise.all(
            subpages.map(link => firecrawl.scrapeUrl(link).catch(() => ({ success: false }) as const))
        );
        for (const s of subScrapes) {
            if (s.success && s.data?.markdown) {
                subpageContent.push(s.data.markdown.slice(0, 3_000));
            }
        }
    }

    // Combine website context
    const homeContent = homeScrape.success && homeScrape.data?.markdown
        ? homeScrape.data.markdown.slice(0, 6_000)
        : "";
    const websiteContext = [homeContent, ...subpageContent].filter(Boolean).join("\n\n---\n\n").slice(0, 16_000);

    // Phase 2: Per-tool intelligence (parallel, batched in groups of 5)
    const toolIntelParts: string[] = [];
    const TOOL_BATCH_SIZE = 5;
    for (let i = 0; i < currentTools.length; i += TOOL_BATCH_SIZE) {
        const batch = currentTools.slice(i, i + TOOL_BATCH_SIZE);
        const results = await Promise.all(
            batch.map(tool =>
                tavily.search(`"${tool}" pricing features AI capabilities 2025`, {
                    searchDepth: "basic",
                    maxResults: 2,
                    includeAnswer: true,
                }).catch(() => ({ answer: "", results: [] }))
            )
        );
        for (let j = 0; j < batch.length; j++) {
            const r = results[j];
            if (r.answer || r.results.length > 0) {
                const snippets = r.results.slice(0, 2).map(x => x.content.slice(0, 300)).join(" | ");
                toolIntelParts.push(`${batch[j]}: ${r.answer?.slice(0, 400) || snippets}`);
            }
        }
    }
    const toolIntel = toolIntelParts.join("\n\n");

    // Combine company intelligence
    const companyIntel = [
        companySearch.answer ? `COMPANY RESEARCH: ${companySearch.answer.slice(0, 1500)}` : "",
        ...companySearch.results.slice(0, 3).map(r => `SOURCE (${r.title}): ${r.content.slice(0, 500)}`),
        industrySearch.answer ? `INDUSTRY BENCHMARK CONTEXT: ${industrySearch.answer.slice(0, 1000)}` : "",
        ...industrySearch.results.slice(0, 2).map(r => `INDUSTRY SOURCE: ${r.content.slice(0, 400)}`),
    ].filter(Boolean).join("\n\n");

    return { websiteContext, toolIntel, companyIntel };
}

async function getIndustryBenchmark(industry: string | null, _companySize: string | null): Promise<{ avgScore: number; count: number } | null> {
    if (!industry) return null;
    try {
        const result = await db
            .select({
                avgScore: sql<number>`ROUND(AVG((${auditSubmissions.scorecard}->>'aiNativeScore'->'score')::int))`,
                count: sql<number>`COUNT(*)`,
            })
            .from(auditSubmissions)
            .where(and(
                eq(auditSubmissions.status, "complete"),
                eq(auditSubmissions.industry, industry),
            ));
        const row = result[0];
        if (row && Number(row.count) >= 3) {
            return { avgScore: Number(row.avgScore) || 50, count: Number(row.count) };
        }
    } catch { /* non-critical */ }
    return null;
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
        // 1. Deep multi-source enrichment (website + Tavily + per-tool research)
        const enrichment = await deepEnrich(
            submission.companyWebsite,
            submission.companyName,
            (submission.currentTools ?? []) as string[],
            submission.industry,
        );

        // 2. Industry benchmark from existing audits
        const benchmark = await getIndustryBenchmark(submission.industry, submission.companySize);

        // 3. GPT-4o deep scorecard generation
        const { object: scorecard } = await generateObject({
            model: openai("gpt-4o"),
            schema: AuditScorecardSchema,
            system: SYSTEM_PROMPT,
            prompt: buildPrompt(submission, enrichment, benchmark),
        });

        // 3. Generate share token
        const { randomUUID } = await import("crypto");
        const shareToken = randomUUID().replace(/-/g, "");

        // 4. Pre-build workspace
        const slug = slugify(submission.companyName) + "-" + randomUUID().slice(0, 4);
        const [workspace] = await db.insert(workspaces).values({
            name: submission.companyName,
            slug,
            companyContext: enrichment.websiteContext.slice(0, 2000) || null,
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
                    // Notify architect of new lead — non-blocking
                    sendArchitectNewLead(
                        architect.email,
                        architect.firstName,
                        submission.companyName,
                        submission.contactEmail,
                    ).catch(() => {});
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
        Sentry.captureException(err);
        await db.update(auditSubmissions)
            .set({
                status: "failed",
                errorMessage: err instanceof Error ? err.message.slice(0, 500) : String(err),
            })
            .where(eq(auditSubmissions.id, id));
    }
}
