"use server";

import { db } from "@/lib/db";
import { auditSubmissions, tools, softwareSpend, pendingInvitations } from "@/lib/db/schema";
import { eq, ilike, and, ne } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { PackageSlug } from "@/lib/config/architect-packages";
import { PACKAGE_LIST } from "@/lib/config/architect-packages";

// ── Types ────────────────────────────────────────────────────────────────────

type RecommendedTool = {
    name: string;
    websiteDomain: string | null;
    category: string;
    whatItDoes: string;
    problemItSolves: string;
    painPointLink: string | null;
    reason: string;
    estimatedCostPerUser: string | null;
    impact: "High" | "Medium" | "Low";
    implementationSteps?: string[];
    integrationTarget?: string | null;
};

type Scorecard = {
    recommendedTools?: RecommendedTool[];
    [key: string]: unknown;
};

// ── Validation ───────────────────────────────────────────────────────────────

const AddToolSchema = z.object({
    submissionId: z.string().uuid(),
    name: z.string().min(1).max(200),
    websiteDomain: z.string().max(200).nullable(),
    category: z.string().min(1).max(100),
    whatItDoes: z.string().min(1).max(500),
    problemItSolves: z.string().min(1).max(500),
    painPointLink: z.string().max(100).nullable(),
    reason: z.string().min(1).max(500),
    estimatedCostPerUser: z.string().max(100).nullable(),
    impact: z.enum(["High", "Medium", "Low"]),
    implementationSteps: z.array(z.string().max(500)).max(5).optional(),
    integrationTarget: z.string().max(200).nullable().optional(),
});

const RemoveToolSchema = z.object({
    submissionId: z.string().uuid(),
    toolName: z.string().min(1),
});

const SearchToolsSchema = z.object({
    query: z.string().min(1).max(200),
});

// ── Smart AI Suggestions ─────────────────────────────────────────────────────

export type SmartSuggestion = {
    name: string;
    websiteDomain: string | null;
    category: string;
    whatItDoes: string;
    problemItSolves: string;
    painPointLink: string | null;
    reason: string;
    estimatedCostPerUser: string | null;
    impact: "High" | "Medium" | "Low";
};

export async function generateSmartSuggestions(
    submissionId: string,
): Promise<SmartSuggestion[]> {
    const authed = await isAdminAuthenticated();
    if (!authed) return [];

    const submission = await db.query.auditSubmissions.findFirst({
        where: eq(auditSubmissions.id, submissionId),
    });
    if (!submission?.scorecard) return [];

    const scorecard = submission.scorecard as Record<string, unknown>;
    const painPoints = (scorecard.painPoints ?? []) as Array<{ area: string; description: string }>;
    const currentStack = (scorecard.currentStack ?? []) as Array<{ name: string; category: string; aiRole: string }>;
    const existingRecs = (scorecard.recommendedTools ?? []) as Array<{ name: string }>;

    const stackNames = currentStack.map(t => `${t.name} (${t.category}, ${t.aiRole})`).join(", ");
    const painPointSummary = painPoints.map(p => `- ${p.area}: ${p.description}`).join("\n");
    const alreadyRecommended = existingRecs.map(t => t.name).join(", ");

    try {
        const Anthropic = (await import("@anthropic-ai/sdk")).default;
        const client = new Anthropic();

        const response = await client.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 2000,
            messages: [{
                role: "user",
                content: `You are an AI tool intelligence expert. Suggest 4-5 AI tools for this company.

COMPANY: ${submission.companyName}
INDUSTRY: ${submission.industry ?? "Unknown"}
SIZE: ${submission.companySize ?? "Unknown"}, ${submission.employeeCount ?? "Unknown"} employees
MONTHLY AI SPEND: ${submission.monthlySpend ?? "Unknown"}

CURRENT STACK:
${stackNames}

PAIN POINTS:
${painPointSummary}

ALREADY RECOMMENDED (do NOT suggest these):
${alreadyRecommended || "None"}

CRITICAL RULES:
1. NEVER recommend tools that compete with their existing stack. They won't switch. Recommend tools that LAYER ON TOP.
2. NEVER recommend obvious enterprise BI tools (Tableau, Looker, Power BI) unless they truly have zero reporting.
3. FAVOR scrappy, high-impact AI-native tools that plug into existing workflows.
4. Consider adoption difficulty — enterprise/gov/edu need SSO, compliance, gradual rollout paths.
5. Consider budget — match pricing to their spend level and company size.
6. Each tool must connect to a specific pain point or gap in their current stack.

Respond with ONLY a JSON array. Each element:
{
  "name": "exact tool name",
  "websiteDomain": "domain.com or null",
  "category": "short category label",
  "whatItDoes": "1 sentence, plain language",
  "problemItSolves": "1 sentence specific to THIS company",
  "painPointLink": "pain point area name or null",
  "reason": "2 sentences tying to their situation",
  "estimatedCostPerUser": "$X-Y/user/month or null",
  "impact": "High|Medium|Low"
}`,
            }],
        });

        const text = response.content[0].type === "text" ? response.content[0].text : "";
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) return [];
        const suggestions = JSON.parse(jsonMatch[0]) as SmartSuggestion[];
        return suggestions.filter(s => s.name && s.category && s.reason);
    } catch {
        return [];
    }
}

