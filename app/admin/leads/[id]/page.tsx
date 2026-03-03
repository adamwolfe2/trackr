export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { auditSubmissions, pendingInvitations, workspaces, softwareSpend } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import type { AuditScorecard } from "@/lib/actions/audit";
import { processAuditSubmission } from "@/lib/actions/audit";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const metadata: Metadata = {
    title: "Lead Detail — Trackr Admin",
    robots: { index: false },
};

// ── Types ─────────────────────────────────────────────────────────────────────

type TalkingPoint = {
    topic: string;
    observation: string;
    question: string;
    opportunity: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
    if (score >= 61) return "text-green-700";
    if (score >= 41) return "text-yellow-700";
    return "text-red-700";
}

function scoreBgColor(score: number): string {
    if (score >= 61) return "border-green-400 bg-green-50";
    if (score >= 41) return "border-yellow-400 bg-yellow-50";
    return "border-red-400 bg-red-50";
}

function impactBadge(level: string) {
    const colors: Record<string, string> = {
        High: "bg-red-50 text-red-700 border-red-200",
        Medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
        Low: "bg-neutral-50 text-neutral-600 border-neutral-200",
    };
    return colors[level] ?? colors.Low;
}

function aiRoleBadge(role: string) {
    const colors: Record<string, string> = {
        "AI-native": "bg-green-50 text-green-700 border-green-200",
        "AI-assisted": "bg-blue-50 text-blue-700 border-blue-200",
        "Non-AI core infra": "bg-neutral-50 text-neutral-600 border-neutral-200",
    };
    return colors[role] ?? colors["Non-AI core infra"];
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function LeadDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const authed = await isAdminAuthenticated();
    if (!authed) redirect("/admin/leads");

    const { id } = await params;
    const submission = await db.query.auditSubmissions.findFirst({
        where: eq(auditSubmissions.id, id),
    });
    if (!submission) notFound();

    const scorecard = submission.scorecard as AuditScorecard | null;
    const talkingPoints = submission.talkingPoints as TalkingPoint[] | null;
    const score = scorecard?.aiNativeScore?.score ?? null;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://trytrackr.com";
    const shareUrl = submission.shareToken
        ? `${appUrl}/audit/share/${submission.shareToken}`
        : null;

    // Workspace info
    let workspaceName: string | null = null;
    let toolCount = 0;
    if (submission.preBuiltWorkspaceId) {
        const ws = await db.query.workspaces.findFirst({
            where: eq(workspaces.id, submission.preBuiltWorkspaceId),
        });
        workspaceName = ws?.name ?? null;
        const [{ value }] = await db
            .select({ value: count() })
            .from(softwareSpend)
            .where(eq(softwareSpend.workspaceId, submission.preBuiltWorkspaceId));
        toolCount = Number(value);
    }

    // ── Server Actions ────────────────────────────────────────────────────────

    async function saveNotes(formData: FormData) {
        "use server";
        const notes = formData.get("notes") as string;
        await db.update(auditSubmissions)
            .set({ salesRepNotes: notes })
            .where(eq(auditSubmissions.id, id));
    }

    async function sendInvite() {
        "use server";
        if (!submission?.preBuiltWorkspaceId || !submission.contactEmail) {
            throw new Error("Missing workspace or contact email");
        }
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const [invite] = await db.insert(pendingInvitations).values({
            workspaceId: submission.preBuiltWorkspaceId,
            email: submission.contactEmail,
            invitedByUserId: "admin",
            expiresAt,
        }).returning();

        try {
            const { sendInviteEmail } = await import("@/lib/email/resend");
            await sendInviteEmail(
                submission.contactEmail,
                submission.companyName,
                "Trackr Team",
                invite.id,
            );
        } catch {
            // Non-fatal — invite row created even if email fails
        }
        redirect(`/admin/leads/${id}?invited=1`);
    }

    async function markCalled() {
        "use server";
        await db.update(auditSubmissions)
            .set({ status: "complete", assignedRep: "called" })
            .where(eq(auditSubmissions.id, id));
        redirect(`/admin/leads/${id}?called=1`);
    }

    async function retryScorecard() {
        "use server";
        await db.update(auditSubmissions)
            .set({ status: "processing", errorMessage: null })
            .where(eq(auditSubmissions.id, id));
        const { after } = await import("next/server");
        after(async () => { await processAuditSubmission(id); });
        redirect(`/admin/leads/${id}?retrying=1`);
    }

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-8 pb-32">
            {/* Back nav */}
            <div className="flex items-center gap-4">
                <a href="/admin/leads" className="font-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-black">
                    ← All Leads
                </a>
            </div>

            {/* Header */}
            <div className="border border-black p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">
                            {submission.industry || "Unknown industry"} · {submission.companySize || "Unknown size"}
                        </p>
                        <h1 className="font-serif text-3xl font-normal mb-2">{submission.companyName}</h1>
                        <div className="flex items-center gap-3 flex-wrap">
                            {submission.contactName && (
                                <span className="font-mono text-sm">{submission.contactName}</span>
                            )}
                            {submission.role && (
                                <span className="font-mono text-xs text-neutral-500">· {submission.role}</span>
                            )}
                            <a
                                href={`mailto:${submission.contactEmail}`}
                                className="font-mono text-xs text-neutral-500 hover:text-black underline"
                            >
                                {submission.contactEmail}
                            </a>
                            {submission.companyWebsite && (
                                <a
                                    href={submission.companyWebsite.startsWith("http") ? submission.companyWebsite : `https://${submission.companyWebsite}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-xs text-neutral-500 hover:text-black underline"
                                >
                                    {submission.companyWebsite.replace(/^https?:\/\//, "")}
                                </a>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`font-mono text-[10px] uppercase tracking-widest border px-2 py-1 ${
                            submission.status === "complete" ? "border-green-200 text-green-700" :
                            submission.status === "processing" ? "border-yellow-200 text-yellow-700" :
                            submission.status === "failed" ? "border-red-200 text-red-700" :
                            "border-neutral-200 text-neutral-500"
                        }`}>
                            {submission.status}
                        </span>
                        {submission.status === "failed" && (
                            <form action={retryScorecard}>
                                <button type="submit" className="font-mono text-[10px] uppercase tracking-widest border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors">
                                    Retry Scorecard
                                </button>
                            </form>
                        )}
                        <span className="font-mono text-xs text-neutral-400">
                            {new Date(submission.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Score */}
            {score !== null && scorecard && (
                <div className={`border-2 p-6 ${scoreBgColor(score)}`}>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-2">AI-Native Score</p>
                    <div className="flex items-end gap-4 mb-3">
                        <span className={`font-mono text-7xl font-black leading-none ${scoreColor(score)}`}>{score}</span>
                        <span className="font-mono text-2xl text-neutral-400 mb-2">/100</span>
                    </div>
                    <p className="font-mono text-sm text-neutral-700">{scorecard.aiNativeScore.summary}</p>
                </div>
            )}

            {/* Talking Points */}
            {talkingPoints && talkingPoints.length > 0 && (
                <div className="border border-black">
                    <div className="border-b border-black px-5 py-3">
                        <h2 className="font-mono text-xs uppercase tracking-widest">Call Prep: Talking Points</h2>
                    </div>
                    <div className="p-5 space-y-4">
                        {talkingPoints.map((tp, i) => (
                            <div key={i} className="border border-neutral-200 p-4 bg-white">
                                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-3">
                                    {i + 1}. {tp.topic}
                                </p>
                                <div className="space-y-2">
                                    <div>
                                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mr-2">Found:</span>
                                        <span className="font-mono text-xs text-neutral-700">{tp.observation}</span>
                                    </div>
                                    <div>
                                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mr-2">Ask:</span>
                                        <span className="font-mono text-xs text-black font-semibold">"{tp.question}"</span>
                                    </div>
                                    <div>
                                        <span className="font-mono text-[10px] uppercase tracking-widest text-green-600 mr-2">Opportunity:</span>
                                        <span className="font-mono text-xs text-neutral-700">{tp.opportunity}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Pain Points */}
            {scorecard && scorecard.painPoints.length > 0 && (
                <div className="border border-black">
                    <div className="border-b border-black px-5 py-3">
                        <h2 className="font-mono text-xs uppercase tracking-widest">Pain Points</h2>
                    </div>
                    <div className="divide-y divide-neutral-100">
                        {scorecard.painPoints.map((p, i) => (
                            <div key={i} className="px-5 py-3 flex gap-4">
                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 w-24 shrink-0 pt-0.5">{p.area}</span>
                                <span className="font-mono text-xs text-neutral-700">{p.description}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Current Stack */}
            {scorecard && scorecard.currentStack.length > 0 && (
                <div className="border border-black">
                    <div className="border-b border-black px-5 py-3">
                        <h2 className="font-mono text-xs uppercase tracking-widest">Current Stack</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-200">
                                    <th className="text-left px-5 py-2 font-mono text-[10px] uppercase tracking-widest text-neutral-400">Tool</th>
                                    <th className="text-left px-5 py-2 font-mono text-[10px] uppercase tracking-widest text-neutral-400">Category</th>
                                    <th className="text-left px-5 py-2 font-mono text-[10px] uppercase tracking-widest text-neutral-400">AI Role</th>
                                    <th className="text-left px-5 py-2 font-mono text-[10px] uppercase tracking-widest text-neutral-400">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scorecard.currentStack.map((t, i) => (
                                    <tr key={i} className="border-b border-neutral-100">
                                        <td className="px-5 py-3 font-mono text-sm font-bold">{t.name}</td>
                                        <td className="px-5 py-3 font-mono text-xs text-neutral-500">{t.category}</td>
                                        <td className="px-5 py-3">
                                            <span className={`font-mono text-[10px] uppercase tracking-widest border px-1.5 py-0.5 ${aiRoleBadge(t.aiRole)}`}>
                                                {t.aiRole}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 font-mono text-xs text-neutral-600">{t.usageNotes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {scorecard && scorecard.recommendations.length > 0 && (
                <div className="border border-black">
                    <div className="border-b border-black px-5 py-3">
                        <h2 className="font-mono text-xs uppercase tracking-widest">Recommendations</h2>
                    </div>
                    <div className="p-5 space-y-3">
                        {scorecard.recommendations.map((r, i) => (
                            <div key={i} className="border-l-4 border-black pl-4 py-2">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <p className="font-mono text-xs font-bold uppercase tracking-widest">
                                        {i + 1}. {r.title}
                                    </p>
                                    <div className="flex gap-1 shrink-0">
                                        <span className={`font-mono text-[10px] border px-1.5 py-0.5 ${impactBadge(r.impact)}`}>
                                            Impact: {r.impact}
                                        </span>
                                        <span className={`font-mono text-[10px] border px-1.5 py-0.5 ${impactBadge(r.difficulty)}`}>
                                            Effort: {r.difficulty}
                                        </span>
                                    </div>
                                </div>
                                <p className="font-mono text-xs text-neutral-600">{r.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Pre-built Workspace */}
            <div className="border border-black p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-3">Pre-built Workspace</p>
                {submission.preBuiltWorkspaceId ? (
                    <div className="space-y-1">
                        <p className="font-mono text-sm font-bold">{workspaceName ?? submission.companyName}</p>
                        <p className="font-mono text-xs text-neutral-500">
                            {toolCount} tool{toolCount !== 1 ? "s" : ""} seeded from audit responses
                        </p>
                        <p className="font-mono text-[10px] text-neutral-400 font-mono break-all">
                            ID: {submission.preBuiltWorkspaceId}
                        </p>
                    </div>
                ) : (
                    <p className="font-mono text-xs text-neutral-400">Workspace not yet provisioned — audit may still be processing.</p>
                )}
            </div>

            {/* Rep Notes */}
            <div className="border border-black">
                <div className="border-b border-black px-5 py-3">
                    <h2 className="font-mono text-xs uppercase tracking-widest">Rep Notes</h2>
                </div>
                <form action={saveNotes} className="p-5">
                    <textarea
                        name="notes"
                        defaultValue={submission.salesRepNotes ?? ""}
                        placeholder="Add your call prep notes, objections, follow-ups..."
                        className="w-full h-32 font-mono text-xs border border-neutral-200 p-3 bg-white focus:outline-none focus:border-black resize-none"
                    />
                    <button
                        type="submit"
                        className="mt-2 font-mono text-xs uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
                    >
                        Save Notes
                    </button>
                </form>
            </div>

            {/* Sticky Actions Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#F3F3EF] border-t-2 border-black px-6 py-4 z-50">
                <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap">
                    {shareUrl && (
                        <a
                            href={shareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs uppercase tracking-widest border border-black px-4 py-2 hover:bg-neutral-100 transition-colors"
                        >
                            Open Scorecard Share Link →
                        </a>
                    )}

                    {submission.preBuiltWorkspaceId && (
                        <form action={sendInvite}>
                            <button
                                type="submit"
                                className="font-mono text-xs uppercase tracking-widest border border-black bg-black text-white px-4 py-2 hover:bg-neutral-800 transition-colors"
                            >
                                Send Workspace Invite
                            </button>
                        </form>
                    )}

                    <form action={markCalled}>
                        <button
                            type="submit"
                            className="font-mono text-xs uppercase tracking-widest border border-neutral-400 text-neutral-600 px-4 py-2 hover:border-black hover:text-black transition-colors"
                        >
                            Mark Called
                        </button>
                    </form>

                    {!shareUrl && !scorecard && (
                        <p className="font-mono text-xs text-neutral-400">
                            Scorecard still processing — actions available once complete.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
