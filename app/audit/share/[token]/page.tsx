import { db } from "@/lib/db";
import { auditSubmissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink } from "lucide-react";
import { TrackrLogo } from "@/components/common/trackr-logo";
import { LogoImage } from "@/components/common/logo-image";
import type { Metadata } from "next";
import type { AuditScorecard } from "@/lib/actions/audit";

export const dynamic = "force-dynamic";

type RecommendedTool = {
    name: string;
    websiteDomain: string | null;
    category: string;
    reason: string;
    estimatedCostPerUser: string | null;
    impact: "High" | "Medium" | "Low";
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getWebsiteHostname(website: string | null | undefined): string | null {
    if (!website) return null;
    try {
        const url = website.startsWith("http") ? website : `https://${website}`;
        return new URL(url).hostname.replace("www.", "");
    } catch {
        return website;
    }
}

function clearbitLogo(domain: string) {
    return `https://logo.clearbit.com/${domain}`;
}

function faviconUrl(nameOrDomain: string) {
    const domain = nameOrDomain.includes(".")
        ? nameOrDomain
        : `${nameOrDomain.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}

function aiRoleBadge(role: string) {
    if (role === "AI-native") return "border-black text-black bg-white";
    if (role === "AI-assisted") return "border-neutral-400 text-neutral-500";
    return "border-neutral-200 text-neutral-400";
}

function aiRoleShort(role: string) {
    if (role === "AI-native") return "AI";
    if (role === "AI-assisted") return "Assisted";
    return "Core";
}

function impactBadge(level: string) {
    if (level === "High") return "border-black text-black";
    if (level === "Medium") return "border-neutral-400 text-neutral-600";
    return "border-neutral-200 text-neutral-400";
}

function effortBadge(level: string) {
    return "border-neutral-200 text-neutral-400";
}

// ── Metadata ──────────────────────────────────────────────────────────────────

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
        twitter: { card: "summary_large_image", title: `${submission.companyName} — AI Readiness Scorecard`, description: desc, images: ["/og.png"] },
        robots: { index: false },
    };
}

// ── Page ──────────────────────────────────────────────────────────────────────

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
    const recommendedTools = (scorecard as AuditScorecard & { recommendedTools?: RecommendedTool[] }).recommendedTools ?? [];
    const score = scorecard.aiNativeScore.score;

    const scoreBarColor = score >= 61 ? "bg-green-600" : score >= 41 ? "bg-yellow-500" : "bg-red-500";
    const scoreTextColor = score >= 61 ? "#16a34a" : score >= 41 ? "#d97706" : "#dc2626";
    const scoreLabel = score < 21 ? "Minimal" : score < 41 ? "Ad-hoc" : score < 61 ? "Moderate" : score < 81 ? "Structured" : "AI-native";

    const websiteHostname = getWebsiteHostname(submission.companyWebsite);
    const companyLogo = websiteHostname ? clearbitLogo(websiteHostname) : null;

    // Build readiness profile facts from form data
    const profileFacts = [
        { label: "AI Tools Used", value: submission.aiToolCount },
        { label: "Daily Adoption", value: submission.dailyAdoptionPct },
        { label: "Monthly Spend", value: submission.monthlySpend },
        { label: "Employee Count", value: submission.employeeCount },
        { label: "Revenue", value: (submission as typeof submission & { revenue?: string }).revenue ?? null },
        { label: "AI Governance", value: submission.hasAIManager },
    ].filter((f): f is { label: string; value: string } => !!f.value);

    return (
        <div className="min-h-screen bg-[#F3F3EF]">

            {/* ── Nav ──────────────────────────────────────────────────── */}
            <div className="border-b border-black bg-[#F3F3EF] px-6 py-4 flex items-center justify-between">
                <a href="https://trytrackr.com" className="flex items-center gap-2 font-serif text-xl font-medium hover:opacity-70 transition-opacity">
                    <TrackrLogo size={22} />
                    Trackr
                </a>
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 border border-neutral-300 px-2 py-1">
                    AI Readiness Scorecard
                </span>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">

                {/* ── Company Header ──────────────────────────────────── */}
                <div className="border border-black bg-white p-6">
                    <div className="flex items-start justify-between gap-6 flex-wrap">
                        {/* Left: logo + name + meta */}
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                            {companyLogo && (
                                <div className="w-16 h-16 border border-neutral-200 bg-white p-1.5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                    <LogoImage
                                        src={companyLogo}
                                        alt={scorecard.companyName}
                                        fallbackChar={scorecard.companyName}
                                        className="w-full h-full"
                                        fallbackClassName="w-16 h-16 text-lg"
                                    />
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">
                                    AI Readiness Report
                                </p>
                                <h1 className="font-serif text-4xl font-normal mb-1">{scorecard.companyName}</h1>
                                <div className="flex items-center gap-2 flex-wrap font-mono text-xs text-neutral-400">
                                    {scorecard.industry && <span>{scorecard.industry}</span>}
                                    {scorecard.companySize && <><span>·</span><span>{scorecard.companySize}</span></>}
                                    {submission.contactName && <><span>·</span><span>{submission.contactName}</span></>}
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

                        {/* Right: score box (like Clay) */}
                        <div className="text-center border border-black p-4 flex-shrink-0 min-w-[100px]">
                            <div className="font-mono text-5xl font-black leading-none" style={{ color: scoreTextColor }}>
                                {score}
                            </div>
                            <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mt-1.5">
                                AI-Native Score
                            </div>
                            <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mt-1 border border-neutral-300 px-1.5 py-0.5">
                                {scoreLabel}
                            </div>
                        </div>
                    </div>

                    {/* Score bar */}
                    <div className="mt-4 pt-4 border-t border-neutral-200">
                        <div className="h-2 bg-neutral-100 border border-neutral-200 mb-2">
                            <div className={`h-full ${scoreBarColor} transition-all`} style={{ width: `${score}%` }} />
                        </div>
                        <p className="font-mono text-xs text-neutral-500 leading-relaxed">
                            {scorecard.aiNativeScore.summary}
                        </p>
                    </div>
                </div>

                {/* ── Main 3-col grid ──────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left column: 2/3 */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Readiness Profile */}
                        {profileFacts.length > 0 && (
                            <div className="border border-black bg-white p-5">
                                <h2 className="font-mono text-xs uppercase tracking-widest mb-4">Readiness Profile</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                                    {profileFacts.map(({ label, value }) => (
                                        <div key={label}>
                                            <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-0.5">{label}</div>
                                            <div className="font-mono text-xs font-bold text-black">{value}</div>
                                        </div>
                                    ))}
                                </div>
                                {submission.teamsNeedingAI && submission.teamsNeedingAI.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-neutral-100">
                                        <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-2">Teams needing AI support</div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {submission.teamsNeedingAI.map((t) => (
                                                <span key={t} className="font-mono text-[10px] border border-neutral-300 px-2 py-0.5 text-neutral-600">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pain Points */}
                        {scorecard.painPoints.length > 0 && (
                            <div className="border border-black bg-white">
                                <div className="border-b border-black px-5 py-3">
                                    <h2 className="font-mono text-xs uppercase tracking-widest">Pain Points Identified</h2>
                                </div>
                                <div className="divide-y divide-neutral-100">
                                    {scorecard.painPoints.map((p, i) => (
                                        <div key={i} className="px-5 py-4 flex gap-4">
                                            <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mt-0.5 w-20 flex-shrink-0 leading-relaxed">
                                                {p.area}
                                            </span>
                                            <p className="font-mono text-sm text-neutral-600 leading-relaxed">{p.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        {scorecard.recommendations.length > 0 && (
                            <div className="border border-black bg-white">
                                <div className="border-b border-black px-5 py-3">
                                    <h2 className="font-mono text-xs uppercase tracking-widest">Recommendations</h2>
                                </div>
                                <div className="divide-y divide-neutral-100">
                                    {scorecard.recommendations.map((r, i) => (
                                        <div key={i} className="px-5 py-4">
                                            <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                                                <span className="font-mono text-xs font-bold">
                                                    {i + 1}. {r.title}
                                                </span>
                                                <div className="flex gap-1.5 flex-shrink-0">
                                                    <span className={`font-mono text-[10px] border px-1.5 py-0.5 ${impactBadge(r.impact)}`}>
                                                        {r.impact} Impact
                                                    </span>
                                                    <span className={`font-mono text-[10px] border px-1.5 py-0.5 ${effortBadge(r.difficulty)}`}>
                                                        {r.difficulty} Effort
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="font-mono text-xs text-neutral-500 leading-relaxed">{r.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right sidebar: 1/3 */}
                    <div className="space-y-5">

                        {/* Current Stack */}
                        {scorecard.currentStack.length > 0 && (
                            <div className="border border-black bg-white p-5">
                                <h2 className="font-mono text-xs uppercase tracking-widest mb-3">Current Stack</h2>
                                <div className="space-y-2">
                                    {scorecard.currentStack.map((t, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-7 h-7 border border-neutral-200 bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                <LogoImage
                                                    src={faviconUrl(t.name)}
                                                    alt={t.name}
                                                    fallbackChar={t.name}
                                                    className="w-4 h-4"
                                                    fallbackClassName="w-7 h-7 text-[9px]"
                                                />
                                            </div>
                                            <span className="font-mono text-xs flex-1 truncate">{t.name}</span>
                                            <span className={`font-mono text-[9px] uppercase tracking-widest border px-1 py-0.5 flex-shrink-0 ${aiRoleBadge(t.aiRole)}`}>
                                                {aiRoleShort(t.aiRole)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommended Tools */}
                        {recommendedTools.length > 0 && (
                            <div className="border border-black bg-white">
                                <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                                    <h2 className="font-mono text-xs uppercase tracking-widest">Recommended</h2>
                                    <span className="font-mono text-[9px] text-neutral-400">Tools to adopt</span>
                                </div>
                                <div className="divide-y divide-neutral-100">
                                    {recommendedTools.map((t, i) => (
                                        <div key={i} className="p-4 flex items-start gap-3">
                                            <div className="w-8 h-8 border border-neutral-200 bg-white flex items-center justify-center flex-shrink-0 overflow-hidden mt-0.5">
                                                <LogoImage
                                                    src={t.websiteDomain ? clearbitLogo(t.websiteDomain) : faviconUrl(t.name)}
                                                    alt={t.name}
                                                    fallbackChar={t.name}
                                                    className="w-5 h-5"
                                                    fallbackClassName="w-8 h-8 text-[10px]"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                                    <span className="font-mono text-xs font-bold">{t.name}</span>
                                                    <span className={`font-mono text-[9px] border px-1 py-0.5 flex-shrink-0 ${impactBadge(t.impact)}`}>
                                                        {t.impact}
                                                    </span>
                                                </div>
                                                <p className="font-mono text-[9px] text-neutral-400 mb-1">{t.category}</p>
                                                <p className="font-mono text-[10px] text-neutral-600 leading-relaxed">{t.reason}</p>
                                                {t.estimatedCostPerUser && (
                                                    <p className="font-mono text-[9px] text-neutral-400 mt-1">{t.estimatedCostPerUser}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Company Context */}
                        <div className="border border-black bg-white p-5">
                            <h2 className="font-mono text-xs uppercase tracking-widest mb-3">Company Context</h2>
                            <div className="space-y-2">
                                {[
                                    { label: "Industry", value: scorecard.industry },
                                    { label: "Company Size", value: scorecard.companySize },
                                    { label: "Employees", value: submission.employeeCount },
                                    { label: "Monthly Spend", value: submission.monthlySpend },
                                    { label: "Failed AI", value: submission.failedAI },
                                ].filter((f): f is { label: string; value: string } => !!f.value).map(({ label, value }) => (
                                    <div key={label} className="flex items-start justify-between gap-2 border-b border-neutral-100 pb-2 last:border-0 last:pb-0">
                                        <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 flex-shrink-0">{label}</span>
                                        <span className="font-mono text-[10px] text-right max-w-[60%]">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Powered by Trackr CTA (sidebar) */}
                        <div className="border border-black bg-black text-white p-5">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">
                                Research your tools
                            </p>
                            <p className="font-serif text-base font-normal mb-4 text-white leading-snug">
                                Get a report like this for any AI tool in under 2 minutes.
                            </p>
                            <a
                                href="https://trytrackr.com/sign-up"
                                className="block text-center bg-white text-black px-4 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-neutral-100 transition-colors border border-white"
                            >
                                Get Started Free →
                            </a>
                        </div>
                    </div>
                </div>

                {/* ── Future Target ────────────────────────────────────── */}
                <div className="border-2 border-black bg-black text-white p-6 flex items-center gap-6">
                    <div className="flex-shrink-0">
                        <span className="font-mono font-black leading-none text-white" style={{ fontSize: "3.5rem" }}>
                            {scorecard.futureAINativeTarget.targetScore}
                        </span>
                        <span className="font-mono text-xl text-white/30">/100</span>
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

                {/* ── Bottom CTA ───────────────────────────────────────── */}
                <div className="border border-black bg-white p-8 space-y-5">
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Powered by Trackr</p>
                        <h3 className="font-serif text-2xl font-normal mb-2">Is your company AI-native?</h3>
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
