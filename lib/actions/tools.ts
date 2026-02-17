"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { tools, workspaces, workspaceMembers } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

export async function submitTool(formData: FormData) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const websiteUrl = formData.get("website_url") as string;
    const description = formData.get("description") as string;

    // 1. Get user's workspace (or create default)
    // MVP: fetch the first workspace or create one for the user
    let workspace = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
        with: {
            // @ts-ignore
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
    // We don't await this to keep UI snappy, or we use a background job. 
    // For Vercel server actions, it's better to await or use Inngest/Queue. 
    // We'll await for simplicity in MVP.
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
