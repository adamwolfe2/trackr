import { getInvoiceHistory } from "@/lib/actions/stripe";
import { ExternalLink } from "lucide-react";

export async function InvoiceHistory({ workspaceId }: { workspaceId: string }) {
    const { invoices } = await getInvoiceHistory(workspaceId);

    if (invoices.length === 0) return null;

    return (
        <div className="border border-black">
            <div className="border-b border-black px-5 py-3">
                <h2 className="font-mono text-xs uppercase tracking-widest">Invoice History</h2>
            </div>
            <div className="divide-y divide-neutral-100">
                {invoices.map((inv) => (
                    <div key={inv.id} className="px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="font-mono text-xs text-neutral-500 w-24">{inv.date}</span>
                            <span className="font-mono text-xs">{inv.description || "Subscription"}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`font-mono text-[10px] uppercase tracking-widest border px-2 py-0.5 ${
                                inv.status === "paid" ? "border-neutral-200 text-black" :
                                inv.status === "open" ? "border-yellow-200 text-yellow-700" :
                                "border-red-200 text-red-600"
                            }`}>{inv.status}</span>
                            <span className="font-mono text-xs font-bold">${(inv.amount / 100).toFixed(2)}</span>
                            {inv.pdfUrl && (
                                <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-black">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
