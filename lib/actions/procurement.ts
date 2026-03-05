"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { procurementRequests } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

// ── Types ────────────────────────────────────────────────────────────

type SubmitProcurementData = {
    requestedBy: string;
    requestedByName: string;
    toolName: string;
    toolUrl?: string;
    justification: string;
    urgency: "low" | "medium" | "high" | "critical";
    category?: string;
    estimatedBudget?: string;
};

type UpdateProcurementStatusData = {
    status: "pending" | "researching" | "reviewed" | "approved" | "rejected";
    reviewedBy?: string;
    reviewedByName?: string;
    reviewNotes?: string;
    approvedBudget?: string;
};

// ── Actions ──────────────────────────────────────────────────────────

export async function submitProcurementRequest(
    workspaceId: string,
    data: SubmitProcurementData
) {
    const toolName = data.toolName.trim();
    if (!toolName || toolName.length > 200) {
        throw new Error("Tool name must be 1-200 characters");
    }
    if (!data.justification.trim()) {
        throw new Error("Justification is required");
    }

    const validUrgencies = ["low", "medium", "high", "critical"];
    if (!validUrgencies.includes(data.urgency)) {
        throw new Error("Invalid urgency level");
    }

    // Validate URL if provided
    if (data.toolUrl) {
        try {
            new URL(
                data.toolUrl.startsWith("http")
                    ? data.toolUrl
                    : `https://${data.toolUrl}`
            );
        } catch {
            throw new Error("Invalid tool URL");
        }
    }

    const [request] = await db
        .insert(procurementRequests)
        .values({
            workspaceId,
            requestedBy: data.requestedBy,
            requestedByName: data.requestedByName,
            toolName,
            toolUrl: data.toolUrl?.trim() || null,
            justification: data.justification.trim(),
            urgency: data.urgency,
            category: data.category?.trim() || null,
            estimatedBudget: data.estimatedBudget || null,
            status: "pending",
        })
        .returning();

    revalidatePath("/procurement");
    return request;
}

export async function updateProcurementStatus(
    requestId: string,
    workspaceId: string,
    data: UpdateProcurementStatusData
) {
    const validStatuses = [
        "pending",
        "researching",
        "reviewed",
        "approved",
        "rejected",
    ];
    if (!validStatuses.includes(data.status)) {
        throw new Error("Invalid status");
    }

    // Verify ownership
    const existing = await db.query.procurementRequests.findFirst({
        where: and(
            eq(procurementRequests.id, requestId),
            eq(procurementRequests.workspaceId, workspaceId)
        ),
    });

    if (!existing) {
        throw new Error("Procurement request not found or unauthorized");
    }

    const updates: Record<string, unknown> = {
        status: data.status,
        updatedAt: new Date(),
    };

    if (data.reviewedBy) updates.reviewedBy = data.reviewedBy;
    if (data.reviewedByName) updates.reviewedByName = data.reviewedByName;
    if (data.reviewNotes !== undefined) updates.reviewNotes = data.reviewNotes;
    if (data.approvedBudget !== undefined)
        updates.approvedBudget = data.approvedBudget;

    await db
        .update(procurementRequests)
        .set(updates)
        .where(eq(procurementRequests.id, requestId));

    revalidatePath("/procurement");
    return { success: true };
}

export async function listProcurementRequests(
    workspaceId: string,
    status?: string
) {
    if (status) {
        return db.query.procurementRequests.findMany({
            where: and(
                eq(procurementRequests.workspaceId, workspaceId),
                eq(procurementRequests.status, status)
            ),
            orderBy: [desc(procurementRequests.createdAt)],
        });
    }
    return db.query.procurementRequests.findMany({
        where: eq(procurementRequests.workspaceId, workspaceId),
        orderBy: [desc(procurementRequests.createdAt)],
    });
}

export async function getProcurementRequest(
    requestId: string,
    workspaceId: string
) {
    return db.query.procurementRequests.findFirst({
        where: and(
            eq(procurementRequests.id, requestId),
            eq(procurementRequests.workspaceId, workspaceId)
        ),
    });
}

export async function startProcurementResearch(
    requestId: string,
    workspaceId: string
) {
    const existing = await db.query.procurementRequests.findFirst({
        where: and(
            eq(procurementRequests.id, requestId),
            eq(procurementRequests.workspaceId, workspaceId)
        ),
    });

    if (!existing) {
        throw new Error("Procurement request not found or unauthorized");
    }

    await db
        .update(procurementRequests)
        .set({ status: "researching", updatedAt: new Date() })
        .where(eq(procurementRequests.id, requestId));

    revalidatePath("/procurement");
    return { success: true };
}
