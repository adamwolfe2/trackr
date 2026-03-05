export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkspaceId } from "@/lib/db/queries";
import { checkFeatureAccess } from "@/lib/middleware/require-subscription";
import { PlanGate } from "@/components/billing/plan-gate";
import { getMonthEvents, getUpcomingEvents, generateRenewalEvents } from "@/lib/actions/calendar";
import { CalendarClient } from "@/components/calendar/calendar-client";

export const metadata: Metadata = {
    title: "Calendar — Trackr",
    description: "Track renewals, reviews, deadlines, and custom events for your software stack.",
};

export default async function CalendarPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) redirect("/onboarding");

    // Feature gate: calendar requires Team+
    const plan = await checkFeatureAccess(workspaceId, "calendar");
    if (!plan) {
        return (
            <PlanGate
                featureName="Internal Calendar"
                description="Track renewal dates, review deadlines, and custom events for your entire software stack. Never miss a renewal again."
                requiredPlan="Team"
            />
        );
    }

    // Auto-generate renewal events from spend data
    await generateRenewalEvents(workspaceId);

    // Current month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Fetch data in parallel
    const [monthEvents, upcomingEvents] = await Promise.all([
        getMonthEvents(workspaceId, year, month),
        getUpcomingEvents(workspaceId, 30),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="font-serif text-3xl font-normal">Calendar</h1>
                <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
                    {upcomingEvents.length} upcoming event{upcomingEvents.length !== 1 ? "s" : ""}
                </span>
            </div>

            <CalendarClient
                workspaceId={workspaceId}
                initialEvents={monthEvents}
                initialYear={year}
                initialMonth={month}
                upcomingEvents={upcomingEvents}
            />
        </div>
    );
}
