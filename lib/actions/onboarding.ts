"use server";

import { db } from "@/lib/db";
import { workspaces, workspaceMembers, softwareSpend } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { firecrawl } from "@/lib/services/firecrawl";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

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
}: {
    companyName: string;
    companyContext: string;
    selectedTools: Array<{ name: string; url?: string }>;
    scorecardDimensions: Array<{ key: string; label: string; weight: number }>;
}) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
        with: { workspace: true },
    });

    if (!member) throw new Error("No workspace found");

    const workspaceId = member.workspaceId;

    // Build scorecard config
    const scorecardConfig = scorecardDimensions.reduce((acc, d) => {
        acc[d.key] = { label: d.label, weight: d.weight };
        return acc;
    }, {} as Record<string, { label: string; weight: number }>);

    // 1. Update workspace with company info + scorecard + mark onboarding done
    await db.update(workspaces).set({
        name: companyName.trim() || member.workspace.name,
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
    redirect("/tools");
}

export async function checkOnboardingNeeded(): Promise<boolean> {
    const user = await currentUser();
    if (!user) return false;

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
        with: { workspace: true },
    });

    if (!member) return false;
    return !member.workspace.onboardingCompleted;
}
