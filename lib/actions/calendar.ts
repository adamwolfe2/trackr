"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { calendarEvents, softwareSpend } from "@/lib/db/schema";
import { eq, and, gte, lte, asc } from "drizzle-orm";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VALID_EVENT_TYPES = ["renewal", "review", "deadline", "procurement", "custom"] as const;
type EventType = typeof VALID_EVENT_TYPES[number];

// ─── Create Event ──────────────────────────────────────────────────────────

export async function createCalendarEvent(
    workspaceId: string,
    data: {
        title: string;
        description?: string;
        eventDate: string; // ISO string
        endDate?: string;
        eventType: string;
        relatedToolId?: string;
        relatedSpendId?: string;
        createdBy?: string;
    }
) {
    const title = data.title?.trim();
    if (!title) throw new Error("Event title is required");
    if (title.length > 200) throw new Error("Title too long");

    if (!VALID_EVENT_TYPES.includes(data.eventType as EventType)) {
        throw new Error("Invalid event type");
    }

    const eventDate = new Date(data.eventDate);
    if (isNaN(eventDate.getTime())) throw new Error("Invalid event date");

    let endDate: Date | null = null;
    if (data.endDate) {
        endDate = new Date(data.endDate);
        if (isNaN(endDate.getTime())) throw new Error("Invalid end date");
    }

    const [created] = await db
        .insert(calendarEvents)
        .values({
            workspaceId,
            title,
            description: data.description?.trim() || null,
            eventDate,
            endDate,
            eventType: data.eventType,
            relatedToolId: data.relatedToolId && UUID_RE.test(data.relatedToolId) ? data.relatedToolId : null,
            relatedSpendId: data.relatedSpendId && UUID_RE.test(data.relatedSpendId) ? data.relatedSpendId : null,
            createdBy: data.createdBy || null,
        })
        .returning();

    revalidatePath("/calendar");
    return { success: true, event: created };
}

// ─── Update Event ──────────────────────────────────────────────────────────

export async function updateCalendarEvent(
    eventId: string,
    workspaceId: string,
    data: {
        title?: string;
        description?: string;
        eventDate?: string;
        endDate?: string;
        eventType?: string;
        isCompleted?: boolean;
    }
) {
    if (!UUID_RE.test(eventId)) throw new Error("Invalid event ID");
    if (!UUID_RE.test(workspaceId)) throw new Error("Invalid workspace ID");

    const updates: Record<string, unknown> = {};

    if (data.title !== undefined) {
        const title = data.title.trim();
        if (!title) throw new Error("Event title cannot be empty");
        if (title.length > 200) throw new Error("Title too long");
        updates.title = title;
    }

    if (data.description !== undefined) {
        updates.description = data.description.trim() || null;
    }

    if (data.eventDate !== undefined) {
        const d = new Date(data.eventDate);
        if (isNaN(d.getTime())) throw new Error("Invalid event date");
        updates.eventDate = d;
    }

    if (data.endDate !== undefined) {
        if (data.endDate) {
            const d = new Date(data.endDate);
            if (isNaN(d.getTime())) throw new Error("Invalid end date");
            updates.endDate = d;
        } else {
            updates.endDate = null;
        }
    }

    if (data.eventType !== undefined) {
        if (!VALID_EVENT_TYPES.includes(data.eventType as EventType)) {
            throw new Error("Invalid event type");
        }
        updates.eventType = data.eventType;
    }

    if (data.isCompleted !== undefined) {
        updates.isCompleted = data.isCompleted;
    }

    if (Object.keys(updates).length === 0) {
        throw new Error("No fields to update");
    }

    // Verify event belongs to workspace before updating
    const existing = await db.query.calendarEvents.findFirst({
        where: and(eq(calendarEvents.id, eventId), eq(calendarEvents.workspaceId, workspaceId)),
        columns: { id: true },
    });
    if (!existing) throw new Error("Event not found or unauthorized");

    await db
        .update(calendarEvents)
        .set(updates)
        .where(and(eq(calendarEvents.id, eventId), eq(calendarEvents.workspaceId, workspaceId)));

    revalidatePath("/calendar");
    return { success: true };
}

