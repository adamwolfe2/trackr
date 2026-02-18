"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { softwareSpend, workspaceMembers } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { getWorkspaceId } from "./tools";

export async function addSoftwareSpend(formData: FormData) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    const toolName = (formData.get("toolName") as string)?.trim();
    if (!toolName) throw new Error("Tool name is required");

    const monthlyCostRaw = formData.get("monthlyCost") as string;
    const monthlyCost = monthlyCostRaw ? parseFloat(monthlyCostRaw).toFixed(2) : "0";

    const seatCountRaw = formData.get("seatCount") as string;
    const seatCount = seatCountRaw ? parseInt(seatCountRaw, 10) : null;

    await db.insert(softwareSpend).values({
        workspaceId,
        toolName,
        category: (formData.get("category") as string)?.trim() || null,
        vendorUrl: (formData.get("vendorUrl") as string)?.trim() || null,
        monthlyCost,
        seatCount,
        billingCycle: (formData.get("billingCycle") as string) || "monthly",
        status: (formData.get("status") as string) || "active",
        notes: (formData.get("notes") as string)?.trim() || null,
    });

    revalidatePath("/stack");
    return { success: true };
}

export async function deleteSoftwareSpend(id: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    await db.delete(softwareSpend).where(
        and(eq(softwareSpend.id, id), eq(softwareSpend.workspaceId, workspaceId))
    );

    revalidatePath("/stack");
    return { success: true };
}

export async function updateSoftwareSpendStatus(id: string, status: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    await db.update(softwareSpend)
        .set({ status })
        .where(and(eq(softwareSpend.id, id), eq(softwareSpend.workspaceId, workspaceId)));

    revalidatePath("/stack");
    return { success: true };
}

export async function updateSoftwareSpendDetails(id: string, monthlyCost: string, seatCount: number | null) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    const cost = parseFloat(monthlyCost);
    await db.update(softwareSpend)
        .set({
            monthlyCost: isNaN(cost) ? "0" : cost.toFixed(2),
            seatCount,
        })
        .where(and(eq(softwareSpend.id, id), eq(softwareSpend.workspaceId, workspaceId)));

    revalidatePath("/stack");
    return { success: true };
}
