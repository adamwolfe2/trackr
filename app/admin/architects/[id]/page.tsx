export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import {
    architectApplications,
    architects,
    architectReferrals,
    architectCommissions,
    workspaces,
    auditSubmissions,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { createHash, timingSafeEqual } from "crypto";
import { ARCHITECT_ROLES } from "@/lib/config/architect-roles";
import {
    approveApplication,
    rejectApplication,
    pauseArchitect,
    terminateArchitect,
} from "@/lib/actions/architects";

async function isAuthenticated(): Promise<boolean> {
    const cookie = (await cookies()).get("trackr-admin");
    if (!cookie?.value || !process.env.ADMIN_PASSWORD) return false;
    const expected = createHash("sha256").update(process.env.ADMIN_PASSWORD).digest("hex");
    const a = Buffer.from(cookie.value);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
}

function getRoleTitle(slug: string): string {
    return ARCHITECT_ROLES.find((r) => r.slug === slug)?.title ?? slug;
}

function statusColor(status: string): string {
    switch (status) {
        case "approved":
        case "active": return "text-green-700 border-green-200";
        case "rejected":
        case "terminated": return "text-red-700 border-red-200";
        case "pending": return "text-yellow-700 border-yellow-200";
        case "paused": return "text-orange-700 border-orange-200";
        default: return "text-neutral-500 border-neutral-200";
    }
}

export default async function ArchitectDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const authed = await isAuthenticated();
    if (!authed) redirect("/admin/architects");

    const { id } = await params;

    const application = await db.query.architectApplications.findFirst({
        where: eq(architectApplications.id, id),
    });
    if (!application) notFound();

    // Check if there's an approved architect record
    const architect = await db.query.architects.findFirst({
        where: eq(architects.applicationId, id),
    });

    // If architect exists, get referrals and commissions
    type CommissionRow = typeof architectCommissions.$inferSelect;
    let referrals: {
        id: string;
        workspaceId: string | null;
        status: string;
        attributedAt: Date;
        workspaceName: string | null;
        companyName: string | null;
        contactEmail: string | null;
    }[] = [];
    let commissions: CommissionRow[] = [];

    if (architect) {
        referrals = await db
            .select({
                id: architectReferrals.id,
                workspaceId: architectReferrals.workspaceId,
                status: architectReferrals.status,
                attributedAt: architectReferrals.attributedAt,
                workspaceName: workspaces.name,
                companyName: auditSubmissions.companyName,
                contactEmail: auditSubmissions.contactEmail,
            })
            .from(architectReferrals)
            .leftJoin(workspaces, eq(architectReferrals.workspaceId, workspaces.id))
            .leftJoin(auditSubmissions, eq(architectReferrals.auditSubmissionId, auditSubmissions.id))
            .where(eq(architectReferrals.architectId, architect.id));

        commissions = await db
            .select()
            .from(architectCommissions)
            .where(eq(architectCommissions.architectId, architect.id));
    }

    // Server actions
    async function handleApprove() {
        "use server";
        await approveApplication(id);
        redirect(`/admin/architects/${id}?approved=1`);
    }

    async function handleReject(formData: FormData) {
        "use server";
        const notes = formData.get("reviewNotes") as string;
        await rejectApplication(id, notes || undefined);
        redirect(`/admin/architects/${id}?rejected=1`);
    }

    async function saveNotes(formData: FormData) {
        "use server";
        const notes = formData.get("reviewNotes") as string;
        await db
            .update(architectApplications)
            .set({ reviewNotes: notes })
            .where(eq(architectApplications.id, id));
        redirect(`/admin/architects/${id}`);
    }

    async function handlePause() {
        "use server";
        if (!architect) return;
        await pauseArchitect(architect.id);
        redirect(`/admin/architects/${id}?paused=1`);
    }

    async function handleTerminate() {
        "use server";
        if (!architect) return;
        await terminateArchitect(architect.id);
        redirect(`/admin/architects/${id}?terminated=1`);
    }

    return (
        <div className="space-y-8 pb-32">
            {/* Back nav */}
            <div className="flex items-center gap-4">
                <a href="/admin/architects" className="font-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-black transition-colors">
                    &larr; All Architects
                </a>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
                        Application
                    </p>
                    <h1 className="font-serif text-3xl font-normal">
                        {application.firstName} {application.lastName}
                    </h1>
                    <p className="font-mono text-sm text-neutral-600 mt-1">{application.email}</p>
                </div>
                <span className={`font-mono text-[10px] uppercase tracking-widest border px-2 py-1 ${statusColor(application.status)}`}>
                    {application.status}
                </span>
            </div>

            {/* Application details */}
            <div className="border border-black">
                <div className="border-b border-black p-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-3">Application Details</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <p className="font-mono text-[10px] text-neutral-400 uppercase">Role</p>
                            <p className="font-mono text-sm">{getRoleTitle(application.roleSlug)}</p>
                        </div>
                        <div>
                            <p className="font-mono text-[10px] text-neutral-400 uppercase">Applied</p>
                            <p className="font-mono text-sm">{new Date(application.createdAt).toLocaleDateString()}</p>
                        </div>
                        {application.phone && (
                            <div>
                                <p className="font-mono text-[10px] text-neutral-400 uppercase">Phone</p>
                                <p className="font-mono text-sm">{application.phone}</p>
                            </div>
                        )}
                        {application.linkedinUrl && (
                            <div>
                                <p className="font-mono text-[10px] text-neutral-400 uppercase">LinkedIn</p>
                                <a href={application.linkedinUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-sm underline hover:text-neutral-600">
                                    {application.linkedinUrl}
                                </a>
                            </div>
                        )}
                        {application.portfolioUrl && (
                            <div>
                                <p className="font-mono text-[10px] text-neutral-400 uppercase">Portfolio</p>
                                <a href={application.portfolioUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-sm underline hover:text-neutral-600">
                                    {application.portfolioUrl}
                                </a>
                            </div>
                        )}
                        {application.referralSource && (
                            <div>
                                <p className="font-mono text-[10px] text-neutral-400 uppercase">Referral Source</p>
                                <p className="font-mono text-sm">{application.referralSource}</p>
                            </div>
                        )}
                    </div>
                </div>
                {application.experience && (
                    <div className="p-5">
                        <p className="font-mono text-[10px] text-neutral-400 uppercase mb-2">Experience / Why they&apos;re a good fit</p>
                        <p className="font-mono text-sm text-neutral-700 whitespace-pre-wrap">{application.experience}</p>
                    </div>
                )}
            </div>

            {/* Review notes */}
            <div className="border border-black">
                <form action={saveNotes} className="p-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Review Notes (Internal)</p>
                    <textarea
                        name="reviewNotes"
                        defaultValue={application.reviewNotes ?? ""}
                        placeholder="Add your review notes..."
                        className="w-full h-24 font-mono text-xs border border-neutral-200 p-3 bg-white focus:outline-none resize-none"
                    />
                    <button
                        type="submit"
                        className="mt-2 font-mono text-xs uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
                    >
                        Save Notes
                    </button>
                </form>
            </div>

            {/* Architect profile (if approved) */}
            {architect && (
                <div className="border border-black">
                    <div className="border-b border-black p-5">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-3">Architect Profile</p>
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div>
                                <p className="font-mono text-[10px] text-neutral-400 uppercase">Arc Code</p>
                                <p className="font-mono text-sm font-bold">{architect.arcCode}</p>
                            </div>
                            <div>
                                <p className="font-mono text-[10px] text-neutral-400 uppercase">Status</p>
                                <span className={`font-mono text-[10px] uppercase tracking-widest border px-1.5 py-0.5 ${statusColor(architect.status)}`}>
                                    {architect.status}
                                </span>
                            </div>
                            <div>
                                <p className="font-mono text-[10px] text-neutral-400 uppercase">Stripe Connect</p>
                                <p className="font-mono text-sm">{architect.stripeOnboardingComplete ? "Connected" : "Not connected"}</p>
                            </div>
                            <div>
                                <p className="font-mono text-[10px] text-neutral-400 uppercase">Total Earnings</p>
                                <p className="font-mono text-sm">${(architect.totalEarnings / 100).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="font-mono text-[10px] text-neutral-400 uppercase">Total Clients</p>
                                <p className="font-mono text-sm">{architect.totalClients}</p>
                            </div>
                            <div>
                                <p className="font-mono text-[10px] text-neutral-400 uppercase">Referral Link</p>
                                <p className="font-mono text-[10px] text-neutral-600 break-all">trytrackr.com/audit?arc={architect.arcCode}</p>
                            </div>
                        </div>
                    </div>

                    {/* Referrals */}
                    {referrals.length > 0 && (
                        <div className="border-b border-black p-5">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-3">Referrals ({referrals.length})</p>
                            <div className="space-y-2">
                                {referrals.map((ref) => (
                                    <div key={ref.id} className="flex justify-between items-center border border-neutral-200 p-3">
                                        <div>
                                            <p className="font-mono text-xs">{ref.workspaceName || ref.companyName || "Pending workspace"}</p>
                                            {ref.contactEmail && (
                                                <p className="font-mono text-[10px] text-neutral-400">{ref.contactEmail}</p>
                                            )}
                                        </div>
                                        <span className={`font-mono text-[10px] uppercase tracking-widest border px-1.5 py-0.5 ${statusColor(ref.status)}`}>
                                            {ref.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Commissions */}
                    {commissions.length > 0 && (
                        <div className="p-5">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-3">Commissions ({commissions.length})</p>
                            <div className="space-y-2">
                                {commissions.map((comm) => (
                                    <div key={comm.id} className="flex justify-between items-center border border-neutral-200 p-3">
                                        <div>
                                            <p className="font-mono text-xs">Invoice: ${(comm.invoiceAmount / 100).toFixed(2)}</p>
                                            <p className="font-mono text-[10px] text-neutral-500">Commission: ${(comm.commissionAmount / 100).toFixed(2)}</p>
                                        </div>
                                        <span className={`font-mono text-[10px] uppercase tracking-widest border px-1.5 py-0.5 ${statusColor(comm.status)}`}>
                                            {comm.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Sticky action bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#F3F3EF] border-t-2 border-black px-6 py-4 z-50">
                <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap">
                    {application.status === "pending" && (
                        <>
                            <form action={handleApprove}>
                                <button
                                    type="submit"
                                    className="font-mono text-xs uppercase tracking-widest border border-black bg-black text-white px-4 py-2 hover:bg-neutral-800 transition-colors"
                                >
                                    Approve Application
                                </button>
                            </form>
                            <form action={handleReject}>
                                <input type="hidden" name="reviewNotes" value={application.reviewNotes ?? ""} />
                                <button
                                    type="submit"
                                    className="font-mono text-xs uppercase tracking-widest border border-red-600 text-red-600 px-4 py-2 hover:bg-red-600 hover:text-white transition-colors"
                                >
                                    Reject Application
                                </button>
                            </form>
                        </>
                    )}

                    {architect && architect.status === "active" && (
                        <>
                            <form action={handlePause}>
                                <button
                                    type="submit"
                                    className="font-mono text-xs uppercase tracking-widest border border-orange-600 text-orange-600 px-4 py-2 hover:bg-orange-600 hover:text-white transition-colors"
                                >
                                    Pause Architect
                                </button>
                            </form>
                            <form action={handleTerminate}>
                                <button
                                    type="submit"
                                    className="font-mono text-xs uppercase tracking-widest border border-red-600 text-red-600 px-4 py-2 hover:bg-red-600 hover:text-white transition-colors"
                                >
                                    Terminate
                                </button>
                            </form>
                        </>
                    )}

                    {application.status === "approved" && (
                        <span className="font-mono text-[10px] uppercase tracking-widest text-green-700">
                            Application approved
                        </span>
                    )}
                    {application.status === "rejected" && (
                        <span className="font-mono text-[10px] uppercase tracking-widest text-red-700">
                            Application rejected
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
