import { AppSidebar } from "@/components/layout/app-sidebar"
import { Header } from "@/components/layout/header"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { workspaceMembers, workspaces } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await currentUser()

    if (!user) {
        redirect("/sign-in")
    }

    // Check for workspace and onboarding status
    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
        with: {
            // @ts-ignore
            workspace: true
        }
    });

    if (!member) {
        redirect("/onboarding");
    }

    // @ts-ignore
    const workspace = member.workspace;

    // If workspace exists but no company context, force onboarding
    if (!workspace.companyContext) {
        redirect("/onboarding");
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
                <AppSidebar />
            </div>
            <div className="flex-1 md:pl-64 flex flex-col min-h-screen transition-all duration-300">
                <Header />
                <main className="w-full h-full overflow-y-auto bg-gray-50/50 dark:bg-zinc-900/50">
                    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
