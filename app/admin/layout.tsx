import { isAdminAuthenticated } from "@/lib/admin-auth";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const authed = await isAdminAuthenticated();

    if (!authed) {
        // Don't redirect — render children which show their own password form
        return (
            <div className="min-h-screen bg-[#F3F3EF] p-6 md:p-10">
                <div className="max-w-7xl mx-auto">{children}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F3F3EF] p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <nav className="flex flex-wrap items-center gap-1 mb-8 border-b border-black pb-4">
                    <Link href="/admin/leads" className="font-mono text-[10px] uppercase tracking-widest border border-transparent px-3 py-1.5 hover:border-black transition-colors">
                        Leads
                    </Link>
                    <span className="font-mono text-neutral-300 text-xs hidden sm:inline">|</span>
                    <Link href="/admin/analytics" className="font-mono text-[10px] uppercase tracking-widest border border-transparent px-3 py-1.5 hover:border-black transition-colors">
                        Analytics
                    </Link>
                    <span className="font-mono text-neutral-300 text-xs hidden sm:inline">|</span>
                    <Link href="/admin/api" className="font-mono text-[10px] uppercase tracking-widest border border-transparent px-3 py-1.5 hover:border-black transition-colors">
                        API
                    </Link>
                    <span className="font-mono text-neutral-300 text-xs hidden sm:inline">|</span>
                    <Link href="/admin/architects" className="font-mono text-[10px] uppercase tracking-widest border border-transparent px-3 py-1.5 hover:border-black transition-colors">
                        Architects
                    </Link>
                    <span className="font-mono text-neutral-300 text-xs hidden sm:inline">|</span>
                    <Link href="/admin/payouts" className="font-mono text-[10px] uppercase tracking-widest border border-transparent px-3 py-1.5 hover:border-black transition-colors">
                        Payouts
                    </Link>
                </nav>
                {children}
            </div>
        </div>
    );
}
