"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { db } from "@/lib/db";
import { tools, reports, researchJobs, notes, subscriptions } from "@/lib/db/schema";
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

    // 1.5 Check Limits
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, workspaceId)
    });

    const { getPlanLimits } = await import("@/lib/config/subscriptions");
    const limits = getPlanLimits(subscription);

    // Count existing tools
    const [{ value: toolCount }] = await db.select({ value: count() })
        .from(tools)
        .where(eq(tools.workspaceId, workspaceId));

    if (limits.limits.tools !== Infinity && toolCount >= limits.limits.tools) {
        throw new Error(`Tool limit reached (${limits.limits.tools} tools on ${limits.name} plan). Upgrade to Team for unlimited tools.`);
    }

    // 2. Generate Embedding + Fetch logo preview in parallel
    const { generateEmbedding } = await import("@/lib/ai/embedding");
    const { previewTool } = await import("@/lib/actions/preview");

    const [embedding, preview] = await Promise.all([
        generateEmbedding(`${name}: ${websiteUrl}`).catch(() => null),
        previewTool(websiteUrl).catch(() => null),
    ]);
    const logoUrl = (preview && "image" in preview && preview.image) ? preview.image : null;

    // 3. Insert Tool
    const [newTool] = await db.insert(tools).values({
        workspaceId,
        name,
        websiteUrl,
        logoUrl,
        status: "queued", // Initial status
        submittedBy: user.id,
        embedding,
    }).returning();

    // 4. Kick off research in the background (runs after redirect is sent)
    after(() => performDeepResearch(newTool.id));

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
