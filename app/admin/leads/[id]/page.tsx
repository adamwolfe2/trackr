export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { auditSubmissions, pendingInvitations, workspaces, softwareSpend } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { AuditScorecard } from "@/lib/actions/audit";
import { processAuditSubmission } from "@/lib/actions/audit";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { ExternalLink } from "lucide-react";
import { LogoImage } from "@/components/common/logo-image";
import { getToolLogoUrls } from "@/lib/utils/tool-logos";
import { RecommendedToolsEditor } from "./recommended-tools-editor";
import { ScorecardNav } from "./scorecard-nav";
import { CopyButton } from "./copy-button";

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
    whatItDoes?: string;
    problemItSolves?: string;
    painPointLink?: string | null;
    reason: string;
    estimatedCostPerUser: string | null;
    impact: "High" | "Medium" | "Low";
};

type ExtendedScorecard = AuditScorecard & {
    executiveSummary?: string | null;
    painPoints: Array<{ area: string; description: string; annualCostEstimate?: string | null }>;
    recommendations: Array<{
        title: string; impact: "High" | "Medium" | "Low"; difficulty: "High" | "Medium" | "Low";
        description: string; estimatedROI?: string | null;
    }>;
    workflowGaps?: Array<{ workflowName: string; stages: Array<{ name: string; tool: string | null; status: string }>; bottleneck: string; fixDescription: string }>;
    industryBenchmark?: { peerAvgScore: number; peerLabel: string; percentile: number; insight: string };
    roiProjection?: { currentAnnualWaste: number; projectedSavings: number; paybackMonths: number; assumptions: string[] };
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
    if (score >= 61) return "text-black";
    if (score >= 41) return "text-yellow-700";
    return "text-red-700";
}

function scoreBarColor(score: number): string {
    if (score >= 61) return "bg-black";
    if (score >= 41) return "bg-yellow-500";
    return "bg-red-500";
}

function maturityTier(score: number): string {
    if (score < 21) return "Not using AI";
    if (score < 41) return "Ad-hoc";
    if (score < 61) return "Moderate";
    if (score < 81) return "Structured";
    return "AI-native";
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
        "AI-native": "bg-neutral-50 text-black border-neutral-200",
        "AI-assisted": "bg-blue-50 text-blue-700 border-blue-200",
        "Non-AI core infra": "bg-neutral-50 text-neutral-600 border-neutral-200",
    };
    return colors[role] ?? colors["Non-AI core infra"];
}

