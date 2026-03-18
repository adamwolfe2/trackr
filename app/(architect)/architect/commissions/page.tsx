export const dynamic = "force-dynamic";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { architects, architectCommissions } from "@/lib/db/schema";
import { eq, desc, sum, and } from "drizzle-orm";

export default async function ArchitectCommissionsPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const architect = await db.query.architects.findFirst({
        where: eq(architects.userId, user.id),
    });
    if (!architect) redirect("/apply");

    const commissions = await db
        .select()
        .from(architectCommissions)
        .where(eq(architectCommissions.architectId, architect.id))
        .orderBy(desc(architectCommissions.createdAt));

    const [paidResult] = await db
        .select({ total: sum(architectCommissions.commissionAmount) })
        .from(architectCommissions)
        .where(and(
            eq(architectCommissions.architectId, architect.id),
            eq(architectCommissions.status, "paid"),
        ));

    const [pendingResult] = await db
        .select({ total: sum(architectCommissions.commissionAmount) })
        .from(architectCommissions)
        .where(and(
            eq(architectCommissions.architectId, architect.id),
            eq(architectCommissions.status, "pending"),
        ));

    const totalPaid = Number(paidResult?.total ?? 0);
    const totalPending = Number(pendingResult?.total ?? 0);
    const totalEarned = totalPaid + totalPending;

    return (
        <div className="space-y-8">
            <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Commissions</p>
                <h1 className="font-serif text-3xl font-normal">Commission History</h1>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-px border border-black bg-black">
                {[
                    { label: "Total Earned", value: `$${(totalEarned / 100).toFixed(2)}` },
                    { label: "Paid Out", value: `$${(totalPaid / 100).toFixed(2)}` },
                    { label: "Pending", value: `$${(totalPending / 100).toFixed(2)}` },
                ].map((stat) => (
                    <div key={stat.label} className="bg-[#F3F3EF] p-5">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">{stat.label}</p>
                        <p className="font-serif text-3xl font-normal">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Commission table */}
            <div className="border border-black overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-black">
                            <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Date</th>
                            <th className="text-right font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Invoice</th>
                            <th className="text-right font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Rate</th>
                            <th className="text-right font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Commission</th>
                            <th className="text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500 p-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commissions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center font-mono text-sm text-neutral-400">
                                    No commissions yet. When your referred clients make payments, commissions will appear here.
                                </td>
                            </tr>
                        )}
                        {commissions.map((comm) => (
                            <tr key={comm.id} className="border-b border-neutral-200 last:border-0 hover:bg-white transition-colors">
                                <td className="p-3 font-mono text-xs text-neutral-600">
                                    {new Date(comm.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-3 font-mono text-xs text-right">
                                    ${(comm.invoiceAmount / 100).toFixed(2)}
                                </td>
                                <td className="p-3 font-mono text-xs text-right text-neutral-500">
                                    {comm.commissionRate}%
                                </td>
                                <td className="p-3 font-mono text-xs text-right font-bold">
                                    ${(comm.commissionAmount / 100).toFixed(2)}
                                </td>
                                <td className="p-3">
                                    <span className={`font-mono text-[10px] uppercase tracking-widest border px-1.5 py-0.5 ${
                                        comm.status === "paid" ? "text-black border-neutral-200" :
                                        comm.status === "failed" ? "text-red-700 border-red-200" :
                                        "text-yellow-700 border-yellow-200"
                                    }`}>
                                        {comm.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
