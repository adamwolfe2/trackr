"use client";

import { useState, useTransition } from "react";
import { updateEmailPreferences } from "@/lib/actions/notification-preferences";
import { toast } from "sonner";

type EmailPreferences = {
    weeklyDigest: boolean;
    researchComplete: boolean;
    renewalAlerts: boolean;
    trialReminders: boolean;
};

const PREFERENCE_ITEMS: Array<{
    key: keyof EmailPreferences;
    label: string;
    description: string;
}> = [
    {
        key: "weeklyDigest",
        label: "Weekly Stack Digest",
        description: "A weekly summary of your research activity, stack health, and upcoming renewals.",
    },
    {
        key: "researchComplete",
        label: "Research Complete Notifications",
        description: "Get notified when a tool research job finishes with results.",
    },
    {
        key: "renewalAlerts",
        label: "Renewal Reminders",
        description: "Alerts about upcoming software renewals in the next 30 days.",
    },
    {
        key: "trialReminders",
        label: "Trial Reminders",
        description: "Reminders before your Trackr trial period ends.",
    },
];

export function NotificationPreferencesForm({
    initialPreferences,
}: {
    initialPreferences: EmailPreferences;
}) {
    const [prefs, setPrefs] = useState<EmailPreferences>(initialPreferences);
    const [isPending, startTransition] = useTransition();
    const [pendingKey, setPendingKey] = useState<string | null>(null);

    function handleToggle(key: keyof EmailPreferences) {
        const newValue = !prefs[key];
        setPendingKey(key);
        setPrefs({ ...prefs, [key]: newValue });

        startTransition(async () => {
            const result = await updateEmailPreferences(key, newValue);
            setPendingKey(null);
            if (result.success) {
                toast.success("Preference updated");
            } else {
                setPrefs((prev) => ({ ...prev, [key]: !newValue }));
                toast.error("Failed to update preference");
            }
        });
    }

    return (
        <div className="border border-black bg-white divide-y divide-black/10">
            {PREFERENCE_ITEMS.map((item) => (
                <div
                    key={item.key}
                    className="flex items-center justify-between px-5 py-4 gap-4"
                >
                    <div className="min-w-0">
                        <p className="font-mono text-sm font-medium">
                            {item.label}
                        </p>
                        <p className="font-mono text-xs text-neutral-500 mt-0.5">
                            {item.description}
                        </p>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={prefs[item.key]}
                        disabled={isPending && pendingKey === item.key}
                        onClick={() => handleToggle(item.key)}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-50 ${
                            prefs[item.key]
                                ? "border-black bg-black"
                                : "border-neutral-300 bg-neutral-200"
                        }`}
                    >
                        <span
                            className={`pointer-events-none block h-4 w-4 bg-white border border-black transition-transform ${
                                prefs[item.key]
                                    ? "translate-x-5"
                                    : "translate-x-0.5"
                            }`}
                        />
                    </button>
                </div>
            ))}
        </div>
    );
}
