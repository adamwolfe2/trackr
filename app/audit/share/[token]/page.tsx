import { db } from "@/lib/db";
import { auditSubmissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, ArrowRight, Clock, Zap } from "lucide-react";
import { TrackrLogo } from "@/components/common/trackr-logo";
import { LogoImage } from "@/components/common/logo-image";
import { getToolDomain as getToolDomainShared } from "@/lib/utils/tool-logos";
import { ScoreArc } from "@/components/audit/score-arc";
import type { Metadata } from "next";
import type { AuditScorecard } from "@/lib/actions/audit";
import { PACKAGE_LIST } from "@/lib/config/architect-packages";
import type { PackageSlug } from "@/lib/config/architect-packages";

export const dynamic = "force-dynamic";

// ── Types ─────────────────────────────────────────────────────────────────────

type WorkflowGap = {
    workflowName: string;
    stages: Array<{ name: string; tool: string | null; status: "covered" | "partial" | "gap" }>;
    bottleneck: string;
    fixDescription: string;
};

type IndustryBenchmark = {
    peerAvgScore: number;
    peerLabel: string;
    percentile: number;
    insight: string;
    competitiveContext?: string;
};

type QuickWin = {
    action: string;
    tool: string;
    timeToValue: string;
    expectedOutcome: string;
};

type RoiProjection = {
    currentAnnualWaste: number;
    projectedSavings: number;
    paybackMonths: number;
    assumptions: string[];
};

type ExtendedScorecard = AuditScorecard & {
    executiveSummary?: string | null;
    painPoints: Array<{ area: string; description: string; annualCostEstimate?: string | null }>;
    recommendations: Array<{
        title: string; impact: "High" | "Medium" | "Low"; difficulty: "High" | "Medium" | "Low";
        description: string; estimatedROI?: string | null; implementationSteps?: string[];
    }>;
    recommendedTools?: RecommendedTool[];
    workflowGaps?: WorkflowGap[];
    industryBenchmark?: IndustryBenchmark;
    roiProjection?: RoiProjection;
    quickWins?: QuickWin[];
};

type RecommendedTool = { name: string; websiteDomain: string | null; category: string; whatItDoes?: string; problemItSolves?: string; painPointLink?: string | null; reason: string; impact: "High" | "Medium" | "Low"; implementationSteps?: string[]; integrationTarget?: string | null };
type MergedTool = { name: string; category: string | null; aiRole: "AI-native" | "AI-assisted" | "Non-AI core infra"; usageNotes: string | null };

// ── Tool intelligence ─────────────────────────────────────────────────────────

const TOOL_DOMAINS: Record<string, string> = {
    "google ads": "ads.google.com", "google analytics": "analytics.google.com",
    "google workspace": "workspace.google.com", "google drive": "drive.google.com",
    "google sheets": "sheets.google.com", "google docs": "docs.google.com",
    "google calendar": "calendar.google.com", "google meet": "meet.google.com",
    "gmail": "google.com", "notion": "notion.so", "notion ai": "notion.so",
    "openai": "openai.com", "chatgpt": "openai.com", "gpt-4": "openai.com",
    "gpt4": "openai.com", "claude": "anthropic.com", "anthropic": "anthropic.com",
    "v0 by vercel": "vercel.com", "v0": "v0.dev",
    "slack": "slack.com", "zoom": "zoom.us", "microsoft teams": "microsoft.com",
    "microsoft 365": "microsoft.com", "outlook": "microsoft.com",
    "hubspot": "hubspot.com", "salesforce": "salesforce.com",
    "pipedrive": "pipedrive.com", "close": "close.com", "close crm": "close.com",
    "apollo": "apollo.io", "apollo.io": "apollo.io",
    "clay": "clay.com", "instantly": "instantly.ai", "lemlist": "lemlist.com",
    "zapier": "zapier.com", "make": "make.com", "make.com": "make.com",
    "n8n": "n8n.io", "n8n.io": "n8n.io",
    "airtable": "airtable.com", "asana": "asana.com", "monday": "monday.com",
    "linear": "linear.app", "jira": "atlassian.com", "confluence": "atlassian.com",
    "trello": "trello.com", "figma": "figma.com", "canva": "canva.com",
    "stripe": "stripe.com", "quickbooks": "intuit.com", "xero": "xero.com",
    "shopify": "shopify.com", "webflow": "webflow.com",
    "mailchimp": "mailchimp.com", "klaviyo": "klaviyo.com",
    "intercom": "intercom.com", "zendesk": "zendesk.com",
    "freshdesk": "freshdesk.com", "helpscout": "helpscout.com",
    "tableau": "tableau.com", "looker": "looker.com",
    "mixpanel": "mixpanel.com", "amplitude": "amplitude.com",
    "posthog": "posthog.com", "segment": "segment.com",
    "github": "github.com", "gitlab": "gitlab.com", "vercel": "vercel.com",
    "loom": "loom.com", "typeform": "typeform.com", "calendly": "calendly.com",
    "cal.com": "cal.com", "dropbox": "dropbox.com",
    "docusign": "docusign.com", "pandadoc": "pandadoc.com",
    "rippling": "rippling.com", "gusto": "gusto.com", "deel": "deel.com",
    "gohighlevel": "gohighlevel.com", "ghl": "gohighlevel.com", "highlevel": "gohighlevel.com",
    "perplexity": "perplexity.ai", "cursor": "cursor.sh",
    "gemini": "google.com", "grok": "x.ai", "midjourney": "midjourney.com",
    "elevenlabs": "elevenlabs.io", "runway": "runwayml.com",
    "jasper": "jasper.ai", "copy.ai": "copy.ai",
    "grammarly": "grammarly.com", "superhuman": "superhuman.com",
    "hotjar": "hotjar.com", "fullstory": "fullstory.com",
    "miro": "miro.com", "coda": "coda.io",
    "twilio": "twilio.com", "sendgrid": "sendgrid.com",
    "snowflake": "snowflake.com", "fivetran": "fivetran.com",
    "sentry": "sentry.io", "datadog": "datadoghq.com",
    "wordpress": "wordpress.com", "wix": "wix.com",
    "instagram": "instagram.com", "linkedin": "linkedin.com",
    "tiktok": "tiktok.com", "twitter": "twitter.com", "x / twitter": "x.com",
    "youtube": "youtube.com", "reddit": "reddit.com", "pinterest": "pinterest.com",
    "meta": "meta.com", "facebook": "facebook.com",
    "cloudflare": "cloudflare.com", "aws": "aws.amazon.com",
    "supabase": "supabase.com", "firebase": "firebase.google.com",
    "stripe atlas": "stripe.com", "squarespace": "squarespace.com",
    "framer": "framer.com", "search console": "search.google.com",
    "semrush": "semrush.com", "ahrefs": "ahrefs.com",
    "convertkit": "convertkit.com", "beehiiv": "beehiiv.com",
    "fathom": "usefathom.com", "otter": "otter.ai", "otter.ai": "otter.ai",
    "fireflies": "fireflies.ai", "fireflies.ai": "fireflies.ai",
    "descript": "descript.com", "heygen": "heygen.com",
    "monday.com": "monday.com", "clickup": "clickup.com",
    "mural": "mural.co", "lucidchart": "lucidchart.com",
    "zoom info": "zoominfo.com", "zoominfo": "zoominfo.com",
    "outreach": "outreach.io", "salesloft": "salesloft.com",
    "drift": "drift.com", "crisp": "crisp.chat", "tidio": "tidio.com",
    "freshsales": "freshworks.com", "copper": "copper.com",
    "notion calendar": "notion.so", "calendly scheduling": "calendly.com",
};

