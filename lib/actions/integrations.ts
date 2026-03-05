"use server";

import { db } from "@/lib/db";
import { integrations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { getWorkspaceId } from "@/lib/db/queries";

export type IntegrationProvider = "ramp" | "brex" | "billcom" | "notion" | "confluence";

const PROVIDER_INFO: Record<IntegrationProvider, { name: string; description: string; category: string }> = {
    ramp: { name: "Ramp", description: "Auto-sync SaaS transactions from your Ramp corporate card", category: "Spend Management" },
    brex: { name: "Brex", description: "Import software spend from Brex card transactions", category: "Spend Management" },
    billcom: { name: "Bill.com", description: "Sync vendor payments and invoices from Bill.com", category: "Spend Management" },
    notion: { name: "Notion", description: "Push tool reports and decision logs to your Notion workspace", category: "Knowledge Base" },
    confluence: { name: "Confluence", description: "Push reports and board summaries to Confluence spaces", category: "Knowledge Base" },
};

export async function getProviderInfo() {
    return PROVIDER_INFO;
}

export async function listIntegrations(workspaceId: string) {
    return db.query.integrations.findMany({
        where: eq(integrations.workspaceId, workspaceId),
    });
}

export async function connectIntegration(provider: IntegrationProvider, metadata?: Record<string, unknown>) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    // Check if already connected
    const existing = await db.query.integrations.findFirst({
        where: and(
            eq(integrations.workspaceId, workspaceId),
            eq(integrations.provider, provider),
        ),
    });

    if (existing) {
        // Update existing connection
        await db.update(integrations)
            .set({ status: "connected", metadata: metadata || null, errorMessage: null })
            .where(eq(integrations.id, existing.id));
    } else {
        await db.insert(integrations).values({
            workspaceId,
            provider,
            status: "connected",
            metadata: metadata || null,
            createdBy: user.id,
        });
    }

    revalidatePath("/settings/integrations");
    return { success: true };
}

export async function disconnectIntegration(provider: IntegrationProvider) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    await db.update(integrations)
        .set({ status: "disconnected", accessToken: null, refreshToken: null })
        .where(and(
            eq(integrations.workspaceId, workspaceId),
            eq(integrations.provider, provider),
        ));

    revalidatePath("/settings/integrations");
    return { success: true };
}
