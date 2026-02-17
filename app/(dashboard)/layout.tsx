import { Suspense } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
                <AppSidebar />
            </div>
            <div className="flex-1 md:pl-64 flex flex-col min-h-screen transition-all duration-300">
                <Header />
                <main className="w-full h-full overflow-y-auto bg-gray-50/50 dark:bg-zinc-900/50">
                    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
                        <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                            {children}
                        </Suspense>
                    </div>
                </main>
            </div>
        </div>
    );
}
