export const dynamic = "force-dynamic";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { workspaceMembers, workspaces } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Shield, UserX, Building2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { updateWorkspaceName, inviteMember, removeMember, updateCompanyContext } from "@/lib/actions/workspace";

export default async function WorkspacePage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const currentMember = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });

    if (!currentMember) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <h1 className="text-2xl font-bold">No Workspace Found</h1>
                <p className="text-muted-foreground">Complete onboarding to set up your workspace.</p>
            </div>
        );
    }

    const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.id, currentMember.workspaceId),
    });

    const members = await db.query.workspaceMembers.findMany({
        where: eq(workspaceMembers.workspaceId, currentMember.workspaceId),
        orderBy: [asc(workspaceMembers.joinedAt)],
    });

    const isOwnerOrAdmin = currentMember.role === "owner" || currentMember.role === "admin";

    const getRoleBadge = (role: string) => {
        if (role === "owner") return <Badge variant="secondary" className="gap-1"><Shield className="h-3 w-3" />Owner</Badge>;
        if (role === "admin") return <Badge variant="outline" className="gap-1"><Shield className="h-3 w-3" />Admin</Badge>;
        return <Badge variant="outline">Member</Badge>;
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Workspace Settings</h1>
                    <p className="text-sm text-muted-foreground">Manage your team and preferences.</p>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Team Members */}
                <Card>
                    <CardHeader>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>
                            {members.length} member{members.length !== 1 ? "s" : ""} in this workspace.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {isOwnerOrAdmin && (
                            <form action={async (fd: FormData) => {
                                "use server";
                                await inviteMember(fd);
                            }} className="flex gap-2">
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="colleague@company.com"
                                    className="max-w-md"
                                    required
                                />
                                <Button type="submit">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Invite
                                </Button>
                            </form>
                        )}

                        <div className="space-y-3">
                            {members.map((member) => {
                                const initials = member.userId.slice(5, 7).toUpperCase();
                                const isCurrentUser = member.userId === user.id;
                                const isThisOwner = member.role === "owner";

                                return (
                                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback>{isCurrentUser ? (user.firstName?.[0] ?? "U") + (user.lastName?.[0] ?? "") : initials}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">
                                                    {isCurrentUser ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "You" : `Member ${initials}`}
                                                    {isCurrentUser && <span className="text-xs text-muted-foreground ml-2">(you)</span>}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {isCurrentUser && user.emailAddresses[0]?.emailAddress
                                                        ? user.emailAddresses[0].emailAddress
                                                        : `Joined ${new Date(member.joinedAt).toLocaleDateString()}`}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {getRoleBadge(member.role)}
                                            {isOwnerOrAdmin && !isCurrentUser && !isThisOwner && (
                                                <form action={async () => {
                                                    "use server";
                                                    await removeMember(member.id);
                                                }}>
                                                    <Button
                                                        type="submit"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <UserX className="h-4 w-4 mr-1" />
                                                        Remove
                                                    </Button>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* General Preferences */}
                <Card>
                    <CardHeader>
                        <CardTitle>General Preferences</CardTitle>
                        <CardDescription>Update your workspace name and settings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={async (fd: FormData) => {
                                "use server";
                                await updateWorkspaceName(fd);
                            }} className="space-y-4 max-w-md">
                            <div className="space-y-2">
                                <label className="text-sm font-medium" htmlFor="workspace-name">Workspace Name</label>
                                <Input
                                    id="workspace-name"
                                    name="name"
                                    defaultValue={workspace?.name ?? "My Workspace"}
                                    disabled={!isOwnerOrAdmin}
                                />
                            </div>
                            {isOwnerOrAdmin && (
                                <Button type="submit" variant="outline">Save Changes</Button>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Company Profile */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Company Profile
                        </CardTitle>
                        <CardDescription>
                            This context is used by AI research agents to evaluate tools specifically for your company.
                            It was captured from your website during onboarding and can be edited manually.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={async (fd: FormData) => {
                            "use server";
                            await updateCompanyContext(fd);
                        }} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium" htmlFor="company-context">
                                    Company Context
                                </label>
                                <Textarea
                                    id="company-context"
                                    name="companyContext"
                                    rows={6}
                                    defaultValue={workspace?.companyContext ?? ""}
                                    disabled={!isOwnerOrAdmin}
                                    placeholder="Describe your company: industry, business model, team size, main goals, tech stack, and what kind of tools would be most valuable..."
                                    className="resize-none"
                                />
                                <p className="text-xs text-muted-foreground">
                                    The more specific you are, the better the AI can tailor research to your actual needs.
                                </p>
                            </div>
                            {isOwnerOrAdmin && (
                                <Button type="submit" variant="outline">Save Company Profile</Button>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
