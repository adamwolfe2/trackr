import { db } from "@/lib/db";
import { tools, reports } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, RefreshCw, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { NotesSection } from "@/components/tools/notes-section";
import { ExportButton } from "@/components/common/export-button";
import { ResearchStream } from "@/components/tools/research-stream";

export const dynamic = "force-dynamic";

export default async function ToolDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;

    // Mock data for now if DB fails or is empty
    let tool = null;
    let report = null;

    try {
        // const result = await db.select().from(tools).where(eq(tools.id, id));
        // tool = result[0];
        // if (tool) {
        //    const reportsResult = await db.select().from(reports).where(eq(reports.toolId, id)).orderBy(desc(reports.createdAt));
        //    report = reportsResult[0];
        // }
    } catch (e) {
        console.error(e);
    }

    // Fallback mock for demo
    if (!tool) {
        tool = {
            id,
            name: "Mock Tool (Instantly.ai)",
            websiteUrl: "https://instantly.ai",
            status: "researched",
            overallScore: "8.2",
            lastResearchedAt: new Date(),
            category: ["Outreach", "Sales"],
        };
        report = {
            summary: "Best-in-class cold email sequencing platform with strong deliverability infrastructure. Competitive pricing at scale.",
            scorecardSnapshot: {
                "feature_fit": { "score": 9, "justification": "Directly addresses cold outreach automation." },
                "pricing_value": { "score": 9, "justification": "$37/mo for unlimited emails." },
                "ease_of_use": { "score": 8, "justification": "Clean UI, good onboarding." },
                "integration_depth": { "score": 6, "justification": "No native GHL or Make connector." },
            },
            features: {
                "list": ["Unlimited sending accounts", "Warmup pool", "Unified inbox"]
            },
            pricing: [
                { tier: "Growth", price: "$37/mo" },
                { tier: "Hypergrowth", price: "$97/mo" }
            ],
            pros: ["Best deliverability", "Unlimited accounts"],
            cons: ["No native GHL integration"],
        };
    }

    if (!tool) return notFound();

    const isResearching = tool.status === "researching";

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link href="/tools" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <ChevronLeft className="h-4 w-4" /> Back to Tools
                </Link>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            {tool.name}
                            <Badge variant="outline" className="text-sm font-normal">
                                {tool.status}
                            </Badge>
                        </h1>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                                {tool.websiteUrl} <ExternalLink className="h-3 w-3" />
                            </a>
                            <span>•</span>
                            <span>Last updated {tool.lastResearchedAt ? formatDistanceToNow(new Date(tool.lastResearchedAt), { addSuffix: true }) : 'Never'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButton />
                        <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" /> Re-Research
                        </Button>
                        <div className="flex flex-col items-end">
                            <span className="text-3xl font-bold text-foreground">
                                {Number(tool.overallScore || 0).toFixed(1)}
                            </span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Overall Score</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column (2/3) */}
                <div className="md:col-span-2 space-y-6">
                    {isResearching && <ResearchStream toolId={tool.id} />}

                    <Card>
                        <CardHeader>
                            <CardTitle>Executive Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="leading-relaxed text-muted-foreground">
                                {report?.summary || "No summary available."}
                            </p>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="report" className="w-full">
                        <TabsList>
                            <TabsTrigger value="report">Analysis</TabsTrigger>
                            <TabsTrigger value="features">Features & Pricing</TabsTrigger>
                            <TabsTrigger value="notes">Team Notes</TabsTrigger>
                            {isResearching && <TabsTrigger value="stream">Live Logs</TabsTrigger>}
                        </TabsList>

                        <TabsContent value="report" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader><CardTitle>Score Breakdown</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {report?.scorecardSnapshot && Object.entries(report.scorecardSnapshot).map(([key, value]: [string, any]) => (
                                            <div key={key} className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium capitalize">{key.replace('_', ' ')}</span>
                                                    <span className="font-bold">{value.score}/10</span>
                                                </div>
                                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary" style={{ width: `${(value.score / 10) * 100}%` }} />
                                                </div>
                                                <p className="text-sm text-muted-foreground">{value.justification}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="bg-green-50/50 border-green-100">
                                    <CardHeader><CardTitle className="text-green-700">Pros</CardTitle></CardHeader>
                                    <CardContent>
                                        <ul className="list-disc pl-4 space-y-1 text-sm text-green-800">
                                            {report?.pros?.map((pro: string, i: number) => (
                                                <li key={i}>{pro}</li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                                <Card className="bg-red-50/50 border-red-100">
                                    <CardHeader><CardTitle className="text-red-700">Cons</CardTitle></CardHeader>
                                    <CardContent>
                                        <ul className="list-disc pl-4 space-y-1 text-sm text-red-800">
                                            {report?.cons?.map((con: string, i: number) => (
                                                <li key={i}>{con}</li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="features" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader><CardTitle>Extracted Features</CardTitle></CardHeader>
                                <CardContent>
                                    <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                                        {JSON.stringify(report?.features, null, 2)}
                                    </pre>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Pricing Structure</CardTitle></CardHeader>
                                <CardContent>
                                    <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                                        {JSON.stringify(report?.pricing, null, 2)}
                                    </pre>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="notes" className="space-y-4 mt-4">
                            <NotesSection toolId={tool.id} notes={[]} />
                        </TabsContent>

                        <TabsContent value="stream" className="space-y-4 mt-4">
                            <ResearchStream toolId={tool.id} />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column (1/3) - Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <span className="text-sm text-muted-foreground block">Categories</span>
                                <div className="flex gap-1 flex-wrap mt-1">
                                    {tool.category?.map((c: string) => (
                                        <Badge key={c} variant="secondary">{c}</Badge>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground block">Submitted By</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-6 h-6 rounded-full bg-slate-200" />
                                    <span className="text-sm">Adam Wolfe</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Competitors</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="p-2 rounded hover:bg-muted cursor-pointer transition-colors flex justify-between items-center bg-muted/30">
                                    <span className="text-sm font-medium">Smartlead.ai</span>
                                    <Badge variant="outline">7.9</Badge>
                                </div>
                                <div className="p-2 rounded hover:bg-muted cursor-pointer transition-colors flex justify-between items-center bg-muted/30">
                                    <span className="text-sm font-medium">Apollo.io</span>
                                    <Badge variant="outline">8.5</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