const AI_NATIVE_TOOLS = [
    "openai", "chatgpt", "gpt", "claude", "anthropic", "gemini", "grok", "llama",
    "midjourney", "dall-e", "stable diffusion", "runway", "elevenlabs", "synthesia", "heygen",
    "jasper", "copy.ai", "writesonic", "rytr", "otter", "fathom", "fireflies",
    "descript", "cursor", "copilot", "github copilot", "notion ai",
    "perplexity", "superhuman", "clay", "instantly", "v0", "lovable", "bolt", "devin",
    "adobe firefly", "canva ai", "grammarly",
];

const AI_ASSISTED_TOOLS = [
    "google ads", "hubspot", "salesforce", "zapier", "make", "n8n", "airtable",
    "intercom", "zendesk", "freshdesk", "drift", "crisp", "notion", "figma",
    "canva", "loom", "typeform", "asana", "linear", "monday", "jira", "trello",
    "slack", "zoom", "google analytics", "mixpanel", "amplitude", "hotjar",
    "shopify", "webflow", "klaviyo", "mailchimp", "segment",
    "github", "vercel", "datadog", "sentry", "tableau", "looker",
    "apollo", "outreach", "salesloft", "convertkit", "beehiiv", "semrush",
];

const HIGH_CRIT_TOOLS = [
    "google ads", "facebook ads", "hubspot", "salesforce", "pipedrive", "close",
    "stripe", "quickbooks", "xero", "shopify",
    "slack", "teams", "gmail", "google workspace", "microsoft 365", "outlook",
    "notion", "airtable", "google sheets", "google drive",
    "github", "gitlab", "jira", "linear", "asana", "monday",
    "zoom", "google meet", "calendly", "cal.com",
    "google analytics", "mixpanel", "amplitude", "segment",
    "intercom", "zendesk", "helpscout", "freshdesk",
    "zapier", "make", "n8n", "openai", "chatgpt", "claude", "anthropic",
    "twilio", "sendgrid", "mailchimp", "klaviyo",
    "snowflake", "fivetran", "tableau", "looker",
    "apollo", "clay", "instantly", "outreach", "salesloft",
    "dropbox", "docusign", "pandadoc",
    "rippling", "gusto", "deel", "workday",
    "gohighlevel", "ghl", "highlevel",
    "vercel", "aws", "cloudflare", "supabase",
];

function getToolDomain(name: string, hint?: string | null): string {
    return getToolDomainShared(name, hint);
}

/** Use Google Favicon for small icons (reliable, always square), Clearbit for larger logos */
function faviconUrl(domain: string): string {
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}
function clearbitLogoUrl(domain: string): string {
    return `https://logo.clearbit.com/${domain}`;
}

function inferAIRole(name: string, existing: string | null): "AI-native" | "AI-assisted" | "Non-AI core infra" {
    if (existing === "AI-native" || existing === "AI-assisted" || existing === "Non-AI core infra") {
        return existing;
    }
    const n = name.toLowerCase();
    if (AI_NATIVE_TOOLS.some(x => n.includes(x))) return "AI-native";
    if (AI_ASSISTED_TOOLS.some(x => n.includes(x))) return "AI-assisted";
    return "Non-AI core infra";
}

function inferCriticality(name: string, category: string | null): "high" | "low" {
    const n = name.toLowerCase();
    const c = (category ?? "").toLowerCase();
    if (HIGH_CRIT_TOOLS.some(x => n.includes(x))) return "high";
    const highCatWords = ["crm", "sales", "payment", "billing", "finance", "analytics", "email", "communication", "automation", "core", "platform"];
    if (highCatWords.some(x => c.includes(x))) return "high";
    return "low";
}

// ── Other helpers ─────────────────────────────────────────────────────────────

function getWebsiteHostname(website: string | null | undefined): string | null {
    if (!website) return null;
    try {
        const url = website.startsWith("http") ? website : `https://${website}`;
        return new URL(url).hostname.replace("www.", "");
    } catch { return website; }
}

function mergeToolData(allTools: string[], stack: AuditScorecard["currentStack"]): MergedTool[] {
    return allTools.map(name => {
        const match = stack.find(s =>
            s.name.toLowerCase().trim() === name.toLowerCase().trim() ||
            name.toLowerCase().includes(s.name.toLowerCase()) ||
            s.name.toLowerCase().includes(name.toLowerCase())
        );
        return {
            name,
            category: match?.category ?? null,
            aiRole: inferAIRole(name, match?.aiRole ?? null),
            usageNotes: match?.usageNotes ?? null,
        };
    });
}

function parseAdoptionPct(val: string | null): number {
    if (!val) return 20;
    const n = parseFloat(val.replace(/[^0-9.]/g, ""));
    if (!isNaN(n) && n <= 100) return Math.round(n);
    if (val.includes("80") || val.includes("90") || val.includes("100")) return 88;
    if (val.includes("50") || val.includes("60") || val.includes("70")) return 62;
    if (val.includes("30") || val.includes("40")) return 38;
    return 20;
}

function computeDimensions(
    sub: { dailyAdoptionPct: string | null; hasAIManager: string | null; monthlySpend: string | null },
    scorecard: ExtendedScorecard,
    allTools: MergedTool[],
): Array<{ label: string; score: number; detail: string }> {
    const adoption = parseAdoptionPct(sub.dailyAdoptionPct);
    const aiNative = allTools.filter(t => t.aiRole === "AI-native").length;
    const aiAssisted = allTools.filter(t => t.aiRole === "AI-assisted").length;
    const total = allTools.length || 1;
    const stackMaturity = Math.round(((aiNative + aiAssisted * 0.6) / total) * 100);
    const governance = (sub.hasAIManager ?? "").toLowerCase().includes("yes") ? 76 : 22;
    const integration = Math.min(Math.round(total * 2.5), 72);
    const spendVis = sub.monthlySpend ? 68 : 32;
    const automation = Math.round((adoption + stackMaturity) / 2);
    return [
        { label: "AI Daily Adoption", score: adoption, detail: sub.dailyAdoptionPct ?? "Not tracked" },
        { label: "Stack AI Maturity", score: stackMaturity, detail: `${aiNative} AI-native · ${aiAssisted} AI-assisted` },
        { label: "Governance & Oversight", score: governance, detail: governance > 50 ? "AI manager in place" : "No dedicated AI owner" },
        { label: "Integration Density", score: integration, detail: `${total} tools mapped` },
        { label: "Spend Visibility", score: spendVis, detail: sub.monthlySpend ?? "Unknown" },
        { label: "Automation Coverage", score: automation, detail: "Workflow automation index" },
    ];
}

