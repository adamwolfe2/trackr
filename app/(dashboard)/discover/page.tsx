

export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, PlusCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

// Mock suggested tools
const suggestions = [
    {
        id: "s1",
        name: "Clay.com",
        description: "Automate outbound campaigns with AI data enrichment.",
        matchReason: "Matches 'Automate outbound sales' pain point.",
        source: "YC W24",
        url: "https://clay.com"
    },
    {
        id: "s2",
        name: "F5Bot",
        description: "Free Reddit keyword monitor. Get emails when keywords are mentioned.",
        matchReason: "Matches 'Monitor brand mentions on Reddit' pain point.",
        source: "Reddit r/marketing",
        url: "https://f5bot.com"
    },
    {
        id: "s3",
        name: "Vapi.ai",
        description: "Build voice AI assistants in minutes.",
        matchReason: "Trending in AI Tools category.",
        source: "ProductHunt #1",
        url: "https://vapi.ai"
    }
];

export default function DiscoverPage() {
    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-purple-600" />
                        Discovery
                    </h1>
                    <p className="text-sm text-muted-foreground">AI-suggested tools based on your pain points and team activity.</p>
                </div>
                <Button variant="outline">
                    <RefreshCwIcon className="h-4 w-4 mr-2" />
                    Refresh Suggestions
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {suggestions.map((tool) => (
                    <Card key={tool.id} className="hover-lift flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{tool.name}</CardTitle>
                                <Badge variant="secondary" className="text-xs">{tool.source}</Badge>
                            </div>
                            <CardDescription className="line-clamp-2 min-h-[40px]">{tool.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-end gap-4">
                            <div className="text-xs bg-purple-50 text-purple-700 p-2 rounded flex items-center gap-2">
                                <Sparkles className="h-3 w-3" />
                                {tool.matchReason}
                            </div>
                            <div className="flex gap-2">
                                <Button className="w-full gap-2" asChild>
                                    <Link href={`/tools/submit?url=${encodeURIComponent(tool.url)}&name=${encodeURIComponent(tool.name)}`}>
                                        <PlusCircle className="h-4 w-4" /> Add to Research
                                    </Link>
                                </Button>
                                <Button variant="ghost" size="icon" asChild>
                                    <a href={tool.url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function RefreshCwIcon(props: any) {
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
    )
}
