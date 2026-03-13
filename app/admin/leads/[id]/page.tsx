export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { auditSubmissions, pendingInvitations, workspaces, softwareSpend } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import type { AuditScorecard } from "@/lib/actions/audit";
import { processAuditSubmission } from "@/lib/actions/audit";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { ExternalLink } from "lucide-react";
import { LogoImage } from "@/components/common/logo-image";

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

type RecommendedTool = {
    name: string;
    websiteDomain: string | null;
    category: string;
    reason: string;
    estimatedCostPerUser: string | null;
    impact: "High" | "Medium" | "Low";
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
    if (score >= 61) return "text-green-700";
    if (score >= 41) return "text-yellow-700";
    return "text-red-700";
}

function scoreBarColor(score: number): string {
    if (score >= 61) return "bg-green-600";
    if (score >= 41) return "bg-yellow-500";
    return "bg-red-500";
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

/** Returns Clearbit as primary, Google favicon as fallback */
function toolLogos(name: string, domain?: string | null) {
    const d = domain ?? `${name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "")}.com`;
    return {
        src: `https://logo.clearbit.com/${d}`,
        fallbackSrc: `https://www.google.com/s2/favicons?sz=64&domain=${d}`,
    };
}

/** Returns Clearbit as primary, Google favicon sz=128 as fallback */
function companyLogos(website: string): { src: string; fallbackSrc: string } | null {
    try {
        const url = website.startsWith("http") ? website : `https://${website}`;
        const domain = new URL(url).hostname.replace("www.", "");
        return {
            src: `https://logo.clearbit.com/${domain}`,
            fallbackSrc: `https://www.google.com/s2/favicons?sz=128&domain=${domain}`,
        };
    } catch {
        return null;
    }
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
    const recommendedTools = (scorecard as (AuditScorecard & { recommendedTools?: RecommendedTool[] }) | null)?.recommendedTools ?? [];

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://trytrackr.com";
    const shareUrl = submission.shareToken
        ? `${appUrl}/audit/share/${submission.shareToken}`
        : null;

    const websiteHostname = (() => {
        if (!submission.companyWebsite) return null;
        try {
            const url = submission.companyWebsite.startsWith("http")
                ? submission.companyWebsite
                : `https://${submission.companyWebsite}`;
            return new URL(url).hostname.replace("www.", "");
        } catch {
            return submission.companyWebsite;
        }
    })();

    const companyLogoUrls = submission.companyWebsite ? companyLogos(submission.companyWebsite) : null;

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
        <div className="space-y-6 pb-32">
            {/* Back nav */}
            <div className="flex items-center gap-4">
                <a href="/admin/leads" className="font-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-black">
                    ← All Leads
                </a>
            </div>

            {/* ── Hero Card ─────────────────────────────────────────────────── */}
            <div className="border border-black p-6">
                <div className="flex items-start gap-5">
                    {/* Company logo — Clearbit → Google favicon → initial */}
                    <div className="w-16 h-16 border border-neutral-200 p-1.5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {companyLogoUrls ? (
                            <LogoImage
                                src={companyLogoUrls.src}
                                fallbackSrc={companyLogoUrls.fallbackSrc}
                                alt={submission.companyName}
                                fallbackChar={submission.companyName}
                                className="w-full h-full"
                                fallbackClassName="w-16 h-16 text-lg"
                            />
                        ) : (
                            <div className="w-16 h-16 flex items-center justify-center font-mono font-bold text-xl text-neutral-400 bg-neutral-100">
                                {submission.companyName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">
                            {[submission.industry, submission.companySize, submission.employeeCount ? `${submission.employeeCount} employees` : null]
                                .filter(Boolean).join(" · ")}
                        </p>
                        <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                            <h1 className="font-serif text-3xl font-normal">{submission.companyName}</h1>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`font-mono text-[10px] uppercase tracking-widest border px-2 py-1 ${
                                    submission.status === "complete" ? "border-green-200 text-green-700" :
                                    submission.status === "processing" ? "border-yellow-200 text-yellow-700" :
                                    submission.status === "failed" ? "border-red-200 text-red-700" :
                                    "border-neutral-200 text-neutral-500"
                                }`}>
                                    {submission.status}
                                </span>
                                {(submission.status === "failed" || submission.status === "complete") && (
                                    <form action={retryScorecard}>
                                        <button type="submit" className="font-mono text-[10px] uppercase tracking-widest border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors">
                                            {submission.status === "failed" ? "Retry" : "Regenerate"}
                                        </button>
                                    </form>
                                )}
                                <span className="font-mono text-xs text-neutral-400">
                                    {new Date(submission.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap font-mono text-xs text-neutral-500">
                            {submission.contactName && <span className="font-medium text-black">{submission.contactName}</span>}
                            {submission.role && <span>· {submission.role}</span>}
                            <a href={`mailto:${submission.contactEmail}`} className="hover:text-black underline">
                                {submission.contactEmail}
                            </a>
                            {websiteHostname && (
                                <a
                                    href={submission.companyWebsite!.startsWith("http") ? submission.companyWebsite! : `https://${submission.companyWebsite}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-black flex items-center gap-1"
                                >
                                    {websiteHostname} <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Score bar */}
                {score !== null && scorecard && (
                    <div className="mt-5 pt-5 border-t border-neutral-200">
                        <div className="flex items-center gap-5">
                            <div className="flex-shrink-0 text-center">
                                <span className={`font-mono text-5xl font-black leading-none ${scoreColor(score)}`}>{score}</span>
                                <span className="font-mono text-lg text-neutral-300">/100</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">AI-Native Score</span>
                                    <span className="font-mono text-[10px] text-neutral-400">
                                        {score < 21 ? "Not using AI" : score < 41 ? "Ad-hoc" : score < 61 ? "Moderate" : score < 81 ? "Structured" : "AI-native"}
                                    </span>
                                </div>
                                <div className="h-2.5 w-full bg-neutral-100 border border-neutral-200">
                                    <div className={`h-full ${scoreBarColor(score)} transition-all`} style={{ width: `${score}%` }} />
                                </div>
                                <p className="font-mono text-xs text-neutral-600 mt-2 leading-relaxed">{scorecard.aiNativeScore.summary}</p>
                            </div>
                        </div>
                    </div>
                )}

                {submission.status === "failed" && submission.errorMessage && (
                    <div className="mt-4 border border-red-200 bg-red-50 px-4 py-3">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-red-600 mb-1">Pipeline Error</p>
                        <p className="font-mono text-xs text-red-700 break-all">{submission.errorMessage}</p>
                    </div>
                )}
            </div>

            {/* ── Current Stack + Recommended Tools ─────────────────────────── */}
            {scorecard && (scorecard.currentStack.length > 0 || recommendedTools.length > 0) && (
                <div className="grid lg:grid-cols-2 gap-6">

                    {/* Current Stack */}
                    {scorecard.currentStack.length > 0 && (
                        <div className="border border-black">
                            <div className="border-b border-black px-5 py-3">
                                <h2 className="font-mono text-xs uppercase tracking-widest">Current Stack</h2>
                            </div>

                            {/* Logo strip — all tool logos at a glance */}
                            <div className="px-5 py-4 border-b border-neutral-100 flex flex-wrap gap-2.5">
                                {scorecard.currentStack.map((t, i) => {
                                    const logos = toolLogos(t.name);
                                    return (
                                        <div
                                            key={i}
                                            title={t.name}
                                            className="w-10 h-10 border border-neutral-200 p-1 flex items-center justify-center overflow-hidden"
                                        >
                                            <LogoImage
                                                src={logos.src}
                                                fallbackSrc={logos.fallbackSrc}
                                                alt={t.name}
                                                fallbackChar={t.name}
                                                className="w-7 h-7"
                                                fallbackClassName="w-10 h-10 text-[10px]"
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Detailed list */}
                            <div className="divide-y divide-neutral-100">
                                {scorecard.currentStack.map((t, i) => {
                                    const logos = toolLogos(t.name);
                                    return (
                                        <div key={i} className="px-4 py-3 flex items-start gap-3">
                                            <div className="w-9 h-9 border border-neutral-200 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                <LogoImage
                                                    src={logos.src}
                                                    fallbackSrc={logos.fallbackSrc}
                                                    alt={t.name}
                                                    fallbackChar={t.name}
                                                    className="w-6 h-6"
                                                    fallbackClassName="w-9 h-9 text-[10px]"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                    <span className="font-mono text-xs font-bold">{t.name}</span>
                                                    <span className="font-mono text-[9px] text-neutral-400">{t.category}</span>
                                                </div>
                                                <span className={`font-mono text-[9px] uppercase tracking-widest border px-1.5 py-0.5 ${aiRoleBadge(t.aiRole)}`}>
                                                    {t.aiRole}
                                                </span>
                                                <p className="font-mono text-[10px] text-neutral-500 mt-1 leading-relaxed">{t.usageNotes}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Recommended Tools */}
                    {recommendedTools.length > 0 && (
                        <div className="border border-black">
                            <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                                <h2 className="font-mono text-xs uppercase tracking-widest">Recommended Tools</h2>
                                <span className="font-mono text-[10px] text-neutral-400">Propose on call</span>
                            </div>

                            {/* Logo strip */}
                            <div className="px-5 py-4 border-b border-neutral-100 flex flex-wrap gap-2.5">
                                {recommendedTools.map((t, i) => {
                                    const logos = toolLogos(t.name, t.websiteDomain);
                                    return (
                                        <div
                                            key={i}
                                            title={t.name}
                                            className="w-10 h-10 border border-neutral-200 p-1 flex items-center justify-center overflow-hidden"
                                        >
                                            <LogoImage
                                                src={logos.src}
                                                fallbackSrc={logos.fallbackSrc}
                                                alt={t.name}
                                                fallbackChar={t.name}
                                                className="w-7 h-7"
                                                fallbackClassName="w-10 h-10 text-[10px]"
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Detailed list */}
                            <div className="divide-y divide-neutral-100">
                                {recommendedTools.map((t, i) => {
                                    const logos = toolLogos(t.name, t.websiteDomain);
                                    return (
                                        <div key={i} className="px-4 py-3 flex items-start gap-3">
                                            <div className="w-9 h-9 border border-neutral-200 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                <LogoImage
                                                    src={logos.src}
                                                    fallbackSrc={logos.fallbackSrc}
                                                    alt={t.name}
                                                    fallbackChar={t.name}
                                                    className="w-6 h-6"
                                                    fallbackClassName="w-9 h-9 text-[10px]"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className="font-mono text-xs font-bold">{t.name}</span>
                                                    <span className="font-mono text-[9px] uppercase tracking-widest border border-neutral-200 px-1.5 py-0.5 text-neutral-500">
                                                        {t.category}
                                                    </span>
                                                    <span className={`font-mono text-[9px] border px-1.5 py-0.5 ${impactBadge(t.impact)}`}>
                                                        {t.impact} Impact
                                                    </span>
                                                </div>
                                                <p className="font-mono text-[10px] text-neutral-600 leading-relaxed">{t.reason}</p>
                                                {t.estimatedCostPerUser && (
                                                    <p className="font-mono text-[9px] text-neutral-400 mt-1">{t.estimatedCostPerUser}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Talking Points ─────────────────────────────────────────────── */}
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
                                        <span className="font-mono text-xs text-black font-semibold">&ldquo;{tp.question}&rdquo;</span>
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

            {/* ── Pain Points ────────────────────────────────────────────────── */}
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

            {/* ── Recommendations ────────────────────────────────────────────── */}
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

            {/* ── Workflow Gap Analysis ──────────────────────────────────────── */}
            {scorecard && (scorecard as AuditScorecard & { workflowGaps?: Array<{ workflowName: string; stages: Array<{ name: string; tool: string | null; status: string }>; bottleneck: string; fixDescription: string }> }).workflowGaps && (scorecard as AuditScorecard & { workflowGaps?: Array<{ workflowName: string; stages: Array<{ name: string; tool: string | null; status: string }>; bottleneck: string; fixDescription: string }> }).workflowGaps!.length > 0 && (
                <div className="border border-black">
                    <div className="border-b border-black px-5 py-3">
                        <h2 className="font-mono text-xs uppercase tracking-widest">Workflow Gap Analysis</h2>
                    </div>
                    <div className="divide-y divide-neutral-100">
                        {((scorecard as AuditScorecard & { workflowGaps: Array<{ workflowName: string; stages: Array<{ name: string; tool: string | null; status: string }>; bottleneck: string; fixDescription: string }> }).workflowGaps).map((wf, i) => (
                            <div key={i} className="p-5">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <p className="font-mono text-xs font-bold">{wf.workflowName}</p>
                                    <span className="font-mono text-[9px] text-red-600">{wf.stages.filter(s => s.status === "gap").length} gaps</span>
                                </div>
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {wf.stages.map((stage, si) => (
                                        <span key={si} className={`font-mono text-[9px] px-2 py-1 border ${
                                            stage.status === "covered" ? "border-green-200 bg-green-50 text-green-700" :
                                            stage.status === "partial" ? "border-yellow-200 bg-yellow-50 text-yellow-700" :
                                            "border-red-200 bg-red-50 text-red-700"
                                        }`}>
                                            {stage.name}: {stage.tool ?? "GAP"}
                                        </span>
                                    ))}
                                </div>
                                <p className="font-mono text-[10px] text-red-600 mb-1">Bottleneck: {wf.bottleneck}</p>
                                <p className="font-mono text-[10px] text-neutral-500">{wf.fixDescription}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Industry Benchmark ──────────────────────────────────────────── */}
            {scorecard && (scorecard as AuditScorecard & { industryBenchmark?: { peerAvgScore: number; peerLabel: string; percentile: number; insight: string } }).industryBenchmark && (
                <div className="border border-black">
                    <div className="border-b border-black px-5 py-3">
                        <h2 className="font-mono text-xs uppercase tracking-widest">Deep Industry Benchmark</h2>
                    </div>
                    <div className="p-5">
                        {(() => {
                            const bm = (scorecard as AuditScorecard & { industryBenchmark: { peerAvgScore: number; peerLabel: string; percentile: number; insight: string } }).industryBenchmark;
                            return (
                                <>
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        <div className="border border-neutral-200 p-3 text-center">
                                            <span className="font-mono text-2xl font-black">{score}</span>
                                            <p className="font-mono text-[9px] text-neutral-400 uppercase">Your Score</p>
                                        </div>
                                        <div className="border border-neutral-200 p-3 text-center">
                                            <span className="font-mono text-2xl font-black text-neutral-500">{bm.peerAvgScore}</span>
                                            <p className="font-mono text-[9px] text-neutral-400 uppercase">Peer Avg</p>
                                        </div>
                                        <div className="border border-neutral-200 p-3 text-center">
                                            <span className="font-mono text-2xl font-black text-blue-700">{bm.percentile}%</span>
                                            <p className="font-mono text-[9px] text-neutral-400 uppercase">Percentile</p>
                                        </div>
                                    </div>
                                    <p className="font-mono text-[10px] text-neutral-400 mb-1">{bm.peerLabel}</p>
                                    <p className="font-mono text-xs text-neutral-600 leading-relaxed">{bm.insight}</p>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* ── ROI Projection ──────────────────────────────────────────────── */}
            {scorecard && (scorecard as AuditScorecard & { roiProjection?: { currentAnnualWaste: number; projectedSavings: number; paybackMonths: number; assumptions: string[] } }).roiProjection && (
                <div className="border-2 border-green-700">
                    <div className="border-b border-green-700 px-5 py-3">
                        <h2 className="font-mono text-xs uppercase tracking-widest text-green-700">ROI Projection</h2>
                    </div>
                    <div className="p-5">
                        {(() => {
                            const roi = (scorecard as AuditScorecard & { roiProjection: { currentAnnualWaste: number; projectedSavings: number; paybackMonths: number; assumptions: string[] } }).roiProjection;
                            return (
                                <>
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        <div className="border border-red-200 bg-red-50 p-3 text-center">
                                            <span className="font-mono text-xl font-black text-red-600">${Math.round(roi.currentAnnualWaste / 1000)}K</span>
                                            <p className="font-mono text-[9px] text-red-400 uppercase">Annual Waste</p>
                                        </div>
                                        <div className="border border-green-200 bg-green-50 p-3 text-center">
                                            <span className="font-mono text-xl font-black text-green-700">${Math.round(roi.projectedSavings / 1000)}K</span>
                                            <p className="font-mono text-[9px] text-green-500 uppercase">Savings</p>
                                        </div>
                                        <div className="border border-blue-200 bg-blue-50 p-3 text-center">
                                            <span className="font-mono text-xl font-black text-blue-700">{roi.paybackMonths}mo</span>
                                            <p className="font-mono text-[9px] text-blue-400 uppercase">Payback</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        {roi.assumptions.map((a, i) => (
                                            <p key={i} className="font-mono text-[10px] text-neutral-500">
                                                {i + 1}. {a}
                                            </p>
                                        ))}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* ── Future Target ──────────────────────────────────────────────── */}
            {scorecard && (
                <div className="border-2 border-black bg-black text-white p-6 flex items-center gap-5">
                    <div className="flex-shrink-0">
                        <span className="font-mono font-black leading-none" style={{ fontSize: "3rem" }}>
                            {scorecard.futureAINativeTarget.targetScore}
                        </span>
                        <span className="font-mono text-xl text-white/30">/100</span>
                    </div>
                    <div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-1.5">Target AI-Native Score</div>
                        <p className="font-mono text-sm text-white/70 leading-relaxed">{scorecard.futureAINativeTarget.summary}</p>
                    </div>
                </div>
            )}

            {/* ── Submission Details ─────────────────────────────────────────── */}
            <div className="grid sm:grid-cols-2 gap-6">
                {/* Pre-built Workspace */}
                <div className="border border-black p-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-3">Pre-built Workspace</p>
                    {submission.preBuiltWorkspaceId ? (
                        <div className="space-y-1">
                            <p className="font-mono text-sm font-bold">{workspaceName ?? submission.companyName}</p>
                            <p className="font-mono text-xs text-neutral-500">
                                {toolCount} tool{toolCount !== 1 ? "s" : ""} seeded from audit responses
                            </p>
                            <p className="font-mono text-[10px] text-neutral-400 break-all">
                                ID: {submission.preBuiltWorkspaceId}
                            </p>
                        </div>
                    ) : (
                        <p className="font-mono text-xs text-neutral-400">Workspace not yet provisioned — audit may still be processing.</p>
                    )}
                </div>

                {/* Form Details */}
                <div className="border border-black p-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-3">Form Data</p>
                    <div className="space-y-1.5">
                        {[
                            { label: "AI Tools", value: submission.aiToolCount },
                            { label: "Daily AI Use", value: submission.dailyAdoptionPct },
                            { label: "Monthly Spend", value: submission.monthlySpend },
                            { label: "Employees", value: submission.employeeCount },
                            { label: "Revenue", value: submission.revenue },
                            { label: "Arc Code", value: submission.arcCode },
                        ].filter(f => f.value).map(({ label, value }) => (
                            <div key={label} className="flex gap-3">
                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 w-24 shrink-0">{label}</span>
                                <span className="font-mono text-xs text-neutral-700">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Rep Notes ──────────────────────────────────────────────────── */}
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

            {/* ── Sticky Actions Bar ─────────────────────────────────────────── */}
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
