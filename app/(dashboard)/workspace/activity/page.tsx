export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { researchJobs, tools } from "@/lib/db/schema";
import { eq, inArray, desc } from "drizzle-orm";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";
import { Clock } from "lucide-react";
import { getWorkspaceId } from "@/lib/db/queries";

export const metadata: Metadata = {
    title: "Team Activity — Trackr",
    description: "Full history of team research actions and tool events.",
};

export default async function WorkspaceActivityPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) redirect("/onboarding");

    // All research jobs for this workspace (last 200)
    const workspaceToolIds = db
        .select({ id: tools.id })
        .from(tools)
        .where(eq(tools.workspaceId, workspaceId));

    const jobs = await db.query.researchJobs.findMany({
        with: { tool: { columns: { id: true, name: true } } },
        where: inArray(researchJobs.toolId, workspaceToolIds),
        orderBy: [desc(researchJobs.triggeredAt)],
        limit: 200,
    });

    // Resolve Clerk user IDs to names
    const triggeredByIds = [...new Set(jobs.map((j) => j.triggeredBy).filter(Boolean))] as string[];
    const nameMap = new Map<string, string>();
    if (triggeredByIds.length > 0) {
        try {
            const clerk = await clerkClient();
            const result = await clerk.users.getUserList({ userId: triggeredByIds, limit: 100 });
            for (const u of result.data) {
                const name =
                    [u.firstName, u.lastName].filter(Boolean).join(" ") ||
                    u.emailAddresses[0]?.emailAddress ||
                    "Team Member";
                nameMap.set(u.id, name);
            }
        } catch {
            // Degrade gracefully
        }
    }

    // Group jobs by calendar date
    const grouped: { date: string; jobs: typeof jobs }[] = [];
    for (const job of jobs) {
        const dateKey = format(new Date(job.triggeredAt), "yyyy-MM-dd");
        const last = grouped[grouped.length - 1];
        if (last && last.date === dateKey) {
            last.jobs.push(job);
        } else {
            grouped.push({ date: dateKey, jobs: [job] });
        }
    }

    const statusConfig: Record<string, { label: string; className: string }> = {
        complete: { label: "Done", className: "border-black text-black" },
        running: { label: "Running", className: "border-neutral-400 text-neutral-500" },
        failed: { label: "Failed", className: "border-red-500 text-red-500" },
        queued: { label: "Queued", className: "border-neutral-300 text-neutral-400" },
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-3xl font-normal">Team Activity</h1>
                    <p className="font-mono text-sm text-neutral-500 mt-1">
                        Full history of research jobs and team actions.
                    </p>
                </div>
                <Link
                    href="/queue"
                    className="font-mono text-xs border border-black px-3 py-2 hover:bg-neutral-100 transition-colors"
                >
                    Live Queue →
                </Link>
            </div>

            {jobs.length === 0 ? (
                <div className="border border-black bg-white p-12 text-center">
                    <p className="font-mono text-sm text-neutral-400">No activity yet.</p>
                    <p className="font-mono text-xs text-neutral-400 mt-2">
                        Research a tool to see activity here.
                    </p>
                    <Link
                        href="/submit"
                        className="inline-block mt-4 border border-black px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                    >
                        Submit a Tool →
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {grouped.map(({ date, jobs: dayJobs }) => {
                        const dateObj = new Date(date + "T00:00:00");
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);

                        let dateLabel: string;
                        if (dateObj.getTime() === today.getTime()) {
                            dateLabel = "Today";
                        } else if (dateObj.getTime() === yesterday.getTime()) {
                            dateLabel = "Yesterday";
                        } else {
                            dateLabel = format(dateObj, "MMMM d, yyyy");
                        }

                        return (
                            <div key={date}>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                                        {dateLabel}
                                    </span>
                                    <div className="flex-1 border-t border-neutral-200" />
                                    <span className="font-mono text-[10px] text-neutral-300">
                                        {dayJobs.length} event{dayJobs.length !== 1 ? "s" : ""}
                                    </span>
                                </div>

                                <div className="border border-black bg-white divide-y divide-neutral-100">
                                    {dayJobs.map((job) => {
                                        const cfg = statusConfig[job.status] ?? { label: job.status.toUpperCase(), className: "border-neutral-300 text-neutral-400" };
                                        const triggeredName = job.triggeredBy
                                            ? nameMap.get(job.triggeredBy) ?? "Team Member"
                                            : "Scheduled";
                                        const isCurrentUser = job.triggeredBy === user.id;
                                        const displayName = isCurrentUser ? "You" : triggeredName;
                                        const avatarLetter = triggeredName[0]?.toUpperCase() ?? "?";

                                        return (
                                            <div key={job.id} className="flex items-center gap-4 px-5 py-3.5">
                                                {/* Avatar */}
                                                <div className="h-7 w-7 border border-black flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 bg-neutral-50">
                                                    {job.triggeredBy ? avatarLetter : <Clock className="h-3 w-3 text-neutral-400" />}
                                                </div>

                                                {/* Event text */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-mono text-sm">
                                                        <span className="font-semibold">{displayName}</span>
                                                        {" "}researched{" "}
                                                        <Link
                                                            href={`/tools/${job.toolId}`}
                                                            className="underline underline-offset-2 hover:no-underline"
                                                        >
                                                            {job.tool.name}
                                                        </Link>
                                                    </p>
                                                    <p className="font-mono text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1">
                                                        <Clock className="h-2.5 w-2.5" />
                                                        {formatDistanceToNow(new Date(job.triggeredAt), { addSuffix: true })}
                                                        {" · "}
                                                        {format(new Date(job.triggeredAt), "h:mm a")}
                                                    </p>
                                                </div>

                                                {/* Status badge */}
                                                <span className={`font-mono text-[10px] uppercase border px-2 py-0.5 flex-shrink-0 ${cfg.className}`}>
                                                    {cfg.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {jobs.length === 200 && (
                        <p className="font-mono text-xs text-neutral-400 text-center py-2">
                            Showing last 200 events.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
