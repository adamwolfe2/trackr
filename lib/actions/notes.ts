"use server";

import { db } from "@/lib/db";
import { notes, workspaceMembers, tools } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

const addNoteSchema = z.object({
    toolId: z.string().uuid(),
    content: z.string().min(1, "Note content cannot be empty").max(10000, "Note too long (max 10,000 characters)"),
});

export async function addNote(toolId: string, content: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // Get workspace member
    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id)
    });

    if (!member) throw new Error("User is not a member of any workspace");

    // Verify the tool belongs to the caller's workspace (workspace-scoped query prevents cross-workspace access)
    const tool = await db.query.tools.findFirst({
        where: and(eq(tools.id, toolId), eq(tools.workspaceId, member.workspaceId)),
    });
    if (!tool) throw new Error("Not authorized");

    const validated = addNoteSchema.safeParse({ toolId, content });
    if (!validated.success) {
        throw new Error(validated.error.issues[0].message);
    }

    await db.insert(notes).values({
        toolId: validated.data.toolId,
        content: validated.data.content,
        workspaceMemberId: member.id,
        noteType: 'general'
    });

    revalidatePath(`/tools/${toolId}`);
    return { success: true };
}
