"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { softwareSpend } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { getWorkspaceId } from "@/lib/db/queries";

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

    const renewalDateRaw = formData.get("renewalDate") as string;
    const renewalDate = renewalDateRaw ? new Date(renewalDateRaw) : null;

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
        renewalDate,
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

const VALID_SPEND_STATUSES = ["active", "evaluating", "canceling", "canceled"] as const;

export async function updateSoftwareSpendStatus(id: string, status: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    if (!VALID_SPEND_STATUSES.includes(status as typeof VALID_SPEND_STATUSES[number])) {
        throw new Error("Invalid status");
    }

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    await db.update(softwareSpend)
        .set({ status })
        .where(and(eq(softwareSpend.id, id), eq(softwareSpend.workspaceId, workspaceId)));

    revalidatePath("/stack");
    return { success: true };
}

export async function batchAddSoftwareSpend(items: Array<{
    toolName: string;
    category?: string | null;
    vendorUrl?: string | null;
    monthlyCost?: string | null;
    seatCount?: number | null;
    billingCycle?: string | null;
    notes?: string | null;
}>) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    if (items.length > 100) throw new Error("Batch size limit exceeded (max 100)");
    const valid = items.filter(i => i.toolName?.trim());
    if (valid.length === 0) throw new Error("No valid tools to add");

    await db.insert(softwareSpend).values(
        valid.map(i => {
            const cost = i.monthlyCost ? parseFloat(i.monthlyCost) : null;
            return {
                workspaceId,
                toolName: i.toolName.trim(),
                category: i.category?.trim() || null,
                vendorUrl: i.vendorUrl?.trim() || null,
                monthlyCost: cost && !isNaN(cost) ? cost.toFixed(2) : "0",
                seatCount: i.seatCount ?? null,
                billingCycle: i.billingCycle || "monthly",
                status: "active",
                notes: i.notes?.trim() || null,
            };
        })
    );

    revalidatePath("/stack");
    return { success: true, count: valid.length };
}

export async function updateSoftwareSpendDetails(
    id: string,
    monthlyCost: string,
    seatCount: number | null,
    renewalDate?: string | null,
    contractLengthMonths?: number | null
) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    const cost = parseFloat(monthlyCost);
    const updates: Record<string, unknown> = {
        monthlyCost: isNaN(cost) ? "0" : cost.toFixed(2),
        seatCount,
    };

    if (renewalDate !== undefined) {
        updates.renewalDate = renewalDate ? new Date(renewalDate) : null;
    }
    if (contractLengthMonths !== undefined) {
        updates.contractLength = contractLengthMonths;
    }

    await db.update(softwareSpend)
        .set(updates)
        .where(and(eq(softwareSpend.id, id), eq(softwareSpend.workspaceId, workspaceId)));

    revalidatePath("/stack");
    return { success: true };
}
