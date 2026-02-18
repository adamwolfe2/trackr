export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { ads, workspaceMembers } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PlusCircle, BarChart3, MousePointer2, DollarSign, Eye } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function AdvertisePage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });

    if (!member) return <div>No workspace found</div>;

    const myAds = await db.query.ads.findMany({
        where: eq(ads.workspaceId, member.workspaceId),
        with: {
            tool: true
        },
        orderBy: [desc(ads.createdAt)]
    });

    const totalImpressions = myAds.reduce((acc, ad) => acc + ad.impressions, 0);
    const totalClicks = myAds.reduce((acc, ad) => acc + ad.clicks, 0);
    const totalSpend = myAds.reduce((acc, ad) => acc + ad.spent, 0);

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ad Manager</h1>
                    <p className="text-muted-foreground">Promote your tools to the entire Trackr network.</p>
                </div>
                <Link href="/advertise/create">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Campaign
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                        <MousePointer2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${(totalSpend / 100).toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Campaigns</CardTitle>
                    <CardDescription>Manage your active ad campaigns.</CardDescription>
                </CardHeader>
                <CardContent>
                    {myAds.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            No campaigns found. Start promoting your first tool!
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tool</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Budget</TableHead>
                                    <TableHead>Spent</TableHead>
                                    <TableHead>Impressions</TableHead>
                                    <TableHead>Clicks</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Invoice</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {myAds.map((ad) => (
                                    <TableRow key={ad.id}>
                                        <TableCell className="font-medium">{ad.tool.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={ad.status === 'active' ? 'default' : 'secondary'}>
                                                {ad.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>${(ad.budget / 100).toFixed(2)}</TableCell>
                                        <TableCell>${(ad.spent / 100).toFixed(2)}</TableCell>
                                        <TableCell>{ad.impressions.toLocaleString()}</TableCell>
                                        <TableCell>{ad.clicks.toLocaleString()}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {formatDistanceToNow(new Date(ad.createdAt), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell>
                                            <a href={`/api/invoices/${ad.id}`} target="_blank" rel="noopener noreferrer">
                                                <Button variant="ghost" size="sm">
                                                    Download Invoice
                                                </Button>
                                            </a>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
