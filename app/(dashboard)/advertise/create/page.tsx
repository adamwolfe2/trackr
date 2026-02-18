export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/lib/db";
import { tools, workspaceMembers } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CreateAdForm } from "@/components/advertise/create-ad-form";

export default async function CreateAdPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });

    if (!member) return <div>No workspace found</div>;

    const myTools = await db.query.tools.findMany({
        where: eq(tools.workspaceId, member.workspaceId),
        orderBy: [desc(tools.submittedAt)]
    });

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">New Ad Campaign</h1>
                <p className="text-muted-foreground">Boost your tool's visibility with a sponsored placement.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Campaign Details</CardTitle>
                    <CardDescription>Select a tool and set your budget.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CreateAdForm tools={myTools} workspaceId={member.workspaceId} />
                </CardContent>
            </Card>
        </div>
    );
}
