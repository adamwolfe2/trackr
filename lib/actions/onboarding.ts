"use server";

import { db } from "@/lib/db";
import { workspaces, softwareSpend } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { firecrawl } from "@/lib/services/firecrawl";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { ensureWorkspace } from "@/lib/db/ensure-workspace";

/** Scrape company website and auto-generate a context description */
export async function generateCompanyContext(websiteUrl: string): Promise<{ context: string; error?: string }> {
    try {
        if (!websiteUrl.startsWith("http")) websiteUrl = `https://${websiteUrl}`;

        const scrape = await firecrawl.scrapeUrl(websiteUrl);
        const content = scrape.data?.markdown?.slice(0, 4000) ?? "";

        if (!content) return { context: "", error: "Could not scrape website" };

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

export async function completeOnboarding({
    companyName,
    companyContext,
    selectedTools,
    scorecardDimensions,
    plan,
}: {
    companyName: string;
    companyContext: string;
    selectedTools: Array<{ name: string; url?: string }>;
    scorecardDimensions: Array<{ key: string; label: string; weight: number }>;
    plan?: string;
}) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // Ensure workspace exists — creates one if Clerk webhook was delayed/failed
    const { workspaceId, workspace: existingWorkspace } = await ensureWorkspace(user.id, {
        displayName: user.firstName || user.username || undefined,
        email: user.primaryEmailAddress?.emailAddress,
    });

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

        const toInsert = selectedTools.filter((t) => !existingNames.has(t.name.toLowerCase()));

        if (toInsert.length > 0) {
            await db.insert(softwareSpend).values(
                toInsert.map((t) => ({
                    workspaceId,
                    toolName: t.name,
                    vendorUrl: t.url ? `https://${t.url}` : null,
                    status: "active" as const,
                    monthlyCost: "0",
                }))
            );
        }
    }

    revalidatePath("/tools");
    revalidatePath("/workspace");
    revalidatePath("/stack");

    if (plan === "team" || plan === "agency") {
        redirect(`/settings/billing?upgrade=${plan}`);
    }
    redirect("/tools");
}

