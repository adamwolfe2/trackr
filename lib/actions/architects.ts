"use server";

import { db } from "@/lib/db";
import {
    architectApplications,
    architects,
    architectCommissions,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
    sendArchitectApproved,
    sendArchitectRejected,
} from "@/lib/email/resend";
import { isAdminAuthenticated } from "@/lib/admin-auth";

function generateArcCode(): string {
    return randomUUID().replace(/-/g, "").substring(0, 8).toUpperCase();
}

async function requireAdmin() {
    const authed = await isAdminAuthenticated();
    if (!authed) throw new Error("Unauthorized: admin access required");
}

export async function approveApplication(applicationId: string) {
    await requireAdmin();
    const application = await db.query.architectApplications.findFirst({
        where: eq(architectApplications.id, applicationId),
    });
    if (!application) throw new Error("Application not found");
    if (application.status !== "pending") throw new Error("Application already reviewed");

    const arcCode = generateArcCode();

    // Update application status
    await db
        .update(architectApplications)
        .set({ status: "approved", reviewedAt: new Date() })
        .where(eq(architectApplications.id, applicationId));

    // Create architect record
    const [architect] = await db
        .insert(architects)
        .values({
            applicationId,
            email: application.email,
            firstName: application.firstName,
            lastName: application.lastName,
            role: application.roleSlug,
            arcCode,
        })
        .returning();

    // Send approval email with onboarding link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com";
    const onboardingUrl = `${appUrl}/architect/dashboard`;
    await sendArchitectApproved(application.email, application.firstName, arcCode, onboardingUrl);

    return architect;
}

export async function rejectApplication(applicationId: string, notes?: string) {
    await requireAdmin();
    const application = await db.query.architectApplications.findFirst({
        where: eq(architectApplications.id, applicationId),
    });
    if (!application) throw new Error("Application not found");
    if (application.status !== "pending") throw new Error("Application already reviewed");

    await db
        .update(architectApplications)
        .set({
            status: "rejected",
            reviewedAt: new Date(),
            reviewNotes: notes || null,
        })
        .where(eq(architectApplications.id, applicationId));

    await sendArchitectRejected(application.email, application.firstName);
}

export async function pauseArchitect(architectId: string) {
    await requireAdmin();
    await db
        .update(architects)
        .set({ status: "paused" })
        .where(eq(architects.id, architectId));
}

export async function terminateArchitect(architectId: string) {
    await requireAdmin();
    await db
        .update(architects)
        .set({ status: "terminated" })
        .where(eq(architects.id, architectId));

    // Void pending commissions
    await db
        .update(architectCommissions)
        .set({ status: "failed" })
        .where(eq(architectCommissions.architectId, architectId));
}
