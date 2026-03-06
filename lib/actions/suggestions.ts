"use server";

import { db } from "@/lib/db";
import { toolSuggestions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getWorkspaceId as getWorkspaceIdFromDb } from "@/lib/db/queries";

async function getWorkspaceId(): Promise<string> {
    let user;
    try {
        user = await currentUser();
    } catch {
        throw new Error("Authentication error — please refresh and try again.");
    }
    if (!user) throw new Error("Unauthorized");
    const workspaceId = await getWorkspaceIdFromDb(user.id);
    if (!workspaceId) throw new Error("No workspace");
    return workspaceId;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function dismissSuggestion(id: string) {
    if (!UUID_RE.test(id)) throw new Error("Invalid suggestion ID");
    const workspaceId = await getWorkspaceId();
    await db.update(toolSuggestions)
        .set({ status: "dismissed" })
        .where(and(eq(toolSuggestions.id, id), eq(toolSuggestions.workspaceId, workspaceId)));
    revalidatePath("/feed");
    return { success: true };
}