// ─── Delete Event ──────────────────────────────────────────────────────────

export async function deleteCalendarEvent(eventId: string, workspaceId: string) {
    if (!UUID_RE.test(eventId)) throw new Error("Invalid event ID");
    if (!UUID_RE.test(workspaceId)) throw new Error("Invalid workspace ID");

    await db
        .delete(calendarEvents)
        .where(and(eq(calendarEvents.id, eventId), eq(calendarEvents.workspaceId, workspaceId)));

    revalidatePath("/calendar");
    return { success: true };
}

// ─── Get Month Events ──────────────────────────────────────────────────────

export async function getMonthEvents(
    workspaceId: string,
    year: number,
    month: number
) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const events = await db.query.calendarEvents.findMany({
        where: and(
            eq(calendarEvents.workspaceId, workspaceId),
            gte(calendarEvents.eventDate, start),
            lte(calendarEvents.eventDate, end)
        ),
        with: {
            tool: { columns: { id: true, name: true } },
        },
        orderBy: [asc(calendarEvents.eventDate)],
    });

    return events.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        eventDate: e.eventDate.toISOString(),
        endDate: e.endDate?.toISOString() ?? null,
        eventType: e.eventType,
        isCompleted: e.isCompleted,
        relatedToolId: e.relatedToolId,
        relatedToolName: e.tool?.name ?? null,
        createdBy: e.createdBy,
    }));
}

// ─── Get Upcoming Events ───────────────────────────────────────────────────

export async function getUpcomingEvents(
    workspaceId: string,
    days: number = 30
) {
    const now = new Date();
    const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const events = await db.query.calendarEvents.findMany({
        where: and(
            eq(calendarEvents.workspaceId, workspaceId),
            gte(calendarEvents.eventDate, now),
            lte(calendarEvents.eventDate, end)
        ),
        with: {
            tool: { columns: { id: true, name: true } },
        },
        orderBy: [asc(calendarEvents.eventDate)],
    });

    return events.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        eventDate: e.eventDate.toISOString(),
        endDate: e.endDate?.toISOString() ?? null,
        eventType: e.eventType,
        isCompleted: e.isCompleted,
        relatedToolId: e.relatedToolId,
        relatedToolName: e.tool?.name ?? null,
        createdBy: e.createdBy,
    }));
}

// ─── Generate Renewal Events ───────────────────────────────────────────────

export async function generateRenewalEvents(workspaceId: string) {
    // Get all active spend items with a renewal date
    const spendEntries = await db.query.softwareSpend.findMany({
        where: eq(softwareSpend.workspaceId, workspaceId),
        columns: {
            id: true,
            toolName: true,
            renewalDate: true,
            status: true,
        },
    });

    const withRenewal = spendEntries.filter(
        (s) => s.status === "active" && s.renewalDate !== null
    );

    if (withRenewal.length === 0) return { created: 0 };

    // Get existing renewal events to avoid duplicates
    const existingEvents = await db.query.calendarEvents.findMany({
        where: and(
            eq(calendarEvents.workspaceId, workspaceId),
            eq(calendarEvents.eventType, "renewal")
        ),
        columns: { relatedSpendId: true, eventDate: true },
    });

    const existingSet = new Set(
        existingEvents.map(
            (e) => `${e.relatedSpendId}:${e.eventDate.toISOString().split("T")[0]}`
        )
    );

    const toCreate = withRenewal.filter((s) => {
        const dateKey = new Date(s.renewalDate!).toISOString().split("T")[0];
        return !existingSet.has(`${s.id}:${dateKey}`);
    });

    if (toCreate.length === 0) return { created: 0 };

    await db.insert(calendarEvents).values(
        toCreate.map((s) => ({
            workspaceId,
            title: `${s.toolName} Renewal`,
            eventDate: new Date(s.renewalDate!),
            eventType: "renewal" as const,
            relatedSpendId: s.id,
        }))
    );

    revalidatePath("/calendar");
    return { created: toCreate.length };
}
