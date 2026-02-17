"use client";

export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Shield } from "lucide-react";

export default function WorkspacePage() {
    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Workspace Settings</h1>
                    <p className="text-sm text-muted-foreground">Manage your team and preferences.</p>
                </div>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>Invite colleagues to collaborate on tool research.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-2">
                            <Input placeholder="colleague@company.com" className="max-w-md" />
                            <Button>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Invite
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {/* Members List */}
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src="https://github.com/shadcn.png" />
                                        <AvatarFallback>AW</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">Adam Wolfe</div>
                                        <div className="text-sm text-muted-foreground">adam@example.com</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant="secondary" className="gap-1">
                                        <Shield className="h-3 w-3" />
                                        Owner
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>JD</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">Jane Doe</div>
                                        <div className="text-sm text-muted-foreground">jane@example.com</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant="outline">Member</Badge>
                                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">Remove</Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>General Preferences</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Form fields for workspace name, slug, etc. */}
                        <div className="space-y-4 max-w-md">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Workspace Name</label>
                                <Input defaultValue="My Workspace" />
                            </div>
                            <Button variant="outline">Save Changes</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
