"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
    publicProfiles,
    tools,
    softwareSpend,
    stackHealthScores,
    workspaces,
    workspaceMembers,
} from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { computeStackInsights } from "@/lib/utils/stack-insights";

async function requireWorkspace() {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");
    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
        columns: { workspaceId: true, role: true },
        orderBy: (wm, { asc }) => [asc(wm.joinedAt)],
    });
    if (!member) throw new Error("No workspace found");
    return member;
}

// ── Types ────────────────────────────────────────────────────────

type CreateProfileInput = {
    slug: string;
    headline?: string;
    description?: string;
};

type UpdateProfileInput = {
    slug?: string;
    headline?: string;
    description?: string;
    showScores?: boolean;
    showSpend?: boolean;
    showHealth?: boolean;
};

// ── Create Public Profile ────────────────────────────────────────

export async function createPublicProfile(workspaceId: string, data: CreateProfileInput) {
    const member = await requireWorkspace();
    if (member.workspaceId !== workspaceId) throw new Error("Unauthorized");
    if (member.role !== "owner" && member.role !== "admin") throw new Error("Only workspace owners or admins can manage public profiles");

    // Validate slug format
    const slug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (!slug || slug.length < 3) {
        throw new Error("Slug must be at least 3 characters");
    }

    // Block slugs that shadow system routes
    const RESERVED_SLUGS = new Set([
        "admin", "api", "research", "audit", "apply", "terms", "privacy", "security",
        "faq", "changelog", "blog", "about", "contact", "playbook", "industries",
        "share", "sign-in", "sign-up", "onboarding", "dashboard", "settings",
        "workspace", "invite", "stack",
    ]);
    if (RESERVED_SLUGS.has(slug)) {
        throw new Error(`"${slug}" is a reserved slug. Please choose a different URL.`);
    }

    // Check slug uniqueness
    const existing = await db.query.publicProfiles.findFirst({
        where: eq(publicProfiles.slug, slug),
    });
    if (existing) {
        throw new Error("This URL slug is already taken");
    }

    // Check if workspace already has a profile
    const existingProfile = await db.query.publicProfiles.findFirst({
        where: eq(publicProfiles.workspaceId, workspaceId),
    });
    if (existingProfile) {
        throw new Error("Workspace already has a public profile");
    }

    const [profile] = await db
        .insert(publicProfiles)
        .values({
            workspaceId,
            slug,
            headline: data.headline ?? null,
            description: data.description ?? null,
        })
        .returning();

    revalidatePath("/settings/public-profile");
    return profile;
}

// ── Update Public Profile ────────────────────────────────────────

export async function updatePublicProfile(workspaceId: string, data: UpdateProfileInput) {
    const member = await requireWorkspace();
    if (member.workspaceId !== workspaceId) throw new Error("Unauthorized");
    if (member.role !== "owner" && member.role !== "admin") throw new Error("Only workspace owners or admins can manage public profiles");

    // If slug is being changed, validate uniqueness
    if (data.slug !== undefined) {
        const slug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
        if (!slug || slug.length < 3) {
            throw new Error("Slug must be at least 3 characters");
        }

        const existing = await db.query.publicProfiles.findFirst({
            where: and(
                eq(publicProfiles.slug, slug),
            ),
        });
        if (existing && existing.workspaceId !== workspaceId) {
            throw new Error("This URL slug is already taken");
        }
        data.slug = slug;
    }

    const [updated] = await db
        .update(publicProfiles)
        .set({
            ...(data.slug !== undefined && { slug: data.slug }),
            ...(data.headline !== undefined && { headline: data.headline }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.showScores !== undefined && { showScores: data.showScores }),
            ...(data.showSpend !== undefined && { showSpend: data.showSpend }),
            ...(data.showHealth !== undefined && { showHealth: data.showHealth }),
            updatedAt: new Date(),
        })
        .where(eq(publicProfiles.workspaceId, workspaceId))
        .returning();

    revalidatePath("/settings/public-profile");
    return updated;
}

