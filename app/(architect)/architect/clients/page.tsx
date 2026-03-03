export const dynamic = "force-dynamic";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { architects, architectReferrals, architectCommissions, workspaces, auditSubmissions } from "@/lib/db/schema";
import { eq, sum, and } from "drizzle-orm";

export default async function ArchitectClientsPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const architect = await db.query.architects.findFirst({
        where: eq(architects.userId, user.id),
    });
    if (!architect) redirect("/apply");

    const referrals = await db
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

    // Get commission totals per referral
    const commissionsByReferral = new Map<string, number>();
    for (const ref of referrals) {
        const [result] = await db
            .select({ total: sum(architectCommissions.commissionAmount) })
            .from(architectCommissions)
            .where(and(
                eq(architectCommissions.referralId, ref.id),
                eq(architectCommissions.status, "paid"),
            ));
        commissionsByReferral.set(ref.id, Number(result?.total ?? 0));
    }

    return (
        <div className="space-y-8">
            <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Clients</p>
                <h1 className="font-serif text-3xl font-normal">Your Referrals</h1>
            </div>

            <div className="border border-black overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-black">
                            <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Client</th>
                            <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Contact</th>
                            <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Status</th>
                            <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Referred</th>
                            <th className="text-right font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Commission Earned</th>
                        </tr>
                    </thead>
                    <tbody>
                        {referrals.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center font-mono text-sm text-neutral-400">
                                    No referrals yet. Share your referral link to start earning commissions.
                                </td>
                            </tr>
                        )}
                        {referrals.map((ref) => (
                            <tr key={ref.id} className="border-b border-neutral-200 last:border-0 hover:bg-white transition-colors">
                                <td className="p-3 font-mono text-sm">
                                    {ref.workspaceName || ref.companyName || "Pending"}
                                </td>
                                <td className="p-3 font-mono text-xs text-neutral-500">
                                    {ref.contactEmail || "—"}
                                </td>
                                <td className="p-3">
                                    <span className={`font-mono text-[10px] uppercase tracking-widest border px-1.5 py-0.5 ${
                                        ref.status === "active" ? "text-green-700 border-green-200" :
                                        ref.status === "churned" ? "text-red-700 border-red-200" :
                                        "text-yellow-700 border-yellow-200"
                                    }`}>
                                        {ref.status}
                                    </span>
                                </td>
                                <td className="p-3 font-mono text-xs text-neutral-500">
                                    {new Date(ref.attributedAt).toLocaleDateString()}
                                </td>
                                <td className="p-3 font-mono text-xs text-right">
                                    ${((commissionsByReferral.get(ref.id) ?? 0) / 100).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
