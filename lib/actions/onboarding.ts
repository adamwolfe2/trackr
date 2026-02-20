"use server";

import { db } from "@/lib/db";
import { workspaces, softwareSpend } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { firecrawl } from "@/lib/services/firecrawl";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { ensureWorkspace } from "@/lib/db/ensure-workspace";
import { trackReferralSignup } from "@/lib/actions/referrals";
import { z } from "zod";

/** Scrape company website and auto-generate a context description */
export async function generateCompanyContext(websiteUrl: string): Promise<{ context: string; error?: string }> {
    // Auth check — this triggers Firecrawl + GPT-4o-mini calls, must not be anonymous
    const user = await currentUser();
    if (!user) return { context: "", error: "Unauthorized" };

    // Validate URL format
    if (!websiteUrl || typeof websiteUrl !== "string" || websiteUrl.trim().length === 0) {
        return { context: "", error: "Website URL is required" };
    }
    if (websiteUrl.length > 2000) {
        return { context: "", error: "URL too long" };
    }

    try {
        if (!websiteUrl.startsWith("http")) websiteUrl = `https://${websiteUrl}`;

        // Block private/internal URLs
        try {
            const parsed = new URL(websiteUrl);
            const hostname = parsed.hostname.toLowerCase();
            if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0" ||
                hostname === "[::1]" || hostname.endsWith(".local") || hostname.endsWith(".internal") ||
                hostname === "metadata.google.internal") {
                return { context: "", error: "Invalid URL" };
            }
        } catch {
            return { context: "", error: "Invalid URL format" };
        }

        const scrape = await firecrawl.scrapeUrl(websiteUrl);
        if (!scrape.success) return { context: "", error: "Could not scrape website" };
        const content = scrape.data?.markdown?.slice(0, 4000) ?? "";

        if (!content) return { context: "", error: "No readable content found on website" };

        const { text } = await generateText({
            model: openai("gpt-4o-mini"),
            prompt: `Based on this website content, write a 2-3 sentence description that captures:
1. What the company does and their core product/service
2. Their target market (B2B/B2C, industry, typical company size they sell to)
3. Their likely priorities when evaluating software tools

Website content:
${content}

Write only the description, no preamble or label.`,
        });

        return { context: text };
    } catch {
        return { context: "", error: "Failed to generate context" };
    }
}

const OnboardingSchema = z.object({
    companyName: z.string().max(200),
    companyContext: z.string().max(5000).default(""),
    selectedTools: z.array(z.object({
        name: z.string().min(1).max(200),
        url: z.string().max(2000).optional(),
    })).max(50),
    scorecardDimensions: z.array(z.object({
        key: z.string().min(1).max(50),
        label: z.string().min(1).max(100),
        weight: z.number().min(0).max(100),
    })).max(20),
    plan: z.string().max(50).optional(),
    refCode: z.string().max(20).optional(),
});

/**
 * Complete onboarding — saves workspace config, selected tools, and scorecard.
 *
 * IMPORTANT: Returns { success, redirectTo } instead of calling redirect().
 * In Next.js 15, redirect() throws a NEXT_REDIRECT error that gets caught by
 * client-side try/catch blocks, causing "Failed to save" toast even though the
 * save actually succeeded. The client must handle navigation via router.push().
 */
export async function completeOnboarding(input: {
    companyName: string;
    companyContext: string;
    selectedTools: Array<{ name: string; url?: string }>;
    scorecardDimensions: Array<{ key: string; label: string; weight: number }>;
    plan?: string;
    refCode?: string;
}): Promise<{ success: true; redirectTo: string }> {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const parsed = OnboardingSchema.safeParse(input);
    if (!parsed.success) {
        throw new Error(`Invalid onboarding data: ${parsed.error.issues[0]?.message ?? "validation failed"}`);
    }
    const { companyName, companyContext, selectedTools, scorecardDimensions, plan, refCode } = parsed.data;

    // Validate scorecard weights sum to 100%
    if (scorecardDimensions.length > 0) {
        const totalWeight = scorecardDimensions.reduce((sum, d) => sum + d.weight, 0);
        if (totalWeight !== 100) {
            throw new Error(`Scorecard weights must sum to 100% (currently ${totalWeight}%)`);
        }
    }

    // Ensure workspace exists — creates one if Clerk webhook was delayed/failed
    const { workspaceId, workspace: existingWorkspace, created } = await ensureWorkspace(user.id, {
        displayName: user.firstName || user.username || undefined,
        email: user.primaryEmailAddress?.emailAddress,
    });

    // Track referral signup if this is a new workspace creation
    if (created && refCode) {
        trackReferralSignup(refCode).catch(() => {});
    }

    // If already completed, still allow re-run (idempotent)
    const currentName = existingWorkspace.name;

    // Build scorecard config
    const scorecardConfig = scorecardDimensions.reduce((acc, d) => {
        acc[d.key] = { label: d.label, weight: d.weight };
        return acc;
    }, {} as Record<string, { label: string; weight: number }>);

    // 1. Update workspace with company info + scorecard + mark onboarding done
    await db.update(workspaces).set({
        name: companyName.trim() || currentName,
        companyContext: companyContext.trim(),
        scorecardConfig,
        onboardingCompleted: true,
    }).where(eq(workspaces.id, workspaceId));

    // 2. Add selected tools to software_spend (skip duplicates)
    if (selectedTools.length > 0) {
        const existing = await db.query.softwareSpend.findMany({
            where: eq(softwareSpend.workspaceId, workspaceId),
            columns: { toolName: true },
        });
        const existingNames = new Set(existing.map((e) => e.toolName.toLowerCase()));

        const toInsert = selectedTools
            .filter((t) => t.name.trim().length > 0)
            .filter((t) => !existingNames.has(t.name.trim().toLowerCase()));

        if (toInsert.length > 0) {
            await db.insert(softwareSpend).values(
                toInsert.map((t) => ({
                    workspaceId,
                    toolName: t.name.trim(),
                    vendorUrl: t.url ? (t.url.startsWith("http") ? t.url : `https://${t.url}`) : null,
                    status: "active" as const,
                    monthlyCost: "0",
                }))
            );
        }
    }

    revalidatePath("/tools");
    revalidatePath("/workspace");
    revalidatePath("/stack");

    // Return redirect URL — client handles navigation via router.push()
    const redirectTo = (plan && ["team", "startup", "enterprise"].includes(plan))
        ? "/settings/billing"
        : "/tools";

    return { success: true, redirectTo };
}

