"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { workspaces, workspaceMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { firecrawl } from "@/lib/services/firecrawl";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Define the schema for the AI-generated scorecard configuration
const ScorecardConfigSchema = z.object({
    industry: z.string().describe("The primary industry of the company (e.g. B2B SaaS, E-commerce, Healthcare)"),
    businessModel: z.enum(["B2B", "B2C", "Marketplace", "Agency", "Other"]).describe("The business model"),
    teamSize: z.string().describe("Estimated team size or stage (e.g. Seed, Series A, Enterprise)"),
    techStack: z.array(z.string()).describe("Key technologies or platforms identified (e.g. React, Salesforce, AWS)"),
    primaryGoals: z.array(z.string()).describe("Likely business goals (e.g. Scale sales, Automate support, Improve code quality)"),
    complianceNeeds: z.array(z.string()).describe("Standard compliance requirements for this industry (e.g. SOC2, HIPAA, GDPR)"),
    budgetTier: z.enum(["Low", "Medium", "High", "Enterprise"]).describe("Estimated budget tier for tooling"),
    keyPainPoints: z.array(z.string()).describe("Potential operational pain points based on the business type")
});

export async function processOnboarding(url: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Get user's workspace
    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
        with: {
            // @ts-ignore
            workspace: true
        }
    });

    if (!member) throw new Error("No workspace found");

    // 2. Scrape the URL
    console.log(`Scraping ${url} for onboarding...`);
    const scrapeResult = await firecrawl.scrapeUrl(url);

    if (!scrapeResult.success || !scrapeResult.data) {
        throw new Error(`Failed to scrape URL: ${scrapeResult.error}`);
    }

    const markdown = scrapeResult.data.markdown || JSON.stringify(scrapeResult.data); // Fallback if markdown missing

    // 3. Analyze with AI
    console.log("Analyzing content...");
    const { object: analysis } = await generateObject({
        model: openai("gpt-4o"),
        schema: ScorecardConfigSchema,
        prompt: `
            Analyze the following company website content to build a software procurement scorecard.
            We need to understand their business context to recommend the right AI tools.

            Website URL: ${url}
            Content:
            ${markdown.slice(0, 15000)} // Truncate to avoid token limits
        `
    });

    // 4. Update Workspace
    await db.update(workspaces)
        .set({
            companyContext: `
                Industry: ${analysis.industry}
                Model: ${analysis.businessModel}
                Stage: ${analysis.teamSize}
                Stack: ${analysis.techStack.join(", ")}
            `.trim(),
            scorecardConfig: analysis
        })
        .where(eq(workspaces.id, member.workspaceId));

    revalidatePath("/dashboard");
    return { success: true, analysis };
}
