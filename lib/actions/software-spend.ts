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
    if (toolName.length > 200) throw new Error("Tool name too long");

    // Check for duplicates
    const existing = await db.query.softwareSpend.findFirst({
        where: and(eq(softwareSpend.workspaceId, workspaceId), eq(softwareSpend.toolName, toolName)),
        columns: { id: true },
    });
    if (existing) throw new Error(`"${toolName}" is already in your stack`);

    const monthlyCostRaw = formData.get("monthlyCost") as string;
    const parsedCost = monthlyCostRaw ? parseFloat(monthlyCostRaw) : 0;
    if (!isNaN(parsedCost) && parsedCost > 10_000_000) throw new Error("Monthly cost exceeds maximum allowed value");
    const monthlyCost = isNaN(parsedCost) || parsedCost < 0 ? "0" : parsedCost.toFixed(2);

    const seatCountRaw = formData.get("seatCount") as string;
    const parsedSeats = seatCountRaw ? parseInt(seatCountRaw, 10) : null;
    const seatCount = parsedSeats !== null && (isNaN(parsedSeats) || parsedSeats < 0) ? null : parsedSeats;

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

    // Filter out tools already in the stack
    const existingEntries = await db.query.softwareSpend.findMany({
        where: eq(softwareSpend.workspaceId, workspaceId),
        columns: { toolName: true },
    });
    const existingNames = new Set(existingEntries.map(e => e.toolName.toLowerCase()));
    const deduped = valid.filter(i => !existingNames.has(i.toolName.trim().toLowerCase()));

    if (deduped.length === 0) throw new Error("All tools are already in your stack");

    await db.insert(softwareSpend).values(
        deduped.map(i => {
            const cost = i.monthlyCost ? parseFloat(i.monthlyCost) : null;
            return {
                workspaceId,
                toolName: i.toolName.trim(),
                category: i.category?.trim() || null,
                vendorUrl: i.vendorUrl?.trim() || null,
                monthlyCost: cost && !isNaN(cost) && cost >= 0 ? cost.toFixed(2) : "0",
                seatCount: i.seatCount != null && i.seatCount >= 0 ? i.seatCount : null,
                billingCycle: i.billingCycle || "monthly",
                status: "active",
                notes: i.notes?.trim() || null,
            };
        })
    );

    const skipped = valid.length - deduped.length;
    revalidatePath("/stack");
    return { success: true, count: deduped.length, skipped };
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
    if (!isNaN(cost) && cost > 10_000_000) throw new Error("Monthly cost exceeds maximum allowed value");
    if (seatCount !== null && seatCount > 1_000_000) throw new Error("Seat count exceeds maximum allowed value");
    if (contractLengthMonths !== null && contractLengthMonths !== undefined && (contractLengthMonths < 1 || contractLengthMonths > 120)) {
        throw new Error("Contract length must be between 1 and 120 months");
    }

    const updates: Record<string, unknown> = {
        monthlyCost: isNaN(cost) || cost < 0 ? "0" : cost.toFixed(2),
        seatCount: seatCount !== null && seatCount >= 0 ? seatCount : null,
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
