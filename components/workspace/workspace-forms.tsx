"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { updateWorkspaceName, inviteMember, removeMember, updateCompanyContext, cancelInvitation, generateInviteLink, revokeInviteLink } from "@/lib/actions/workspace";
import { Loader2, UserX, X, Copy, Check, Link2, RefreshCw, Trash2 } from "lucide-react";

function SubmitButton({ children, className }: { children: React.ReactNode; className: string }) {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className={`${className} disabled:opacity-50 disabled:cursor-not-allowed`}>
            {pending ? <Loader2 className="h-3 w-3 animate-spin inline mr-1.5" /> : null}
            {children}
        </button>
    );
}

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
                maxLength={320}
                className="flex-1 sm:max-w-sm border border-black px-4 py-2 font-mono text-sm bg-white focus:outline-none"
            />
            <SubmitButton className="border sm:border-l-0 border-t-0 sm:border-t border-black px-5 py-2 font-mono text-xs uppercase tracking-widest bg-black text-white hover:bg-neutral-800 whitespace-nowrap">
                Send Invite
            </SubmitButton>
        </form>
    );
}

export function RemoveMemberButton({ memberId, memberName }: { memberId: string; memberName?: string }) {
    return (
        <form action={async () => {
            const name = memberName ?? "this member";
            if (!window.confirm(`Remove ${name} from the workspace? They will lose access immediately.`)) return;
            try {
                await removeMember(memberId);
                toast.success("Member removed");
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to remove member");
            }
        }}>
            <SubmitButton className="font-mono text-[10px] uppercase tracking-widest border border-red-300 text-red-500 px-2 py-0.5 hover:bg-red-50 flex items-center gap-1">
                <UserX className="h-2.5 w-2.5" /> Remove
            </SubmitButton>
        </form>
    );
}

export function CancelInvitationButton({ invitationId }: { invitationId: string }) {
    return (
        <form action={async () => {
            try {
                await cancelInvitation(invitationId);
                toast.success("Invitation cancelled");
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to cancel invitation");
            }
        }}>
            <SubmitButton className="font-mono text-[10px] uppercase tracking-widest border border-neutral-300 text-neutral-500 px-2 py-0.5 hover:bg-neutral-100 hover:border-neutral-400 flex items-center gap-1">
                <X className="h-2.5 w-2.5" /> Cancel
            </SubmitButton>
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
                    required
                    maxLength={200}
                    className="w-full border border-black px-4 py-2 font-mono text-sm bg-white focus:outline-none disabled:opacity-40"
                />
            </div>
            {!disabled && (
                <SubmitButton className="border border-black px-5 py-2 font-mono text-xs uppercase tracking-widest bg-white hover:bg-black hover:text-white">
                    Save Changes
                </SubmitButton>
            )}
        </form>
    );
}

export function InviteLinkPanel({ initialCode }: { initialCode: string | null }) {
    const [code, setCode] = useState<string | null>(initialCode);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    const inviteUrl = code ? `https://trytrackr.com/invite/link/${code}` : null;

    async function handleGenerate() {
        setLoading(true);
        try {
            const newCode = await generateInviteLink();
            setCode(newCode);
            toast.success("Invite link generated");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to generate link");
        } finally {
            setLoading(false);
        }
    }

    async function handleRevoke() {
        if (!window.confirm("Revoke this link? Anyone who tries to use it will be denied access.")) return;
        setLoading(true);
        try {
            await revokeInviteLink();
            setCode(null);
            toast.success("Invite link revoked");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to revoke link");
        } finally {
            setLoading(false);
        }
    }

    async function handleCopy() {
        if (!inviteUrl) return;
        try {
            await navigator.clipboard.writeText(inviteUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy to clipboard");
        }
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Link2 className="h-3.5 w-3.5" />
                <span className="font-mono text-xs uppercase tracking-widest">Invite Link</span>
            </div>
            {inviteUrl ? (
                <div className="flex flex-col sm:flex-row gap-0">
                    <input
                        readOnly
                        value={inviteUrl}
                        className="flex-1 border border-black px-4 py-2 font-mono text-xs bg-white focus:outline-none text-neutral-600 truncate"
                    />
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="border sm:border-l-0 border-t-0 sm:border-t border-black px-4 py-2 font-mono text-xs uppercase tracking-widest bg-black text-white hover:bg-neutral-800 flex items-center gap-1.5 whitespace-nowrap"
                    >
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copied ? "Copied" : "Copy"}
                    </button>
                </div>
            ) : (
                <p className="font-mono text-xs text-neutral-400">No invite link yet. Generate one to share with your team.</p>
            )}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={loading}
                    className="border border-black px-4 py-2 font-mono text-xs uppercase tracking-widest bg-white hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    {code ? "Regenerate" : "Generate Link"}
                </button>
                {code && (
                    <button
                        type="button"
                        onClick={handleRevoke}
                        disabled={loading}
                        className="border border-red-300 text-red-500 px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                        <Trash2 className="h-3 w-3" />
                        Revoke
                    </button>
                )}
            </div>
            <p className="font-mono text-[10px] text-neutral-400">
                Anyone with this link can join your workspace · Subject to member limits
            </p>
        </div>
    );
}

export function UpdateCompanyContextForm({ defaultContext, disabled }: { defaultContext: string; disabled: boolean }) {
    const [charCount, setCharCount] = useState(defaultContext.length);
    const MAX_CHARS = 5000;
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
                <div className="flex items-center justify-between mb-2">
                    <label className="font-mono text-xs uppercase tracking-widest" htmlFor="company-context">Company Context</label>
                    <span className={`font-mono text-[10px] ${charCount > MAX_CHARS * 0.9 ? "text-amber-600" : "text-neutral-400"}`}>
                        {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                    </span>
                </div>
                <textarea
                    id="company-context"
                    name="companyContext"
                    rows={6}
                    defaultValue={defaultContext}
                    disabled={disabled}
                    maxLength={MAX_CHARS}
                    onChange={(e) => setCharCount(e.target.value.length)}
                    placeholder="Describe your company: industry, business model, team size, main goals, tech stack, and what kind of tools would be most valuable..."
                    className="w-full border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none resize-none disabled:opacity-40"
                />
                <p className="font-mono text-[10px] text-neutral-400 mt-1">
                    The more specific you are, the better the AI can tailor research to your actual needs.
                </p>
            </div>
            {!disabled && (
                <SubmitButton className="border border-black px-5 py-2 font-mono text-xs uppercase tracking-widest bg-white hover:bg-black hover:text-white">
                    Save Company Profile
                </SubmitButton>
            )}
        </form>
    );
}
