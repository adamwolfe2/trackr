import { db } from "@/lib/db";
import { tools, reports } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Star } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type ScorecardEntry = { score: number; justification: string };
type PricingTier = { tier: string; price: string };

const SCORECARD_LABELS: Record<string, string> = {
    features: "Features",
    pricing_value: "Pricing Value",
    ease_of_use: "Ease of Use",
    integration_depth: "Integrations",
    support_quality: "Support",
    security: "Security",
    ai_capabilities: "AI Capabilities",
};

async function fetchPublicReport(slug: string) {
    const tool = await db.query.tools.findFirst({
        where: eq(tools.publicSlug, slug),
    });
    if (!tool) return null;

    const report = await db.query.reports.findFirst({
        where: and(eq(reports.toolId, tool.id), eq(reports.isPublic, true)),
        orderBy: [desc(reports.createdAt)],
    });
    if (!report) return null;

    return { tool, report };
}

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<{ tools?: string }>;
}): Promise<Metadata> {
    const { tools: toolsParam } = await searchParams;
    const slugs = (toolsParam ?? "").split(",").map(s => s.trim()).filter(s => /^[a-z0-9-]+$/.test(s)).slice(0, 2);

    if (slugs.length < 2) {
        return { title: "Compare Tools — Trackr" };
    }

    const names = await Promise.all(
        slugs.map(async (slug) => {
            const tool = await db.query.tools.findFirst({
                where: eq(tools.publicSlug, slug),
                columns: { name: true },
            });
            return tool?.name ?? slug;
        })
    );

    const title = `${names[0]} vs ${names[1]} — Trackr Research Comparison`;
    const description = `Side-by-side AI research comparison of ${names[0]} vs ${names[1]}. Scores, pros, cons, pricing, and features.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [{ url: "/og.png", width: 1456, height: 816, alt: title }],
        },
        alternates: { canonical: `https://trytrackr.com/research/compare?tools=${slugs.join(",")}` },
    };
}

export default async function PublicComparePage({
    searchParams,
}: {
    searchParams: Promise<{ tools?: string }>;
}) {
    const user = await currentUser();
    const { tools: toolsParam } = await searchParams;
    const slugs = (toolsParam ?? "").split(",").map(s => s.trim()).filter(s => /^[a-z0-9-]+$/.test(s)).slice(0, 2);

    // Need exactly 2 valid slugs
    const results = await Promise.all(slugs.map(fetchPublicReport));
    const validResults = results.filter((r): r is NonNullable<typeof r> => r !== null);

    const hasTwo = validResults.length === 2;
    const [left, right] = validResults;

    const jsonLd = hasTwo
        ? {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://trytrackr.com" },
                { "@type": "ListItem", position: 2, name: "Research Library", item: "https://trytrackr.com/research" },
                { "@type": "ListItem", position: 3, name: `${left.tool.name} vs ${right.tool.name}`, item: `https://trytrackr.com/research/compare?tools=${slugs.join(",")}` },
            ],
        }
        : null;

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
                <MarketingNavigation isLoggedIn={!!user} />

                <section className="py-16 border-t border-black/10">
                    <Link
                        href="/research"
                        className="inline-flex items-center gap-2 font-mono text-xs text-neutral-400 hover:text-black transition-colors mb-10"
                    >
                        <ArrowLeft className="w-3 h-3" /> Research Library
                    </Link>

                    <div className="mb-8">
                        <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">Compare</p>
                        {hasTwo ? (
                            <h1 className="font-serif text-4xl md:text-5xl font-normal">
                                {left.tool.name} <span className="text-neutral-400">vs</span> {right.tool.name}
                            </h1>
                        ) : (
                            <h1 className="font-serif text-4xl font-normal">Tool Comparison</h1>
                        )}
                    </div>

                    {!hasTwo ? (
                        <div className="border border-dashed border-neutral-300 py-24 text-center">
                            <p className="font-mono text-sm text-neutral-400 mb-2">
                                Pass two tool slugs to compare: <code className="bg-neutral-100 px-1">?tools=slug-a,slug-b</code>
                            </p>
                            <Link href="/research" className="font-mono text-xs text-neutral-400 hover:text-black underline mt-4 inline-block">
                                Browse Research Library →
                            </Link>
                        </div>
                    ) : (
                        <ComparisonGrid left={left} right={right} />
                    )}

                    <div className="mt-16 pt-8 border-t border-black/10">
                        <div className="border border-black bg-black text-white p-8">
                            <p className="font-mono text-xs uppercase tracking-wider text-neutral-400 mb-3">Research your stack</p>
                            <h3 className="font-serif text-2xl font-normal mb-3 text-white">
                                Research any tool in under 2 minutes
                            </h3>
                            <p className="font-mono text-sm text-neutral-400 mb-6 max-w-md">
                                Submit any tool URL. Get a scored report with features, pricing, pros/cons, and competitive analysis.
                            </p>
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-neutral-100 transition-colors border border-white"
                            >
                                Get Started Free →
                            </Link>
                        </div>
                    </div>
                </section>

                <MarketingFooter />
            </main>
        </>
    );
}