function getIndustryBenchmarks(industry: string | null): { avg: number; leader: number; label: string } {
    const i = (industry ?? "").toLowerCase();
    if (i.includes("agency") || i.includes("consult")) return { avg: 54, leader: 88, label: "Agency / Consultancy" };
    if (i.includes("saas") || i.includes("software") || i.includes("tech")) return { avg: 67, leader: 92, label: "SaaS / Technology" };
    if (i.includes("ecommerce") || i.includes("retail")) return { avg: 48, leader: 84, label: "E-Commerce / Retail" };
    if (i.includes("finance") || i.includes("fintech")) return { avg: 52, leader: 86, label: "Finance / FinTech" };
    if (i.includes("healthcare") || i.includes("health")) return { avg: 44, leader: 80, label: "Healthcare" };
    if (i.includes("media") || i.includes("marketing")) return { avg: 56, leader: 86, label: "Media / Marketing" };
    return { avg: 55, leader: 88, label: "B2B Services" };
}

function getPeerExamples(industry: string | null): string[] {
    const i = (industry ?? "").toLowerCase();
    if (i.includes("agency") || i.includes("consult")) return [
        "A $40M digital agency moved 52→81 in 9 months — cutting tool costs $14K/mo, accelerating delivery cycles 34%.",
        "A 60-person consultancy at 48 implemented AI governance and hit 74 in 6 months, saving 12 hrs/week per senior consultant.",
    ];
    if (i.includes("saas") || i.includes("software")) return [
        "A $22M SaaS company moved 61→89 in 6 months — support tickets fell 40%, features shipped 28% faster.",
        "A 45-person software firm at 55 automated QA and docs, recapturing 18 hrs/week in engineering time.",
    ];
    return [
        "A $35M B2B services company moved 58→79 in 7 months — recovering $210K in annual productivity.",
        "A 75-person growth-stage company at 51 cut tool sprawl from 32 to 18 tools, saving $8.5K/month.",
    ];
}

function estimateWasteNum(spend: string | null): number {
    if (!spend) return 20;
    const m = spend.match(/\$?(\d+)K?/);
    if (!m) return 20;
    const monthly = parseInt(m[1]) * (spend.includes("K") ? 1000 : 1);
    return Math.round((monthly * 0.30 * 12) / 1000);
}

function getInactionRisks(score: number, spend: string | null, adoption: string | null, toolCount: number): string[] {
    const waste = estimateWasteNum(spend);
    return [
        `Competitors structuring AI strategy now compound a 15–25% productivity advantage each quarter. At your current ${adoption ?? "low"} daily adoption rate, the gap grows without deliberate intervention.`,
        `${toolCount}+ tools without centralized governance typically yields 25–35% redundant spend. At your baseline that represents an estimated $${waste}K–${Math.round(waste * 1.4)}K annually — invisible until the next renewal cycle.`,
        `Without AI-assisted workflows, your team spends an estimated ${score < 40 ? "10–15" : score < 60 ? "6–10" : "4–6"} hrs/week per person on automatable tasks — a compounding drag on headcount efficiency.`,
    ];
}

// ── Badge helpers ─────────────────────────────────────────────────────────────

