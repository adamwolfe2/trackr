"use server";

import { db } from "@/lib/db";
import { auditSubmissions, tools } from "@/lib/db/schema";
import { eq, ilike, and, ne } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ── Types ────────────────────────────────────────────────────────────────────

type RecommendedTool = {
    name: string;
    websiteDomain: string | null;
    category: string;
    reason: string;
    estimatedCostPerUser: string | null;
    impact: "High" | "Medium" | "Low";
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
    reason: z.string().min(1).max(500),
    estimatedCostPerUser: z.string().max(100).nullable(),
    impact: z.enum(["High", "Medium", "Low"]),
});

const RemoveToolSchema = z.object({
    submissionId: z.string().uuid(),
    toolName: z.string().min(1),
});

const SearchToolsSchema = z.object({
    query: z.string().min(1).max(200),
});

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
        reason: parsed.data.reason,
        estimatedCostPerUser: parsed.data.estimatedCostPerUser,
        impact: parsed.data.impact,
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
