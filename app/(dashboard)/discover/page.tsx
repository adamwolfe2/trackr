export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, PlusCircle, ExternalLink, AlertCircle } from "lucide-react";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { painPoints, workspaceMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { perplexity } from "@/lib/services/perplexity";

interface ToolSuggestion {
    name: string;
    url: string;
    description: string;
    matchReason?: string;
    source?: string;
}

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
        // Try to parse JSON from the response
        const jsonMatch = raw.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsed)) {
                suggestions = parsed.map((item: any, i: number) => ({
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

    const { suggestions, painPointTitles } = await getDiscoverySuggestions(member.workspaceId);

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-purple-600" />
                        Discovery
                    </h1>
                    <p className="text-sm text-muted-foreground">AI-suggested tools based on your active pain points.</p>
                </div>
                <form action="/discover" method="GET">
                    <Button type="submit" variant="outline">
                        <RefreshCwIcon className="h-4 w-4 mr-2" />
                        Refresh Suggestions
                    </Button>
                </form>
            </div>

            {painPointTitles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl space-y-4">
                    <div className="p-4 bg-purple-50 rounded-full">
                        <AlertCircle className="h-8 w-8 text-purple-400" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">No active pain points</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Add pain points your team is facing and Trackr's AI will suggest the best tools to solve them.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/pain-points">Add Pain Points</Link>
                    </Button>
                </div>
            ) : suggestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl space-y-4">
                    <div className="p-4 bg-purple-50 rounded-full">
                        <Sparkles className="h-8 w-8 text-purple-400" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">No suggestions found</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            The AI couldn't find matching tools right now. Try refreshing or updating your pain points.
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-center">
                        {painPointTitles.map(title => (
                            <Badge key={title} variant="secondary">{title}</Badge>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground font-mono">Based on:</span>
                        {painPointTitles.map(title => (
                            <Badge key={title} variant="outline" className="text-xs">{title}</Badge>
                        ))}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {suggestions.map((tool, i) => (
                            <Card key={i} className="hover-lift flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                                        {tool.source && (
                                            <Badge variant="secondary" className="text-xs shrink-0">{tool.source}</Badge>
                                        )}
                                    </div>
                                    <CardDescription className="line-clamp-2 min-h-[40px]">{tool.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-end gap-4">
                                    {tool.matchReason && (
                                        <div className="text-xs bg-purple-50 text-purple-700 p-2 rounded flex items-center gap-2">
                                            <Sparkles className="h-3 w-3 shrink-0" />
                                            {tool.matchReason}
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <Button className="w-full gap-2" asChild>
                                            <Link href={`/submit?url=${encodeURIComponent(tool.url)}&name=${encodeURIComponent(tool.name)}`}>
                                                <PlusCircle className="h-4 w-4" /> Add to Research
                                            </Link>
                                        </Button>
                                        {tool.url && tool.url !== "#" && (
                                            <Button variant="ghost" size="icon" asChild>
                                                <a href={tool.url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function RefreshCwIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
        </svg>
    );
}
