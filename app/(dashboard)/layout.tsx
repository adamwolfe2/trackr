import { AppSidebar } from "@/components/layout/app-sidebar"
import { Header } from "@/components/layout/header"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { workspaceMembers, workspaces } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type { InferSelectModel } from "drizzle-orm"

type MemberWithWorkspace = InferSelectModel<typeof workspaceMembers> & {
    workspace: InferSelectModel<typeof workspaces>;
};

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await currentUser()

    if (!user) {
        redirect("/sign-in")
    }

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
        with: { workspace: true },
    }) as MemberWithWorkspace | undefined;

    if (!member) {
        redirect("/onboarding");
    }

    const workspace = member.workspace;

    if (!workspace.onboardingCompleted) {
        redirect("/onboarding");
    }

    return (
        <div className="flex min-h-screen bg-[#F3F3EF] text-black">
            <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
                <AppSidebar />
            </div>
            <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
                <Header />
                <main className="w-full h-full overflow-y-auto bg-[#F8F8F5]">
                    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
