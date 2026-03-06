import { isAdminAuthenticated } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const authed = await isAdminAuthenticated();

    return (
        <div className="min-h-screen bg-[#F3F3EF] p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                {authed && (
                    <nav className="flex items-center gap-1 mb-8 border-b border-black pb-4">
                        <a href="/admin/leads" className="font-mono text-[10px] uppercase tracking-widest border border-transparent px-3 py-1.5 hover:border-black transition-colors">
                            Leads
                        </a>
                        <span className="font-mono text-neutral-300 text-xs">|</span>
                        <a href="/admin/analytics" className="font-mono text-[10px] uppercase tracking-widest border border-transparent px-3 py-1.5 hover:border-black transition-colors">
                            Analytics
                        </a>
                        <span className="font-mono text-neutral-300 text-xs">|</span>
                        <a href="/admin/api" className="font-mono text-[10px] uppercase tracking-widest border border-transparent px-3 py-1.5 hover:border-black transition-colors">
                            API
                        </a>
                        <span className="font-mono text-neutral-300 text-xs">|</span>
                        <a href="/admin/architects" className="font-mono text-[10px] uppercase tracking-widest border border-transparent px-3 py-1.5 hover:border-black transition-colors">
                            Architects
                        </a>
                    </nav>
                )}
                {children}
            </div>
        </div>
    );
}
