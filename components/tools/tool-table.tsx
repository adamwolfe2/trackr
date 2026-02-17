"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

// Mock type matching schema roughly
type Tool = {
    id: string;
    name: string;
    category: string[] | null;
    overallScore: string | number | null;
    status: string;
    lastResearchedAt: Date | null;
};

export function ToolTable({ tools }: { tools: Tool[] }) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm animate-fade-in-up delay-100">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Last Updated</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tools.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-64 text-center">
                                <div className="flex flex-col items-center justify-center space-y-3">
                                    <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-800">
                                        <div className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-medium">No tools found</p>
                                        <p className="text-sm text-muted-foreground">Submit a tool to start tracking intelligence.</p>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href="/tools/submit">Add Tool</Link>
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        tools.map((tool) => (
                            <TableRow key={tool.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                                <TableCell className="font-medium">
                                    <Link href={`/tools/${tool.id}`} className="block w-full h-full">
                                        {tool.name}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 flex-wrap">
                                        {tool.category?.map((cat) => (
                                            <Badge key={cat} variant="secondary" className="text-xs">
                                                {cat}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {tool.overallScore ? (
                                        <Badge
                                            variant="outline"
                                            className={
                                                Number(tool.overallScore) >= 8
                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                    : Number(tool.overallScore) >= 6
                                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                                        : "bg-red-50 text-red-700 border-red-200"
                                            }
                                        >
                                            {Number(tool.overallScore).toFixed(1)}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground text-xs">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                        {tool.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground text-sm">
                                    {tool.lastResearchedAt
                                        ? formatDistanceToNow(new Date(tool.lastResearchedAt), { addSuffix: true })
                                        : "Pending"}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
