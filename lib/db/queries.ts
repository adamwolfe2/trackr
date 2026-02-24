/**
 * Shared database query utilities.
 *
 * IMPORTANT: This file does NOT have "use server" — functions here are
 * server-only utilities, not client-callable server actions.
 */

import { db } from "@/lib/db";
import { workspaceMembers } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

/**
 * Look up the workspace ID for a given Clerk user ID.
 * Returns the oldest (primary) workspace to be deterministic for multi-workspace users.
 * This is an internal utility — NOT a server action.
 */
export async function getWorkspaceId(userId: string) {
    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, userId),
        orderBy: asc(workspaceMembers.joinedAt),
    });
    return member?.workspaceId;
}
