"use server";

import { db } from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getWorkspaceId } from "@/lib/db/queries";

const VALID_KEYS = new Set([
    "weeklyDigest",
    "researchComplete",
    "renewalAlerts",
    "trialReminders",
]);

export async function updateEmailPreferences(
    key: string,
    enabled: boolean,
): Promise<{ success: boolean }> {
    const user = await currentUser();
    if (!user) {
        return { success: false };
    }

    if (!VALID_KEYS.has(key)) {
        return { success: false };
    }

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) {
        return { success: false };
    }

    const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.id, workspaceId),
        columns: { id: true, emailPreferences: true },
    });
    if (!workspace) {
        return { success: false };
    }

    const current = (workspace.emailPreferences as Record<string, boolean>) ?? {};
    const updated = { ...current, [key]: enabled };

    await db
        .update(workspaces)
        .set({ emailPreferences: updated })
        .where(eq(workspaces.id, workspaceId));

    revalidatePath("/settings/notifications");
    return { success: true };
}
