import { db } from "@/lib/db";
import { auditSubmissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ExternalLink, ArrowRight } from "lucide-react";
import { TrackrLogo } from "@/components/common/trackr-logo";
import type { Metadata } from "next";
import type { AuditScorecard } from "@/lib/actions/audit";

export const dynamic = "force-dynamic";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ token: string }>;
}): Promise<Metadata> {
    const { token } = await params;
    const submission = await db.query.auditSubmissions.findFirst({
        where: eq(auditSubmissions.shareToken, token),
        columns: { companyName: true, scorecard: true },
    });
    if (!submission) return { title: "Scorecard Not Found — Trackr" };

    const scorecard = submission.scorecard as AuditScorecard | null;
    const score = scorecard?.aiNativeScore?.score ?? 0;
    const desc = `AI Readiness Scorecard for ${submission.companyName}. AI-Native Score: ${score}/100. Powered by Trackr.`;
    return {
        title: `${submission.companyName} — AI Readiness Scorecard`,
        description: desc,
        openGraph: {
            title: `${submission.companyName} — AI Readiness Scorecard`,
            description: desc,
            type: "article",
            images: [{ url: "/og.png", width: 1456, height: 816, alt: "AI Readiness Scorecard" }],
        },
        twitter: {
            card: "summary_large_image",
            title: `${submission.companyName} — AI Readiness Scorecard`,
            description: desc,
            images: ["/og.png"],
        },
        robots: { index: false }, // Don't index individual scorecards
    };
}

