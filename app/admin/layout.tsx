import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminNav } from "@/components/admin/admin-nav";

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
                <AdminNav />
                {children}
            </div>
        </div>
    );
}
