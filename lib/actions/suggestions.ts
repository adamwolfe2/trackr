"use server";

import { db } from "@/lib/db";
import { toolSuggestions, workspaceMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

async function getWorkspaceId(): Promise<string> {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");
    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });
    if (!member) throw new Error("No workspace");
    return member.workspaceId;
}

export async function dismissSuggestion(id: string) {
    const workspaceId = await getWorkspaceId();
    await db.update(toolSuggestions)
        .set({ status: "dismissed" })
        .where(and(eq(toolSuggestions.id, id), eq(toolSuggestions.workspaceId, workspaceId)));
    revalidatePath("/feed");
    return { success: true };
}