/** Returns Clearbit as primary, Google favicon as fallback (uses shared domain lookup) */
const toolLogos = getToolLogoUrls;

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

    const scorecard = submission.scorecard as ExtendedScorecard | null;
    const talkingPoints = submission.talkingPoints as TalkingPoint[] | null;
    const score = scorecard?.aiNativeScore?.score ?? null;
    const recommendedTools = scorecard?.recommendedTools ?? [];
    const executiveSummary = scorecard?.executiveSummary ?? null;

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

    // ── Section nav data ────────────────────────────────────────────────────
    const navSections: Array<{ id: string; label: string }> = [
        ...(score !== null ? [{ id: "score", label: "Score" }] : []),
        ...(scorecard && (scorecard.currentStack.length > 0 || recommendedTools.length > 0) ? [{ id: "stack", label: "Stack & Recs" }] : []),
        ...(talkingPoints && talkingPoints.length > 0 ? [{ id: "talking-points", label: "Talking Points" }] : []),
        ...(scorecard && scorecard.painPoints.length > 0 ? [{ id: "pain-points", label: "Pain Points" }] : []),
        ...(scorecard && scorecard.recommendations.length > 0 ? [{ id: "recommendations", label: "Recommendations" }] : []),
        ...(scorecard?.workflowGaps && scorecard.workflowGaps.length > 0 ? [{ id: "workflow-gaps", label: "Gaps" }] : []),
        ...(scorecard?.industryBenchmark ? [{ id: "industry-benchmark", label: "Benchmark" }] : []),
        ...(scorecard?.roiProjection ? [{ id: "roi-projection", label: "ROI" }] : []),
        ...(submission.preBuiltWorkspaceId ? [{ id: "workspace", label: "Workspace" }] : []),
        { id: "notes", label: "Notes" },
    ];

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
                <Link href="/admin/leads" className="font-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-black">
                    ← All Leads
                </Link>
            </div>

            {/* ── Hero Card ─────────────────────────────────────────────────── */}
            <div id="score" className="border border-black p-6 scroll-mt-16">
                <div className="flex items-start gap-5">
                    {/* Company logo */}
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
                                    submission.status === "complete" ? "border-neutral-200 text-black" :
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

                {/* Executive Summary — serif intro paragraph */}
                {executiveSummary && (
                    <div className="mt-5 pt-5 border-t border-neutral-200">
                        <p className="font-serif text-base text-neutral-800 leading-relaxed">{executiveSummary}</p>
                    </div>
                )}

                {/* Score bar */}
                {score !== null && scorecard && (
                    <div className={`mt-5 pt-5 ${!executiveSummary ? "border-t border-neutral-200" : ""}`}>
                        <div className="flex items-center gap-6">
                            <div className="flex-shrink-0 text-center">
                                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-400 mb-1">AI-Native Score</p>
                                <span className={`font-mono text-6xl font-black leading-none ${scoreColor(score)}`}>{score}</span>
                                <span className="font-mono text-xl text-neutral-300">/100</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">AI Operational Readiness</span>
                                    <span className="font-mono text-[10px] font-bold text-neutral-700">
                                        {maturityTier(score)}
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

            {/* ── Section Nav ─────────────────────────────────────────────────── */}
            {navSections.length > 1 && <ScorecardNav sections={navSections} />}

            {/* ── Current Stack + Recommended Tools ─────────────────────────── */}
            {scorecard && (
                <div id="stack" className="grid lg:grid-cols-2 gap-8 scroll-mt-16">

                    {/* Current Stack */}
                    {scorecard.currentStack.length > 0 && (
                        <div className="border border-black">
                            <div className="border-b border-black px-5 py-3">
                                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 flex items-center gap-2">
                                    <span className="w-1 h-3 bg-black inline-block" />
                                    Current Stack
                                </p>
                            </div>

                            {/* Logo strip */}
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

                    {/* Recommended Tools — editable */}
                    <RecommendedToolsEditor
                        submissionId={id}
                        initialTools={recommendedTools}
                    />
                </div>
            )}

            {/* ── Talking Points ─────────────────────────────────────────────── */}
            {talkingPoints && talkingPoints.length > 0 && (
                <div id="talking-points" className="border border-black scroll-mt-16">
                    <div className="border-b border-black px-5 py-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 flex items-center gap-2">
                            <span className="w-1 h-3 bg-black inline-block" />
                            Call Prep: Talking Points
                        </p>
                    </div>
                    <div className="p-5 space-y-5">
                        {talkingPoints.map((tp, i) => (
                            <div key={i} className="border-l-4 border-l-black border border-neutral-200 p-5 bg-white">
                                <div className="flex items-baseline gap-3 mb-4">
                                    <span className="font-mono text-lg text-neutral-300 font-bold flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-bold">
                                        {tp.topic}
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-1">Found</p>
                                        <p className="font-mono text-xs text-neutral-700 leading-relaxed">{tp.observation}</p>
                                    </div>
                                    <div className="bg-neutral-50 border border-neutral-200 p-4">
                                        <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-2">Ask</p>
                                        <p className="font-serif text-base text-black font-medium leading-relaxed">&ldquo;{tp.question}&rdquo;</p>
                                    </div>
                                    <div>
                                        <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-1">Opportunity</p>
                                        <p className="font-mono text-xs text-neutral-700 leading-relaxed">{tp.opportunity}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Pain Points ────────────────────────────────────────────────── */}
            {scorecard && scorecard.painPoints.length > 0 && (
                <div id="pain-points" className="border border-black scroll-mt-16">
                    <div className="border-b border-black px-5 py-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 flex items-center gap-2">
                            <span className="w-1 h-3 bg-red-500 inline-block" />
                            Critical Business Risk Factors
                        </p>
                    </div>
                    <div className="p-5 space-y-3">
                        {scorecard.painPoints.map((p, i) => (
                            <div key={i} className="border-l-4 border-l-red-500 border border-neutral-200 bg-white p-5">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-red-600 font-bold">{p.area}</span>
                                    {p.annualCostEstimate && (
                                        <span className="font-mono text-[9px] border border-red-200 bg-red-50 text-red-700 px-2.5 py-0.5 flex-shrink-0 whitespace-nowrap">
                                            {p.annualCostEstimate} / yr
                                        </span>
                                    )}
                                </div>
                                <p className="font-mono text-xs text-neutral-600 leading-relaxed">{p.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Recommendations ────────────────────────────────────────────── */}
            {scorecard && scorecard.recommendations.length > 0 && (
                <div id="recommendations" className="border border-black scroll-mt-16">
                    <div className="border-b border-black px-5 py-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 flex items-center gap-2">
                            <span className="w-1 h-3 bg-black inline-block" />
                            90-Day Strategic Roadmap
                        </p>
                    </div>
                    <div className="p-5 space-y-4">
                        {scorecard.recommendations.map((r, i) => (
                            <div key={i} className="border border-neutral-200 bg-white p-5">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-baseline gap-3 min-w-0">
                                        <span className="font-mono text-lg text-neutral-300 font-bold flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                                        <span className="font-mono text-sm font-bold">{r.title}</span>
                                    </div>
                                    <div className="flex gap-1.5 flex-shrink-0">
                                        <span className={`font-mono text-[8px] border px-2 py-0.5 ${impactBadge(r.impact)}`}>{r.impact} Impact</span>
                                        <span className="font-mono text-[8px] border border-neutral-200 text-neutral-500 bg-neutral-50 px-2 py-0.5">{r.difficulty} Effort</span>
                                    </div>
                                </div>
                                <p className="font-mono text-xs text-neutral-600 leading-relaxed">{r.description}</p>
                                {r.estimatedROI && (
                                    <p className="mt-3 font-mono text-[10px] text-black flex items-center gap-2">
                                        <span className="w-5 h-px bg-neutral-400 flex-shrink-0" />
                                        Est. ROI: {r.estimatedROI}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Workflow Gap Analysis ──────────────────────────────────────── */}
            {scorecard?.workflowGaps && scorecard.workflowGaps.length > 0 && (
                <div id="workflow-gaps" className="border border-black scroll-mt-16">
                    <div className="border-b border-black px-5 py-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 flex items-center gap-2">
                            <span className="w-1 h-3 bg-yellow-500 inline-block" />
                            Workflow Gap Analysis
                        </p>
                    </div>
                    <div className="divide-y divide-neutral-100">
                        {scorecard.workflowGaps.map((wf, i) => (
                            <div key={i} className="p-5">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <p className="font-mono text-xs font-bold">{wf.workflowName}</p>
                                    <span className="font-mono text-[9px] border border-neutral-200 bg-neutral-50 text-neutral-500 px-2.5 py-1 flex-shrink-0">
                                        {wf.stages.filter(s => s.status === "gap").length} gap{wf.stages.filter(s => s.status === "gap").length !== 1 ? "s" : ""}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {wf.stages.map((stage, si) => (
                                        <span key={si} className={`font-mono text-[9px] px-2 py-1 border ${
                                            stage.status === "covered" ? "border-neutral-200 bg-neutral-50 text-black" :
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
            {scorecard?.industryBenchmark && (
                <div id="industry-benchmark" className="border border-black scroll-mt-16">
                    <div className="border-b border-black px-5 py-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 flex items-center gap-2">
                            <span className="w-1 h-3 bg-black inline-block" />
                            Deep Industry Benchmark
                        </p>
                    </div>
                    <div className="p-5">
                        {(() => {
                            const bm = scorecard.industryBenchmark!;
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
                                            <span className="font-mono text-2xl font-black">{bm.percentile}%</span>
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
            {scorecard?.roiProjection && (
                <div id="roi-projection" className="border-2 border-black scroll-mt-16">
                    <div className="border-b border-black px-5 py-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 flex items-center gap-2">
                            <span className="w-1 h-3 bg-black inline-block" />
                            ROI Projection
                        </p>
                    </div>
                    <div className="p-6">
                        {(() => {
                            const roi = scorecard.roiProjection!;
                            return (
                                <>
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="border border-red-200 bg-red-50 p-4 text-center">
                                            <p className="font-mono text-[9px] text-red-400 uppercase mb-1">Annual Waste</p>
                                            <span className="font-mono text-3xl font-black text-red-600">${Math.round(roi.currentAnnualWaste / 1000)}K</span>
                                        </div>
                                        <div className="border border-neutral-200 bg-neutral-50 p-4 text-center">
                                            <p className="font-mono text-[9px] text-neutral-500 uppercase mb-1">Projected Savings</p>
                                            <span className="font-mono text-3xl font-black text-black">${Math.round(roi.projectedSavings / 1000)}K</span>
                                        </div>
                                        <div className="border-2 border-black bg-black p-4 text-center">
                                            <p className="font-mono text-[9px] text-white/50 uppercase mb-1">Payback Period</p>
                                            <span className="font-mono text-3xl font-black text-white">{roi.paybackMonths}<span className="text-lg text-white/50">mo</span></span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-2">Assumptions</p>
                                        <ul className="space-y-1.5">
                                            {roi.assumptions.map((a, i) => (
                                                <li key={i} className="font-mono text-[10px] text-neutral-500 flex items-start gap-2">
                                                    <span className="w-1 h-1 bg-neutral-300 mt-1.5 flex-shrink-0" />
                                                    {a}
                                                </li>
                                            ))}
                                        </ul>
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
            <div id="workspace" className="grid sm:grid-cols-2 gap-8 scroll-mt-16">
                {/* Pre-built Workspace */}
                <div className="border border-black p-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-4 flex items-center gap-2">
                        <span className="w-1 h-3 bg-black inline-block" />
                        Pre-built Workspace
                    </p>
                    {submission.preBuiltWorkspaceId ? (
                        <div className="space-y-2">
                            <p className="font-serif text-xl font-normal">{workspaceName ?? submission.companyName}</p>
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
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-4 flex items-center gap-2">
                        <span className="w-1 h-3 bg-black inline-block" />
                        Form Data
                    </p>
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
            <div id="notes" className="border border-black scroll-mt-16">
                <div className="border-b border-black px-5 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 flex items-center gap-2">
                        <span className="w-1 h-3 bg-black inline-block" />
                        Rep Notes
                    </p>
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
                    {submission.preBuiltWorkspaceId && (
                        <form action={sendInvite}>
                            <button
                                type="submit"
                                className="font-mono text-xs uppercase tracking-widest border-2 border-black bg-black text-white px-6 py-2.5 hover:bg-neutral-800 transition-colors"
                            >
                                Send Workspace Invite
                            </button>
                        </form>
                    )}

                    {shareUrl && (
                        <div className="flex items-center gap-2">
                            <a
                                href={shareUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-xs uppercase tracking-widest border border-black px-4 py-2 hover:bg-neutral-100 transition-colors"
                            >
                                Open Scorecard
                            </a>
                            <CopyButton text={shareUrl} />
                        </div>
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
