/**
 * Verify the current user is a member of the given workspace.
 * Use this in server actions that accept workspaceId as a parameter
 * to prevent IDOR attacks.
 */

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { workspaceMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function requireWorkspaceMember(workspaceId: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.userId, user.id),
            eq(workspaceMembers.workspaceId, workspaceId)
        ),
    });
    if (!member) throw new Error("Forbidden");

    return { user, member };
}
