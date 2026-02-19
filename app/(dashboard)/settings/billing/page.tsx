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
import { Check } from "lucide-react";
import { UpgradeButton } from "@/components/billing/upgrade-button";
import { ManageSubscriptionButton } from "@/components/billing/manage-subscription-button";

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

    const limits = getPlanLimits(subscription ?? undefined);
    const isTeam = limits.slug === "team";
    const isAgency = limits.slug === "agency";
    const isFree = limits.slug === "free";

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

    const plans = [
        {
            key: "free" as const,
            name: "Free",
            price: `$${PLANS.FREE.price}`,
            period: "/mo",
            description: "Perfect for exploring Trackr and evaluating a handful of tools.",
            features: [
                "25 tools",
                "5 research runs/month",
                "1 workspace member",
                "AI News Digest",
                "Kanban board",
            ],
            isCurrent: isFree,
            planSlug: null as null,
        },
        {
            key: "team" as const,
            name: "Team",
            price: `$${PLANS.TEAM.price}`,
            period: "/mo",
            description: "For ops teams that evaluate tools regularly and track spend.",
            features: [
                "Unlimited tools",
                "50 research runs/month",
                "10 workspace members",
                "Ask Trackr AI",
                "Tool comparison",
                "Priority support",
            ],
            isCurrent: isTeam,
            planSlug: "team" as const,
        },
        {
            key: "agency" as const,
            name: "Agency",
            price: `$${PLANS.AGENCY.price}`,
            period: "/mo",
            description: "For agencies managing tools across multiple clients.",
            features: [
                "Unlimited tools",
                "Unlimited research runs",
                "Unlimited members",
                "Ask Trackr AI",
                "Tool comparison",
                "Advertise system access",
                "Priority support",
            ],
            isCurrent: isAgency,
            planSlug: "agency" as const,
        },
    ];

    const hasActiveSubscription = subscription && (subscription.status === "active" || subscription.status === "trialing" || subscription.status === "past_due");

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-serif font-normal">Billing & Plans</h1>
                <p className="font-mono text-sm text-neutral-500 mt-1">
                    Currently on <span className="font-semibold text-black">{limits.name}</span> plan.
                    {limits.limits.research !== Infinity && (
                        <> {limits.limits.research} research runs/month.</>
                    )}
                </p>
            </div>

            {success && (
                <div className="border border-black bg-white p-4 font-mono text-sm">
                    Subscription activated. Welcome to {limits.name}!
                </div>
            )}

            {canceled && (
                <div className="border border-neutral-400 bg-white p-4 font-mono text-sm text-neutral-600">
                    Checkout was canceled. No charges were made.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-black">
                {plans.map((plan, i) => (
                    <div
                        key={plan.key}
                        className={`p-6 ${i < plans.length - 1 ? "border-b md:border-b-0 md:border-r border-black" : ""} ${plan.isCurrent ? "bg-black text-white" : "bg-white"}`}
                    >
                        <div className="mb-1">
                            <span className={`font-mono text-xs uppercase tracking-widest ${plan.isCurrent ? "text-neutral-400" : "text-neutral-500"}`}>
                                {plan.isCurrent ? "Current Plan" : plan.name}
                            </span>
                        </div>
                        <div className="flex items-baseline gap-1 mb-1">
                            <span className="text-4xl font-serif">{plan.price}</span>
                            <span className={`font-mono text-sm ${plan.isCurrent ? "text-neutral-400" : "text-neutral-500"}`}>{plan.period}</span>
                        </div>
                        <p className={`font-mono text-xs mb-6 leading-relaxed ${plan.isCurrent ? "text-neutral-300" : "text-neutral-500"}`}>
                            {plan.description}
                        </p>
                        <ul className="space-y-2 mb-8">
                            {plan.features.map((feature) => (
                                <li key={feature} className={`flex items-center gap-2 font-mono text-xs ${plan.isCurrent ? "text-neutral-200" : "text-neutral-700"}`}>
                                    <Check className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <div>
                            {plan.isCurrent && subscription?.stripeCustomerId ? (
                                <ManageSubscriptionButton workspaceId={workspaceId} />
                            ) : plan.isCurrent ? (
                                <div className={`border px-4 py-2 text-center font-mono text-xs uppercase tracking-widest ${plan.isCurrent ? "border-neutral-600 text-neutral-400" : "border-black text-black"}`}>
                                    Active
                                </div>
                            ) : (
                                plan.planSlug && (
                                    <UpgradeButton workspaceId={workspaceId} plan={plan.planSlug} />
                                )
                            )}
                        </div>
                    </div>
                ))}
            </div>

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
                        label="Tools"
                        current={Number(toolCount)}
                        limit={limits.limits.tools}
                    />
                    <UsageBar
                        label="Research Runs"
                        current={Number(researchCount)}
                        limit={limits.limits.research}
                    />
                </div>
            </div>

            <div className="border border-black/20 p-4 font-mono text-xs text-neutral-500">
                Subscriptions are billed monthly. Cancel any time from the billing portal. Upgrades take effect immediately.
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
