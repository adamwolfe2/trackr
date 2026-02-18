"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { tools, workspaces, workspaceMembers, reports, researchJobs } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";

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

    // 2. Insert Tool
    const [newTool] = await db.insert(tools).values({
        workspaceId,
        name,
        websiteUrl,
        status: "queued", // Initial status
        submittedBy: user.id,
    }).returning();

    // 3. Trigger Research Agent
    try {
        const { triggerResearchAgent } = await import("@/lib/agents/trigger");
        await triggerResearchAgent(newTool.id, websiteUrl);
    } catch (err) {
        console.error("Failed to trigger agent:", err);
    }

    console.log("Tool submitted:", newTool.id);

    revalidatePath("/tools");
    redirect("/tools");
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