function aiRoleBadge(role: string | null) {
    if (role === "AI-native") return "bg-neutral-100 text-black border-neutral-300";
    if (role === "AI-assisted") return "bg-neutral-50 text-neutral-700 border-neutral-200";
    return "bg-neutral-100 text-neutral-500 border-neutral-300";
}
function impactBadge(level: string) {
    if (level === "High") return "bg-red-50 text-red-700 border-red-300";
    if (level === "Medium") return "bg-amber-50 text-amber-700 border-amber-300";
    return "bg-neutral-100 text-neutral-500 border-neutral-300";
}
function scoreColor(score: number) {
    if (score <= 40) return "text-red-600";
    if (score <= 65) return "text-amber-600";
    if (score <= 85) return "text-neutral-700";
    return "text-black";
}
function dimColor(score: number) {
    if (score >= 68) return "#171717";
    if (score >= 42) return "#D97706";
    return "#DC2626";
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
    const { token } = await params;
    const sub = await db.query.auditSubmissions.findFirst({
        where: eq(auditSubmissions.shareToken, token), columns: { companyName: true, scorecard: true },
    });
    if (!sub) return { title: "AI Readiness Assessment", robots: { index: false } };
    const sc = sub.scorecard as { aiNativeScore?: { score?: number } } | null;
    const score = sc?.aiNativeScore?.score;
    const ogUrl = `/api/og?type=audit&name=${encodeURIComponent(sub.companyName)}${score != null ? `&score=${score}` : ""}`;
    return {
        title: `AI Readiness Assessment — ${sub.companyName}`,
        description: `AI Readiness Assessment for ${sub.companyName}${score != null ? `. Score: ${score}/100.` : ""}`,
        openGraph: {
            title: `${sub.companyName} — AI Readiness Assessment`,
            images: [{ url: ogUrl, width: 1200, height: 630, alt: `${sub.companyName} AI Audit` }],
        },
        twitter: { card: "summary_large_image", images: [ogUrl] },
        robots: { index: false },
    };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const submission = await db.query.auditSubmissions.findFirst({
        where: eq(auditSubmissions.shareToken, token),
    });
    if (!submission || submission.status !== "complete" || !submission.scorecard) notFound();

    const scorecard = submission.scorecard as ExtendedScorecard;
    const score = scorecard.aiNativeScore.score;
    const selectedPackageSlug = ((submission.scorecard as Record<string, unknown>).selectedPackage as PackageSlug | undefined) ?? null;
    const selectedPackage = selectedPackageSlug ? PACKAGE_LIST.find(p => p.slug === selectedPackageSlug) ?? null : null;
    const allToolNames = (submission.currentTools ?? []) as string[];
    const mergedTools = mergeToolData(allToolNames, scorecard.currentStack);
    const recommendedTools = scorecard.recommendedTools ?? [];
    const scoreQuickWins = scorecard.quickWins ?? [];
    const benchmarks = getIndustryBenchmarks(submission.industry);
    const peerExamples = getPeerExamples(submission.industry);
    const dimensions = computeDimensions(submission, scorecard, mergedTools);
    const inactionRisks = getInactionRisks(score, submission.monthlySpend, submission.dailyAdoptionPct, mergedTools.length);

    const websiteHostname = getWebsiteHostname(submission.companyWebsite);
    const companyDomain = websiteHostname ?? "";
    const reportDate = new Date(submission.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const executiveSummary = scorecard.executiveSummary ?? scorecard.aiNativeScore.summary;

    const profileFacts = [
        { label: "Total Tools", value: mergedTools.length > 0 ? `${mergedTools.length} tools` : submission.aiToolCount },
        { label: "Daily Adoption", value: submission.dailyAdoptionPct },
        { label: "Monthly Spend", value: submission.monthlySpend },
        { label: "Employees", value: submission.employeeCount },
        { label: "Revenue", value: (submission as typeof submission & { revenue?: string }).revenue ?? null },
        { label: "AI Governance", value: submission.hasAIManager },
    ].filter((f): f is { label: string; value: string } => !!f.value);

    const teamsNeedingAI = submission.teamsNeedingAI as string[] | null;

    // Matrix quadrant buckets (using inferred data for ALL tools)
    const champions = mergedTools.filter(t => inferCriticality(t.name, t.category) === "high" && t.aiRole === "AI-native");
    const quickWins  = mergedTools.filter(t => inferCriticality(t.name, t.category) === "high" && t.aiRole !== "AI-native");
    const explorers  = mergedTools.filter(t => inferCriticality(t.name, t.category) === "low" && t.aiRole === "AI-native");
    const evaluate   = mergedTools.filter(t => inferCriticality(t.name, t.category) === "low" && t.aiRole !== "AI-native");

    // Stack summary counts
    const nativeCount   = mergedTools.filter(t => t.aiRole === "AI-native").length;
    const assistedCount = mergedTools.filter(t => t.aiRole === "AI-assisted").length;
    const coreCount     = mergedTools.filter(t => t.aiRole === "Non-AI core infra").length;
    const totalCount    = mergedTools.length;

    return (
        <div className="min-h-screen bg-[#F3F3EF]">

            {/* ── Nav ──────────────────────────────────────────────────────────── */}
            <nav className="border-b border-black bg-[#F3F3EF] px-6 py-3.5 flex items-center justify-between sticky top-0 z-40">
                <a href="https://trytrackr.com" className="flex items-center gap-2 hover:opacity-60 transition-opacity">
                    <TrackrLogo size={18} />
                    <span className="font-mono text-sm font-semibold tracking-tight">Trackr</span>
                </a>
                <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 border border-neutral-300 px-3 py-1">AI Readiness Report</span>
                    <span className="font-mono text-[10px] text-neutral-400 hidden sm:block">Confidential</span>
                </div>
            </nav>

            {/* ── Hero ─────────────────────────────────────────────────────────── */}
            <div className="border-b border-black bg-[#F3F3EF]">
                <div className="max-w-7xl mx-auto px-6 py-10 lg:py-14">
                    <div className="grid lg:grid-cols-5 gap-10 items-start">

                        {/* Left 3/5 */}
                        <div className="lg:col-span-3 space-y-6">
                            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400">AI Readiness Report · {reportDate}</p>

                            {/* Company identity */}
                            <div className="flex items-center gap-4">
                                {companyDomain && (
                                    <div className="w-14 h-14 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                        <LogoImage
                                            src={clearbitLogoUrl(companyDomain)}
                                            fallbackSrc={faviconUrl(companyDomain)}
                                            alt={submission.companyName}
                                            fallbackChar={submission.companyName}
                                            className="w-14 h-14 object-contain"
                                            fallbackClassName="w-14 h-14 text-base border border-neutral-200"
                                        />
                                    </div>
                                )}
                                <div>
                                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-1">
                                        {[submission.industry, submission.companySize].filter(Boolean).join(" · ")}
                                    </p>
                                    <h1 className="font-serif text-4xl lg:text-[2.75rem] font-normal leading-tight tracking-tight">
                                        {submission.companyName}
                                    </h1>
                                </div>
                            </div>

                            {/* Meta row */}
                            <div className="flex items-center gap-4 flex-wrap font-mono text-xs text-neutral-500">
                                {submission.contactName && (
                                    <span className="text-neutral-700">Prepared for: <strong>{submission.contactName}</strong>{submission.role ? `, ${submission.role}` : ""}</span>
                                )}
                                {websiteHostname && (
                                    <a href={submission.companyWebsite!.startsWith("http") ? submission.companyWebsite! : `https://${submission.companyWebsite}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1 hover:text-black transition-colors">
                                        {websiteHostname} <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>

                            {/* AORI bar */}
                            <div>
                                <div className="flex items-center justify-between font-mono text-[10px] text-neutral-500 mb-1.5">
                                    <span>AI Operational Readiness Index™</span>
                                    <span className={scoreColor(score)}>
                                        {score < 21 ? "Minimal" : score < 41 ? "Ad-hoc" : score < 61 ? "Developing" : score < 81 ? "Advancing" : "AI-Native"}
                                    </span>
                                </div>
                                <div className="h-2 bg-neutral-200 mb-2">
                                    <div className="h-full" style={{ width: `${score}%`, background: score <= 40 ? "#DC2626" : score <= 65 ? "#D97706" : score <= 85 ? "#525252" : "#171717" }} />
                                </div>
                                <p className="font-mono text-xs text-neutral-600 leading-relaxed">{scorecard.aiNativeScore.summary}</p>
                            </div>

                            {/* Dimension bars 2×3 */}
                            <div className="grid grid-cols-2 gap-x-8 gap-y-3.5 pt-2 border-t border-neutral-200">
                                {dimensions.map(d => (
                                    <div key={d.label}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">{d.label}</span>
                                            <span className="font-mono text-[10px] font-bold tabular-nums" style={{ color: dimColor(d.score) }}>{d.score}</span>
                                        </div>
                                        <div className="h-1 bg-neutral-200">
                                            <div className="h-full" style={{ width: `${d.score}%`, background: dimColor(d.score) }} />
                                        </div>
                                        <p className="font-mono text-[8px] text-neutral-400 mt-0.5 truncate">{d.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right 2/5 */}
                        <div className="lg:col-span-2 flex flex-col items-center gap-5">
                            <ScoreArc score={score} size={210} />

                            <div className="grid grid-cols-3 gap-3 w-full">
                                {[
                                    { label: "Your Score", value: score, cls: scoreColor(score) },
                                    { label: benchmarks.label + " Avg", value: benchmarks.avg, cls: "text-neutral-500" },
                                    { label: "AI Leader Tier", value: benchmarks.leader, cls: "text-black" },
                                ].map(({ label, value, cls }) => (
                                    <div key={label} className="border border-black bg-white p-3 text-center">
                                        <div className={`font-mono text-2xl font-black ${cls}`}>{value}</div>
                                        <div className="font-mono text-[8px] uppercase tracking-widest text-neutral-400 mt-0.5 leading-tight">{label}</div>
                                    </div>
                                ))}
                            </div>

                            <p className="font-mono text-[10px] text-center text-neutral-500 leading-relaxed">
                                <span className={scoreColor(score)}>
                                    {score > benchmarks.avg ? `${score - benchmarks.avg} pts above` : `${benchmarks.avg - score} pts below`}
                                </span>
                                {" "}industry avg ·{" "}
                                <span className="text-neutral-700">{benchmarks.leader - score} pts</span> to AI-Leader tier
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

                {/* ── Executive Summary ──────────────────────────────────────────── */}
                <div className="border border-black bg-white p-6 lg:p-8">
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-4">Executive Summary</p>
                    <p className="font-serif text-base text-neutral-800 leading-relaxed mb-6">{executiveSummary}</p>
                    {profileFacts.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 pt-5 border-t border-neutral-200">
                            {profileFacts.map(({ label, value }) => (
                                <div key={label}>
                                    <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-1">{label}</p>
                                    <p className="font-mono text-sm font-bold leading-snug">{value}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {teamsNeedingAI && teamsNeedingAI.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-neutral-200">
                            <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-2">Teams Prioritizing AI</p>
                            <div className="flex flex-wrap gap-2">
                                {teamsNeedingAI.map(t => (
                                    <span key={t} className="font-mono text-[10px] border border-neutral-300 bg-neutral-50 px-3 py-1 text-neutral-600">{t}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Quick Wins ────────────────────────────────────────────────── */}
                {scoreQuickWins.length > 0 && (
                    <div className="border border-black bg-white">
                        <div className="px-6 py-4 border-b border-black">
                            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 flex items-center gap-2">
                                <Zap className="w-3 h-3" />
                                Immediate Opportunities (No New Purchases)
                            </p>
                            <p className="font-mono text-[9px] text-neutral-400 mt-0.5">
                                Actions you can take this week with tools you already own
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-100">
                            {scoreQuickWins.map((qw, i) => (
                                <div key={i} className="bg-white p-5 flex flex-col">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="font-mono text-[8px] border border-neutral-200 bg-neutral-50 text-neutral-700 px-2 py-0.5">{qw.tool}</span>
                                        <span className="font-mono text-[8px] border border-neutral-200 bg-neutral-50 text-neutral-500 px-2 py-0.5 flex items-center gap-1">
                                            <Clock className="w-2.5 h-2.5" />
                                            {qw.timeToValue}
                                        </span>
                                    </div>
                                    <p className="font-mono text-xs font-bold leading-relaxed mb-2">{qw.action}</p>
                                    <p className="font-mono text-[10px] text-neutral-600 leading-relaxed mt-auto">{qw.expectedOutcome}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Main 3-col grid ───────────────────────────────────────────── */}
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Left 2/3 — Pain Points + Roadmap */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Pain Points */}
                        {scorecard.painPoints.length > 0 && (
                            <div>
                                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-4 flex items-center gap-2">
                                    <span className="w-1 h-3 bg-red-500 inline-block" />
                                    Critical Business Risk Factors
                                </p>
                                <div className="space-y-3">
                                    {scorecard.painPoints.map((p, i) => (
                                        <div key={i} className="bg-white border-l-4 border-l-red-500 border border-neutral-200 p-5">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <span className="font-mono text-[10px] uppercase tracking-widest text-red-600 font-bold">{p.area}</span>
                                                {p.annualCostEstimate && (
                                                    <span className="font-mono text-[9px] border border-amber-300 bg-amber-50 text-amber-700 px-2.5 py-0.5 flex-shrink-0 whitespace-nowrap">
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

                        {/* Roadmap */}
                        {scorecard.recommendations.length > 0 && (
                            <div>
                                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-4 flex items-center gap-2">
                                    <span className="w-1 h-3 bg-black inline-block" />
                                    90-Day Strategic Roadmap
                                </p>
                                <div className="space-y-3">
                                    {scorecard.recommendations.map((r, i) => (
                                        <div key={i} className="bg-white border border-neutral-200 p-5">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-baseline gap-3 min-w-0">
                                                    <span className="font-mono text-[11px] text-neutral-300 font-bold flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                                                    <span className="font-mono text-sm font-bold">{r.title}</span>
                                                </div>
                                                <div className="flex gap-1.5 flex-shrink-0">
                                                    <span className={`font-mono text-[8px] border px-2 py-0.5 ${impactBadge(r.impact)}`}>{r.impact} Impact</span>
                                                    <span className="font-mono text-[8px] border border-neutral-200 text-neutral-500 bg-neutral-50 px-2 py-0.5">{r.difficulty} Effort</span>
                                                </div>
                                            </div>
                                            <p className="font-mono text-xs text-neutral-600 leading-relaxed">{r.description}</p>
                                            {r.implementationSteps && r.implementationSteps.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-neutral-100">
                                                    <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-2 flex items-center gap-1.5">
                                                        <ArrowRight className="w-2.5 h-2.5" />
                                                        Implementation Steps
                                                    </p>
                                                    <ol className="space-y-1">
                                                        {r.implementationSteps.map((step, si) => (
                                                            <li key={si} className="font-mono text-[10px] text-neutral-600 flex items-start gap-2">
                                                                <span className="font-mono text-[9px] text-neutral-400 flex-shrink-0 mt-px">{si + 1}.</span>
                                                                {step}
                                                            </li>
                                                        ))}
                                                    </ol>
                                                </div>
                                            )}
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
                    </div>

                    {/* Right 1/3 — Stack + Gaps */}
                    <div className="space-y-6">

                        {/* Stack Intelligence Map — ALL tools */}
                        {mergedTools.length > 0 && (
                            <div className="border border-black bg-white">
                                <div className="px-4 py-3 border-b border-black flex items-center justify-between">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">Stack Intelligence Map</span>
                                    <span className="font-mono text-[9px] text-neutral-400">{mergedTools.length} tools</span>
                                </div>

                                {/* Logo grid strip */}
                                <div className="px-4 py-3 border-b border-neutral-100 flex flex-wrap gap-1">
                                    {mergedTools.map((t, i) => {
                                        const domain = getToolDomain(t.name);
                                        return (
                                            <div key={i} title={t.name} className="w-6 h-6 flex items-center justify-center overflow-hidden">
                                                <LogoImage
                                                    src={faviconUrl(domain)}
                                                    alt={t.name} fallbackChar={t.name}
                                                    className="w-5 h-5 object-contain"
                                                    fallbackClassName="w-6 h-6 text-[7px]"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Tool rows */}
                                <div className="divide-y divide-neutral-100">
                                    {mergedTools.map((t, i) => {
                                        const domain = getToolDomain(t.name);
                                        return (
                                            <div key={i} className="px-4 py-2 flex items-center gap-2.5">
                                                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    <LogoImage
                                                        src={faviconUrl(domain)}
                                                        alt={t.name} fallbackChar={t.name}
                                                        className="w-4 h-4 object-contain"
                                                        fallbackClassName="w-5 h-5 text-[7px]"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-mono text-[11px] font-medium truncate">{t.name}</p>
                                                    {t.category && <p className="font-mono text-[8px] text-neutral-400 truncate">{t.category}</p>}
                                                </div>
                                                <span className={`font-mono text-[7px] uppercase border px-1.5 py-0.5 flex-shrink-0 ${aiRoleBadge(t.aiRole)}`}>
                                                    {t.aiRole === "AI-native" ? "Native" : t.aiRole === "AI-assisted" ? "Assisted" : "Core"}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Recommended Tools */}
                        {recommendedTools.length > 0 && (
                            <div className="border border-black bg-white">
                                <div className="px-4 py-3 border-b border-black flex items-center justify-between">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">Capability Gaps</span>
                                    <span className="font-mono text-[9px] text-neutral-700">To adopt</span>
                                </div>
                                <div className="px-4 py-3 border-b border-neutral-100 flex flex-wrap gap-1">
                                    {recommendedTools.map((t, i) => {
                                        const domain = getToolDomain(t.name, t.websiteDomain);
                                        return (
                                            <div key={i} title={t.name} className="w-6 h-6 flex items-center justify-center overflow-hidden">
                                                <LogoImage
                                                    src={faviconUrl(domain)}
                                                    alt={t.name} fallbackChar={t.name}
                                                    className="w-5 h-5 object-contain"
                                                    fallbackClassName="w-6 h-6 text-[7px]"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="divide-y divide-neutral-100">
                                    {recommendedTools.map((t, i) => {
                                        const domain = getToolDomain(t.name, t.websiteDomain);
                                        return (
                                            <div key={i} className="p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 overflow-hidden mt-0.5 border border-neutral-100">
                                                        <LogoImage
                                                            src={clearbitLogoUrl(domain)}
                                                            fallbackSrc={faviconUrl(domain)}
                                                            alt={t.name} fallbackChar={t.name}
                                                            className="w-6 h-6 object-contain"
                                                            fallbackClassName="w-8 h-8 text-[9px]"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                            <span className="font-mono text-xs font-bold">{t.name}</span>
                                                            <span className={`font-mono text-[8px] border px-1.5 py-0.5 ${impactBadge(t.impact)}`}>{t.impact}</span>
                                                        </div>
                                                        <p className="font-mono text-[9px] text-neutral-400 mb-1">{t.category}</p>
                                                        {t.whatItDoes && (
                                                            <p className="font-mono text-[10px] text-neutral-700 leading-relaxed font-medium">{t.whatItDoes}</p>
                                                        )}
                                                        {t.problemItSolves && (
                                                            <p className="font-mono text-[10px] text-neutral-600 leading-relaxed mt-0.5">
                                                                <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mr-1.5">Solves:</span>
                                                                {t.problemItSolves}
                                                            </p>
                                                        )}
                                                        {t.painPointLink && (
                                                            <span className="inline-block font-mono text-[8px] uppercase tracking-widest border border-neutral-300 text-neutral-500 px-1.5 py-0.5 mt-1">{t.painPointLink}</span>
                                                        )}
                                                        <p className="font-mono text-[10px] text-neutral-600 leading-relaxed mt-1">{t.reason}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Workflow Gap Analysis ──────────────────────────────────────── */}
                {scorecard.workflowGaps && scorecard.workflowGaps.length > 0 && (
                    <div className="border border-black bg-white">
                        <div className="px-6 py-4 border-b border-black">
                            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 flex items-center gap-2">
                                <span className="w-1 h-3 bg-amber-500 inline-block" />
                                Workflow Gap Analysis
                            </p>
                            <p className="font-mono text-[9px] text-neutral-400 mt-0.5">End-to-end workflow coverage across {scorecard.workflowGaps.length} critical processes</p>
                        </div>
                        <div className="divide-y divide-neutral-100">
                            {scorecard.workflowGaps.map((wf, i) => (
                                <div key={i} className="p-5 lg:p-6">
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div>
                                            <p className="font-mono text-sm font-bold">{wf.workflowName}</p>
                                            <p className="font-mono text-[10px] text-red-600 mt-1">Bottleneck: {wf.bottleneck}</p>
                                        </div>
                                        <span className="font-mono text-[9px] border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-neutral-500 flex-shrink-0">
                                            {wf.stages.filter(s => s.status === "gap").length} gap{wf.stages.filter(s => s.status === "gap").length !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                    {/* Stage pipeline */}
                                    <div className="flex items-stretch gap-0 overflow-x-auto mb-4">
                                        {wf.stages.map((stage, si) => (
                                            <div key={si} className="flex items-stretch">
                                                <div className={`px-3 py-2.5 border text-center min-w-[100px] ${
                                                    stage.status === "covered" ? "border-neutral-300 bg-neutral-50" :
                                                    stage.status === "partial" ? "border-amber-300 bg-amber-50" :
                                                    "border-red-300 bg-red-50"
                                                }`}>
                                                    <p className="font-mono text-[10px] font-bold leading-tight">{stage.name}</p>
                                                    <p className={`font-mono text-[8px] mt-1 ${
                                                        stage.status === "covered" ? "text-black" :
                                                        stage.status === "partial" ? "text-amber-600" :
                                                        "text-red-600"
                                                    }`}>
                                                        {stage.tool ?? "No tool"}
                                                    </p>
                                                    <span className={`inline-block font-mono text-[7px] uppercase tracking-wider mt-1 px-1.5 py-0.5 border ${
                                                        stage.status === "covered" ? "border-neutral-300 text-black" :
                                                        stage.status === "partial" ? "border-amber-300 text-amber-700" :
                                                        "border-red-300 text-red-700"
                                                    }`}>{stage.status}</span>
                                                </div>
                                                {si < wf.stages.length - 1 && (
                                                    <div className="flex items-center px-1">
                                                        <span className="font-mono text-neutral-300 text-xs">→</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="font-mono text-xs text-neutral-600 leading-relaxed">{wf.fixDescription}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Industry Benchmark (Deep) ────────────────────────────────────── */}
                {scorecard.industryBenchmark && (
                    <div className="border border-black bg-white p-6 lg:p-8">
                        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-6 flex items-center gap-2">
                            <span className="w-1 h-3 bg-black inline-block" />
                            Deep Industry Benchmark
                        </p>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {[
                                { label: "Your Score", value: score, cls: scoreColor(score) },
                                { label: scorecard.industryBenchmark.peerLabel, value: scorecard.industryBenchmark.peerAvgScore, cls: "text-neutral-500" },
                                { label: "Your Percentile", value: `${scorecard.industryBenchmark.percentile}%`, cls: scorecard.industryBenchmark.percentile >= 50 ? "text-black" : "text-amber-600" },
                            ].map(({ label, value, cls }) => (
                                <div key={label} className="border border-neutral-200 bg-[#F3F3EF] p-5 text-center">
                                    <div className={`font-mono text-4xl font-black mb-2 ${cls}`}>{value}</div>
                                    <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 leading-tight">{label}</div>
                                </div>
                            ))}
                        </div>
                        <p className="font-mono text-sm text-neutral-700 leading-relaxed">{scorecard.industryBenchmark.insight}</p>
                        {scorecard.industryBenchmark.competitiveContext && (
                            <div className="mt-5 pt-4 border-t border-neutral-200">
                                <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-2">Competitive Context</p>
                                <p className="font-mono text-sm text-neutral-700 leading-relaxed">{scorecard.industryBenchmark.competitiveContext}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── ROI Projection ────────────────────────────────────────────────── */}
                {scorecard.roiProjection && (
                    <div className="border-2 border-black bg-white p-6 lg:p-8">
                        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-black mb-6 flex items-center gap-2">
                            <span className="w-1 h-3 bg-black inline-block" />
                            ROI Projection — Implementation Impact
                        </p>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="border border-red-200 bg-red-50 p-5 text-center">
                                <div className="font-mono text-3xl font-black text-red-600 mb-1">
                                    ${Math.round(scorecard.roiProjection.currentAnnualWaste / 1000)}K
                                </div>
                                <div className="font-mono text-[9px] uppercase tracking-widest text-red-400">Annual Waste</div>
                            </div>
                            <div className="border border-neutral-200 bg-neutral-50 p-5 text-center">
                                <div className="font-mono text-3xl font-black text-black mb-1">
                                    ${Math.round(scorecard.roiProjection.projectedSavings / 1000)}K
                                </div>
                                <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">Projected Savings</div>
                            </div>
                            <div className="border border-neutral-200 bg-neutral-50 p-5 text-center">
                                <div className="font-mono text-3xl font-black text-neutral-700 mb-1">
                                    {scorecard.roiProjection.paybackMonths}mo
                                </div>
                                <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">Payback Period</div>
                            </div>
                        </div>
                        <div>
                            <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-3">Assumptions</p>
                            <div className="space-y-2">
                                {scorecard.roiProjection.assumptions.map((a, i) => (
                                    <div key={i} className="flex gap-3 bg-[#F3F3EF] border border-neutral-200 p-3">
                                        <span className="font-mono text-[9px] text-neutral-400 shrink-0 pt-0.5">{String(i + 1).padStart(2, "0")}</span>
                                        <p className="font-mono text-xs text-neutral-600 leading-relaxed">{a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── AI Maturity Matrix ──────────────────────────────────────────── */}
                {mergedTools.length > 0 && (
                    <div className="border border-black bg-white">
                        <div className="px-6 py-4 border-b border-black">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">AI Maturity Matrix</p>
                                    <p className="font-mono text-[9px] text-neutral-400 mt-0.5">Business Criticality × AI Utilization · {mergedTools.length} tools classified</p>
                                </div>
                                {/* Stack summary pills */}
                                <div className="flex gap-2 flex-wrap justify-end">
                                    <span className="font-mono text-[9px] border border-black bg-neutral-100 text-black px-2.5 py-1">{nativeCount} AI-Native</span>
                                    <span className="font-mono text-[9px] border border-neutral-300 bg-neutral-50 text-neutral-700 px-2.5 py-1">{assistedCount} AI-Assisted</span>
                                    <span className="font-mono text-[9px] border border-neutral-300 bg-neutral-100 text-neutral-600 px-2.5 py-1">{coreCount} Core Infra</span>
                                </div>
                            </div>

                            {/* Proportion bar */}
                            <div className="mt-4 h-2 flex gap-px overflow-hidden">
                                {nativeCount > 0 && <div className="bg-black h-full" style={{ width: `${(nativeCount / totalCount) * 100}%` }} />}
                                {assistedCount > 0 && <div className="bg-neutral-400 h-full" style={{ width: `${(assistedCount / totalCount) * 100}%` }} />}
                                {coreCount > 0 && <div className="bg-neutral-300 h-full" style={{ width: `${(coreCount / totalCount) * 100}%` }} />}
                            </div>
                        </div>

                        <div className="grid grid-cols-2">
                            {[
                                { tools: quickWins, title: "Quick Wins", sub: "High Criticality · Low AI Use", desc: "Highest-ROI upgrade targets", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", chip: "border-amber-200 bg-white" },
                                { tools: champions, title: "AI Champions", sub: "High Criticality · High AI Use", desc: "Best-in-class — maximize these", bg: "bg-neutral-50", border: "border-neutral-200", text: "text-black", chip: "border-neutral-200 bg-white" },
                                { tools: evaluate, title: "○ Evaluate", sub: "Low Criticality · Low AI Use", desc: "Assess ROI, consider consolidation", bg: "bg-[#F3F3EF]", border: "border-neutral-200", text: "text-neutral-500", chip: "border-neutral-200 bg-white" },
                                { tools: explorers, title: "Explorers", sub: "Low Criticality · High AI Use", desc: "AI-capable, lower business priority", bg: "bg-neutral-50", border: "border-neutral-200", text: "text-neutral-700", chip: "border-neutral-200 bg-white" },
                            ].map(({ tools, title, sub, desc, bg, text, chip }, qi) => (
                                <div key={qi} className={`${bg} p-5 ${qi === 0 ? "border-r border-b" : qi === 1 ? "border-b" : qi === 2 ? "border-r" : ""} border-neutral-200 min-h-[200px]`}>
                                    <p className={`font-mono text-[10px] font-bold uppercase tracking-wider ${text} mb-0.5`}>{title}</p>
                                    <p className="font-mono text-[8px] text-neutral-400 mb-3">{sub}</p>
                                    {tools.length === 0 ? (
                                        <p className="font-mono text-[9px] text-neutral-400 italic">None identified</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                            {tools.slice(0, 16).map((t, ti) => {
                                                const domain = getToolDomain(t.name);
                                                return (
                                                    <div key={ti} title={t.usageNotes ?? t.name}
                                                        className={`flex items-center gap-1.5 border ${chip} px-2 py-1`}>
                                                        <div className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                            <LogoImage
                                                                src={faviconUrl(domain)}
                                                                alt={t.name} fallbackChar={t.name}
                                                                className="w-3.5 h-3.5 object-contain"
                                                                fallbackClassName="w-3.5 h-3.5 text-[6px]"
                                                            />
                                                        </div>
                                                        <span className="font-mono text-[9px] text-neutral-700">{t.name}</span>
                                                    </div>
                                                );
                                            })}
                                            {tools.length > 16 && (
                                                <span className="font-mono text-[9px] text-neutral-400 px-2 py-1 border border-neutral-200 bg-white">
                                                    +{tools.length - 16} more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <p className={`font-mono text-[8px] ${text} opacity-70 mt-3`}>{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Benchmark Intelligence ───────────────────────────────────── */}
                <div className="border border-black bg-white p-6 lg:p-8">
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-6 flex items-center gap-2">
                        <span className="w-1 h-3 bg-black inline-block" />
                        Benchmark Intelligence — {benchmarks.label}
                    </p>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: "Your Score", value: score, cls: scoreColor(score) },
                            { label: "Industry Average", value: benchmarks.avg, cls: "text-neutral-500" },
                            { label: "AI Leader Tier", value: benchmarks.leader, cls: "text-black" },
                            { label: "Your Potential", value: scorecard.futureAINativeTarget.targetScore, cls: "text-neutral-700" },
                        ].map(({ label, value, cls }) => (
                            <div key={label} className="border border-neutral-200 bg-[#F3F3EF] p-5 text-center">
                                <div className={`font-mono text-5xl font-black mb-2 ${cls}`}>{value}</div>
                                <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">{label}</div>
                            </div>
                        ))}
                    </div>

                    <div>
                        <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-3">Peer Case Studies</p>
                        <div className="space-y-2">
                            {peerExamples.map((ex, i) => (
                                <div key={i} className="flex gap-4 bg-[#F3F3EF] border border-neutral-200 p-4">
                                    <span className="font-mono text-[9px] text-neutral-400 shrink-0 pt-0.5">Case {String(i + 1).padStart(2, "0")}</span>
                                    <p className="font-mono text-xs text-neutral-600 leading-relaxed">{ex}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── What Happens If You Do Nothing ───────────────────────────── */}
                <div className="border border-red-300 bg-red-50 p-6 lg:p-8">
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-red-600 mb-6 flex items-center gap-2">
                        <span className="w-1 h-3 bg-red-500 inline-block" />
                        What Happens If You Do Nothing
                    </p>
                    <div className="space-y-4">
                        {inactionRisks.map((risk, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-6 h-6 border border-red-400 text-red-600 font-mono text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 flex-shrink-0">
                                    {i + 1}
                                </div>
                                <p className="font-mono text-sm text-neutral-700 leading-relaxed">{risk}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── AI Performance Ceiling ───────────────────────────────────── */}
                <div className="border border-black bg-white p-6 lg:p-10">
                    <div className="flex flex-col sm:flex-row items-start gap-8">
                        <div className="text-center flex-shrink-0 sm:border-r sm:border-neutral-200 sm:pr-8 pb-4 sm:pb-0">
                            <div className="font-mono text-7xl font-black text-black leading-none">
                                {scorecard.futureAINativeTarget.targetScore}
                            </div>
                            <div className="font-mono text-xs text-neutral-400 mt-1">/100 potential</div>
                            <div className="font-mono text-[9px] text-black mt-2 uppercase tracking-widest">
                                +{scorecard.futureAINativeTarget.targetScore - score} pt gap
                            </div>
                        </div>
                        <div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-2">AI Performance Ceiling — Unlocked With Advisory</p>
                            <p className="font-mono text-sm text-neutral-700 leading-relaxed mb-4">{scorecard.futureAINativeTarget.summary}</p>
                            <p className="font-mono text-xs text-neutral-700 flex items-center gap-2">
                                <span className="w-5 h-px bg-neutral-400 flex-shrink-0" />
                                Companies at {scorecard.futureAINativeTarget.targetScore}+ generate an avg 23% more revenue per employee
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* ── Recommended Engagement ─────────────────────────────────────── */}
            {selectedPackage && (
                <div className="max-w-7xl mx-auto px-6">
                    <div className="border border-black bg-white p-6 lg:p-8">
                        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-6 flex items-center gap-2">
                            <span className="w-1 h-3 bg-black inline-block" />
                            Recommended Engagement
                        </p>

                        <div className="grid lg:grid-cols-2 gap-8 items-start">
                            <div>
                                <h3 className="font-serif text-2xl mb-2">{selectedPackage.name}</h3>
                                <p className="font-mono text-sm text-neutral-600 leading-relaxed mb-5">{selectedPackage.tagline}</p>

                                <div className="flex items-center gap-3 mb-5">
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 border border-neutral-200 px-2 py-1">
                                        {selectedPackage.duration}
                                    </span>
                                    <span className="font-mono text-[9px] text-neutral-400">
                                        {selectedPackage.meetings}
                                    </span>
                                </div>

                                <div className="mb-5">
                                    <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-3">What is included</p>
                                    <ul className="space-y-2">
                                        {selectedPackage.includes.map((item, i) => (
                                            <li key={i} className="font-mono text-xs text-neutral-700 flex items-start gap-2.5">
                                                <span className="w-1 h-1 bg-black mt-2 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <div className="mb-5">
                                    <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-3">Deliverables</p>
                                    <ul className="space-y-2">
                                        {selectedPackage.deliverables.map((item, i) => (
                                            <li key={i} className="font-mono text-xs text-neutral-700 flex items-start gap-2.5">
                                                <span className="w-1 h-1 bg-neutral-400 mt-2 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="border-t border-neutral-200 pt-5 mt-5">
                                    <p className="font-mono text-xs text-neutral-600 leading-relaxed mb-5">
                                        {selectedPackage.idealFor}
                                    </p>
                                    <a
                                        href="https://cal.com/thara-rao/schedule-an-audit"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 border border-black bg-black text-white font-mono text-xs uppercase tracking-widest px-6 py-3 hover:bg-neutral-800 transition-colors"
                                    >
                                        Discuss on Call <ArrowRight className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── CTA Footer ───────────────────────────────────────────────────── */}
            <div className="border-t border-black bg-black">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        <div>
                            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-neutral-500 mb-3">
                                Join 40+ companies who moved 55 → 75+ on the AORI in under 6 months
                            </p>
                            <h2 className="font-serif text-3xl lg:text-4xl text-white mb-3">
                                Book your Strategic AI<br />Advisory Session.
                            </h2>
                            <p className="font-mono text-sm text-neutral-400 mb-6 leading-relaxed">
                                In 45 minutes, we&apos;ll identify the 3 changes in your stack with the fastest ROI,
                                build your 90-day AI roadmap, and show you exactly what strategic AI advisory
                                looks like for a company at your stage.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <a href="https://cal.com/thara-rao/schedule-an-audit"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-white text-black font-mono text-xs uppercase tracking-[0.2em] px-6 py-3 hover:bg-neutral-100 transition-colors">
                                    Schedule Now <ArrowRight className="w-3 h-3" />
                                </a>
                                <Link href="/sign-up"
                                    className="inline-flex items-center gap-2 border border-white text-white font-mono text-xs uppercase tracking-[0.2em] px-6 py-3 hover:bg-white/10 transition-colors">
                                    Start Tracking Free <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                        <div className="space-y-3 font-mono text-xs text-neutral-500 pt-2">
                            <div className="pb-3 border-b border-neutral-800">
                                <span className="text-white font-medium">Trackr Advisory</span>
                                <span className="ml-2">· AI Strategy & Implementation</span>
                            </div>
                            <p>This assessment was prepared using Trackr&apos;s proprietary AI Operational Readiness methodology. Confidential — prepared for {submission.contactName ?? submission.companyName} only.</p>
                            <p><span className="text-neutral-400">Report date:</span> {reportDate} &middot; We recommend re-scoring quarterly as the AI landscape evolves.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Sticky Bottom Bar ────────────────────────────────────────── */}
            <div className="sticky bottom-0 z-50 border-t border-black bg-black/95 backdrop-blur-sm lg:hidden">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                    <div className="font-mono text-white">
                        <span className="text-lg font-bold">{score}</span>
                        <span className="text-xs text-neutral-400">/100</span>
                    </div>
                    <Link href="/sign-up"
                        className="inline-flex items-center gap-2 bg-white text-black font-mono text-[10px] uppercase tracking-[0.2em] px-4 py-2 hover:bg-neutral-100 transition-colors whitespace-nowrap">
                        Track Your AI Stack Free <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>

        </div>
    );
}
