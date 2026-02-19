export const dynamic = "force-dynamic";

import { Sparkles, PlusCircle, ExternalLink, AlertCircle, Newspaper } from "lucide-react";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { painPoints, workspaceMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { perplexity } from "@/lib/services/perplexity";
import { tavily } from "@/lib/services/tavily";
import { unstable_cache } from "next/cache";

interface ToolSuggestion {
    name: string;
    url: string;
    description: string;
    matchReason?: string;
    source?: string;
}

interface NewsItem {
    title: string;
    url: string;
    content: string;
    source: string;
}

// Cache AI news for 1 hour
const getAINews = unstable_cache(
    async (): Promise<NewsItem[]> => {
        const month = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
        const result = await tavily.search(
            `AI tools funding announcements product launches ${month}`,
            { maxResults: 8, searchDepth: "basic", includeAnswer: false }
        );
        return result.results.map(r => ({
            title: r.title,
            url: r.url,
            content: r.content.slice(0, 220),
            source: (() => { try { return new URL(r.url).hostname.replace("www.", ""); } catch { return r.url; } })(),
        }));
    },
    ["ai-news-feed"],
    { revalidate: 3600 }
);

// Cache Perplexity suggestions at module level — keyed by workspaceId + pain point content.
// Must be module-level so Next.js reuses the same stable function reference across requests.
const fetchSuggestionsFromAI = unstable_cache(
    async (_workspaceId: string, combinedPainPoint: string): Promise<ToolSuggestion[]> => {
        let suggestions: ToolSuggestion[] = [];
        try {
            const raw = await perplexity.discoverTools(combinedPainPoint);
            const jsonMatch = raw.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (Array.isArray(parsed)) {
                    suggestions = parsed.map((item: Record<string, string>, i: number) => ({
                        name: item.name || `Tool ${i + 1}`,
                        url: item.url || "#",
                        description: item.description || "",
                        matchReason: item.matchReason || "Matches your team's pain points",
                        source: item.source || "AI Discovery",
                    }));
                }
            }
        } catch {
            // Fall through with empty suggestions
        }
        return suggestions;
    },
    ["discover-suggestions"],
    { revalidate: 21600 } // 6 hours
);

async function getDiscoverySuggestions(workspaceId: string): Promise<{ suggestions: ToolSuggestion[]; painPointTitles: string[] }> {
    const activePainPoints = await db.query.painPoints.findMany({
        where: eq(painPoints.workspaceId, workspaceId),
        columns: { title: true, description: true, active: true },
    });

    const activePoints = activePainPoints.filter(p => p.active);

    if (activePoints.length === 0) {
        return { suggestions: [], painPointTitles: [] };
    }

    const painPointTitles = activePoints.map(p => p.title);
    const combinedPainPoint = activePoints
        .map(p => p.title + (p.description ? `: ${p.description}` : ""))
        .join(". ");

    const suggestions = await fetchSuggestionsFromAI(workspaceId, combinedPainPoint);
    return { suggestions, painPointTitles };
}

