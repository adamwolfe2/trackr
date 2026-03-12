"use server";

import { after } from "next/server";
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
import { captureEvent } from "@/lib/analytics/posthog-server";
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

        // Block private/internal URLs and enforce https
        try {
            const parsed = new URL(websiteUrl);
            if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
                return { context: "", error: "Invalid URL" };
            }
            const hostname = parsed.hostname.toLowerCase();
            if (hostname.length > 253) {
                return { context: "", error: "Invalid URL" };
            }
            if (
                hostname === "localhost" || hostname === "0.0.0.0" ||
                hostname === "[::1]" || hostname.endsWith(".local") || hostname.endsWith(".internal") ||
                hostname === "metadata.google.internal" ||
                /^127\./.test(hostname) ||
                /^10\./.test(hostname) ||
                /^192\.168\./.test(hostname) ||
                /^172\.(1[6-9]|2[0-9]|3[01])\./.test(hostname)
            ) {
                return { context: "", error: "Invalid URL" };
            }
            // Block scraping the app itself to prevent redirect loops
            if (hostname === "trytrackr.com" || hostname === "www.trytrackr.com") {
                return { context: "", error: "Invalid URL" };
            }
        } catch {
            return { context: "", error: "Invalid URL format" };
        }

        const scrape = await firecrawl.scrapeUrl(websiteUrl);
        if (!scrape.success) {
            console.error("[onboarding] Firecrawl scrape failed:", (scrape as unknown as Record<string, unknown>).error ?? "unknown error");
            return { context: "", error: "Could not scrape website" };
        }
        const content = scrape.data?.markdown?.slice(0, 4000) ?? "";

        if (!content) return { context: "", error: "No readable content found on website" };

        const aiController = new AbortController();
        const aiTimeout = setTimeout(() => aiController.abort(), 20_000);
        let text: string;
        try {
            const result = await generateText({
                model: openai("gpt-4o-mini"),
                abortSignal: aiController.signal,
                prompt: `Based on this website content, write a 2-3 sentence description that captures:
1. What the company does and their core product/service
2. Their target market (B2B/B2C, industry, typical company size they sell to)
3. Their likely priorities when evaluating software tools

Website content:
${content}

Write only the description, no preamble or label.`,
            });
            text = result.text;
        } catch (aiErr) {
            const aiMsg = aiErr instanceof Error ? aiErr.message : "Unknown";
            if (aiMsg.includes("aborted") || aiMsg.includes("abort")) {
                console.error("[onboarding] generateText timed out after 20s");
            } else {
                console.error("[onboarding] generateText failed:", aiErr);
            }
            return { context: "", error: "Failed to generate context" };
        } finally {
            clearTimeout(aiTimeout);
        }

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
    interval: z.string().max(20).optional(),
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
    interval?: string;
    refCode?: string;
}): Promise<{ success: true; redirectTo: string }> {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const parsed = OnboardingSchema.safeParse(input);
    if (!parsed.success) {
        throw new Error(`Invalid onboarding data: ${parsed.error.issues[0]?.message ?? "validation failed"}`);
    }
    const { companyName, companyContext, selectedTools, scorecardDimensions, plan, interval, refCode } = parsed.data;

    // Validate scorecard weights sum to 100%
    if (scorecardDimensions.length > 0) {
        const totalWeight = scorecardDimensions.reduce((sum, d) => sum + d.weight, 0);
        if (totalWeight !== 100) {
            throw new Error(`Scorecard weights must sum to 100% (currently ${totalWeight}%)`);
        }
    }

    // Ensure workspace exists — creates one if Clerk webhook was delayed/failed
    let workspaceResult: Awaited<ReturnType<typeof ensureWorkspace>>;
    try {
        workspaceResult = await ensureWorkspace(user.id, {
            displayName: user.firstName || user.username || undefined,
            email: user.primaryEmailAddress?.emailAddress,
        });
    } catch (err) {
        console.error("[completeOnboarding] ensureWorkspace failed:", err);
        throw err;
    }
    const { workspaceId, workspace: existingWorkspace, created } = workspaceResult;

    // Track referral signup if this is a new workspace creation
    if (created && refCode) {
        trackReferralSignup(refCode).catch((err) => console.warn("[onboarding] trackReferralSignup failed:", err));
    }

    // If already completed, still allow re-run (idempotent)
    // Guard against null workspace (data integrity issue — shouldn't happen)
    const currentName = existingWorkspace?.name ?? "";

    // Build scorecard config
    const scorecardConfig = scorecardDimensions.reduce((acc, d) => {
        acc[d.key] = { label: d.label, weight: d.weight };
        return acc;
    }, {} as Record<string, { label: string; weight: number }>);

    // 1. Update workspace with company info + scorecard + mark onboarding done
    try {
        await db.update(workspaces).set({
            name: companyName.trim() || currentName,
            companyContext: companyContext.trim(),
            scorecardConfig,
            onboardingCompleted: true,
        }).where(eq(workspaces.id, workspaceId));
    } catch (err) {
        console.error("[completeOnboarding] workspace update failed:", err);
        throw err;
    }

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

    // Fire PostHog event after response — non-blocking
    const captureUserId = user.id;
    const captureWorkspaceId = workspaceId;
    after(async () => {
        await captureEvent(captureUserId, "onboarding_completed", {
            company_name: companyName,
            tool_count: selectedTools.length,
            plan: plan ?? "free",
            has_ref_code: !!refCode,
            workspace_id: captureWorkspaceId,
            is_new_workspace: created,
        });
    });

    // Return redirect URL — client handles navigation via router.push()
    // Free users → /submit so they immediately research their first tool (Aha moment <2 min)
    // Paid plan → /settings/billing with plan+interval so the page auto-triggers checkout
    let redirectTo = "/submit";
    if (plan && ["team", "startup", "enterprise"].includes(plan)) {
        const billingInterval = interval && ["monthly", "annual"].includes(interval) ? interval : "monthly";
        redirectTo = `/settings/billing?plan=${plan}&interval=${billingInterval}`;
    }

    return { success: true, redirectTo };
}

