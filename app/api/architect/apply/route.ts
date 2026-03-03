/**
 * POST /api/architect/apply
 *
 * Public endpoint — no auth required.
 * Accepts architect application form data, persists it, then sends
 * notification emails via after().
 */

import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { db } from "@/lib/db";
import { architectApplications } from "@/lib/db/schema";
import { rateLimit } from "@/lib/middleware/rate-limit";
import { sendArchitectApplicationReceived, sendArchitectApplicationNotification } from "@/lib/email/resend";
import { ARCHITECT_ROLES } from "@/lib/config/architect-roles";
import { z } from "zod";

const ArchitectApplySchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().optional(),
    linkedinUrl: z.string().url().optional().or(z.literal("")),
    roleSlug: z.string().min(1, "Role is required"),
    experience: z.string().optional(),
    portfolioUrl: z.string().url().optional().or(z.literal("")),
    referralSource: z.string().optional(),
});

export async function POST(req: NextRequest) {
    // Rate limit: 3 per email per day + 10 per IP per hour
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const ipRl = await rateLimit(`architect-apply-ip:${ip}`, { limit: 10, windowSeconds: 3600 });
    if (!ipRl.success) {
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429 }
        );
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = ArchitectApplySchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? "Invalid form data" },
            { status: 400 }
        );
    }

    const data = parsed.data;

    // Rate limit per email: 3 per day
    const emailRl = await rateLimit(`architect-apply-email:${data.email}`, { limit: 3, windowSeconds: 86400 });
    if (!emailRl.success) {
        return NextResponse.json(
            { error: "You've already submitted an application. Please wait for a response." },
            { status: 429 }
        );
    }

    const [application] = await db
        .insert(architectApplications)
        .values({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone || null,
            linkedinUrl: data.linkedinUrl || null,
            roleSlug: data.roleSlug,
            experience: data.experience || null,
            portfolioUrl: data.portfolioUrl || null,
            referralSource: data.referralSource || null,
            status: "pending",
        })
        .returning();

    // Send confirmation + admin notification in background
    after(async () => {
        await sendArchitectApplicationReceived(data.email, data.firstName);
    });

    after(async () => {
        const roleTitle = ARCHITECT_ROLES.find(r => r.slug === data.roleSlug)?.title ?? data.roleSlug;
        await sendArchitectApplicationNotification(
            application.id,
            `${data.firstName} ${data.lastName}`,
            roleTitle
        );
    });

    return NextResponse.json({ success: true });
}
