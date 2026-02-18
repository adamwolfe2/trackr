export const dynamic = "force-dynamic";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { workspaceMembers, workspaces } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { Shield, UserX, Building2 } from "lucide-react";
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
                <h1 className="font-serif text-3xl">No Workspace Found</h1>
                <p className="font-mono text-sm text-neutral-500">Complete onboarding to set up your workspace.</p>
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

    const roleLabel = (role: string) => {
        if (role === "owner") return <span className="font-mono text-[10px] uppercase tracking-widest border border-black px-2 py-0.5 flex items-center gap-1"><Shield className="h-2.5 w-2.5" /> Owner</span>;
        if (role === "admin") return <span className="font-mono text-[10px] uppercase tracking-widest border border-neutral-400 text-neutral-600 px-2 py-0.5 flex items-center gap-1"><Shield className="h-2.5 w-2.5" /> Admin</span>;
        return <span className="font-mono text-[10px] uppercase tracking-widest border border-neutral-300 text-neutral-400 px-2 py-0.5">Member</span>;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-serif text-3xl font-normal">Workspace Settings</h1>
                <p className="font-mono text-sm text-neutral-500 mt-1">Manage your team and preferences.</p>
            </div>

            <div className="space-y-6">
                {/* Team Members */}
                <div className="border border-black">
                    <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                        <h2 className="font-mono text-xs uppercase tracking-widest">Team Members</h2>
                        <span className="font-mono text-[10px] text-neutral-400">{members.length} member{members.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="p-5 space-y-5">
                        {isOwnerOrAdmin && (
                            <form action={async (fd: FormData) => {
                                "use server";
                                await inviteMember(fd);
                            }} className="flex gap-0">
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="colleague@company.com"
                                    required
                                    className="flex-1 max-w-sm border border-black px-4 py-2 font-mono text-sm bg-white focus:outline-none"
                                />
                                <button type="submit" className="border border-l-0 border-black px-5 py-2 font-mono text-xs uppercase tracking-widest bg-black text-white hover:bg-neutral-800">
                                    Send Invite
                                </button>
                            </form>
                        )}

                        <div className="divide-y divide-neutral-100">
                            {members.map((member) => {
                                const initials = member.userId.slice(5, 7).toUpperCase();
                                const isCurrentUser = member.userId === user.id;
                                const isThisOwner = member.role === "owner";

                                return (
                                    <div key={member.id} className="flex items-center justify-between py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 border border-black flex items-center justify-center font-mono text-xs font-bold flex-shrink-0">
                                                {isCurrentUser ? (user.firstName?.[0] ?? "U") : initials.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-mono text-sm font-medium">
                                                    {isCurrentUser ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "You" : `Member ${initials}`}
                                                    {isCurrentUser && <span className="font-mono text-[10px] text-neutral-400 ml-2">(you)</span>}
                                                </div>
                                                <div className="font-mono text-[10px] text-neutral-400">
                                                    {isCurrentUser && user.emailAddresses[0]?.emailAddress
                                                        ? user.emailAddresses[0].emailAddress
                                                        : `Joined ${new Date(member.joinedAt).toLocaleDateString()}`}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {roleLabel(member.role)}
                                            {isOwnerOrAdmin && !isCurrentUser && !isThisOwner && (
                                                <form action={async () => {
                                                    "use server";
                                                    await removeMember(member.id);
                                                }}>
                                                    <button type="submit" className="font-mono text-[10px] uppercase tracking-widest border border-red-300 text-red-500 px-2 py-0.5 hover:bg-red-50 flex items-center gap-1">
                                                        <UserX className="h-2.5 w-2.5" /> Remove
                                                    </button>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* General Preferences */}
                <div className="border border-black">
                    <div className="border-b border-black px-5 py-3">
                        <h2 className="font-mono text-xs uppercase tracking-widest">General Preferences</h2>
                    </div>
                    <div className="p-5">
                        <form action={async (fd: FormData) => {
                            "use server";
                            await updateWorkspaceName(fd);
                        }} className="space-y-4 max-w-md">
                            <div>
                                <label className="font-mono text-xs uppercase tracking-widest block mb-2" htmlFor="workspace-name">Workspace Name</label>
                                <input
                                    id="workspace-name"
                                    name="name"
                                    defaultValue={workspace?.name ?? "My Workspace"}
                                    disabled={!isOwnerOrAdmin}
                                    className="w-full border border-black px-4 py-2 font-mono text-sm bg-white focus:outline-none disabled:opacity-40"
                                />
                            </div>
                            {isOwnerOrAdmin && (
                                <button type="submit" className="border border-black px-5 py-2 font-mono text-xs uppercase tracking-widest bg-white hover:bg-black hover:text-white">
                                    Save Changes
                                </button>
                            )}
                        </form>
                    </div>
                </div>

                {/* Company Profile */}
                <div className="border border-black">
                    <div className="border-b border-black px-5 py-3 flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5" />
                        <h2 className="font-mono text-xs uppercase tracking-widest">Company Profile</h2>
                    </div>
                    <div className="p-5">
                        <p className="font-mono text-xs text-neutral-500 mb-4 leading-relaxed">
                            This context is used by AI research agents to evaluate tools specifically for your company.
                            It was captured from your website during onboarding and can be edited manually.
                        </p>
                        <form action={async (fd: FormData) => {
                            "use server";
                            await updateCompanyContext(fd);
                        }} className="space-y-4">
                            <div>
                                <label className="font-mono text-xs uppercase tracking-widest block mb-2" htmlFor="company-context">Company Context</label>
                                <textarea
                                    id="company-context"
                                    name="companyContext"
                                    rows={6}
                                    defaultValue={workspace?.companyContext ?? ""}
                                    disabled={!isOwnerOrAdmin}
                                    placeholder="Describe your company: industry, business model, team size, main goals, tech stack, and what kind of tools would be most valuable..."
                                    className="w-full border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none resize-none disabled:opacity-40"
                                />
                                <p className="font-mono text-[10px] text-neutral-400 mt-1">
                                    The more specific you are, the better the AI can tailor research to your actual needs.
                                </p>
                            </div>
                            {isOwnerOrAdmin && (
                                <button type="submit" className="border border-black px-5 py-2 font-mono text-xs uppercase tracking-widest bg-white hover:bg-black hover:text-white">
                                    Save Company Profile
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
