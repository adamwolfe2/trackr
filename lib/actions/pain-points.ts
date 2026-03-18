"use server";

import { db } from "@/lib/db";
import { painPoints } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { getWorkspaceId } from "@/lib/db/queries";
import { workspaceMembers } from "@/lib/db/schema";

const addPainPointSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long (max 200 characters)"),
    description: z.string().max(2000, "Description too long").optional(),
    category: z.string().max(100, "Category too long").optional(),
});

async function getMemberIdAndWorkspace(userId: string) {
    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, userId),
        columns: { id: true, workspaceId: true },
    });
    return member;
}

export async function addPainPoint(formData: FormData) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const member = await getMemberIdAndWorkspace(user.id);
    if (!member) throw new Error("No workspace found");
    const workspaceId = member.workspaceId;

    const rawData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
    };

    const validated = addPainPointSchema.safeParse(rawData);
    if (!validated.success) throw new Error(validated.error.issues[0].message);

    await db.insert(painPoints).values({
        workspaceId,
        title: validated.data.title,
        description: validated.data.description,
        category: validated.data.category || "General",
        createdBy: member.id,
    });

    revalidatePath("/pain-points");
    return { success: true };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function deletePainPoint(id: string) {
    if (!UUID_RE.test(id)) throw new Error("Invalid pain point ID");
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    await db.delete(painPoints).where(and(eq(painPoints.id, id), eq(painPoints.workspaceId, workspaceId)));
    revalidatePath("/pain-points");
    return { success: true };
}

export async function batchAddPainPoints(items: Array<{ title: string; category?: string; description?: string }>) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const member = await getMemberIdAndWorkspace(user.id);
    if (!member) throw new Error("No workspace found");
    const workspaceId = member.workspaceId;

    if (items.length > 100) throw new Error("Batch size limit exceeded (max 100)");
    const totalChars = items.reduce((sum, i) => sum + (i.title?.length ?? 0) + (i.description?.length ?? 0), 0);
    if (totalChars > 200_000) throw new Error("Payload too large");
    const valid = items.filter(i => i.title?.trim());
    if (valid.length === 0) throw new Error("No valid pain points to add");

    await db.insert(painPoints).values(
        valid.map(i => ({
            workspaceId,
            title: i.title.trim(),
            description: i.description?.trim() || undefined,
            category: i.category?.trim() || "General",
            createdBy: member.id,
        }))
    );

    revalidatePath("/pain-points");
    return { success: true, count: valid.length };
}

const updatePainPointSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long (max 200 characters)"),
    description: z.string().max(2000, "Description too long").optional(),
    category: z.string().max(100, "Category too long").optional(),
});

export async function updatePainPoint(id: string, data: { title: string; description?: string; category?: string }) {
    if (!UUID_RE.test(id)) throw new Error("Invalid pain point ID");
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    const validated = updatePainPointSchema.safeParse(data);
    if (!validated.success) throw new Error(validated.error.issues[0].message);

    await db.update(painPoints)
        .set({
            title: validated.data.title,
            description: validated.data.description,
            category: validated.data.category || "General",
        })
        .where(and(eq(painPoints.id, id), eq(painPoints.workspaceId, workspaceId)));

    revalidatePath("/pain-points");
    return { success: true };
}

export async function togglePainPointActive(id: string, currentState: boolean) {
    if (!UUID_RE.test(id)) throw new Error("Invalid pain point ID");

    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    await db.update(painPoints)
        .set({ active: !currentState })
        .where(and(eq(painPoints.id, id), eq(painPoints.workspaceId, workspaceId)));

    revalidatePath("/pain-points");
    return { success: true };
}