// ── Search tools across all workspaces ───────────────────────────────────────

export type ToolSearchResult = {
    id: string;
    name: string;
    websiteUrl: string | null;
    category: string[] | null;
    logoUrl: string | null;
    overallScore: string | null;
};

export async function searchToolsForRecommendation(
    query: string,
): Promise<ToolSearchResult[]> {
    const authed = await isAdminAuthenticated();
    if (!authed) return [];

    const parsed = SearchToolsSchema.safeParse({ query });
    if (!parsed.success) return [];

    const results = await db
        .select({
            id: tools.id,
            name: tools.name,
            websiteUrl: tools.websiteUrl,
            category: tools.category,
            logoUrl: tools.logoUrl,
            overallScore: tools.overallScore,
        })
        .from(tools)
        .where(
            and(
                ilike(tools.name, `%${parsed.data.query}%`),
                ne(tools.status, "failed"),
            ),
        )
        .limit(10);

    // Deduplicate by name (tools exist per-workspace, same tool can appear multiple times)
    const seen = new Set<string>();
    return results.filter((t) => {
        const key = t.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

// ── Add a recommended tool to an audit scorecard ─────────────────────────────

export async function addRecommendedTool(
    input: z.infer<typeof AddToolSchema>,
): Promise<{ success: boolean; error?: string }> {
    const authed = await isAdminAuthenticated();
    if (!authed) return { success: false, error: "Not authenticated" };

    const parsed = AddToolSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Invalid input" };

    const submission = await db.query.auditSubmissions.findFirst({
        where: eq(auditSubmissions.id, parsed.data.submissionId),
    });
    if (!submission) return { success: false, error: "Submission not found" };

    const scorecard = submission.scorecard as Scorecard | null;
    if (!scorecard) return { success: false, error: "No scorecard generated yet" };

    const existing = scorecard.recommendedTools ?? [];

    // Prevent duplicates
    if (existing.some((t) => t.name.toLowerCase() === parsed.data.name.toLowerCase())) {
        return { success: false, error: "Tool already in recommendations" };
    }

    const newTool: RecommendedTool = {
        name: parsed.data.name,
        websiteDomain: parsed.data.websiteDomain,
        category: parsed.data.category,
        whatItDoes: parsed.data.whatItDoes,
        problemItSolves: parsed.data.problemItSolves,
        painPointLink: parsed.data.painPointLink,
        reason: parsed.data.reason,
        estimatedCostPerUser: parsed.data.estimatedCostPerUser,
        impact: parsed.data.impact,
        ...(parsed.data.implementationSteps && parsed.data.implementationSteps.length > 0
            ? { implementationSteps: parsed.data.implementationSteps }
            : {}),
        ...(parsed.data.integrationTarget !== undefined
            ? { integrationTarget: parsed.data.integrationTarget ?? null }
            : {}),
    };

    const updatedScorecard = {
        ...scorecard,
        recommendedTools: [...existing, newTool],
    };

    await db
        .update(auditSubmissions)
        .set({ scorecard: updatedScorecard })
        .where(eq(auditSubmissions.id, parsed.data.submissionId));

    revalidatePath(`/admin/leads/${parsed.data.submissionId}`);
    return { success: true };
}

// ── Remove a recommended tool from an audit scorecard ────────────────────────

export async function removeRecommendedTool(
    input: z.infer<typeof RemoveToolSchema>,
): Promise<{ success: boolean; error?: string }> {
    const authed = await isAdminAuthenticated();
    if (!authed) return { success: false, error: "Not authenticated" };

    const parsed = RemoveToolSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Invalid input" };

    const submission = await db.query.auditSubmissions.findFirst({
        where: eq(auditSubmissions.id, parsed.data.submissionId),
    });
    if (!submission) return { success: false, error: "Submission not found" };

    const scorecard = submission.scorecard as Scorecard | null;
    if (!scorecard) return { success: false, error: "No scorecard generated yet" };

    const existing = scorecard.recommendedTools ?? [];
    const filtered = existing.filter(
        (t) => t.name.toLowerCase() !== parsed.data.toolName.toLowerCase(),
    );

    if (filtered.length === existing.length) {
        return { success: false, error: "Tool not found in recommendations" };
    }

    const updatedScorecard = {
        ...scorecard,
        recommendedTools: filtered,
    };

    await db
        .update(auditSubmissions)
        .set({ scorecard: updatedScorecard })
        .where(eq(auditSubmissions.id, parsed.data.submissionId));

    revalidatePath(`/admin/leads/${parsed.data.submissionId}`);
    return { success: true };
}

// ── Select engagement package for a lead ──────────────────────────────────────

const SelectPackageSchema = z.object({
    submissionId: z.string().uuid(),
    packageSlug: z.enum(["assessment", "implementation", "retainer"]),
});

export async function selectPackage(
    submissionId: string,
    packageSlug: PackageSlug,
): Promise<{ success: boolean; error?: string }> {
    const authed = await isAdminAuthenticated();
    if (!authed) return { success: false, error: "Not authenticated" };

    const parsed = SelectPackageSchema.safeParse({ submissionId, packageSlug });
    if (!parsed.success) return { success: false, error: "Invalid input" };

    // Validate slug exists in package list
    const validSlugs = PACKAGE_LIST.map(p => p.slug);
    if (!validSlugs.includes(parsed.data.packageSlug)) {
        return { success: false, error: "Invalid package" };
    }

    const submission = await db.query.auditSubmissions.findFirst({
        where: eq(auditSubmissions.id, parsed.data.submissionId),
    });
    if (!submission) return { success: false, error: "Submission not found" };

    const scorecard = (submission.scorecard ?? {}) as Record<string, unknown>;
    const updatedScorecard = {
        ...scorecard,
        selectedPackage: parsed.data.packageSlug,
    };

    await db
        .update(auditSubmissions)
        .set({ scorecard: updatedScorecard })
        .where(eq(auditSubmissions.id, parsed.data.submissionId));

    revalidatePath(`/admin/leads/${parsed.data.submissionId}`);
    return { success: true };
}

// ── Clear selected package ────────────────────────────────────────────────────

export async function clearPackage(
    submissionId: string,
): Promise<{ success: boolean; error?: string }> {
    const authed = await isAdminAuthenticated();
    if (!authed) return { success: false, error: "Not authenticated" };

    const parsed = z.string().uuid().safeParse(submissionId);
    if (!parsed.success) return { success: false, error: "Invalid submission ID" };

    const submission = await db.query.auditSubmissions.findFirst({
        where: eq(auditSubmissions.id, parsed.data),
    });
    if (!submission) return { success: false, error: "Submission not found" };

    const scorecard = (submission.scorecard ?? {}) as Record<string, unknown>;
    const { selectedPackage: _removed, ...rest } = scorecard;
    const updatedScorecard = { ...rest };

    await db
        .update(auditSubmissions)
        .set({ scorecard: updatedScorecard })
        .where(eq(auditSubmissions.id, parsed.data));

    revalidatePath(`/admin/leads/${parsed.data}`);
    return { success: true };
}

// ── One-Click Provisioning ────────────────────────────────────────────────────

const ProvisionSchema = z.object({
    submissionId: z.string().uuid(),
    packageSlug: z.enum(["assessment", "implementation", "retainer"]),
    selectedToolNames: z.array(z.string()).max(20),
});

export async function provisionAndInvite(
    input: z.infer<typeof ProvisionSchema>,
): Promise<{ success: boolean; error?: string }> {
    const authed = await isAdminAuthenticated();
    if (!authed) return { success: false, error: "Not authenticated" };

    const parsed = ProvisionSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Invalid input" };

    const { submissionId, packageSlug, selectedToolNames } = parsed.data;

    // 1. Fetch submission + verify workspace exists
    const submission = await db.query.auditSubmissions.findFirst({
        where: eq(auditSubmissions.id, submissionId),
    });
    if (!submission) return { success: false, error: "Submission not found" };
    if (!submission.preBuiltWorkspaceId) return { success: false, error: "Workspace not ready" };

    const workspaceId = submission.preBuiltWorkspaceId;

    // 2. Seed recommended tools into softwareSpend (ON CONFLICT pattern)
    if (selectedToolNames.length > 0) {
        // Get existing tool names in workspace to avoid duplicates
        const existing = await db.select({ toolName: softwareSpend.toolName })
            .from(softwareSpend)
            .where(eq(softwareSpend.workspaceId, workspaceId));
        const existingNames = new Set(existing.map(e => e.toolName.toLowerCase().trim()));

        const newTools = selectedToolNames.filter(
            name => !existingNames.has(name.toLowerCase().trim())
        );

        if (newTools.length > 0) {
            await db.insert(softwareSpend).values(
                newTools.map(name => ({
                    workspaceId,
                    toolName: name,
                    status: "active" as const,
                    category: "Recommended",
                    monthlyCost: "0",
                }))
            );
        }
    }

    // 3. Update scorecard with selectedPackage
    const scorecard = (submission.scorecard ?? {}) as Record<string, unknown>;
    const updatedScorecard = { ...scorecard, selectedPackage: packageSlug };
    await db.update(auditSubmissions)
        .set({ scorecard: updatedScorecard })
        .where(eq(auditSubmissions.id, submissionId));

    // 4. Create pendingInvitation (skip if one already exists for this email+workspace)
    const existingInvite = await db.query.pendingInvitations.findFirst({
        where: and(
            eq(pendingInvitations.workspaceId, workspaceId),
            eq(pendingInvitations.email, submission.contactEmail),
        ),
    });

    let inviteId: string | null = existingInvite?.id ?? null;
    if (!existingInvite) {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const [invite] = await db.insert(pendingInvitations).values({
            workspaceId,
            email: submission.contactEmail,
            invitedByUserId: "admin",
            expiresAt,
        }).returning();
        inviteId = invite.id;
    }

    // 5. Send invite email
    try {
        const { sendInviteEmail } = await import("@/lib/email/resend");
        await sendInviteEmail(
            submission.contactEmail,
            submission.companyName,
            "Trackr Team",
            inviteId ?? undefined,
        );
    } catch {
        // Non-fatal
    }

    // 6. Cancel audit drip emails
    try {
        const { cancelAuditDrips } = await import("@/lib/email/audit-drips");
        await cancelAuditDrips(submissionId);
    } catch {
        // Non-fatal
    }

    // 7. Mark submission status
    await db.update(auditSubmissions)
        .set({ status: "complete", assignedRep: "provisioned" })
        .where(eq(auditSubmissions.id, submissionId));

    revalidatePath(`/admin/leads/${submissionId}`);
    return { success: true };
}