// ── Publish / Unpublish ──────────────────────────────────────────

export async function publishProfile(workspaceId: string) {
    const member = await requireWorkspace();
    if (member.workspaceId !== workspaceId) throw new Error("Unauthorized");
    if (member.role !== "owner" && member.role !== "admin") throw new Error("Only workspace owners or admins can manage public profiles");

    const [updated] = await db
        .update(publicProfiles)
        .set({ isPublished: true, updatedAt: new Date() })
        .where(eq(publicProfiles.workspaceId, workspaceId))
        .returning();

    revalidatePath("/settings/public-profile");
    return updated;
}

export async function unpublishProfile(workspaceId: string) {
    const member = await requireWorkspace();
    if (member.workspaceId !== workspaceId) throw new Error("Unauthorized");
    if (member.role !== "owner" && member.role !== "admin") throw new Error("Only workspace owners or admins can manage public profiles");

    const [updated] = await db
        .update(publicProfiles)
        .set({ isPublished: false, updatedAt: new Date() })
        .where(eq(publicProfiles.workspaceId, workspaceId))
        .returning();

    revalidatePath("/settings/public-profile");
    return updated;
}

// ── Get Public Profile (no auth required) ────────────────────────

export async function getPublicProfile(slug: string) {
    const profile = await db.query.publicProfiles.findFirst({
        where: eq(publicProfiles.slug, slug),
    });

    if (!profile || !profile.isPublished) return null;

    // Fetch workspace info
    const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.id, profile.workspaceId),
        columns: { id: true, name: true },
    });

    if (!workspace) return null;

    // Fetch tools with scores
    const workspaceTools = await db.query.tools.findMany({
        where: eq(tools.workspaceId, profile.workspaceId),
        columns: {
            id: true,
            name: true,
            category: true,
            overallScore: true,
            status: true,
            logoUrl: true,
            websiteUrl: true,
        },
        orderBy: [desc(tools.overallScore)],
    });

    // Fetch spend data (only if profile shows spend)
    let spendSummary = null;
    if (profile.showSpend) {
        const spendEntries = await db.query.softwareSpend.findMany({
            where: eq(softwareSpend.workspaceId, profile.workspaceId),
        });
        const insights = computeStackInsights(spendEntries);
        spendSummary = {
            totalMonthlySpend: insights.totalActiveSpend,
            toolCount: spendEntries.filter((e) => e.status === "active").length,
            score: insights.score,
            label: insights.label,
        };
    }

    // Fetch latest health score
    let healthScore = null;
    if (profile.showHealth) {
        const latest = await db.query.stackHealthScores.findFirst({
            where: eq(stackHealthScores.workspaceId, profile.workspaceId),
            orderBy: [desc(stackHealthScores.computedAt)],
        });
        if (latest) {
            healthScore = {
                score: latest.score,
                breakdown: latest.breakdown,
                computedAt: latest.computedAt,
            };
        }
    }

    // Compute AI nativeness from spend data (always available for the score)
    const spendEntries = await db.query.softwareSpend.findMany({
        where: eq(softwareSpend.workspaceId, profile.workspaceId),
    });
    const insights = computeStackInsights(spendEntries);

    return {
        profile,
        workspace,
        tools: workspaceTools.filter((t) => t.status === "active"),
        spendSummary,
        healthScore,
        aiNativeness: {
            score: insights.score,
            label: insights.label,
            aiNativeCount: insights.aiNativeCount,
            aiEnabledCount: insights.aiEnabledCount,
            traditionalCount: insights.traditionalCount,
        },
    };
}

// ── Get Profile For Dashboard (auth required) ────────────────────

export async function getWorkspaceProfile(workspaceId: string) {
    const member = await requireWorkspace();
    if (member.workspaceId !== workspaceId) throw new Error("Unauthorized");

    return db.query.publicProfiles.findFirst({
        where: eq(publicProfiles.workspaceId, workspaceId),
    });
}
