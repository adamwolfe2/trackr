export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

// Cache AI news for 1 hour to avoid hammering Tavily on every page load
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
                    matchReason: item.matchReason || `Matches your team's pain points`,
                    source: item.source || "AI Discovery",
                }));
            }
        }
    } catch {
        // Fall through with empty suggestions
    }

    return { suggestions, painPointTitles };
}

export default async function DiscoverPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });

    if (!member) {
        return <div className="text-center py-12 text-muted-foreground">No workspace found.</div>;
    }

    const [{ suggestions, painPointTitles }, newsItems] = await Promise.all([
        getDiscoverySuggestions(member.workspaceId),
        getAINews(),
    ]);

    return (
        <div className="space-y-10 animate-fade-in-up">

            {/* ── AI News Feed ────────────────────────────────────────────── */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Newspaper className="h-6 w-6" />
                            AI News Digest
                        </h1>
                        <p className="text-sm text-muted-foreground">Latest AI tool launches, funding rounds, and product updates.</p>
                    </div>
                </div>

                {newsItems.length === 0 ? (
                    <div className="border border-dashed border-neutral-300 p-8 text-center text-sm font-mono text-neutral-400">
                        No news available right now. Check back soon.
                    </div>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                        {newsItems.map((item, i) => (
                            <div key={i} className="border border-black bg-white p-4 flex flex-col gap-3">
                                <div>
                                    <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1">{item.source}</div>
                                    <h3 className="font-semibold text-sm leading-snug line-clamp-2">{item.title}</h3>
                                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3">{item.content}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-auto">
                                    <Button asChild size="sm" className="h-7 text-xs gap-1.5 flex-1">
                                        <Link href={`/submit?url=${encodeURIComponent(item.url)}&name=${encodeURIComponent(item.title.slice(0, 60))}`}>
                                            <PlusCircle className="h-3 w-3" /> Add to Queue
                                        </Link>
                                    </Button>
                                    <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1.5">
                                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-3 w-3" /> Read
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── Pain-Point Tool Suggestions ─────────────────────────────── */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            Suggested for Your Team
                        </h2>
                        <p className="text-sm text-muted-foreground">AI-suggested tools based on your active pain points.</p>
                    </div>
                    <form action="/discover" method="GET">
                        <Button type="submit" variant="outline" size="sm">
                            Refresh
                        </Button>
                    </form>
                </div>

                {painPointTitles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-neutral-300 space-y-3">
                        <AlertCircle className="h-8 w-8 text-neutral-400" />
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">No active pain points</h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                Add pain points your team is facing and Trackr&apos;s AI will suggest the best tools to solve them.
                            </p>
                        </div>
                        <Button asChild size="sm" variant="outline">
                            <Link href="/pain-points">Add Pain Points</Link>
                        </Button>
                    </div>
                ) : suggestions.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-neutral-300 text-sm text-muted-foreground">
                        No suggestions found. Try refreshing or updating your pain points.
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted-foreground font-mono">Based on:</span>
                            {painPointTitles.map(title => (
                                <Badge key={title} variant="outline" className="text-xs font-mono">{title}</Badge>
                            ))}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {suggestions.map((tool, i) => (
                                <div key={i} className="border border-black bg-white p-4 flex flex-col gap-3">
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="font-semibold text-sm">{tool.name}</h3>
                                            {tool.source && (
                                                <span className="text-[9px] font-mono border border-neutral-300 px-1.5 py-0.5 text-neutral-500 shrink-0">{tool.source}</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{tool.description}</p>
                                    </div>
                                    {tool.matchReason && (
                                        <div className="text-[10px] font-mono bg-neutral-100 border border-neutral-200 px-2 py-1.5 flex items-center gap-1.5">
                                            <Sparkles className="h-2.5 w-2.5 shrink-0" />
                                            {tool.matchReason}
                                        </div>
                                    )}
                                    <div className="flex gap-2 mt-auto">
                                        <Button className="flex-1 gap-1.5 h-8 text-xs" asChild>
                                            <Link href={`/submit?url=${encodeURIComponent(tool.url)}&name=${encodeURIComponent(tool.name)}`}>
                                                <PlusCircle className="h-3 w-3" /> Add to Research
                                            </Link>
                                        </Button>
                                        {tool.url && tool.url !== "#" && (
                                            <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                                                <a href={tool.url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </Button>
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
