"use client";

import { useRef } from "react";
import { toast } from "sonner";
import { updateWorkspaceName, inviteMember, removeMember, updateCompanyContext } from "@/lib/actions/workspace";
import { UserX } from "lucide-react";

export function InviteMemberForm() {
    const formRef = useRef<HTMLFormElement>(null);

    return (
        <form
            ref={formRef}
            action={async (fd: FormData) => {
                try {
                    await inviteMember(fd);
                    toast.success("Invite sent successfully");
                    formRef.current?.reset();
                } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Failed to send invite");
                }
            }}
            className="flex flex-col sm:flex-row gap-0"
        >
            <input
                name="email"
                type="email"
                placeholder="colleague@company.com"
                required
                className="flex-1 sm:max-w-sm border border-black px-4 py-2 font-mono text-sm bg-white focus:outline-none"
            />
            <button type="submit" className="border sm:border-l-0 border-t-0 sm:border-t border-black px-5 py-2 font-mono text-xs uppercase tracking-widest bg-black text-white hover:bg-neutral-800 whitespace-nowrap">
                Send Invite
            </button>
        </form>
    );
}

export function RemoveMemberButton({ memberId }: { memberId: string }) {
    return (
        <form action={async () => {
            try {
                await removeMember(memberId);
                toast.success("Member removed");
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to remove member");
            }
        }}>
            <button type="submit" className="font-mono text-[10px] uppercase tracking-widest border border-red-300 text-red-500 px-2 py-0.5 hover:bg-red-50 flex items-center gap-1">
                <UserX className="h-2.5 w-2.5" /> Remove
            </button>
        </form>
    );
}

export function UpdateWorkspaceNameForm({ defaultName, disabled }: { defaultName: string; disabled: boolean }) {
    return (
        <form
            action={async (fd: FormData) => {
                try {
                    await updateWorkspaceName(fd);
                    toast.success("Workspace name updated");
                } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Failed to update name");
                }
            }}
            className="space-y-4 max-w-md"
        >
            <div>
                <label className="font-mono text-xs uppercase tracking-widest block mb-2" htmlFor="workspace-name">Workspace Name</label>
                <input
                    id="workspace-name"
                    name="name"
                    defaultValue={defaultName}
                    disabled={disabled}
                    className="w-full border border-black px-4 py-2 font-mono text-sm bg-white focus:outline-none disabled:opacity-40"
                />
            </div>
            {!disabled && (
                <button type="submit" className="border border-black px-5 py-2 font-mono text-xs uppercase tracking-widest bg-white hover:bg-black hover:text-white">
                    Save Changes
                </button>
            )}
        </form>
    );
}

export function UpdateCompanyContextForm({ defaultContext, disabled }: { defaultContext: string; disabled: boolean }) {
    return (
        <form
            action={async (fd: FormData) => {
                try {
                    await updateCompanyContext(fd);
                    toast.success("Company profile updated");
                } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Failed to update profile");
                }
            }}
            className="space-y-4"
        >
            <div>
                <label className="font-mono text-xs uppercase tracking-widest block mb-2" htmlFor="company-context">Company Context</label>
                <textarea
                    id="company-context"
                    name="companyContext"
                    rows={6}
                    defaultValue={defaultContext}
                    disabled={disabled}
                    placeholder="Describe your company: industry, business model, team size, main goals, tech stack, and what kind of tools would be most valuable..."
                    className="w-full border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none resize-none disabled:opacity-40"
                />
                <p className="font-mono text-[10px] text-neutral-400 mt-1">
                    The more specific you are, the better the AI can tailor research to your actual needs.
                </p>
            </div>
            {!disabled && (
                <button type="submit" className="border border-black px-5 py-2 font-mono text-xs uppercase tracking-widest bg-white hover:bg-black hover:text-white">
                    Save Company Profile
                </button>
            )}
        </form>
    );
}
