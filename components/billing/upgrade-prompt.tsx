"use client";

import { Lock } from "lucide-react";
import Link from "next/link";

interface UpgradePromptProps {
    feature: string;
    plan: string;
    message?: string;
    compact?: boolean;
}

export function UpgradePrompt({ feature, plan, message, compact }: UpgradePromptProps) {
    const defaultMessage = `${feature} requires the ${plan} plan or higher.`;

    if (compact) {
        return (
            <div className="flex items-center gap-2 py-2 px-3 border border-neutral-200 bg-neutral-50">
                <Lock className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                <span className="font-mono text-[10px] text-neutral-500">{message ?? defaultMessage}</span>
                <Link href="/settings/billing" className="font-mono text-[10px] font-bold text-black underline ml-auto flex-shrink-0">
                    Upgrade
                </Link>
            </div>
        );
    }

    return (
        <div className="border border-black p-6 text-center space-y-3">
            <Lock className="w-5 h-5 mx-auto text-neutral-400" />
            <p className="font-mono text-xs text-neutral-600">{message ?? defaultMessage}</p>
            <Link
                href="/settings/billing"
                className="inline-block font-mono text-[10px] uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
            >
                Upgrade to {plan}
            </Link>
        </div>
    );
}