function ComparisonGrid({
    left,
    right,
}: {
    left: { tool: { name: string; websiteUrl: string | null; logoUrl: string | null; overallScore: string | null; publicSlug: string | null; category: string[] | null }; report: { summary: string | null; pros: unknown; cons: unknown; scorecardSnapshot: unknown; pricing: unknown; isPricingHidden: boolean | null; integrations: unknown } };
    right: typeof left;
}) {
    const leftScorecard = left.report.scorecardSnapshot as Record<string, ScorecardEntry> | null;
    const rightScorecard = right.report.scorecardSnapshot as Record<string, ScorecardEntry> | null;
    const leftPros = (left.report.pros as string[] | null) ?? [];
    const rightPros = (right.report.pros as string[] | null) ?? [];
    const leftCons = (left.report.cons as string[] | null) ?? [];
    const rightCons = (right.report.cons as string[] | null) ?? [];
    const leftPricing = (left.report.pricing as PricingTier[]) ?? [];
    const rightPricing = (right.report.pricing as PricingTier[]) ?? [];
    const leftIntegrations = (left.report.integrations as string[]) ?? [];
    const rightIntegrations = (right.report.integrations as string[]) ?? [];

    const leftDomain = left.tool.websiteUrl ? (() => { try { return new URL(left.tool.websiteUrl!).hostname.replace("www.", ""); } catch { return null; } })() : null;
    const rightDomain = right.tool.websiteUrl ? (() => { try { return new URL(right.tool.websiteUrl!).hostname.replace("www.", ""); } catch { return null; } })() : null;
    const leftScore = Number(left.tool.overallScore || 0);
    const rightScore = Number(right.tool.overallScore || 0);

    const allDimensions = Object.keys({ ...(leftScorecard ?? {}), ...(rightScorecard ?? {}) });

    return (
        <div className="space-y-px border border-black bg-black">
            {/* Header row */}
            <div className="grid grid-cols-3 bg-black text-white">
                <div className="p-4 font-mono text-[10px] uppercase tracking-widest text-neutral-400">Comparison</div>
                <div className="p-4 border-l border-neutral-800">
                    <div className="flex items-center gap-2 mb-1">
                        {(left.tool.logoUrl || leftDomain) && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={left.tool.logoUrl ?? `https://www.google.com/s2/favicons?domain=${leftDomain}&sz=32`} alt={left.tool.name} className="w-5 h-5 object-contain" />
                        )}
                        <Link href={`/research/${left.tool.publicSlug}`} className="font-serif text-lg text-white hover:underline">{left.tool.name}</Link>
                    </div>
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" />
                        <span className="font-mono text-base font-bold text-white">{leftScore.toFixed(1)}</span>
                        <span className="font-mono text-[10px] text-neutral-400">/ 10</span>
                    </div>
                </div>
                <div className="p-4 border-l border-neutral-800">
                    <div className="flex items-center gap-2 mb-1">
                        {(right.tool.logoUrl || rightDomain) && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={right.tool.logoUrl ?? `https://www.google.com/s2/favicons?domain=${rightDomain}&sz=32`} alt={right.tool.name} className="w-5 h-5 object-contain" />
                        )}
                        <Link href={`/research/${right.tool.publicSlug}`} className="font-serif text-lg text-white hover:underline">{right.tool.name}</Link>
                    </div>
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" />
                        <span className="font-mono text-base font-bold text-white">{rightScore.toFixed(1)}</span>
                        <span className="font-mono text-[10px] text-neutral-400">/ 10</span>
                    </div>
                </div>
            </div>

            {/* Summary */}
            {(left.report.summary || right.report.summary) && (
                <div className="grid grid-cols-3 bg-white">
                    <div className="p-4 font-mono text-[10px] uppercase tracking-widest text-neutral-400 border-r border-neutral-100">Summary</div>
                    <div className="p-4 border-r border-neutral-100">
                        <p className="font-mono text-xs text-neutral-600 leading-relaxed">{left.report.summary ?? "—"}</p>
                    </div>
                    <div className="p-4">
                        <p className="font-mono text-xs text-neutral-600 leading-relaxed">{right.report.summary ?? "—"}</p>
                    </div>
                </div>
            )}

            {/* Scorecard dimensions */}
            {allDimensions.map((dim) => {
                const lVal = leftScorecard?.[dim];
                const rVal = rightScorecard?.[dim];
                const lScore = lVal?.score ?? 0;
                const rScore = rVal?.score ?? 0;
                const lWins = lScore > rScore;
                const rWins = rScore > lScore;
                return (
                    <div key={dim} className="grid grid-cols-3 bg-white">
                        <div className="p-4 font-mono text-[10px] uppercase tracking-widest text-neutral-400 border-r border-neutral-100">
                            {SCORECARD_LABELS[dim] ?? dim.replace(/_/g, " ")}
                        </div>
                        <div className={`p-4 border-r border-neutral-100 ${lWins ? "bg-[#F3F3EF]" : ""}`}>
                            {lVal ? (
                                <>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="font-mono text-sm font-bold">{lVal.score.toFixed(1)}</div>
                                        {lWins && <span className="font-mono text-[9px] uppercase tracking-widest border border-black px-1">Better</span>}
                                    </div>
                                    <div className="h-1 bg-neutral-100 border border-neutral-200 mb-1">
                                        <div className="h-full bg-black" style={{ width: `${(lVal.score / 10) * 100}%` }} />
                                    </div>
                                    <p className="font-mono text-[10px] text-neutral-400 leading-relaxed">{lVal.justification}</p>
                                </>
                            ) : <span className="font-mono text-xs text-neutral-300">—</span>}
                        </div>
                        <div className={`p-4 ${rWins ? "bg-[#F3F3EF]" : ""}`}>
                            {rVal ? (
                                <>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="font-mono text-sm font-bold">{rVal.score.toFixed(1)}</div>
                                        {rWins && <span className="font-mono text-[9px] uppercase tracking-widest border border-black px-1">Better</span>}
                                    </div>
                                    <div className="h-1 bg-neutral-100 border border-neutral-200 mb-1">
                                        <div className="h-full bg-black" style={{ width: `${(rVal.score / 10) * 100}%` }} />
                                    </div>
                                    <p className="font-mono text-[10px] text-neutral-400 leading-relaxed">{rVal.justification}</p>
                                </>
                            ) : <span className="font-mono text-xs text-neutral-300">—</span>}
                        </div>
                    </div>
                );
            })}

            {/* Pros */}
            {(leftPros.length > 0 || rightPros.length > 0) && (
                <div className="grid grid-cols-3 bg-white">
                    <div className="p-4 font-mono text-[10px] uppercase tracking-widest text-neutral-400 border-r border-neutral-100">Pros</div>
                    <div className="p-4 border-r border-neutral-100">
                        <ul className="space-y-1.5">
                            {leftPros.map((p, i) => (
                                <li key={i} className="font-mono text-xs text-neutral-600 flex gap-2"><span className="text-black flex-shrink-0">+</span>{p}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="p-4">
                        <ul className="space-y-1.5">
                            {rightPros.map((p, i) => (
                                <li key={i} className="font-mono text-xs text-neutral-600 flex gap-2"><span className="text-black flex-shrink-0">+</span>{p}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Cons */}
            {(leftCons.length > 0 || rightCons.length > 0) && (
                <div className="grid grid-cols-3 bg-white">
                    <div className="p-4 font-mono text-[10px] uppercase tracking-widest text-neutral-400 border-r border-neutral-100">Cons</div>
                    <div className="p-4 border-r border-neutral-100">
                        <ul className="space-y-1.5">
                            {leftCons.map((c, i) => (
                                <li key={i} className="font-mono text-xs text-neutral-600 flex gap-2"><span className="text-neutral-400 flex-shrink-0">−</span>{c}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="p-4">
                        <ul className="space-y-1.5">
                            {rightCons.map((c, i) => (
                                <li key={i} className="font-mono text-xs text-neutral-600 flex gap-2"><span className="text-neutral-400 flex-shrink-0">−</span>{c}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Pricing */}
            {(leftPricing.length > 0 || rightPricing.length > 0) && (
                <div className="grid grid-cols-3 bg-white">
                    <div className="p-4 font-mono text-[10px] uppercase tracking-widest text-neutral-400 border-r border-neutral-100">Pricing</div>
                    <div className="p-4 border-r border-neutral-100">
                        <div className="space-y-1.5">
                            {leftPricing.map((t, i) => (
                                <div key={i} className="flex justify-between border-b border-neutral-50 pb-1 last:border-0">
                                    <span className="font-mono text-xs text-neutral-500">{t.tier}</span>
                                    <span className="font-mono text-xs font-bold">{t.price}</span>
                                </div>
                            ))}
                            {left.report.isPricingHidden && (
                                <p className="font-mono text-[10px] text-neutral-400">Contact sales</p>
                            )}
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="space-y-1.5">
                            {rightPricing.map((t, i) => (
                                <div key={i} className="flex justify-between border-b border-neutral-50 pb-1 last:border-0">
                                    <span className="font-mono text-xs text-neutral-500">{t.tier}</span>
                                    <span className="font-mono text-xs font-bold">{t.price}</span>
                                </div>
                            ))}
                            {right.report.isPricingHidden && (
                                <p className="font-mono text-[10px] text-neutral-400">Contact sales</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Integrations */}
            {(leftIntegrations.length > 0 || rightIntegrations.length > 0) && (
                <div className="grid grid-cols-3 bg-white">
                    <div className="p-4 font-mono text-[10px] uppercase tracking-widest text-neutral-400 border-r border-neutral-100">Integrations</div>
                    <div className="p-4 border-r border-neutral-100">
                        <div className="flex flex-wrap gap-1">
                            {leftIntegrations.slice(0, 8).map((i) => (
                                <span key={i} className="font-mono text-[9px] border border-neutral-200 px-1.5 py-0.5 text-neutral-500">{i}</span>
                            ))}
                            {leftIntegrations.length > 8 && <span className="font-mono text-[9px] text-neutral-400">+{leftIntegrations.length - 8}</span>}
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="flex flex-wrap gap-1">
                            {rightIntegrations.slice(0, 8).map((i) => (
                                <span key={i} className="font-mono text-[9px] border border-neutral-200 px-1.5 py-0.5 text-neutral-500">{i}</span>
                            ))}
                            {rightIntegrations.length > 8 && <span className="font-mono text-[9px] text-neutral-400">+{rightIntegrations.length - 8}</span>}
                        </div>
                    </div>
                </div>
            )}

            {/* Full report links */}
            <div className="grid grid-cols-3 bg-[#F3F3EF]">
                <div className="p-4 font-mono text-[10px] uppercase tracking-widest text-neutral-400 border-r border-neutral-200">Full Reports</div>
                <div className="p-4 border-r border-neutral-200">
                    <Link
                        href={`/research/${left.tool.publicSlug}`}
                        className="inline-flex items-center gap-1 font-mono text-xs border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors"
                    >
                        {left.tool.name} Report <ExternalLink className="w-3 h-3" />
                    </Link>
                </div>
                <div className="p-4">
                    <Link
                        href={`/research/${right.tool.publicSlug}`}
                        className="inline-flex items-center gap-1 font-mono text-xs border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors"
                    >
                        {right.tool.name} Report <ExternalLink className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
