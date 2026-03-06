import Link from "next/link";
import { AlertTriangle, XCircle } from "lucide-react";

interface TrialExpiryBannerProps {
    trialEnd: Date | null;
    status: string | undefined;
    planName: string;
}

export function TrialExpiryBanner({ trialEnd, status, planName }: TrialExpiryBannerProps) {
    if (status !== "trialing" || !trialEnd) return null;

    const now = new Date();
    const daysLeft = Math.ceil((new Date(trialEnd).getTime() - now.getTime()) / 86400000);

    if (daysLeft > 7) return null;

    if (daysLeft <= 0) {
        return (
            <div className="border-b border-red-600 bg-red-50 px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2.5 print:hidden">
                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" strokeWidth={2} />
                <p className="font-mono text-xs text-red-700">
                    Your trial has ended — upgrade to restore access.{" "}
                    <Link href="/settings/billing" className="underline underline-offset-2 font-semibold hover:text-red-900">
                        Upgrade now →
                    </Link>
                </p>
            </div>
        );
    }

    return (
        <div className="border-b border-amber-400 bg-amber-50 px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2.5 print:hidden">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" strokeWidth={2} />
            <p className="font-mono text-xs text-amber-800">
                Your {planName} trial ends in {daysLeft} day{daysLeft === 1 ? "" : "s"} — add a payment method to keep access.{" "}
                <Link href="/settings/billing" className="underline underline-offset-2 font-semibold hover:text-amber-900">
                    Add Payment Method →
                </Link>
            </p>
        </div>
    );
}
