import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getPlanLimits } from "@/lib/config/subscriptions";
import { checkCostCap } from "@/lib/services/cost-cap";
import { AlertTriangle, XCircle } from "lucide-react";

interface CreditUsageBannerProps {
    workspaceId: string;
}

export async function CreditUsageBanner({ workspaceId }: CreditUsageBannerProps) {
    try {
        const subscription = await db.query.subscriptions.findFirst({
            where: eq(subscriptions.workspaceId, workspaceId),
        });
        const plan = getPlanLimits(subscription ?? undefined);
        const cap = await checkCostCap(workspaceId, plan.slug);

        if (!cap.warned && cap.allowed) return null;

        const pct = Math.min(Math.round(cap.pctUsed), 100);

        if (!cap.allowed) {
            return (
                <div className="border-b border-red-600 bg-red-50 px-4 py-2.5 flex items-center gap-2.5">
                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" strokeWidth={2} />
                    <p className="font-mono text-xs text-red-700">
                        Monthly API budget reached (${cap.usage.toFixed(2)} / ${cap.budget.toFixed(2)}).{" "}
                        Research is paused until next month.{" "}
                        <a href="/settings/billing" className="underline underline-offset-2 font-semibold hover:text-red-900">
                            Upgrade to resume →
                        </a>
                    </p>
                </div>
            );
        }

        return (
            <div className="border-b border-amber-400 bg-amber-50 px-4 py-2.5 flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" strokeWidth={2} />
                <p className="font-mono text-xs text-amber-800">
                    {pct}% of your monthly API budget used (${cap.usage.toFixed(2)} / ${cap.budget.toFixed(2)} on {plan.name} plan).{" "}
                    <a href="/settings/billing" className="underline underline-offset-2 font-semibold hover:text-amber-900">
                        Upgrade for more capacity →
                    </a>
                </p>
            </div>
        );
    } catch {
        // Never break the layout for a non-critical banner
        return null;
    }
}
