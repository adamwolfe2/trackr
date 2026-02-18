"use client";

import { useState, useMemo, useTransition } from "react";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, ArrowRight, Star, Globe, Search, Filter, ArrowUpDown, MoreVertical, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { deleteTool, updateToolStatus } from "@/lib/actions/tools";
import { toast } from "sonner";

interface Tool {
    id: string;
    name: string;
    websiteUrl: string | null;
    description?: string;
    category: string[] | null;
    status: string;
    overallScore: string | null;
    submittedAt: Date;
    lastResearchedAt: Date | null;
    isPromoted?: boolean;
}

export function ToolGrid({ tools }: { tools: Tool[] }) {
    const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("newest");
    const [isPending, startTransition] = useTransition();

    // Extract unique categories
    const allCategories = useMemo(() => {
        const categories = new Set<string>();
        tools.forEach(tool => {
            tool.category?.forEach(c => categories.add(c));
        });
        return Array.from(categories).sort();
    }, [tools]);

    // Filter and Sort Logic
    const filteredTools = useMemo(() => {
        return tools
            .filter(tool => {
                const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    tool.description?.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesCategory = selectedCategory === "all" || tool.category?.includes(selectedCategory);
                return matchesSearch && matchesCategory;
            })
            .sort((a, b) => {
                if (sortBy === "score") {
                    const scoreA = parseFloat(a.overallScore || "0");
                    const scoreB = parseFloat(b.overallScore || "0");
                    return scoreB - scoreA;
                }
                // default to newest
                return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
            });
    }, [tools, searchQuery, selectedCategory, sortBy]);

    const handleDelete = (toolId: string) => {
        if (!confirm("Are you sure you want to delete this tool? All reports and data will be permanently lost.")) return;

        startTransition(async () => {
            try {
                await deleteTool(toolId);
                toast.success("Tool deleted successfully");
                setSelectedTool(null);
            } catch (error) {
                toast.error("Failed to delete tool");
            }
        });
    };

    const handleStatusUpdate = (toolId: string, newStatus: string) => {
        startTransition(async () => {
            try {
                await updateToolStatus(toolId, newStatus);
                toast.success(`Tool status updated to ${newStatus}`);
                if (selectedTool) setSelectedTool({ ...selectedTool, status: newStatus });
            } catch (error) {
                toast.error("Failed to update status");
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-background/50 backdrop-blur-sm p-4 rounded-xl border">
                <div className="relative w-full sm:w-[300px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tools..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[160px]">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {allCategories.map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[160px]">
                            <ArrowUpDown className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="score">Highest Score</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <BentoGrid className="max-w-7xl mx-auto">
                {filteredTools.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center space-y-3">
                        <div className="p-4 bg-muted rounded-full">
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium text-lg">No tools found</p>
                            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                ) : (
                    filteredTools.map((tool, i) => (
                        <BentoCard
                            key={tool.id}
                            title={
                                <div className="flex items-center gap-2">
                                    {tool.name}
                                    {tool.isPromoted ? (
                                        <Badge variant="default" className="text-[10px] px-1 py-0 h-5 bg-blue-600 hover:bg-blue-700">
                                            Promoted
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                                            {tool.status}
                                        </Badge>
                                    )}
                                </div>
                            }
                            description={
                                <div className="flex flex-col gap-2">
                                    <span className="text-xs text-muted-foreground line-clamp-2">
                                        {tool.description || "No description available."}
                                    </span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {tool.category?.slice(0, 3).map(c => (
                                            <Badge key={c} variant="secondary" className="text-[10px] px-1 py-0">
                                                {c}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            }
                            header={
                                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 flex-col items-center justify-center relative overflow-hidden group-hover/bento:scale-105 transition-transform duration-200">
                                    {tool.overallScore && (
                                        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                            {Number(tool.overallScore).toFixed(1)}
                                        </div>
                                    )}
                                    <div className="text-4xl font-bold text-neutral-300 dark:text-neutral-700 select-none">
                                        {tool.name.charAt(0)}
                                    </div>
                                </div>
                            }
                            className={i === 3 || i === 6 ? "md:col-span-2" : ""}
                            icon={<Globe className="h-4 w-4 text-neutral-500" />}
                            onClick={() => setSelectedTool(tool)}
                        />
                    ))
                )}
            </BentoGrid>

            <Dialog open={!!selectedTool} onOpenChange={(open) => !open && setSelectedTool(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    {selectedTool && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center justify-between">
                                    <DialogTitle className="flex items-center gap-2 text-2xl">
                                        {selectedTool.name}
                                        <Badge variant={selectedTool.status === 'active' ? 'default' : 'secondary'}>
                                            {selectedTool.status}
                                        </Badge>
                                    </DialogTitle>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleStatusUpdate(selectedTool.id, 'active')}>
                                                Mark Active
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusUpdate(selectedTool.id, 'archived')}>
                                                Archive
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusUpdate(selectedTool.id, 'researching')}>
                                                Re-queue Research
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-600"
                                                onClick={() => handleDelete(selectedTool.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Tool
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <DialogDescription>
                                    Added {formatDistanceToNow(new Date(selectedTool.submittedAt), { addSuffix: true })}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-muted/50">
                                        <span className="text-sm text-muted-foreground block mb-1">Overall Score</span>
                                        <div className="text-3xl font-bold flex items-center gap-2">
                                            {selectedTool.overallScore ? Number(selectedTool.overallScore).toFixed(1) : '-'}
                                            <span className="text-sm text-muted-foreground font-normal">/ 10</span>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-muted/50">
                                        <span className="text-sm text-muted-foreground block mb-1">Last Researched</span>
                                        <div className="text-sm font-medium">
                                            {selectedTool.lastResearchedAt
                                                ? new Date(selectedTool.lastResearchedAt).toLocaleDateString()
                                                : 'Never'}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium leading-none">Categories</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTool.category?.map(c => (
                                            <Badge key={c} variant="secondary">{c}</Badge>
                                        ))}
                                        {!selectedTool.category?.length && <span className="text-sm text-muted-foreground">None</span>}
                                    </div>
                                </div>

                                {selectedTool.websiteUrl && (
                                    <div className="pt-4 flex justify-between items-center">
                                        <a
                                            href={selectedTool.websiteUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                                        >
                                            Visit Website <ExternalLink className="w-3 h-3" />
                                        </a>

                                        <Link href={`/tools/${selectedTool.id}`}>
                                            <Button className="gap-2">
                                                View Full Report <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {isPending && (
                                <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg z-50">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
