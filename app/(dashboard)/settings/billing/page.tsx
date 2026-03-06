export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { subscriptions, workspaceMembers, tools, researchJobs } from "@/lib/db/schema";

export const metadata: Metadata = {
    title: "Billing & Plans — Trackr",
    description: "Manage your subscription and view usage.",
};
import { getWorkspaceId } from "@/lib/db/queries";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and, gte, inArray, count } from "drizzle-orm";
import { subDays } from "date-fns";
import { getPlanLimits, PLANS, CREDIT_PACK_PRICES } from "@/lib/config/subscriptions";
import type { Plan } from "@/lib/config/subscriptions";
import { ManageSubscriptionButton } from "@/components/billing/manage-subscription-button";
import { BillingPlanCards } from "@/components/billing/billing-plan-cards";
import { CreditPackSelector } from "@/components/billing/credit-pack-selector";
import { AutoTopUpToggle } from "@/components/billing/auto-top-up-toggle";

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
    let user;
    try {
        user = await currentUser();
    } catch {
        redirect("/sign-in");
    }
    if (!user) redirect("/sign-in");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) redirect("/onboarding");

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
        ? subDays(new Date(subscription.currentPeriodEnd), 30)
        : subDays(new Date(), 30);

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
                "Buy credit packs anytime",
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
                "Scheduled auto-research",
                "Credit packs from $10",
                "Procurement workflows",
                "Renewal calendar",
                "Decision log",
                "Public stack profile",
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
                "Credit packs from $8 (20% off)",
                "Stack Health (full)",
                "Board reports",
                "Competitor intel",
                "Risk monitor",
                "Contract vault",
                "Team literacy",
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
                "Credit packs from $6 (40% off)",
                "Custom scoring weights",
                "Best credit pack pricing",
            ],
            isCurrent: currentPlan.slug === "enterprise",
        },
    ];

    const hasActiveSubscription = subscription && (subscription.status === "active" || subscription.status === "trialing" || subscription.status === "past_due");

    // Trial countdown
    const trialDaysLeft = subscription?.status === "trialing" && subscription.currentPeriodEnd
        ? Math.max(0, Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : null;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-serif font-normal">Billing & Plans</h1>
                <p className="font-mono text-sm text-neutral-500 mt-1">
                    Currently on <span className="font-semibold text-black">{currentPlan.name}</span> plan
                    {" · "}{currentPlan.limits.research} research credits/month
                    {" · "}<span className="text-neutral-400">Credit packs from ${(CREDIT_PACK_PRICES[currentPlan.slug]?.[25] ?? 1000) / 100}</span>
                </p>
            </div>

            {trialDaysLeft !== null && (
                <div className={`p-4 font-mono text-sm space-y-2 ${
                    trialDaysLeft <= 3
                        ? "border-2 border-red-600 bg-red-50 text-red-800"
                        : "border border-black bg-white"
                }`}>
                    <p className="font-semibold">
                        Your trial ends in {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""}
                    </p>
                    <p className={trialDaysLeft <= 3 ? "" : "text-neutral-600"}>
                        Add a payment method to keep your {currentPlan.name} features after the trial ends.
                    </p>
                    {subscription?.stripeCustomerId && (
                        <ManageSubscriptionButton workspaceId={workspaceId} />
                    )}
                </div>
            )}

            {success && (
                <div className="border border-black bg-white p-4 font-mono text-sm space-y-1">
                    <p className="font-semibold">Payment received — thank you!</p>
                    <p className="text-neutral-500">Your plan will activate within a few seconds. Refresh if your plan details haven't updated yet.</p>
                </div>
            )}

            {canceled && (
                <div className="border border-neutral-400 bg-white p-4 font-mono text-sm text-neutral-600">
                    Checkout was canceled. No charges were made.
                </div>
            )}

            {subscription?.status === "past_due" && (
                <div className="border-2 border-red-600 bg-red-50 p-4 font-mono text-sm text-red-800 space-y-1">
                    <p className="font-semibold">Payment past due</p>
                    <p>Your subscription payment failed. Your account has been downgraded to Free plan limits until payment is resolved. Please update your payment method to restore full access.</p>
                    {subscription.stripeCustomerId && (
                        <ManageSubscriptionButton workspaceId={workspaceId} />
                    )}
                </div>
            )}

            {/* Plan Cards with monthly/annual toggle */}
            <BillingPlanCards
                planCards={planCards}
                workspaceId={workspaceId}
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

            {/* Credit Packs */}
            <div className="border border-black bg-white p-6 space-y-4">
                <div className="flex items-baseline justify-between">
                    <h2 className="font-serif text-lg">Credit Packs</h2>
                    <span className="font-mono text-sm">
                        {subscription?.creditBalance ?? 0} <span className="text-neutral-400">credits available</span>
                    </span>
                </div>
                <p className="font-mono text-xs text-neutral-500">
                    Buy credits in bulk to keep running research after your monthly limit. Volume discounts for paid plans. Credits never expire.
                </p>
                <CreditPackSelector planSlug={currentPlan.slug} />
                {hasActiveSubscription && subscription?.stripeCustomerId && (
                    <AutoTopUpToggle
                        enabled={subscription.autoTopUpEnabled ?? false}
                        currentPack={subscription.autoTopUpPack ?? 25}
                        planSlug={currentPlan.slug}
                    />
                )}
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
    const isWarning = !isUnlimited && percentage >= 75 && percentage < 100;
    const isMaxed = !isUnlimited && percentage >= 100;

    return (
        <div>
            <div className="flex items-baseline justify-between mb-1.5">
                <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">{label}</span>
                <span className={`font-mono text-sm ${isMaxed ? "text-red-600 font-bold" : isWarning ? "text-amber-600" : ""}`}>
                    {current} <span className="text-neutral-400">/</span> {displayLimit}
                </span>
            </div>
            <div className="h-2 bg-neutral-200 w-full">
                <div
                    className={`h-full transition-all ${isMaxed ? "bg-red-600" : isWarning ? "bg-amber-500" : "bg-black"}`}
                    style={{ width: isUnlimited ? "0%" : `${percentage}%` }}
                />
            </div>
            {isMaxed && (
                <p className="font-mono text-[10px] text-red-600 mt-1">
                    Limit reached. Upgrade your plan or buy extra credits to continue.
                </p>
            )}
            {isWarning && (
                <p className="font-mono text-[10px] text-amber-600 mt-1">
                    {Math.round(percentage)}% used — consider upgrading before you hit the limit.
                </p>
            )}
        </div>
    );
}
