"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { notes, workspaceMembers } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function addNote(toolId: string, content: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // Find workspace member ID for this user
    // MVP: Just find the first member record for this user unique to the workspace logic later
    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id)
    });

    if (!member) throw new Error("User is not a member of any workspace");

    await db.insert(notes).values({
        toolId,
        workspaceMemberId: member.id,
        content,
        noteType: "general"
    });

    revalidatePath(`/tools/${toolId}`);
}
