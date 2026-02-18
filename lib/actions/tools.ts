"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { db } from "@/lib/db";
import { tools, workspaces, workspaceMembers, reports, researchJobs, subscriptions } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { performDeepResearch } from "@/lib/actions/research";

export async function getWorkspaceId(userId: string) {
    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, userId),
    });
    return member?.workspaceId;
}

export async function submitTool(formData: FormData) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const websiteUrl = formData.get("website_url") as string;
    // const description = formData.get("description") as string;

    // 1. Get user's workspace (or create default)
    let workspace = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
        with: {
            workspace: true
        }
    });

    let workspaceId;

    if (!workspace) {
        // Create default workspace for user
        const [newWorkspace] = await db.insert(workspaces).values({
            name: "My Workspace",
            slug: `workspace-${user.id.slice(0, 8)}`,
        }).returning();
        workspaceId = newWorkspace.id;

        await db.insert(workspaceMembers).values({
            workspaceId: workspaceId,
            userId: user.id,
            role: "owner"
        });
    } else {
        workspaceId = workspace.workspaceId;
    }

    // 1.5 Check Limits
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, workspaceId)
    });

    const { getPlanLimits } = await import("@/lib/config/subscriptions");
    const limits = getPlanLimits(subscription);

    // Count existing tools
    const toolCount = await db.query.tools.findMany({
        where: eq(tools.workspaceId, workspaceId),
        columns: { id: true }
    });

    if (limits.limits.tools !== Infinity && toolCount.length >= limits.limits.tools) {
        throw new Error(`Free plan limit reached (${limits.limits.tools} tools). Please upgrade to Pro.`);
    }

    // 2. Generate Embedding + Fetch logo preview in parallel
    const { generateEmbedding } = await import("@/lib/ai/embedding");
    const { previewTool } = await import("@/lib/actions/preview");

    const [embedding, preview] = await Promise.all([
        generateEmbedding(`${name}: ${websiteUrl}`),
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

    // Delete related records first (cascade should handle this if configured, but let's be safe)
    await db.delete(reports).where(eq(reports.toolId, toolId));
    await db.delete(researchJobs).where(eq(researchJobs.toolId, toolId));

    // Delete tool
    await db.delete(tools).where(eq(tools.id, toolId));

    revalidatePath("/tools");
    revalidatePath("/dashboard");
    return { success: true };
}

export async function updateToolStatus(toolId: string, status: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    await db.update(tools)
        .set({ status })
        .where(and(eq(tools.id, toolId), eq(tools.workspaceId, workspaceId)));

    revalidatePath("/tools");
    revalidatePath(`/tools/${toolId}`);
    return { success: true };
}
