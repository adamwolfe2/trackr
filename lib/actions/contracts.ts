"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { contracts, softwareSpend, workspaceMembers } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

async function requireWorkspace() {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");
    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
        columns: { workspaceId: true },
        orderBy: (wm, { asc }) => [asc(wm.joinedAt)],
    });
    if (!member) throw new Error("No workspace found");
    return member.workspaceId;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ExtractedTerms = {
    renewalDate?: string | null;
    autoRenew?: boolean | null;
    noticePeriodDays?: number | null;
    termMonths?: number | null;
    priceEscalation?: string | null;
    cancellationTerms?: string | null;
    paymentTerms?: string | null;
};

export async function addContract(
    workspaceId: string,
    data: {
        fileName: string;
        fileUrl: string;
        fileSize?: number;
        mimeType?: string;
        softwareSpendId?: string;
        uploadedBy: string;
    }
) {
    if (!UUID_RE.test(workspaceId)) throw new Error("Invalid workspace ID");
    const authedWorkspaceId = await requireWorkspace();
    if (authedWorkspaceId !== workspaceId) throw new Error("Unauthorized");

    const fileName = data.fileName?.trim();
    if (!fileName || fileName.length > 500) throw new Error("File name is required (max 500 characters)");

    const fileUrl = data.fileUrl?.trim();
    if (!fileUrl) throw new Error("File URL is required");

    if (data.softwareSpendId && !UUID_RE.test(data.softwareSpendId)) {
        throw new Error("Invalid software spend ID");
    }

    const [inserted] = await db.insert(contracts).values({
        workspaceId,
        fileName,
        fileUrl,
        fileSize: data.fileSize ?? null,
        mimeType: data.mimeType?.trim() || null,
        softwareSpendId: data.softwareSpendId || null,
        status: "processing",
        uploadedBy: data.uploadedBy,
    }).returning();

    revalidatePath("/contracts");
    return { success: true, contract: inserted };
}

export async function updateContractTerms(
    contractId: string,
    workspaceId: string,
    extractedTerms: ExtractedTerms
) {
    if (!UUID_RE.test(contractId)) throw new Error("Invalid contract ID");
    if (!UUID_RE.test(workspaceId)) throw new Error("Invalid workspace ID");
    const authedWorkspaceId = await requireWorkspace();
    if (authedWorkspaceId !== workspaceId) throw new Error("Unauthorized");

    // Determine status based on terms
    let status = "active";
    if (extractedTerms.renewalDate) {
        const renewal = new Date(extractedTerms.renewalDate);
        if (!isNaN(renewal.getTime()) && renewal < new Date()) {
            status = "expired";
        }
    }

    await db.update(contracts)
        .set({
            extractedTerms,
            status,
        })
        .where(
            and(eq(contracts.id, contractId), eq(contracts.workspaceId, workspaceId))
        );

    revalidatePath("/contracts");
    return { success: true };
}

export async function listContracts(workspaceId: string) {
    if (!UUID_RE.test(workspaceId)) throw new Error("Invalid workspace ID");
    const authedWorkspaceId = await requireWorkspace();
    if (authedWorkspaceId !== workspaceId) throw new Error("Unauthorized");

    const results = await db.query.contracts.findMany({
        where: eq(contracts.workspaceId, workspaceId),
        with: {
            spend: {
                columns: { id: true, toolName: true },
            },
        },
        orderBy: [desc(contracts.createdAt)],
    });

    return results;
}

export async function getContract(contractId: string, workspaceId: string) {
    if (!UUID_RE.test(contractId)) throw new Error("Invalid contract ID");
    if (!UUID_RE.test(workspaceId)) throw new Error("Invalid workspace ID");
    const authedWorkspaceId = await requireWorkspace();
    if (authedWorkspaceId !== workspaceId) throw new Error("Unauthorized");

    const contract = await db.query.contracts.findFirst({
        where: and(
            eq(contracts.id, contractId),
            eq(contracts.workspaceId, workspaceId)
        ),
        with: {
            spend: {
                columns: { id: true, toolName: true },
            },
        },
    });

    if (!contract) throw new Error("Contract not found");
    return contract;
}

export async function deleteContract(contractId: string, workspaceId: string) {
    if (!UUID_RE.test(contractId)) throw new Error("Invalid contract ID");
    if (!UUID_RE.test(workspaceId)) throw new Error("Invalid workspace ID");
    const authedWorkspaceId = await requireWorkspace();
    if (authedWorkspaceId !== workspaceId) throw new Error("Unauthorized");

    await db.delete(contracts).where(
        and(eq(contracts.id, contractId), eq(contracts.workspaceId, workspaceId))
    );

    revalidatePath("/contracts");
    return { success: true };
}

export async function linkContractToSpend(
    contractId: string,
    workspaceId: string,
    softwareSpendId: string
) {
    if (!UUID_RE.test(contractId)) throw new Error("Invalid contract ID");
    if (!UUID_RE.test(workspaceId)) throw new Error("Invalid workspace ID");
    if (!UUID_RE.test(softwareSpendId)) throw new Error("Invalid software spend ID");
    const authedWorkspaceId = await requireWorkspace();
    if (authedWorkspaceId !== workspaceId) throw new Error("Unauthorized");

    // Verify the spend entry belongs to this workspace
    const spend = await db.query.softwareSpend.findFirst({
        where: and(
            eq(softwareSpend.id, softwareSpendId),
            eq(softwareSpend.workspaceId, workspaceId)
        ),
        columns: { id: true },
    });
    if (!spend) throw new Error("Software spend entry not found");

    await db.update(contracts)
        .set({ softwareSpendId })
        .where(
            and(eq(contracts.id, contractId), eq(contracts.workspaceId, workspaceId))
        );

    revalidatePath("/contracts");
    return { success: true };
}

export async function getSpendEntries(workspaceId: string) {
    if (!UUID_RE.test(workspaceId)) throw new Error("Invalid workspace ID");
    const authedWorkspaceId = await requireWorkspace();
    if (authedWorkspaceId !== workspaceId) throw new Error("Unauthorized");

    return db.query.softwareSpend.findMany({
        where: eq(softwareSpend.workspaceId, workspaceId),
        columns: { id: true, toolName: true },
        orderBy: (s, { asc }) => [asc(s.toolName)],
    });
}
