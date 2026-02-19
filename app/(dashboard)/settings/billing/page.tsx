export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { subscriptions, workspaceMembers, tools, researchJobs } from "@/lib/db/schema";

export const metadata: Metadata = {
    title: "Billing & Plans — Trackr",
    description: "Manage your subscription and view usage.",
};
import { getWorkspaceId } from "@/lib/actions/tools";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and, gte, inArray, count } from "drizzle-orm";
import { getPlanLimits, PLANS } from "@/lib/config/subscriptions";
import type { Plan } from "@/lib/config/subscriptions";
import { Check } from "lucide-react";
import { ManageSubscriptionButton } from "@/components/billing/manage-subscription-button";
import { BillingPlanCards } from "@/components/billing/billing-plan-cards";

type BillingPlanCard = {
    key: string;
    plan: Plan;
    description: string;
    highlights: string[];
    isCurrent: boolean;
};

export default async function BillingPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string>>;
}) {
    const user = await currentUser();
    if (!user) return null;

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) return <div>No workspace found</div>;

    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, workspaceId),
    });

    const currentPlan = getPlanLimits(subscription ?? undefined);

    const params = await searchParams;
    const success = params.success === "true";
    const canceled = params.canceled === "true";

    // Usage stats
    const toolCountResult = await db
        .select({ count: count() })
        .from(tools)
        .where(eq(tools.workspaceId, workspaceId));
    const toolCount = toolCountResult[0]?.count ?? 0;

    const periodStart = subscription?.currentPeriodEnd
        ? new Date(new Date(subscription.currentPeriodEnd).getTime() - 30 * 24 * 60 * 60 * 1000)
        : new Date(new Date().setDate(new Date().getDate() - 30));

    const workspaceToolIds = db
        .select({ id: tools.id })
        .from(tools)
        .where(eq(tools.workspaceId, workspaceId));

    const researchCountResult = await db
        .select({ count: count() })
        .from(researchJobs)
        .where(
            and(
                inArray(researchJobs.toolId, workspaceToolIds),
                gte(researchJobs.triggeredAt, periodStart)
            )
        );
    const researchCount = researchCountResult[0]?.count ?? 0;

    const memberCountResult = await db
        .select({ count: count() })
        .from(workspaceMembers)
        .where(eq(workspaceMembers.workspaceId, workspaceId));
    const memberCount = memberCountResult[0]?.count ?? 0;

    const planCards: BillingPlanCard[] = [
        {
            key: "free",
            plan: PLANS.FREE,
            description: "For individuals evaluating tools on their own.",
            highlights: [
                `${PLANS.FREE.limits.tools} tools`,
                `${PLANS.FREE.limits.research} research credits/mo`,
                `${PLANS.FREE.limits.members} member`,
                "Basic reports",
            ],
            isCurrent: currentPlan.slug === "free",
        },
        {
            key: "team",
            plan: PLANS.TEAM,
            description: "For teams that evaluate tools and track spend together.",
            highlights: [
                "Unlimited tools",
                `${PLANS.TEAM.limits.research} research credits/mo`,
                `${PLANS.TEAM.limits.members} members`,
                "Slack + Chrome extension",
                "Spend tracking + exports",
                `Extra credits: $${PLANS.TEAM.extraCreditPrice}/each`,
            ],
            isCurrent: currentPlan.slug === "team",
        },
        {
            key: "startup",
            plan: PLANS.STARTUP,
            description: "For growing teams that want AI intelligence and custom scoring.",
            highlights: [
                "Everything in Team",
                `${PLANS.STARTUP.limits.research} research credits/mo`,
                `${PLANS.STARTUP.limits.members} members`,
                "Ask Trackr AI",
                "Analytics + scorecard recipe",
                `Extra credits: $${PLANS.STARTUP.extraCreditPrice}/each`,
            ],
            isCurrent: currentPlan.slug === "startup",
        },
        {
            key: "enterprise",
            plan: PLANS.ENTERPRISE,
            description: "For large teams with unlimited needs and API access.",
            highlights: [
                "Everything in Startup",
                `${PLANS.ENTERPRISE.limits.research} research credits/mo`,
                "Unlimited members",
                "API access",
                "Dedicated success manager",
                `Extra credits: $${PLANS.ENTERPRISE.extraCreditPrice}/each`,
            ],
            isCurrent: currentPlan.slug === "enterprise",
        },
    ];

    const hasActiveSubscription = subscription && (subscription.status === "active" || subscription.status === "trialing" || subscription.status === "past_due");

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-serif font-normal">Billing & Plans</h1>
                <p className="font-mono text-sm text-neutral-500 mt-1">
                    Currently on <span className="font-semibold text-black">{currentPlan.name}</span> plan
                    {" · "}{currentPlan.limits.research} research credits/month
                    {currentPlan.extraCreditPrice && (
                        <> · Extra credits at ${currentPlan.extraCreditPrice}/each</>
                    )}
                </p>
            </div>

            {success && (
                <div className="border border-black bg-white p-4 font-mono text-sm">
                    Subscription activated. Welcome to {currentPlan.name}!
                </div>
            )}

            {canceled && (
                <div className="border border-neutral-400 bg-white p-4 font-mono text-sm text-neutral-600">
                    Checkout was canceled. No charges were made.
                </div>
            )}

            {/* Plan Cards with monthly/annual toggle */}
            <BillingPlanCards
                planCards={planCards}
                workspaceId={workspaceId}
                hasActiveSubscription={!!hasActiveSubscription}
                stripeCustomerId={subscription?.stripeCustomerId ?? null}
            />

            {/* Subscription Details */}
            {hasActiveSubscription && (
                <div className="border border-black bg-white p-6 space-y-4">
                    <h2 className="font-serif text-lg">Subscription Details</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 block mb-1">
                                Status
                            </span>
                            <SubscriptionStatusBadge status={subscription!.status} />
                        </div>
                        <div>
                            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 block mb-1">
                                Current Period Ends
                            </span>
                            <span className="font-mono text-sm">
                                {subscription!.currentPeriodEnd
                                    ? new Date(subscription!.currentPeriodEnd).toLocaleDateString("en-US", {
                                          month: "long",
                                          day: "numeric",
                                          year: "numeric",
                                      })
                                    : "N/A"}
                            </span>
                        </div>
                        <div>
                            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 block mb-1">
                                Customer ID
                            </span>
                            <span className="font-mono text-sm text-neutral-600" title={subscription!.stripeCustomerId ?? ""}>
                                {subscription!.stripeCustomerId
                                    ? `${subscription!.stripeCustomerId.slice(0, 14)}...`
                                    : "N/A"}
                            </span>
                        </div>
                        <div className="flex items-end">
                            {subscription!.stripeCustomerId && (
                                <ManageSubscriptionButton workspaceId={workspaceId} />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Usage Stats */}
            <div className="border border-black bg-white p-6 space-y-5">
                <h2 className="font-serif text-lg">Usage This Period</h2>
                <div className="space-y-4">
                    <UsageBar
                        label="Research Credits"
                        current={Number(researchCount)}
                        limit={currentPlan.limits.research}
                    />
                    <UsageBar
                        label="Tools"
                        current={Number(toolCount)}
                        limit={currentPlan.limits.tools}
                    />
                    <UsageBar
                        label="Members"
                        current={Number(memberCount)}
                        limit={currentPlan.limits.members}
                    />
                </div>
            </div>

            <div className="border border-black/20 p-4 font-mono text-xs text-neutral-500">
                All plans include a 14-day free trial. Per workspace, not per member. Cancel any time from the billing portal. Upgrades take effect immediately.
            </div>
        </div>
    );
}

function SubscriptionStatusBadge({ status }: { status: string }) {
    if (status === "active" || status === "trialing") {
        return (
            <span className="inline-block bg-black text-white font-mono text-xs px-2 py-1 uppercase tracking-widest">
                {status === "trialing" ? "Trial" : "Active"}
            </span>
        );
    }
    if (status === "past_due") {
        return (
            <span className="inline-block border-2 border-red-600 text-red-600 font-mono text-xs px-2 py-1 uppercase tracking-widest">
                Past Due
            </span>
        );
    }
    return (
        <span className="inline-block border border-neutral-400 text-neutral-500 font-mono text-xs px-2 py-1 uppercase tracking-widest">
            {status}
        </span>
    );
}

function UsageBar({ label, current, limit }: { label: string; current: number; limit: number }) {
    const isUnlimited = limit === Infinity;
    const percentage = isUnlimited ? 0 : limit > 0 ? Math.min((current / limit) * 100, 100) : 0;
    const displayLimit = isUnlimited ? "Unlimited" : limit.toString();

    return (
        <div>
            <div className="flex items-baseline justify-between mb-1.5">
                <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">{label}</span>
                <span className="font-mono text-sm">
                    {current} <span className="text-neutral-400">/</span> {displayLimit}
                </span>
            </div>
            <div className="h-2 bg-neutral-200 w-full">
                <div
                    className="h-full bg-black transition-all"
                    style={{ width: isUnlimited ? "0%" : `${percentage}%` }}
                />
            </div>
        </div>
    );
}
