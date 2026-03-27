export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getWorkspaceId } from "@/lib/db/queries";
import { NotificationPreferencesForm } from "./client";

export const metadata: Metadata = {
    title: "Notification Preferences -- Trackr",
    description: "Manage which emails you receive from Trackr.",
};

type EmailPreferences = {
    weeklyDigest: boolean;
    researchComplete: boolean;
    renewalAlerts: boolean;
    trialReminders: boolean;
};

const DEFAULT_PREFERENCES: EmailPreferences = {
    weeklyDigest: true,
    researchComplete: true,
    renewalAlerts: true,
    trialReminders: true,
};

export default async function NotificationsSettingsPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) redirect("/onboarding");

    const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.id, workspaceId),
        columns: { emailPreferences: true },
    });

    const raw = (workspace?.emailPreferences as Record<string, boolean>) ?? {};
    const prefs: EmailPreferences = {
        weeklyDigest: raw.weeklyDigest !== false,
        researchComplete: raw.researchComplete !== false,
        renewalAlerts: raw.renewalAlerts !== false,
        trialReminders: raw.trialReminders !== false,
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-serif font-normal">
                    Email Notifications
                </h1>
                <p className="font-mono text-sm text-neutral-500 mt-1">
                    Choose which emails Trackr sends to your inbox.
                    Changes save automatically.
                </p>
            </div>

            <NotificationPreferencesForm initialPreferences={prefs} />

            <p className="font-mono text-xs text-neutral-400">
                Disabling a notification only affects email delivery.
                In-app notifications are always on.
            </p>
        </div>
    );
}
