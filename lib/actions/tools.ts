"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { db } from "@/lib/db";
import { tools, reports, researchJobs, notes, subscriptions, ads, apiLogs } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq, and, count } from "drizzle-orm";
import { performDeepResearch } from "@/lib/actions/research";
import { ensureWorkspace } from "@/lib/db/ensure-workspace";

import { getWorkspaceId } from "@/lib/db/queries";

export async function submitTool(formData: FormData) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const name = (formData.get("name") as string)?.trim();
    const websiteUrl = (formData.get("website_url") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || "";

    if (!name || name.length < 1 || name.length > 200) {
        throw new Error("Tool name must be 1-200 characters");
    }
    if (!websiteUrl) {
        throw new Error("Website URL is required");
    }
    // Validate URL format
    try {
        new URL(websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`);
    } catch {
        throw new Error("Invalid website URL");
    }

    // 1. Get user's workspace (or create one if webhook/onboarding hasn't yet)
    const { workspaceId } = await ensureWorkspace(user.id, {
        displayName: user.firstName || user.username || undefined,
        email: user.primaryEmailAddress?.emailAddress,
    });

    // 1.5 Check Limits + Insert inside a transaction to prevent TOCTOU races
    const { getPlanLimits } = await import("@/lib/config/subscriptions");

    // 2. Generate Embedding + Fetch logo preview in parallel (outside txn — no DB writes)
    const { generateEmbedding } = await import("@/lib/ai/embedding");
    const { previewToolInternal } = await import("@/lib/actions/preview");

    const [embedding, preview] = await Promise.all([
        generateEmbedding(description ? `${name}: ${description} (${websiteUrl})` : `${name}: ${websiteUrl}`).catch(() => null),
        previewToolInternal(websiteUrl).catch(() => null),
    ]);
    const logoUrl = (preview && "image" in preview && preview.image) ? preview.image : null;

    // 3. Check limit + insert atomically
    const newTool = await db.transaction(async (tx) => {
        const subscription = await tx.query.subscriptions.findFirst({
            where: eq(subscriptions.workspaceId, workspaceId)
        });

        const limits = getPlanLimits(subscription);

        const [{ value: toolCount }] = await tx.select({ value: count() })
            .from(tools)
            .where(eq(tools.workspaceId, workspaceId));

        if (limits.limits.tools !== Infinity && toolCount >= limits.limits.tools) {
            throw new Error(`Tool limit reached (${limits.limits.tools} tools on ${limits.name} plan). Upgrade to Team for unlimited tools.`);
        }

        const [inserted] = await tx.insert(tools).values({
            workspaceId,
            name,
            websiteUrl,
            logoUrl,
            status: "queued",
            submittedBy: user.id,
            embedding,
        }).returning();

        return inserted;
    });

    // 4. Kick off research in the background (runs after redirect is sent)
    after(async () => {
        try {
            await performDeepResearch(newTool.id);
        } catch (err) {
            console.error(`[tools] Background research failed for tool ${newTool.id}:`, err);
        }
    });

    revalidatePath("/tools");
    redirect(`/tools/${newTool.id}`);
}

export async function deleteTool(toolId: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    // Verify tool belongs to workspace
    const tool = await db.query.tools.findFirst({
        where: and(eq(tools.id, toolId), eq(tools.workspaceId, workspaceId))
    });

    if (!tool) throw new Error("Tool not found or unauthorized");

    // Atomic deletion — all related records in a single transaction
    await db.transaction(async (tx) => {
        await tx.delete(apiLogs).where(eq(apiLogs.toolId, toolId));
        await tx.delete(ads).where(eq(ads.toolId, toolId));
        await tx.delete(notes).where(eq(notes.toolId, toolId));
        await tx.delete(reports).where(eq(reports.toolId, toolId));
        await tx.delete(researchJobs).where(eq(researchJobs.toolId, toolId));
        await tx.delete(tools).where(eq(tools.id, toolId));
    });

    revalidatePath("/tools");
    revalidatePath("/dashboard");
    return { success: true };
}

const VALID_TOOL_STATUSES = ["queued", "researching", "active", "failed", "paused", "archived"] as const;

export async function updateToolStatus(toolId: string, status: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    if (!VALID_TOOL_STATUSES.includes(status as typeof VALID_TOOL_STATUSES[number])) {
        throw new Error("Invalid status");
    }

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    await db.update(tools)
        .set({ status })
        .where(and(eq(tools.id, toolId), eq(tools.workspaceId, workspaceId)));

    revalidatePath("/tools");
    revalidatePath(`/tools/${toolId}`);
    return { success: true };
}

function slugify(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
}

export async function publishReport(reportId: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    const report = await db.query.reports.findFirst({
        where: eq(reports.id, reportId),
    });
    if (!report) throw new Error("Report not found");

    const tool = await db.query.tools.findFirst({
        where: and(eq(tools.id, report.toolId), eq(tools.workspaceId, workspaceId)),
    });
    if (!tool) throw new Error("Tool not found or not in your workspace");

    const baseSlug = slugify(tool.name);

    // If this tool already has a slug, unpublish (toggle off)
    if (tool.publicSlug) {
        await db.update(reports)
            .set({ isPublic: false })
            .where(eq(reports.toolId, tool.id));
        await db.update(tools)
            .set({ publicSlug: null })
            .where(eq(tools.id, tool.id));
        revalidatePath(`/tools/${tool.id}`);
        revalidatePath(`/research/${tool.publicSlug}`);
        revalidatePath("/research");
        return { published: false, slug: null };
    }

    // Generate unique slug inside the transaction to prevent race conditions
    let slug = baseSlug;
    await db.transaction(async (tx) => {
        let attempt = 2;
        while (true) {
            const existing = await tx.query.tools.findFirst({
                where: eq(tools.publicSlug, slug),
                columns: { id: true },
            });
            if (!existing) break;
            slug = `${baseSlug}-${attempt++}`;
            if (attempt > 50) throw new Error("Could not generate a unique slug");
        }
        // Unpublish any other reports for this tool
        await tx.update(reports).set({ isPublic: false }).where(eq(reports.toolId, tool.id));
        // Publish this report
        await tx.update(reports).set({ isPublic: true }).where(eq(reports.id, reportId));
        // Set slug on tool
        await tx.update(tools).set({ publicSlug: slug }).where(eq(tools.id, tool.id));
    });

    revalidatePath(`/tools/${tool.id}`);
    revalidatePath(`/research/${slug}`);
    revalidatePath("/research");
    return { published: true, slug };
}
