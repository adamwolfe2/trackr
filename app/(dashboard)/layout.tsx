import { AppSidebar } from "@/components/layout/app-sidebar"
import { Header } from "@/components/layout/header"
import { CommandPaletteLoader } from "@/components/command-palette-loader"
import { CreditUsageBanner } from "@/components/layout/credit-usage-banner"
import { CreditStatusBadge } from "@/components/layout/credit-status-badge"
import { TrialExpiryBanner } from "@/components/layout/trial-expiry-banner"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { workspaceMembers, workspaces, subscriptions, tools, researchJobs } from "@/lib/db/schema"
import { eq, and, gte, ne, count, inArray } from "drizzle-orm"
import type { InferSelectModel } from "drizzle-orm"
import type { Metadata } from "next"
import { getPlanLimits } from "@/lib/config/subscriptions"

// Dashboard routes are authenticated — prevent search engines from indexing them
export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

type MemberWithWorkspace = InferSelectModel<typeof workspaceMembers> & {
    workspace: InferSelectModel<typeof workspaces>;
};

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    let user = null;
    try {
        user = await currentUser();
    } catch {
        redirect("/sign-in");
    }

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

    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, workspace.id),
    });
    const plan = getPlanLimits(subscription);
    const creditBalance = subscription?.creditBalance ?? 0;
    const trialEnd = subscription?.currentPeriodEnd ?? null;
    const subStatus = subscription?.status;

    // Compute actual runs remaining this month (plan allowance + extra credits)
    // Only do the DB count if the plan has a finite monthly research limit
    let runsRemaining: number | null = null;
    if (plan.limits.research !== Infinity) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const workspaceToolSubq = db.select({ id: tools.id }).from(tools).where(eq(tools.workspaceId, workspace.id));
        const [row] = await db.select({ value: count() }).from(researchJobs).where(
            and(
                inArray(researchJobs.toolId, workspaceToolSubq),
                gte(researchJobs.triggeredAt, startOfMonth),
                ne(researchJobs.status, "failed"),
            )
        );
        const jobsThisMonth = Number(row?.value ?? 0);
        runsRemaining = Math.max(0, plan.limits.research - jobsThisMonth) + creditBalance;
    }

    // Only render the badge when the plan has a finite limit
    const creditBadge = runsRemaining !== null ? (
        <CreditStatusBadge
            runsRemaining={runsRemaining}
            monthlyLimit={plan.limits.research}
            planName={plan.name}
            workspaceId={workspace.id}
        />
    ) : null;

    return (
        <div className="flex min-h-screen bg-[#F3F3EF] text-black">
            <div className="hidden md:flex print:hidden w-64 flex-col fixed inset-y-0 z-50">
                <AppSidebar planFeatures={plan.features} />
            </div>
            <div className="flex-1 md:pl-64 print:pl-0 flex flex-col min-h-screen">
                <div className="print:hidden"><Header rightExtra={creditBadge} /></div>
                <div className="print:hidden">
                    <TrialExpiryBanner trialEnd={trialEnd} status={subStatus} planName={plan.name} />
                    <CreditUsageBanner workspaceId={workspace.id} />
                </div>
                <main className="w-full h-full overflow-y-auto bg-[#F3F3EF]">
                    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
            <CommandPaletteLoader />
        </div>
    )
}