export default async function AuditSharePage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;

    const submission = await db.query.auditSubmissions.findFirst({
        where: eq(auditSubmissions.shareToken, token),
    });

    if (!submission || !submission.scorecard) return notFound();

    const scorecard = submission.scorecard as AuditScorecard;
    const score = scorecard.aiNativeScore.score;

    const scoreColor =
        score >= 61 ? "#16a34a" : score >= 41 ? "#d97706" : "#dc2626";

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

    return (
        <div className="min-h-screen bg-[#F3F3EF]">
            {/* Header */}
            <div className="border-b border-black bg-[#F3F3EF] px-6 py-4 flex items-center justify-between">
                <a
                    href="https://trytrackr.com"
                    className="flex items-center gap-2 font-serif text-xl font-medium hover:opacity-70 transition-opacity"
                >
                    <TrackrLogo size={24} />
                    Trackr
                </a>
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 border border-neutral-300 px-2 py-1">
                    AI Readiness Scorecard
                </span>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">

                {/* Company Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1 min-w-0">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">
                            AI Readiness Report
                        </p>
                        <h1 className="font-serif text-3xl font-normal">{scorecard.companyName}</h1>
                        <div className="flex items-center gap-3 flex-wrap font-mono text-xs text-neutral-400 mt-1">
                            {submission.contactName && <span>{submission.contactName}</span>}
                            {submission.role && <><span>·</span><span>{submission.role}</span></>}
                            {websiteHostname && (
                                <>
                                    <span>·</span>
                                    <a
                                        href={submission.companyWebsite!.startsWith("http") ? submission.companyWebsite! : `https://${submission.companyWebsite}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-black flex items-center gap-1"
                                    >
                                        {websiteHostname} <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* AI-Native Score */}
                <div className="border-2 border-black p-6 flex items-center gap-6">
                    <div
                        className="font-serif font-black leading-none flex-shrink-0"
                        style={{ fontSize: "4rem", color: scoreColor }}
                    >
                        {score}
                        <span className="text-2xl text-neutral-300">/100</span>
                    </div>
                    <div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">
                            AI-Native Score
                        </div>
                        <p className="font-mono text-sm text-neutral-600 leading-relaxed">
                            {scorecard.aiNativeScore.summary}
                        </p>
                    </div>
                </div>

                {/* Pain Points */}
                {scorecard.painPoints.length > 0 && (
                    <div className="border border-black">
                        <div className="border-b border-black px-5 py-3">
                            <h2 className="font-mono text-xs uppercase tracking-widest">Pain Points Identified</h2>
                        </div>
                        <div className="divide-y divide-black/10">
                            {scorecard.painPoints.map((p, i) => (
                                <div key={i} className="px-5 py-4 flex gap-4">
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mt-0.5 w-20 flex-shrink-0 pt-0.5">
                                        {p.area}
                                    </span>
                                    <p className="font-mono text-sm text-neutral-600 leading-relaxed">{p.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Current Stack */}
                {scorecard.currentStack.length > 0 && (
                    <div className="border border-black">
                        <div className="border-b border-black px-5 py-3">
                            <h2 className="font-mono text-xs uppercase tracking-widest">Current Tool Stack</h2>
                        </div>
                        <div className="divide-y divide-black/10">
                            {scorecard.currentStack.map((t, i) => (
                                <div key={i} className="px-5 py-3 flex items-start gap-4">
                                    <div className="w-36 flex-shrink-0">
                                        <div className="font-mono text-xs font-bold">{t.name}</div>
                                        <div className="font-mono text-[10px] text-neutral-400 mt-0.5">
                                            {t.category}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className={`font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 border ${
                                            t.aiRole === "AI-native"
                                                ? "border-black text-black"
                                                : t.aiRole === "AI-assisted"
                                                ? "border-neutral-400 text-neutral-500"
                                                : "border-neutral-200 text-neutral-400"
                                        }`}>
                                            {t.aiRole}
                                        </span>
                                        <p className="font-mono text-xs text-neutral-500 mt-1.5 leading-relaxed">
                                            {t.usageNotes}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommendations */}
                {scorecard.recommendations.length > 0 && (
                    <div className="border border-black">
                        <div className="border-b border-black px-5 py-3">
                            <h2 className="font-mono text-xs uppercase tracking-widest">Recommendations</h2>
                        </div>
                        <div className="divide-y divide-black/10">
                            {scorecard.recommendations.map((r, i) => (
                                <div key={i} className="px-5 py-4">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <span className="font-mono text-xs font-bold">
                                            {i + 1}. {r.title}
                                        </span>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <span className={`font-mono text-[10px] px-1.5 py-0.5 border ${
                                                r.impact === "High" ? "border-black text-black" : "border-neutral-300 text-neutral-400"
                                            }`}>
                                                {r.impact} Impact
                                            </span>
                                            <span className="font-mono text-[10px] px-1.5 py-0.5 border border-neutral-200 text-neutral-400">
                                                {r.difficulty} Effort
                                            </span>
                                        </div>
                                    </div>
                                    <p className="font-mono text-xs text-neutral-500 leading-relaxed">
                                        {r.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Future Target */}
                <div className="border-2 border-black bg-black text-white p-6 flex items-center gap-6">
                    <div className="font-serif font-black leading-none flex-shrink-0 text-white" style={{ fontSize: "3rem" }}>
                        {scorecard.futureAINativeTarget.targetScore}
                        <span className="text-xl text-white/30">/100</span>
                    </div>
                    <div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-1.5">
                            Target AI-Native Score
                        </div>
                        <p className="font-mono text-sm text-white/70 leading-relaxed">
                            {scorecard.futureAINativeTarget.summary}
                        </p>
                    </div>
                </div>

                {/* Soft CTA */}
                <div className="border border-black p-8 space-y-5">
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">
                            Powered by Trackr
                        </p>
                        <h3 className="font-serif text-2xl font-normal mb-2">
                            Is your company AI-native?
                        </h3>
                        <p className="font-mono text-sm text-neutral-500 leading-relaxed max-w-lg">
                            Get your free AI readiness scorecard — our agents scrape your website, analyze your stack, and deliver a scored report with specific recommendations in under 2 minutes.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <a
                            href="https://trytrackr.com/audit"
                            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 font-mono text-xs uppercase tracking-wide border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                        >
                            Get My Free Audit <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                        <a
                            href="https://trytrackr.com/sign-up"
                            className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-mono text-xs uppercase tracking-wide border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                        >
                            Research Tools Free <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                    </div>
                    <p className="font-mono text-[10px] text-neutral-400">
                        No credit card required · Your team&apos;s AI tool intelligence layer
                    </p>
                </div>

                <div className="text-center pb-8">
                    <a href="https://trytrackr.com" className="font-mono text-xs text-neutral-400 hover:text-black transition-colors">
                        trytrackr.com
                    </a>
                </div>
            </div>
        </div>
    );
}