export default async function DiscoverPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });

    if (!member) {
        redirect("/onboarding");
    }

    const [{ suggestions, painPointTitles }, newsItems] = await Promise.all([
        getDiscoverySuggestions(member.workspaceId),
        getAINews(),
    ]);

    return (
        <div className="space-y-10">

            {/* ── AI News Feed ───────────────────────────────── */}
            <section className="space-y-5">
                <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">Live Feed</p>
                    <h1 className="font-serif text-2xl font-normal flex items-center gap-2">
                        <Newspaper className="h-5 w-5" strokeWidth={1.5} />
                        AI News Digest
                    </h1>
                    <p className="font-mono text-xs text-neutral-500 mt-1">
                        Latest AI tool launches, funding rounds, and product updates — updated hourly.
                    </p>
                </div>

                {newsItems.length === 0 ? (
                    <div className="border border-dashed border-neutral-300 p-8 text-center font-mono text-xs text-neutral-400">
                        No news available right now. Check back soon.
                    </div>
                ) : (
                    <div className="grid gap-0 grid-cols-1 md:grid-cols-2 border border-black">
                        {newsItems.map((item, i) => (
                            <div
                                key={i}
                                className={`p-5 flex flex-col gap-3 bg-white ${
                                    i % 2 === 0 ? "md:border-r border-black" : ""
                                } ${i < newsItems.length - 1 ? "border-b md:border-b-0 border-black" : ""} ${
                                    Math.floor(i / 2) < Math.floor((newsItems.length - 1) / 2) ? "md:border-b md:border-black" : ""
                                }`}
                            >
                                <div className="flex-1">
                                    <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-1.5">
                                        {item.source}
                                    </div>
                                    <h3 className="font-serif text-base leading-snug line-clamp-2 mb-2">{item.title}</h3>
                                    <p className="font-mono text-xs text-neutral-500 leading-relaxed line-clamp-3">{item.content}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-neutral-100 flex-wrap">
                                    <Link
                                        href={`/submit?url=${encodeURIComponent(item.url)}&name=${encodeURIComponent(item.title.slice(0, 60))}`}
                                        className="flex items-center gap-1.5 border border-black px-3 py-1.5 font-mono text-xs bg-black text-white hover:bg-neutral-800 flex-1 justify-center min-w-0"
                                    >
                                        <PlusCircle className="h-3 w-3" /> Add to Queue
                                    </Link>
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 border border-black px-3 py-1.5 font-mono text-xs bg-white hover:bg-black hover:text-white"
                                    >
                                        <ExternalLink className="h-3 w-3" /> Read
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── Pain-Point Tool Suggestions ────────────────── */}
            <section className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">AI Recommendations</p>
                        <h2 className="font-serif text-2xl font-normal flex items-center gap-2">
                            <Sparkles className="h-5 w-5" strokeWidth={1.5} />
                            Suggested for Your Team
                        </h2>
                        <p className="font-mono text-xs text-neutral-500 mt-1">
                            Tools recommended based on your active pain points. Refreshes every 6 hours.
                        </p>
                    </div>
                    <form action="/discover" method="GET">
                        <button type="submit" className="border border-black px-4 py-2 font-mono text-xs bg-white hover:bg-black hover:text-white whitespace-nowrap">
                            Refresh
                        </button>
                    </form>
                </div>

                {painPointTitles.length === 0 ? (
                    <div className="border border-black p-12 text-center space-y-4">
                        <AlertCircle className="h-8 w-8 mx-auto text-neutral-300" strokeWidth={1.5} />
                        <div>
                            <p className="font-serif text-lg mb-1">No active pain points</p>
                            <p className="font-mono text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                                Add pain points your team is facing and Trackr&apos;s AI will suggest the best tools to solve them.
                            </p>
                        </div>
                        <Link
                            href="/pain-points"
                            className="inline-block border border-black px-6 py-2.5 font-mono text-xs bg-black text-white hover:bg-neutral-800"
                        >
                            Add Pain Points
                        </Link>
                    </div>
                ) : suggestions.length === 0 ? (
                    <div className="border border-dashed border-neutral-300 py-10 text-center font-mono text-xs text-neutral-400">
                        No suggestions found. Try refreshing or updating your pain points.
                    </div>
                ) : (
                    <>
                        {/* Pain point tags */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs text-neutral-400">Based on:</span>
                            {painPointTitles.map(title => (
                                <span key={title} className="font-mono text-xs border border-black px-2 py-0.5">{title}</span>
                            ))}
                        </div>

                        <div className="grid gap-0 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-black">
                            {suggestions.map((tool, i) => (
                                <div
                                    key={i}
                                    className={`p-5 flex flex-col gap-3 bg-white ${
                                        i % 3 !== 2 ? "lg:border-r lg:border-black" : ""
                                    } ${i % 2 === 0 ? "md:border-r md:border-black lg:border-r-0" : ""} ${
                                        i < suggestions.length - 1 ? "border-b border-black md:border-b-0" : ""
                                    } ${
                                        Math.floor(i / 3) < Math.floor((suggestions.length - 1) / 3) ? "lg:border-b lg:border-black" : ""
                                    } ${
                                        Math.floor(i / 2) < Math.floor((suggestions.length - 1) / 2) ? "md:border-b md:border-black lg:border-b-0" : ""
                                    }`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="font-serif text-base">{tool.name}</h3>
                                            {tool.source && (
                                                <span className="font-mono text-[9px] border border-neutral-300 px-1.5 py-0.5 text-neutral-400 shrink-0">
                                                    {tool.source}
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-mono text-xs text-neutral-500 leading-relaxed line-clamp-2 mb-3">
                                            {tool.description}
                                        </p>
                                        {tool.matchReason && (
                                            <div className="font-mono text-[10px] bg-neutral-50 border border-neutral-200 px-3 py-2 flex items-center gap-1.5">
                                                <Sparkles className="h-2.5 w-2.5 shrink-0 text-neutral-400" />
                                                <span className="text-neutral-600">{tool.matchReason}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 pt-3 border-t border-neutral-100">
                                        <Link
                                            href={`/submit?url=${encodeURIComponent(tool.url)}&name=${encodeURIComponent(tool.name)}`}
                                            className="flex-1 flex items-center justify-center gap-1.5 border border-black px-3 py-2 font-mono text-xs bg-black text-white hover:bg-neutral-800"
                                        >
                                            <PlusCircle className="h-3 w-3" /> Research
                                        </Link>
                                        {tool.url && tool.url !== "#" && (
                                            <a
                                                href={tool.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="border border-black px-3 py-2 font-mono text-xs hover:bg-black hover:text-white flex items-center"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}
