"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { competitorIntel, subscriptions } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getPlanLimits } from "@/lib/config/subscriptions";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DOMAIN_RE = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/;

function normalizeDomain(input: string): string {
    let domain = input.trim().toLowerCase();
    // Strip protocol
    domain = domain.replace(/^https?:\/\//, "");
    // Strip path / query
    domain = domain.split("/")[0].split("?")[0];
    // Strip www.
    domain = domain.replace(/^www\./, "");
    return domain;
}

export async function addCompetitor(
    workspaceId: string,
    data: { competitorName: string; competitorDomain: string; createdBy: string }
) {
    if (!UUID_RE.test(workspaceId)) throw new Error("Invalid workspace ID");

    const name = data.competitorName?.trim();
    if (!name || name.length > 200) throw new Error("Competitor name is required (max 200 characters)");

    const domain = normalizeDomain(data.competitorDomain);
    if (!domain || !DOMAIN_RE.test(domain)) throw new Error("A valid domain is required (e.g. example.com)");

    // Check plan limit
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, workspaceId),
    });
    const plan = getPlanLimits(subscription ?? undefined);
    const limit = plan.limits.competitors;

    if (limit !== Infinity) {
        const countResult = await db
            .select({ count: sql<string>`count(*)` })
            .from(competitorIntel)
            .where(eq(competitorIntel.workspaceId, workspaceId));
        const currentCount = Number(countResult[0]?.count ?? 0);

        if (currentCount >= limit) {
            throw new Error(
                `You've reached your plan limit of ${limit} competitor${limit === 1 ? "" : "s"}. Upgrade to track more.`
            );
        }
    }

    // Check for duplicate domain
    const existing = await db.query.competitorIntel.findFirst({
        where: and(
            eq(competitorIntel.workspaceId, workspaceId),
            eq(competitorIntel.competitorDomain, domain)
        ),
        columns: { id: true },
    });
    if (existing) throw new Error(`A competitor with domain "${domain}" is already being tracked`);

    const [inserted] = await db.insert(competitorIntel).values({
        workspaceId,
        competitorName: name,
        competitorDomain: domain,
        discoveredTools: [],
        status: "tracking",
        createdBy: data.createdBy,
    }).returning();

    revalidatePath("/competitors");
    return { success: true, competitor: inserted };
}

export async function removeCompetitor(competitorId: string, workspaceId: string) {
    if (!UUID_RE.test(competitorId)) throw new Error("Invalid competitor ID");
    if (!UUID_RE.test(workspaceId)) throw new Error("Invalid workspace ID");

    await db.delete(competitorIntel).where(
        and(eq(competitorIntel.id, competitorId), eq(competitorIntel.workspaceId, workspaceId))
    );

    revalidatePath("/competitors");
    return { success: true };
}

export async function listCompetitors(workspaceId: string) {
    if (!UUID_RE.test(workspaceId)) throw new Error("Invalid workspace ID");

    return db.query.competitorIntel.findMany({
        where: eq(competitorIntel.workspaceId, workspaceId),
        orderBy: (ci, { desc }) => [desc(ci.createdAt)],
    });
}

export async function getCompetitorDetail(competitorId: string, workspaceId: string) {
    if (!UUID_RE.test(competitorId)) throw new Error("Invalid competitor ID");
    if (!UUID_RE.test(workspaceId)) throw new Error("Invalid workspace ID");

    const competitor = await db.query.competitorIntel.findFirst({
        where: and(
            eq(competitorIntel.id, competitorId),
            eq(competitorIntel.workspaceId, workspaceId)
        ),
    });

    if (!competitor) throw new Error("Competitor not found");
    return competitor;
}

export async function pauseCompetitor(competitorId: string, workspaceId: string) {
    if (!UUID_RE.test(competitorId)) throw new Error("Invalid competitor ID");
    if (!UUID_RE.test(workspaceId)) throw new Error("Invalid workspace ID");

    const existing = await db.query.competitorIntel.findFirst({
        where: and(
            eq(competitorIntel.id, competitorId),
            eq(competitorIntel.workspaceId, workspaceId)
        ),
        columns: { status: true },
    });
    if (!existing) throw new Error("Competitor not found");

    const newStatus = existing.status === "tracking" ? "paused" : "tracking";

    await db.update(competitorIntel)
        .set({ status: newStatus })
        .where(
            and(eq(competitorIntel.id, competitorId), eq(competitorIntel.workspaceId, workspaceId))
        );

    revalidatePath("/competitors");
    return { success: true, status: newStatus };
}

type DiscoveredTool = {
    name: string;
    url?: string;
    category?: string;
    confidence: number;
    source: string;
};

export async function updateDiscoveredTools(
    competitorId: string,
    workspaceId: string,
    tools: DiscoveredTool[]
) {
    if (!UUID_RE.test(competitorId)) throw new Error("Invalid competitor ID");
    if (!UUID_RE.test(workspaceId)) throw new Error("Invalid workspace ID");

    if (!Array.isArray(tools)) throw new Error("Tools must be an array");
    if (tools.length > 200) throw new Error("Maximum 200 discovered tools per competitor");

    // Validate each tool entry
    const validTools = tools
        .filter(t => typeof t.name === "string" && t.name.trim())
        .map(t => ({
            name: t.name.trim(),
            url: t.url?.trim() || undefined,
            category: t.category?.trim() || undefined,
            confidence: Math.max(0, Math.min(1, Number(t.confidence) || 0)),
            source: t.source?.trim() || "manual",
        }));

    await db.update(competitorIntel)
        .set({
            discoveredTools: validTools,
            lastScannedAt: new Date(),
        })
        .where(
            and(eq(competitorIntel.id, competitorId), eq(competitorIntel.workspaceId, workspaceId))
        );

    revalidatePath("/competitors");
    return { success: true, count: validTools.length };
}
